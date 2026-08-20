import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getThread } from "@/lib/messages";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageThread } from "./message-thread";

type PageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: `Messages with ${username} | HackerSocket`, robots: { index: false } };
}

export default async function ThreadPage({ params }: PageProps) {
  const { username } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const otherUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true },
  });

  if (!otherUser || !otherUser.username) {
    notFound();
  }
  if (otherUser.id === session.user.id) {
    redirect("/messages");
  }

  const messages = await getThread(session.user.id, otherUser.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        <Card>
          <CardHeader>
            <h1 className="text-lg font-medium">{otherUser.name ?? otherUser.username}</h1>
          </CardHeader>
          <CardContent>
            <MessageThread
              otherUsername={otherUser.username}
              otherUserId={otherUser.id}
              initialMessages={messages}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
