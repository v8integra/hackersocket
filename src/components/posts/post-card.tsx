"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toggleLike, deletePost } from "@/lib/actions/posts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FeedPost } from "@/lib/posts";

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

export function PostCard({ post, linkToDetail = true }: { post: FeedPost; linkToDetail?: boolean }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [pending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  const isOwnPost = session?.user?.id === post.author.id;

  const handleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((count) => count + (nextLiked ? 1 : -1));
    startTransition(async () => {
      await toggleLike(post.id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deletePost(post.id);
      setRemoved(true);
    });
  };

  if (removed) return null;

  const authorName = post.author.name ?? post.author.username ?? "unknown";
  const authorHref = post.author.username ? `/u/${post.author.username}` : undefined;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-brand-muted text-brand text-xs">
              {authorName[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            {authorHref ? (
              <Link href={authorHref} className="text-sm font-medium hover:text-brand">
                {authorName}
              </Link>
            ) : (
              <p className="text-sm font-medium">{authorName}</p>
            )}
            <p className="font-mono text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {isOwnPost && (
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={pending}>
            Delete
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            disabled={!session}
            className={`text-xs ${liked ? "text-brand" : "text-muted-foreground"} disabled:opacity-50`}
          >
            {liked ? "Liked" : "Like"} - {likeCount}
          </button>
          {linkToDetail ? (
            <Link href={`/posts/${post.id}`} className="text-xs text-muted-foreground hover:text-brand">
              {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">
              {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
