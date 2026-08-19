import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEVEL_SLUGS, LEVEL_LABELS, LEVEL_RUBRIC, getActiveJobsByLevel } from "@/lib/jobs";
import { Navbar } from "@/components/layout/navbar";
import { JobCard } from "@/components/jobs/job-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type PageProps = {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ keyword?: string; location?: string; remote?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level: levelSlug } = await params;
  const level = LEVEL_SLUGS[levelSlug];
  if (!level) return { title: "Jobs | HackerSocket" };

  return {
    title: `${LEVEL_LABELS[level]} jobs | HackerSocket`,
    description: `${LEVEL_RUBRIC[level]}. Browse ${LEVEL_LABELS[level].toLowerCase()} developer jobs on HackerSocket.`,
  };
}

export default async function JobLevelPage({ params, searchParams }: PageProps) {
  const { level: levelSlug } = await params;
  const level = LEVEL_SLUGS[levelSlug];

  if (!level) {
    notFound();
  }

  const { keyword, location, remote } = await searchParams;
  const jobs = await getActiveJobsByLevel(level, {
    keyword,
    location,
    remoteOnly: remote === "on",
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-lg font-medium">{LEVEL_LABELS[level]} jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{LEVEL_RUBRIC[level]}</p>
        </div>

        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="keyword">Keyword</Label>
            <Input id="keyword" name="keyword" defaultValue={keyword} placeholder="React" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={location} placeholder="Denver" />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="remote" defaultChecked={remote === "on"} />
            Remote only
          </label>
          <Button type="submit" size="sm">
            Filter
          </Button>
        </form>

        {jobs.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No {LEVEL_LABELS[level].toLowerCase()} listings match right now.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>
    </>
  );
}
