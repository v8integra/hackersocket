"use client";

import { useActionState, useRef, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { addComment, deleteComment } from "@/lib/actions/posts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PostComment } from "@/lib/posts";

type FormState = { error: string | null };

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CommentItem({ comment, postId }: { comment: PostComment; postId: string }) {
  const { data: session } = useSession();
  const [pending, startTransition] = useTransition();
  const isOwn = session?.user?.id === comment.author.id;
  const authorName = comment.author.name ?? comment.author.username ?? "unknown";
  const authorHref = comment.author.username ? `/u/${comment.author.username}` : undefined;

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-brand-muted text-brand text-xs">
          {authorName[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {authorHref ? (
              <Link href={authorHref} className="text-sm font-medium hover:text-brand">
                {authorName}
              </Link>
            ) : (
              <p className="text-sm font-medium">{authorName}</p>
            )}
            <span className="font-mono text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          {isOwn && (
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => startTransition(() => deleteComment(comment.id, postId))}
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
}

export function CommentSection({
  postId,
  comments,
}: {
  postId: string;
  comments: PostComment[];
}) {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await addComment(postId, formData);
      if (!result.error) {
        formRef.current?.reset();
      }
      return result;
    },
    { error: null },
  );

  return (
    <div className="flex flex-col gap-4">
      {session && (
        <form ref={formRef} action={formAction} className="flex flex-col gap-2">
          <Textarea name="content" placeholder="Add a comment" rows={2} />
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button
            type="submit"
            disabled={pending}
            size="sm"
            className="w-fit bg-brand text-brand-foreground hover:bg-brand-hover"
          >
            {pending ? "Posting..." : "Comment"}
          </Button>
        </form>
      )}
      <div className="flex flex-col gap-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
    </div>
  );
}
