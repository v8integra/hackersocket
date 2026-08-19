import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in | HackerSocket",
  robots: { index: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
