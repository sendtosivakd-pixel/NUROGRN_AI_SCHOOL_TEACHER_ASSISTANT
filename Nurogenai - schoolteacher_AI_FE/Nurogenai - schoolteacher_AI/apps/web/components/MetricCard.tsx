"use client";

import { motion } from "motion/react";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  tone?: "tone-success" | "tone-warning" | "tone-danger" | "tone-info" | "tone-neutral";
}

export function MetricCard({
  label,
  value,
  helper,
  tone = "tone-neutral",
}: MetricCardProps) {
  const getGlowColor = () => {
    switch (tone) {
      case "tone-success": return "from-emerald-500/20 to-emerald-500/0";
      case "tone-warning": return "from-amber-500/20 to-amber-500/0";
      case "tone-danger": return "from-rose-500/20 to-rose-500/0";
      case "tone-info": return "from-purple-500/20 to-purple-500/0";
      default: return "from-slate-500/20 to-slate-500/0";
    }
  };

  const getTextColor = () => {
    switch (tone) {
      case "tone-success": return "text-emerald-400";
      case "tone-warning": return "text-amber-400";
      case "tone-danger": return "text-rose-400";
      case "tone-info": return "text-purple-400";
      default: return "text-slate-400";
    }
  };

  return (
    <motion.article 
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all overflow-hidden h-full"
    >
      <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${getGlowColor()} opacity-50`} />
      
      <div className="relative z-10">
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 bg-white/5 ${getTextColor()} border border-white/5`}>
          {label}
        </span>
        <div className="text-3xl font-bold text-white mb-2 tracking-tight">{value}</div>
        <p className="text-slate-400 text-xs leading-relaxed opacity-70">{helper}</p>
      </div>
    </motion.article>
  );
}
