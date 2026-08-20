import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchAllRepos, pickShowcaseRepos } from "@/lib/github";
import { getPostsByAuthor } from "@/lib/posts";
import { Navbar } from "@/components/layout/navbar";
import { PostCard } from "@/components/posts/post-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatYear(date: Date): string {
  return date.getFullYear().toString();
}

type PageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, headline: true, bio: true },
  });

  if (!user) return { title: "Profile not found | HackerSocket" };

  const displayName = user.name ?? username;
  return {
    title: `${displayName} (@${username}) | HackerSocket`,
    description: user.headline ?? user.bio ?? `${displayName}'s profile on HackerSocket.`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      experiences: { orderBy: { startDate: "desc" } },
      educations: { orderBy: { startDate: "desc" } },
    },
  });

  if (!user) {
    notFound();
  }

  const session = await auth();
  const [allRepos, posts] = await Promise.all([
    user.githubUsername ? fetchAllRepos(user.githubUsername) : Promise.resolve([]),
    getPostsByAuthor(user.id, session?.user?.id),
  ]);
  const repos = pickShowcaseRepos(allRepos, user.showcasedRepos);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <Card>
          <CardContent className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-brand-muted text-brand text-lg">
                {(user.name ?? user.username ?? "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-medium">{user.name ?? user.username}</h1>
              <p className="font-mono text-sm text-muted-foreground">@{user.username}</p>
              {user.headline && <p className="mt-1 text-sm">{user.headline}</p>}
              {user.location && (
                <p className="mt-1 text-xs text-muted-foreground">{user.location}</p>
              )}
              {user.linkedinUrl && (
                <Link
                  href={user.linkedinUrl}
                  className="mt-1 inline-block text-xs text-brand hover:underline"
                >
                  LinkedIn
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {user.bio && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-medium">About</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{user.bio}</p>
            </CardContent>
          </Card>
        )}

        {user.experiences.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-medium">Experience</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {user.experiences.map((exp) => (
                <div key={exp.id}>
                  <p className="text-sm font-medium">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{exp.company}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatMonth(exp.startDate)} -{" "}
                    {exp.endDate ? formatMonth(exp.endDate) : "present"}
                  </p>
                  {exp.description && <p className="mt-1 text-sm">{exp.description}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {user.educations.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-medium">Education</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {user.educations.map((edu) => (
                <div key={edu.id}>
                  <p className="text-sm font-medium">{edu.school}</p>
                  {(edu.degree || edu.field) && (
                    <p className="text-xs text-muted-foreground">
                      {[edu.degree, edu.field].filter(Boolean).join(" - ")}
                    </p>
                  )}
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatYear(edu.startDate)} -{" "}
                    {edu.endDate ? formatYear(edu.endDate) : "present"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {repos.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-medium">Top repositories</h2>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {repos.map((repo) => (
                <Link
                  key={repo.url}
                  href={repo.url}
                  className="rounded-md border border-border p-3 hover:border-brand"
                >
                  <p className="text-sm font-medium">{repo.name}</p>
                  {repo.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {repo.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {repo.language && (
                      <Badge variant="outline" className="text-xs">
                        {repo.language}
                      </Badge>
                    )}
                    <span className="font-mono text-xs text-muted-foreground">
                      {repo.stars} stars
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {posts.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-medium">Posts</h2>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
