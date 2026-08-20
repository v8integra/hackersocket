import Link from "next/link";
import { auth } from "@/auth";
import { getFeedPosts, getStarredPosts, getFollowedPosts } from "@/lib/posts";
import { Navbar } from "@/components/layout/navbar";
import { PostComposer } from "@/components/posts/post-composer";
import { PostCard } from "@/components/posts/post-card";

const VIEWS = ["general", "starred", "followed"] as const;
type View = (typeof VIEWS)[number];

function isView(value: string | undefined): value is View {
  return VIEWS.includes(value as View);
}

const EMPTY_MESSAGES: Record<View, string> = {
  general: "No posts yet. Be the first to say something.",
  starred: "You haven't starred any posts yet. Star one to find it again easily.",
  followed: "No posts from people you follow yet. Follow someone from their profile.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await auth();
  const { view: rawView } = await searchParams;
  const view: View = session?.user?.id && isView(rawView) ? rawView : "general";

  const posts = await (async () => {
    if (!session?.user?.id) return getFeedPosts();
    if (view === "starred") return getStarredPosts(session.user.id);
    if (view === "followed") return getFollowedPosts(session.user.id);
    return getFeedPosts(session.user.id);
  })();

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        {session ? (
          <>
            <PostComposer />
            <div className="flex gap-4 border-b border-border text-sm">
              {VIEWS.map((tab) => (
                <Link
                  key={tab}
                  href={tab === "general" ? "/" : `/?view=${tab}`}
                  className={`-mb-px border-b-2 px-1 pb-2 capitalize ${
                    view === tab
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Log in to post, comment, and like.</p>
        )}
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground">{EMPTY_MESSAGES[view]}</p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </main>
    </>
  );
}
