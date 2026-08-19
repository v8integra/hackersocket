import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <h1 className="text-lg font-medium">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          That page doesn&apos;t exist, or it may have been removed.
        </p>
        <Button
          className="bg-brand text-brand-foreground hover:bg-brand-hover"
          nativeButton={false}
          render={<Link href="/">Back to the feed</Link>}
        />
      </main>
    </>
  );
}
