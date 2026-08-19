"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LEVEL_SLUGS, levelToSlug } from "@/lib/jobs";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to do that.");
  }
  return session.user.id;
}

export async function createCompany(formData: FormData) {
  const userId = await requireUserId();

  const existing = await prisma.company.findUnique({ where: { ownerId: userId } });
  if (existing) {
    return { error: "You already have a company." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return { error: "Company name is required." };
  }

  await prisma.company.create({
    data: { ownerId: userId, name, website: website || null, description: description || null },
  });
  await prisma.user.update({ where: { id: userId }, data: { role: "COMPANY" } });

  revalidatePath("/company");
  return { error: null };
}

export async function postJob(formData: FormData) {
  const userId = await requireUserId();

  const company = await prisma.company.findUnique({ where: { ownerId: userId } });
  if (!company) {
    return { error: "Create a company profile before posting a job." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const levelSlug = String(formData.get("level") ?? "");
  const level = LEVEL_SLUGS[levelSlug];
  const location = String(formData.get("location") ?? "").trim();
  const remote = formData.get("remote") === "on";
  const salaryMinRaw = String(formData.get("salaryMin") ?? "").trim();
  const salaryMaxRaw = String(formData.get("salaryMax") ?? "").trim();
  const applyUrl = String(formData.get("applyUrl") ?? "").trim();
  const applyEmail = String(formData.get("applyEmail") ?? "").trim();

  if (!title || !description) {
    return { error: "Title and description are required." };
  }
  if (!level) {
    return { error: "Choose a valid level." };
  }
  if (!applyUrl && !applyEmail) {
    return { error: "Provide either an apply URL or an apply email." };
  }

  const salaryMin = salaryMinRaw ? Number.parseInt(salaryMinRaw, 10) : null;
  const salaryMax = salaryMaxRaw ? Number.parseInt(salaryMaxRaw, 10) : null;
  if (salaryMin !== null && Number.isNaN(salaryMin)) {
    return { error: "Minimum salary must be a number." };
  }
  if (salaryMax !== null && Number.isNaN(salaryMax)) {
    return { error: "Maximum salary must be a number." };
  }

  const job = await prisma.jobPosting.create({
    data: {
      companyId: company.id,
      title,
      description,
      level,
      location: location || null,
      remote,
      salaryMin,
      salaryMax,
      applyUrl: applyUrl || null,
      applyEmail: applyEmail || null,
      status: "ACTIVE",
    },
  });

  revalidatePath("/company");
  revalidatePath(`/jobs/${levelToSlug(level)}`);
  revalidatePath("/jobs");
  return { error: null, jobId: job.id };
}

async function requireOwnedJob(jobId: string, userId: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: { company: true },
  });
  if (!job || job.company.ownerId !== userId) {
    throw new Error("Not found.");
  }
  return job;
}

export async function closeJob(jobId: string) {
  const userId = await requireUserId();
  const job = await requireOwnedJob(jobId, userId);

  await prisma.jobPosting.update({ where: { id: jobId }, data: { status: "EXPIRED" } });

  revalidatePath("/company");
  revalidatePath(`/jobs/${levelToSlug(job.level)}`);
  revalidatePath("/jobs");
}

export async function deleteJob(jobId: string) {
  const userId = await requireUserId();
  const job = await requireOwnedJob(jobId, userId);

  await prisma.jobPosting.delete({ where: { id: jobId } });

  revalidatePath("/company");
  revalidatePath(`/jobs/${levelToSlug(job.level)}`);
  revalidatePath("/jobs");
}
