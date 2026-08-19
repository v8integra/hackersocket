import { auth } from "@/auth";
import { getFeedPosts } from "@/lib/posts";
import { Navbar } from "@/components/layout/navbar";
import { PostComposer } from "@/components/posts/post-composer";
import { PostCard } from "@/components/posts/post-card";

export default async function Home() {
  const session = await auth();
  const posts = await getFeedPosts(session?.user?.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        {session ? (
          <PostComposer />
        ) : (
          <p className="text-sm text-muted-foreground">
            Log in to post, comment, and like.
          </p>
        )}
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No posts yet. Be the first to say something.
          </p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </main>
    </>
  );
}
