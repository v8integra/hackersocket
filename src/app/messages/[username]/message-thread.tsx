"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage, markThreadRead } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ThreadMessage } from "@/lib/messages";

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

export function MessageThread({
  otherUsername,
  otherUserId,
  initialMessages,
}: {
  otherUsername: string;
  otherUserId: string;
  initialMessages: ThreadMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    markThreadRead(otherUserId);
  }, [otherUserId]);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return;

    const optimisticId = `optimistic-${Date.now()}`;
    setMessages((current) => [
      ...current,
      { id: optimisticId, content, createdAt: new Date(), fromMe: true },
    ]);
    formRef.current?.reset();

    startTransition(async () => {
      const result = await sendMessage(otherUsername, formData);
      if (result?.error) {
        setError(result.error);
        setMessages((current) => current.filter((m) => m.id !== optimisticId));
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet. Say hello.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${
                message.fromMe
                  ? "bg-brand text-brand-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={`mt-1 font-mono text-[10px] ${
                  message.fromMe ? "text-brand-foreground/70" : "text-muted-foreground"
                }`}
              >
                {timeAgo(message.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2">
        <Textarea name="content" placeholder="Write a message" rows={2} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          disabled={pending}
          className="w-fit bg-brand text-brand-foreground hover:bg-brand-hover"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
