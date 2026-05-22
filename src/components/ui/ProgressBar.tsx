"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ProgressBar({
  value,
  className,
  color = "primary",
  size = "md",
}: {
  value: number;
  className?: string;
  color?: "primary" | "accent" | "success" | "warning";
  size?: "sm" | "md";
}) {
  const colors = {
    primary: "bg-primary",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
  };

  return (
    <div
      className={cn(
        "w-full rounded-full bg-surface-elevated overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2",
        className
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("h-full rounded-full", colors[color])}
      />
    </div>
  );
}
