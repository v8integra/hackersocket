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
  starredByMe: boolean;
};

const postInclude = {
  author: { select: { id: true, name: true, username: true, image: true } },
  _count: { select: { comments: true, likes: true } },
  likes: { select: { userId: true } },
  stars: { select: { userId: true } },
} satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

function rawPostsQuery(where?: Prisma.PostWhereInput) {
  return prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });
}

function toFeedPost(post: PostWithRelations, currentUserId?: string): FeedPost {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: post.author,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    likedByMe: currentUserId ? post.likes.some((like) => like.userId === currentUserId) : false,
    starredByMe: currentUserId ? post.stars.some((star) => star.userId === currentUserId) : false,
  };
}

function toFeedPosts(posts: PostWithRelations[], currentUserId?: string): FeedPost[] {
  return posts.map((post) => toFeedPost(post, currentUserId));
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

export async function getStarredPosts(userId: string): Promise<FeedPost[]> {
  const stars = await prisma.star.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { post: { include: postInclude } },
  });
  return stars.map((star) => toFeedPost(star.post, userId));
}

export async function getFollowedPosts(userId: string): Promise<FeedPost[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const authorIds = following.map((f) => f.followingId);
  if (authorIds.length === 0) return [];

  const posts = await rawPostsQuery({ authorId: { in: authorIds } });
  return toFeedPosts(posts, userId);
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
      ...postInclude,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, username: true } } },
      },
    },
  });

  if (!post) return null;

  return {
    ...toFeedPost(post, currentUserId),
    comments: post.comments,
  };
}
