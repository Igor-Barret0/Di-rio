"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdviceCard({
  title,
  icon,
  description,
  footer,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-xl">{icon}</div>
        <div className="min-w-0">
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
      </div>
    </Card>
  );
}
