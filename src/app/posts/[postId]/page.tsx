import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getPostById } from "@/lib/posts";
import { Navbar } from "@/components/layout/navbar";
import { PostCard } from "@/components/posts/post-card";
import { CommentSection } from "@/components/posts/comment-section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type PageProps = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPostById(postId);
  if (!post) return { title: "Post not found | HackerSocket" };

  const authorName = post.author.name ?? post.author.username ?? "someone";
  const snippet = post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content;
  return {
    title: `${authorName} on HackerSocket`,
    description: snippet,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { postId } = await params;
  const session = await auth();
  const post = await getPostById(postId, session?.user?.id);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        <PostCard post={post} linkToDetail={false} />
        <Card>
          <CardHeader>
            <h2 className="text-base font-medium">Comments</h2>
          </CardHeader>
          <CardContent>
            <CommentSection postId={post.id} comments={post.comments} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
