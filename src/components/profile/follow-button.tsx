"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toggleFollow } from "@/lib/actions/follows";
import { Button } from "@/components/ui/button";

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string;
  initialFollowing: boolean;
}) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  if (!session || session.user?.id === targetUserId) return null;

  const handleClick = () => {
    setFollowing((current) => !current);
    startTransition(async () => {
      await toggleFollow(targetUserId);
    });
  };

  return (
    <Button
      size="sm"
      variant={following ? "outline" : "default"}
      onClick={handleClick}
      disabled={pending}
      className={following ? "" : "bg-brand text-brand-foreground hover:bg-brand-hover"}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
