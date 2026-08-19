"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { JobLevel } from "@prisma/client";
import { postJob } from "@/lib/actions/jobs";
import { LEVEL_LABELS, LEVEL_RUBRIC, levelToSlug } from "@/lib/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = { error: string | null; jobId?: string };

const LEVELS: JobLevel[] = [JobLevel.ENTRY, JobLevel.MID, JobLevel.SENIOR];

export function JobForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await postJob(formData);
      if (!result.error && result.jobId) {
        router.push(`/jobs/listing/${result.jobId}`);
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Frontend engineer" />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Level</Label>
        <div className="flex flex-col gap-2">
          {LEVELS.map((level, i) => (
            <label
              key={level}
              className="flex items-start gap-2 rounded-md border border-border p-2 text-sm has-[:checked]:border-brand"
            >
              <input
                type="radio"
                name="level"
                value={levelToSlug(level)}
                defaultChecked={i === 0}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{LEVEL_LABELS[level]}</span>
                <span className="block text-xs text-muted-foreground">{LEVEL_RUBRIC[level]}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="Denver, CO" />
        </div>
        <label className="flex items-center gap-2 pb-2 pt-6 text-sm">
          <input type="checkbox" name="remote" />
          Remote friendly
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salaryMin">Salary min (optional)</Label>
          <Input id="salaryMin" name="salaryMin" type="number" placeholder="80000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salaryMax">Salary max (optional)</Label>
          <Input id="salaryMax" name="salaryMax" type="number" placeholder="110000" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="applyUrl">Apply URL</Label>
          <Input id="applyUrl" name="applyUrl" placeholder="https://acme.co/careers/123" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="applyEmail">Apply email</Label>
          <Input id="applyEmail" name="applyEmail" type="email" placeholder="jobs@acme.co" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Provide at least one of the two above.</p>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button
        type="submit"
        disabled={pending}
        className="w-fit bg-brand text-brand-foreground hover:bg-brand-hover"
      >
        {pending ? "Posting..." : "Post job"}
      </Button>
    </form>
  );
}
