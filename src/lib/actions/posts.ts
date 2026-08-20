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

export async function createPost(formData: FormData) {
  const userId = await requireUserId();
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return { error: "Write something before posting." };
  }
  if (content.length > 2000) {
    return { error: "Posts are limited to 2000 characters." };
  }

  await prisma.post.create({ data: { authorId: userId, content } });

  revalidatePath("/");
  return { error: null };
}

export async function deletePost(postId: string) {
  const userId = await requireUserId();
  await prisma.post.deleteMany({ where: { id: postId, authorId: userId } });
  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
}

export async function toggleLike(postId: string) {
  const userId = await requireUserId();

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, userId } });
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  return { liked: !existing };
}

export async function toggleStar(postId: string) {
  const userId = await requireUserId();

  const existing = await prisma.star.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.star.delete({ where: { id: existing.id } });
  } else {
    await prisma.star.create({ data: { postId, userId } });
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  return { starred: !existing };
}

export async function addComment(postId: string, formData: FormData) {
  const userId = await requireUserId();
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return { error: "Write a comment first." };
  }

  await prisma.comment.create({ data: { postId, authorId: userId, content } });

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return { error: null };
}

export async function deleteComment(commentId: string, postId: string) {
  const userId = await requireUserId();
  await prisma.comment.deleteMany({ where: { id: commentId, authorId: userId } });
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
}
