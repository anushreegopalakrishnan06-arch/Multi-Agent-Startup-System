import React from "react";
import { TrendingUp, DollarSign, Target, Activity, ShieldCheck, Zap, Clock, Compass } from "lucide-react";

const ACCENT_STYLES = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-500",
    glow: "shadow-emerald-500/10",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-500",
    glow: "shadow-blue-500/10",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-500",
    glow: "shadow-indigo-500/10",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-500",
    glow: "shadow-purple-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-500",
    glow: "shadow-amber-500/10",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-500",
    glow: "shadow-rose-500/10",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-500",
    glow: "shadow-cyan-500/10",
  },
  teal: {
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    text: "text-teal-500",
    glow: "shadow-teal-500/10",
  },
};

const ICONS = {
  percentage: Target,
  currency: DollarSign,
  growth: TrendingUp,
  roi: Activity,
  timeline: Clock,
  default: Compass,
};

export default function MetricCard({ label, value, type = "default", accent = "blue", description, agent }) {
  if (value === undefined || value === null || value === "") return null;

  const style = ACCENT_STYLES[accent] || ACCENT_STYLES.blue;
  const IconComponent = ICONS[type] || ICONS.default;

  return (
    <div
      className={`glass-panel p-5 md:p-6 rounded-2xl border ${style.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${style.glow} flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
            {label}
          </span>
          <div className={`p-2 rounded-xl ${style.bg} ${style.text} shrink-0`}>
            <IconComponent size={18} />
          </div>
        </div>

        <div className="text-2xl md:text-3xl font-extrabold font-display text-on-surface tracking-tight">
          {value}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-outline-variant/30 flex flex-col gap-1">
        {description && (
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        {agent && (
          <span className="text-[10px] font-medium text-on-surface-variant/60">
            Source: {agent}
          </span>
        )}
      </div>
    </div>
  );
}
