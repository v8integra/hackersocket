"use client";

import { useActionState } from "react";
import { addExperience, deleteExperience } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Experience = {
  id: string;
  title: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
};

type FormState = { error: string | null };

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => addExperience(formData),
    { error: null },
  );

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {experiences.map((exp) => (
          <li
            key={exp.id}
            className="flex items-start justify-between rounded-md border border-border p-3"
          >
            <div>
              <p className="text-sm font-medium">{exp.title}</p>
              <p className="text-xs text-muted-foreground">{exp.company}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {formatMonth(exp.startDate)} - {exp.endDate ? formatMonth(exp.endDate) : "present"}
              </p>
              {exp.description && <p className="mt-1 text-sm">{exp.description}</p>}
            </div>
            <form action={deleteExperience.bind(null, exp.id)}>
              <Button variant="ghost" size="sm" type="submit">
                Remove
              </Button>
            </form>
          </li>
        ))}
        {experiences.length === 0 && (
          <p className="text-sm text-muted-foreground">No experience added yet.</p>
        )}
      </ul>

      <form action={formAction} className="flex flex-col gap-3 rounded-md border border-border p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exp-title">Title</Label>
            <Input id="exp-title" name="title" placeholder="Frontend engineer" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exp-company">Company</Label>
            <Input id="exp-company" name="company" placeholder="Acme Co" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exp-start">Start date</Label>
            <Input id="exp-start" name="startDate" type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exp-end">End date (blank if current)</Label>
            <Input id="exp-end" name="endDate" type="date" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exp-description">Description</Label>
          <Textarea id="exp-description" name="description" rows={2} />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} size="sm" className="w-fit">
          {pending ? "Adding..." : "Add experience"}
        </Button>
      </form>
    </div>
  );
}
