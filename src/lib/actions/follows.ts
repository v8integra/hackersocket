"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to do that.");
  }
  return session.user.id;
}

export async function toggleFollow(targetUserId: string) {
  const userId = await requireUserId();

  if (userId === targetUserId) {
    return { error: "You can't follow yourself." };
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: userId, followingId: targetUserId } });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { username: true },
  });

  if (target?.username) revalidatePath(`/u/${target.username}`);
  revalidatePath("/");
  return { error: null, following: !existing };
}
