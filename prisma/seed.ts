import { PrismaClient, JobLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertDeveloper(data: {
  email: string;
  username: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  githubUsername?: string;
}) {
  const passwordHash = await bcrypt.hash("demo-password-123", 10);
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: { ...data, passwordHash, role: "DEVELOPER" },
  });
}

async function main() {
  console.log("Seeding demo data...");

  const maya = await upsertDeveloper({
    email: "maya@demo.hackersocket.dev",
    username: "maya-chen",
    name: "Maya Chen",
    headline: "New grad frontend engineer, React and TypeScript",
    bio: "Recent CS grad looking for my first full-time role. Built a few side projects, always shipping something.",
    location: "Seattle, WA",
    githubUsername: "octocat",
  });

  const derek = await upsertDeveloper({
    email: "derek@demo.hackersocket.dev",
    username: "derek-osei",
    name: "Derek Osei",
    headline: "Full-stack engineer, 4 years, Next.js and Postgres",
    bio: "I like building tools that other developers actually want to use.",
    location: "Remote",
  });

  const priya = await upsertDeveloper({
    email: "priya@demo.hackersocket.dev",
    username: "priya-nair",
    name: "Priya Nair",
    headline: "Staff engineer, distributed systems",
    bio: "10+ years shipping backend infrastructure at scale. Mentoring is my favorite part of the job.",
    location: "Austin, TX",
  });

  await prisma.experience.upsert({
    where: { id: "seed-exp-derek-1" },
    update: {},
    create: {
      id: "seed-exp-derek-1",
      userId: derek.id,
      title: "Full-Stack Engineer",
      company: "Fintell",
      startDate: new Date("2021-06-01"),
      description: "Built and maintained customer-facing dashboards in Next.js and Node.",
    },
  });

  await prisma.education.upsert({
    where: { id: "seed-edu-maya-1" },
    update: {},
    create: {
      id: "seed-edu-maya-1",
      userId: maya.id,
      school: "University of Washington",
      degree: "B.S.",
      field: "Computer Science",
      startDate: new Date("2021-09-01"),
      endDate: new Date("2025-06-01"),
    },
  });

  const post1 = await prisma.post.upsert({
    where: { id: "seed-post-1" },
    update: {},
    create: {
      id: "seed-post-1",
      authorId: priya.id,
      content:
        "Hot take: the best way to get better at debugging distributed systems is to break one on purpose in a staging environment and watch what happens.",
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-2" },
    update: {},
    create: {
      id: "seed-post-2",
      authorId: derek.id,
      content: "Finally got Postgres row-level security working the way I wanted. Small win, felt huge.",
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-3" },
    update: {},
    create: {
      id: "seed-post-3",
      authorId: maya.id,
      content: "Applying to my first round of new-grad roles this week. Wish me luck.",
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-1" },
    update: {},
    create: {
      id: "seed-comment-1",
      postId: post1.id,
      authorId: derek.id,
      content: "This is exactly how I learned incident response. Terrifying but effective.",
    },
  });

  await prisma.like.upsert({
    where: { postId_userId: { postId: post1.id, userId: maya.id } },
    update: {},
    create: { postId: post1.id, userId: maya.id },
  });
  await prisma.like.upsert({
    where: { postId_userId: { postId: post1.id, userId: derek.id } },
    update: {},
    create: { postId: post1.id, userId: derek.id },
  });

  const acme = await prisma.company.upsert({
    where: { ownerId: priya.id },
    update: {},
    create: {
      ownerId: priya.id,
      name: "Northline Systems",
      website: "https://northline.example.com",
      description: "Infrastructure tooling for teams running critical backend systems.",
    },
  });

  const jobs: Array<{
    id: string;
    title: string;
    level: JobLevel;
    location: string;
    remote: boolean;
    salaryMin: number;
    salaryMax: number;
    description: string;
  }> = [
    {
      id: "seed-job-entry-1",
      title: "Junior Frontend Engineer",
      level: "ENTRY",
      location: "Seattle, WA",
      remote: true,
      salaryMin: 75000,
      salaryMax: 95000,
      description:
        "Your first engineering role, working on real production React/TypeScript code alongside a small, senior-heavy team. We pair a lot and take mentorship seriously.",
    },
    {
      id: "seed-job-entry-2",
      title: "Associate Software Engineer",
      level: "ENTRY",
      location: "Remote",
      remote: true,
      salaryMin: 70000,
      salaryMax: 90000,
      description: "New-grad friendly role on our platform team. Node.js, Postgres, and a lot of learning.",
    },
    {
      id: "seed-job-mid-1",
      title: "Full-Stack Engineer",
      level: "MID",
      location: "Austin, TX",
      remote: true,
      salaryMin: 120000,
      salaryMax: 150000,
      description:
        "Own features end to end across our Next.js frontend and Node/Postgres backend. 2-5 years experience.",
    },
    {
      id: "seed-job-senior-1",
      title: "Staff Backend Engineer",
      level: "SENIOR",
      location: "Austin, TX",
      remote: false,
      salaryMin: 175000,
      salaryMax: 220000,
      description:
        "Lead the design of our next-generation event pipeline. Deep distributed-systems experience required.",
    },
  ];

  for (const job of jobs) {
    await prisma.jobPosting.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        companyId: acme.id,
        title: job.title,
        description: job.description,
        level: job.level,
        location: job.location,
        remote: job.remote,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        applyEmail: "jobs@northline.example.com",
        status: "ACTIVE",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
