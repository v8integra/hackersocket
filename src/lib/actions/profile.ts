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

function usernameIsValid(value: string): boolean {
  return /^[a-z0-9-]{3,32}$/.test(value);
}

export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const githubUsername = String(formData.get("githubUsername") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();

  if (!usernameIsValid(username)) {
    return {
      error: "Username must be 3-32 characters: lowercase letters, numbers, and hyphens only.",
    };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== userId) {
    return { error: "That username is already taken." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      username,
      name: name || null,
      headline: headline || null,
      bio: bio || null,
      location: location || null,
      githubUsername: githubUsername || null,
      linkedinUrl: linkedinUrl || null,
    },
  });

  revalidatePath("/profile/edit");
  revalidatePath(`/u/${username}`);
  return { error: null, username };
}

export async function addExperience(formData: FormData) {
  const userId = await requireUserId();

  const title = String(formData.get("title") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !company || !startDate) {
    return { error: "Title, company, and start date are required." };
  }

  await prisma.experience.create({
    data: {
      userId,
      title,
      company,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description: description || null,
    },
  });

  revalidatePath("/profile/edit");
  return { error: null };
}

export async function deleteExperience(experienceId: string) {
  const userId = await requireUserId();
  await prisma.experience.deleteMany({ where: { id: experienceId, userId } });
  revalidatePath("/profile/edit");
}

export async function addEducation(formData: FormData) {
  const userId = await requireUserId();

  const school = String(formData.get("school") ?? "").trim();
  const degree = String(formData.get("degree") ?? "").trim();
  const field = String(formData.get("field") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  if (!school || !startDate) {
    return { error: "School and start date are required." };
  }

  await prisma.education.create({
    data: {
      userId,
      school,
      degree: degree || null,
      field: field || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  revalidatePath("/profile/edit");
  return { error: null };
}

export async function deleteEducation(educationId: string) {
  const userId = await requireUserId();
  await prisma.education.deleteMany({ where: { id: educationId, userId } });
  revalidatePath("/profile/edit");
}

const MAX_SHOWCASE_REPOS = 6;

export async function updateShowcasedRepos(repoNames: string[]) {
  const userId = await requireUserId();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { showcasedRepos: repoNames.slice(0, MAX_SHOWCASE_REPOS) },
    select: { username: true },
  });

  revalidatePath("/profile/edit");
  if (user.username) revalidatePath(`/u/${user.username}`);
  return { error: null };
}
