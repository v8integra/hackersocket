"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormProps = {
  initial: {
    username: string;
    name: string;
    headline: string;
    bio: string;
    location: string;
    githubUsername: string;
    linkedinUrl: string;
  };
};

type FormState = { error: string | null; username?: string };

export function ProfileForm({ initial }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => updateProfile(formData),
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" defaultValue={initial.username} placeholder="ada-lovelace" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={initial.name} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          name="headline"
          defaultValue={initial.headline}
          placeholder="Frontend engineer building developer tools"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={initial.bio} rows={4} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={initial.location} placeholder="Denver, CO" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="githubUsername">GitHub username</Label>
          <Input
            id="githubUsername"
            name="githubUsername"
            defaultValue={initial.githubUsername}
            placeholder="octocat"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
        <Input
          id="linkedinUrl"
          name="linkedinUrl"
          defaultValue={initial.linkedinUrl}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {!state.error && state.username && (
        <p className="text-sm text-brand">Profile saved.</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-fit bg-brand text-brand-foreground hover:bg-brand-hover"
      >
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
