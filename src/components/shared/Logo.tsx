import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, small }: { className?: string; small?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo site.png"
        alt="Diário Emocional"
        width={small ? 130 : 360}
        height={small ? 48 : 120}
        className={small ? "h-12 w-auto object-contain" : "h-32 w-auto object-contain"}
        priority
      />
    </div>
  );
}
