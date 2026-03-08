import * as React from "react";
import { cn } from "@/lib/utils";

const BASE = "/Di-rio";

export function Logo({ className, small }: { className?: string; small?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE}/logo-site.png`}
        alt="Diário Emocional"
        className={small ? "h-12 w-auto object-contain" : "h-32 w-auto object-contain"}
      />
    </div>
  );
}
