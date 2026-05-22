"use client";

import { motion } from "framer-motion";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">{title}</h1>
        {description && (
          <p className="text-text-muted mt-1 text-sm sm:text-base">{description}</p>
        )}
      </div>
      {action}
    </motion.div>
  );
}
