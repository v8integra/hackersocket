"use client";

import { useState, useTransition } from "react";
import { updateShowcasedRepos } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { GithubRepo } from "@/lib/github";

const MAX_SHOWCASE = 6;

export function ShowcaseReposSection({
  repos,
  initialSelected,
}: {
  repos: GithubRepo[];
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState<string[]>(
    initialSelected.filter((name) => repos.some((repo) => repo.name === name)),
  );
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const toggle = (name: string) => {
    setSaved(false);
    setSelected((current) => {
      if (current.includes(name)) return current.filter((n) => n !== name);
      if (current.length >= MAX_SHOWCASE) return current;
      return [...current, name];
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateShowcasedRepos(selected);
      setSaved(true);
    });
  };

  if (repos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-base font-medium">Showcase repositories</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add your GitHub username above to choose repositories to showcase on your profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-medium">Showcase repositories</h2>
        <p className="text-sm text-muted-foreground">
          Pick up to {MAX_SHOWCASE} repos to feature on your profile, in whatever order you like.
          Leave none selected to automatically show your most-starred repos instead.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {repos.map((repo) => {
            const position = selected.indexOf(repo.name);
            const isSelected = position !== -1;
            const disabled = !isSelected && selected.length >= MAX_SHOWCASE;
            return (
              <li key={repo.name}>
                <label
                  className={`flex items-center gap-3 rounded-md border p-2 text-sm ${
                    isSelected ? "border-brand" : "border-border"
                  } ${disabled ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => toggle(repo.name)}
                  />
                  <span className="flex-1">
                    <span className="font-medium">{repo.name}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {repo.stars} stars
                    </span>
                  </span>
                  {isSelected && (
                    <span className="font-mono text-xs text-brand">#{position + 1}</span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
        {saved && <p className="text-sm text-brand">Saved.</p>}
        <Button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="w-fit bg-brand text-brand-foreground hover:bg-brand-hover"
        >
          {pending ? "Saving..." : "Save selection"}
        </Button>
      </CardContent>
    </Card>
  );
}
