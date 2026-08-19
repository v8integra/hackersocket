"use client";

import { useActionState } from "react";
import { addEducation, deleteEducation } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Education = {
  id: string;
  school: string;
  degree: string | null;
  field: string | null;
  startDate: Date;
  endDate: Date | null;
};

type FormState = { error: string | null };

function formatYear(date: Date): string {
  return date.getFullYear().toString();
}

export function EducationSection({ educations }: { educations: Education[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => addEducation(formData),
    { error: null },
  );

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {educations.map((edu) => (
          <li
            key={edu.id}
            className="flex items-start justify-between rounded-md border border-border p-3"
          >
            <div>
              <p className="text-sm font-medium">{edu.school}</p>
              {(edu.degree || edu.field) && (
                <p className="text-xs text-muted-foreground">
                  {[edu.degree, edu.field].filter(Boolean).join(" - ")}
                </p>
              )}
              <p className="font-mono text-xs text-muted-foreground">
                {formatYear(edu.startDate)} - {edu.endDate ? formatYear(edu.endDate) : "present"}
              </p>
            </div>
            <form action={deleteEducation.bind(null, edu.id)}>
              <Button variant="ghost" size="sm" type="submit">
                Remove
              </Button>
            </form>
          </li>
        ))}
        {educations.length === 0 && (
          <p className="text-sm text-muted-foreground">No education added yet.</p>
        )}
      </ul>

      <form action={formAction} className="flex flex-col gap-3 rounded-md border border-border p-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edu-school">School</Label>
          <Input id="edu-school" name="school" placeholder="Colorado State University" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edu-degree">Degree</Label>
            <Input id="edu-degree" name="degree" placeholder="B.S." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edu-field">Field</Label>
            <Input id="edu-field" name="field" placeholder="Computer Science" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edu-start">Start date</Label>
            <Input id="edu-start" name="startDate" type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edu-end">End date (blank if current)</Label>
            <Input id="edu-end" name="endDate" type="date" />
          </div>
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} size="sm" className="w-fit">
          {pending ? "Adding..." : "Add education"}
        </Button>
      </form>
    </div>
  );
}
