"use client";

import { useActionState, useRef } from "react";
import { createPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type FormState = { error: string | null };

export function PostComposer() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await createPost(formData);
      if (!result.error) {
        formRef.current?.reset();
      }
      return result;
    },
    { error: null },
  );

  return (
    <Card>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
          <Textarea
            name="content"
            placeholder="Shipped something? Stuck on something? Talk shop."
            rows={3}
          />
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button
            type="submit"
            disabled={pending}
            className="w-fit bg-brand text-brand-foreground hover:bg-brand-hover"
          >
            {pending ? "Posting..." : "Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
