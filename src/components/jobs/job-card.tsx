import Link from "next/link";
import type { Company, JobPosting } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { TierBadge } from "@/components/jobs/tier-badge";
import { formatJobMeta } from "@/lib/jobs";

export function JobCard({ job }: { job: JobPosting & { company: Company } }) {
  return (
    <Link href={`/jobs/listing/${job.id}`}>
      <Card className="hover:border-brand">
        <CardContent className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{job.title}</p>
            <p className="text-xs text-muted-foreground">{job.company.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatJobMeta(job)}</p>
          </div>
          <TierBadge level={job.level} />
        </CardContent>
      </Card>
    </Link>
  );
}
