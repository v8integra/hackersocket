"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { JobPosting } from "@prisma/client";
import { closeJob, deleteJob } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/jobs/tier-badge";
import { Badge } from "@/components/ui/badge";

export function CompanyJobRow({ job }: { job: JobPosting }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <div>
        <div className="flex items-center gap-2">
          <Link href={`/jobs/listing/${job.id}`} className="text-sm font-medium hover:text-brand">
            {job.title}
          </Link>
          <TierBadge level={job.level} />
          {job.status !== "ACTIVE" && (
            <Badge variant="outline" className="text-xs">
              {job.status.toLowerCase()}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{job.location ?? "No location set"}</p>
      </div>
      <div className="flex items-center gap-2">
        {job.status === "ACTIVE" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => closeJob(job.id))}
          >
            Close
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => deleteJob(job.id))}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
