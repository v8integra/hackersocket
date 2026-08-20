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

export async function sendMessage(recipientUsername: string, formData: FormData) {
  const userId = await requireUserId();
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return { error: "Write something before sending." };
  }
  if (content.length > 2000) {
    return { error: "Messages are limited to 2000 characters." };
  }

  const recipient = await prisma.user.findUnique({
    where: { username: recipientUsername },
    select: { id: true },
  });
  if (!recipient) {
    return { error: "That user doesn't exist." };
  }
  if (recipient.id === userId) {
    return { error: "You can't message yourself." };
  }

  await prisma.message.create({
    data: { senderId: userId, recipientId: recipient.id, content },
  });

  revalidatePath(`/messages/${recipientUsername}`);
  revalidatePath("/messages");
  return { error: null };
}

export async function markThreadRead(otherUserId: string) {
  const userId = await requireUserId();

  await prisma.message.updateMany({
    where: { senderId: otherUserId, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/messages");
}
