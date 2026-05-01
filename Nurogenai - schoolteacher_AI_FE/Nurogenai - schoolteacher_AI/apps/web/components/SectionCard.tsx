"use client";

import { motion } from "motion/react";

interface SectionCardProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  actions,
  className,
  children,
}: SectionCardProps) {
  return (
    <section 
      className={`relative p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl transition-colors duration-500 ${className ?? ""}`}
    >
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors duration-500">{title}</h2>
          {description ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed opacity-80 transition-colors duration-500">{description}</p>
          ) : null}
        </div>
        {actions && (
          <div className="flex-none">
            {actions}
          </div>
        )}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
