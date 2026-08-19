import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type FeedPost = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  commentCount: number;
  likeCount: number;
  likedByMe: boolean;
};

function rawPostsQuery(where?: Prisma.PostWhereInput) {
  return prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { comments: true, likes: true } },
      likes: { select: { userId: true } },
    },
  });
}

function toFeedPosts(
  posts: Awaited<ReturnType<typeof rawPostsQuery>>,
  currentUserId?: string,
): FeedPost[] {
  return posts.map((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: post.author,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    likedByMe: currentUserId
      ? post.likes.some((like) => like.userId === currentUserId)
      : false,
  }));
}

export async function getFeedPosts(currentUserId?: string): Promise<FeedPost[]> {
  const posts = await rawPostsQuery();
  return toFeedPosts(posts, currentUserId);
}

export async function getPostsByAuthor(
  authorId: string,
  currentUserId?: string,
): Promise<FeedPost[]> {
  const posts = await rawPostsQuery({ authorId });
  return toFeedPosts(posts, currentUserId);
}

export type PostComment = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string | null;
  };
};

export type PostWithComments = FeedPost & { comments: PostComment[] };

export async function getPostById(
  postId: string,
  currentUserId?: string,
): Promise<PostWithComments | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { comments: true, likes: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, username: true } } },
      },
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: post.author,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    likedByMe: currentUserId ? post.likes.some((like) => like.userId === currentUserId) : false,
    comments: post.comments,
  };
}
