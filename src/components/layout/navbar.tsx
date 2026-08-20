"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandToggle } from "@/components/theme/brand-toggle";

export function Navbar() {
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    const load = () => {
      fetch("/api/messages/unread-count")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setUnreadCount(data.count ?? 0);
        })
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status]);

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium">
            hacker<span className="text-brand">socket</span>
          </Link>
          <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
            Jobs
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <BrandToggle />
          {status === "authenticated" ? (
            <>
              <Link
                href="/messages"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Messages
                {unreadCount > 0 && (
                  <Badge className="bg-brand text-brand-foreground">{unreadCount}</Badge>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="rounded-full" aria-label="Account menu">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-brand-muted text-brand text-xs">
                          {(session.user?.name ?? session.user?.email ?? "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href="/profile">My profile</Link>} />
                  <DropdownMenuItem render={<Link href="/profile/edit">Edit profile</Link>} />
                  <DropdownMenuItem render={<Link href="/company">Company dashboard</Link>} />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => signOut({ redirect: true, redirectTo: "/" })}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/login">Log in</Link>}
              />
              <Button
                size="sm"
                nativeButton={false}
                className="bg-brand text-brand-foreground hover:bg-brand-hover"
                render={<Link href="/signup">Sign up</Link>}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
