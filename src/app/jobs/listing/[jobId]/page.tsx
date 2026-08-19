import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getJobById, formatJobMeta, LEVEL_LABELS } from "@/lib/jobs";
import { Navbar } from "@/components/layout/navbar";
import { TierBadge } from "@/components/jobs/tier-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PageProps = { params: Promise<{ jobId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { jobId } = await params;
  const job = await getJobById(jobId);

  if (!job || job.status !== "ACTIVE") {
    return { title: "Job not found | HackerSocket" };
  }

  return {
    title: `${job.title} at ${job.company.name} | HackerSocket`,
    description: `${LEVEL_LABELS[job.level]} role at ${job.company.name}${job.location ? ` in ${job.location}` : ""}.`,
  };
}

export default async function JobListingPage({ params }: PageProps) {
  const { jobId } = await params;
  const job = await getJobById(jobId);

  if (!job || job.status !== "ACTIVE") {
    notFound();
  }

  const applyHref = job.applyUrl || (job.applyEmail ? `mailto:${job.applyEmail}` : undefined);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <h1 className="text-lg font-medium">{job.title}</h1>
              <p className="text-sm text-muted-foreground">{job.company.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatJobMeta(job)}</p>
            </div>
            <TierBadge level={job.level} />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm whitespace-pre-wrap">{job.description}</p>
            {applyHref && (
              <Button
                className="w-fit bg-brand text-brand-foreground hover:bg-brand-hover"
                nativeButton={false}
                render={
                  <Link href={applyHref} target="_blank" rel="noopener noreferrer">
                    Apply
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
