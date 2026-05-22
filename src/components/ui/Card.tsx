"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  delay?: number;
}

export function Card({
  children,
  className,
  hover = false,
  glass = true,
  delay = 0,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "rounded-2xl p-5",
        glass ? "glass-card" : "bg-surface border border-border",
        hover && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "primary",
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: "primary" | "accent" | "secondary" | "success" | "warning";
  delay?: number;
}) {
  const colors = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    secondary: "text-secondary bg-secondary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
  };

  return (
    <Card delay={delay} hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-text">{value}</p>
          {trend && (
            <p className="text-xs text-success mt-1">{trend}</p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
