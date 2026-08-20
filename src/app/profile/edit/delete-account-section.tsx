"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DeleteAccountSection({
  username,
  ownsCompany,
}: {
  username: string;
  ownsCompany: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canDelete = confirmText === username;

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <h2 className="text-base font-medium text-destructive">Danger zone</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Deleting your account permanently removes your profile, posts, comments, likes, and
          experience/education history.
          {ownsCompany && " It also deletes your company and every job you've posted."} This
          can&apos;t be undone.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-delete">Type your username ({username}) to confirm</Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          variant="destructive"
          className="w-fit"
          disabled={!canDelete || pending}
          onClick={handleDelete}
        >
          {pending ? "Deleting..." : "Delete my account"}
        </Button>
      </CardContent>
    </Card>
  );
}
