"use client";

import { useActionState } from "react";
import { createCompany } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = { error: string | null };

export function CompanyForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => createCompany(formData),
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Company name</Label>
        <Input id="name" name="name" placeholder="Acme Co" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" placeholder="https://acme.co" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button
        type="submit"
        disabled={pending}
        className="w-fit bg-brand text-brand-foreground hover:bg-brand-hover"
      >
        {pending ? "Creating..." : "Create company"}
      </Button>
    </form>
  );
}
