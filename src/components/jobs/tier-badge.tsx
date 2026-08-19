import { JobLevel } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { LEVEL_LABELS } from "@/lib/jobs";

const LEVEL_CLASSES: Record<JobLevel, string> = {
  [JobLevel.ENTRY]: "bg-brand-muted text-brand",
  [JobLevel.MID]: "bg-secondary text-secondary-foreground",
  [JobLevel.SENIOR]: "bg-primary text-primary-foreground",
};

export function TierBadge({ level }: { level: JobLevel }) {
  return <Badge className={LEVEL_CLASSES[level]}>{LEVEL_LABELS[level]}</Badge>;
}
