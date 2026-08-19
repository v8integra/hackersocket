import { prisma } from "@/lib/prisma";

function slugify(base: string): string {
  const slug = base
    .toLowerCase()
    .replace(/@.*$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "user";
}

export async function generateUniqueUsername(base: string): Promise<string> {
  const slug = slugify(base);
  let candidate = slug;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    suffix += 1;
    candidate = `${slug}-${suffix}`;
  }

  return candidate;
}
