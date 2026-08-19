"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
