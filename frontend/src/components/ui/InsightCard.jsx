import React from "react";
import { Sparkles, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

export default function InsightCard({ title, highlight, detail, agent, icon: Icon = Sparkles, badgeColor = "primary" }) {
  if (!title && !highlight && !detail) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/30 transition-all flex items-start gap-4">
      <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-sm font-bold text-on-surface font-display truncate">
            {title}
          </h4>
          {agent && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant shrink-0">
              {agent}
            </span>
          )}
        </div>

        {highlight && (
          <div className="text-base font-extrabold text-primary mb-1">
            {highlight}
          </div>
        )}

        {detail && (
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
