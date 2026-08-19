"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <h1 className="text-lg font-medium">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          That's on us, not you. Try again, and if it keeps happening, check back later.
        </p>
        <Button
          className="bg-brand text-brand-foreground hover:bg-brand-hover"
          onClick={() => reset()}
        >
          Try again
        </Button>
      </main>
    </>
  );
}
