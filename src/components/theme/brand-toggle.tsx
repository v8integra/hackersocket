"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

const BRAND_STORAGE_KEY = "hackersocket-brand";

type Brand = "green" | "blue";

export function BrandToggle() {
  const [brand, setBrand] = useState<Brand>("green");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(BRAND_STORAGE_KEY);
    setBrand(stored === "blue" ? "blue" : "green");
    setMounted(true);
  }, []);

  const toggle = (checked: boolean) => {
    const next: Brand = checked ? "blue" : "green";
    setBrand(next);
    localStorage.setItem(BRAND_STORAGE_KEY, next);
    if (next === "blue") {
      document.documentElement.setAttribute("data-brand", "blue");
    } else {
      document.documentElement.removeAttribute("data-brand");
    }
  };

  if (!mounted) {
    return <div className="h-5 w-9" aria-hidden="true" />;
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-mono ${brand === "green" ? "text-brand" : "text-muted-foreground"}`}
      >
        green
      </span>
      <Switch
        checked={brand === "blue"}
        onCheckedChange={toggle}
        aria-label="Switch accent color between green and blue"
      />
      <span
        className={`text-xs font-mono ${brand === "blue" ? "text-brand" : "text-muted-foreground"}`}
      >
        blue
      </span>
    </div>
  );
}
