import Link from "next/link";
import type { Metadata } from "next";
import { JobLevel } from "@prisma/client";
import { getRecentActiveJobs, LEVEL_LABELS, LEVEL_RUBRIC, levelToSlug } from "@/lib/jobs";
import { Navbar } from "@/components/layout/navbar";
import { JobCard } from "@/components/jobs/job-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LEVELS: JobLevel[] = [JobLevel.ENTRY, JobLevel.MID, JobLevel.SENIOR];

export const metadata: Metadata = {
  title: "Jobs | HackerSocket",
  description:
    "Developer jobs sorted into entry-level, mid-level, and senior tiers - so junior roles never get buried.",
};

export default async function JobsOverviewPage() {
  const recentJobs = await getRecentActiveJobs();

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-lg font-medium">Jobs, sorted by level</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Most job boards dump every listing into one pile, which buries entry-level roles
            under a wall of mid and senior postings. Here they get their own lane.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LEVELS.map((level) => (
            <Link key={level} href={`/jobs/${levelToSlug(level)}`}>
              <Card className="hover:border-brand">
                <CardContent className="text-center">
                  <p className="text-sm font-medium">{LEVEL_LABELS[level]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{LEVEL_RUBRIC[level]}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Recent listings</h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/company">For employers</Link>}
          />
        </div>

        {recentJobs.length === 0 && (
          <p className="text-sm text-muted-foreground">No listings yet. Check back soon.</p>
        )}

        <div className="flex flex-col gap-3">
          {recentJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>
    </>
  );
}
