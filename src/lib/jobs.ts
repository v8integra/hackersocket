import { JobLevel, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const LEVEL_SLUGS: Record<string, JobLevel> = {
  entry: JobLevel.ENTRY,
  mid: JobLevel.MID,
  senior: JobLevel.SENIOR,
};

export const LEVEL_LABELS: Record<JobLevel, string> = {
  [JobLevel.ENTRY]: "Entry-level",
  [JobLevel.MID]: "Mid-level",
  [JobLevel.SENIOR]: "Senior+",
};

export const LEVEL_RUBRIC: Record<JobLevel, string> = {
  [JobLevel.ENTRY]: "0-2 years professional experience, new grads, internship-to-full-time",
  [JobLevel.MID]: "2-5 years, independent contributor on a team",
  [JobLevel.SENIOR]: "5+ years, staff/principal/lead",
};

export function levelToSlug(level: JobLevel): string {
  return level.toLowerCase();
}

export type JobFilters = {
  keyword?: string;
  location?: string;
  remoteOnly?: boolean;
};

export async function getActiveJobsByLevel(level: JobLevel, filters: JobFilters = {}) {
  const where: Prisma.JobPostingWhereInput = {
    level,
    status: "ACTIVE",
  };

  if (filters.keyword) {
    where.OR = [
      { title: { contains: filters.keyword, mode: "insensitive" } },
      { description: { contains: filters.keyword, mode: "insensitive" } },
    ];
  }
  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.remoteOnly) {
    where.remote = true;
  }

  return prisma.jobPosting.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { company: true },
  });
}

export async function getJobById(jobId: string) {
  return prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: { company: true },
  });
}

export async function getCompanyForUser(userId: string) {
  return prisma.company.findUnique({
    where: { ownerId: userId },
    include: { jobPostings: { orderBy: { createdAt: "desc" } } },
  });
}

export function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export function formatJobMeta(job: {
  location: string | null;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
}): string {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const showRemoteTag = job.remote && job.location?.toLowerCase() !== "remote";
  return [job.location, showRemoteTag ? "Remote" : null, salary].filter(Boolean).join(" - ");
}

export async function getRecentActiveJobs(limit = 6) {
  return prisma.jobPosting.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { company: true },
  });
}
