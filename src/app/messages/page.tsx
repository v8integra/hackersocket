import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getConversations } from "@/lib/messages";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Messages | HackerSocket",
  robots: { index: false },
};

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

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversations = await getConversations(session.user.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        <h1 className="text-lg font-medium">Messages</h1>
        {conversations.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No conversations yet. Visit someone&apos;s profile and click Message to start one.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {conversations
            .filter((c) => c.otherUser.username)
            .map((c) => (
              <Link key={c.otherUser.id} href={`/messages/${c.otherUser.username}`}>
                <Card className="hover:border-brand">
                  <CardContent className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-brand-muted text-brand text-xs">
                        {(c.otherUser.name ?? c.otherUser.username ?? "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {c.otherUser.name ?? c.otherUser.username}
                        </p>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {timeAgo(c.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.lastMessage.fromMe ? "You: " : ""}
                        {c.lastMessage.content}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <Badge className="bg-brand text-brand-foreground">{c.unreadCount}</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </main>
    </>
  );
}
