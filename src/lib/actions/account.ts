"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to do that." };
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  await signOut({ redirectTo: "/" });
}
