import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Flag, Calendar, Compass } from "lucide-react";

export default function RecommendationCard({
  verdict = "HOLD",
  recommendationText,
  confidenceScore = 95,
  agent = "Startup Validation Agent",
}) {
  const isGo = verdict === "GO";
  const isNoGo = verdict === "NO GO";

  const config = isGo
    ? {
        badgeBg: "bg-emerald-500/10",
        badgeBorder: "border-emerald-500/30",
        badgeText: "text-emerald-500",
        label: "GO — Recommended for Execution",
        icon: CheckCircle2,
        actionAdvice: "Proceed with MVP architecture, early founder pilots, and core supply-chain relationships.",
      }
    : isNoGo
    ? {
        badgeBg: "bg-rose-500/10",
        badgeBorder: "border-rose-500/30",
        badgeText: "text-rose-500",
        label: "NO GO — High Structural Risk",
        icon: XCircle,
        actionAdvice: "Re-evaluate unit economics and pivot toward higher-margin niche sub-segments before allocating capital.",
      }
    : {
        badgeBg: "bg-amber-500/10",
        badgeBorder: "border-amber-500/30",
        badgeText: "text-amber-500",
        label: "HOLD — Conditional Feasibility",
        icon: AlertTriangle,
        actionAdvice: "Viable business model contingent on lean initial overhead and securing initial customer commitments.",
      };

  const IconComponent = config.icon;

  return (
    <div className={`p-6 md:p-8 rounded-[24px] border ${config.badgeBorder} ${config.badgeBg} relative overflow-hidden transition-all duration-300`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.badgeBg} ${config.badgeText} border ${config.badgeBorder}`}>
              <IconComponent size={14} />
              <span>{config.label}</span>
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              Confidence Index: {confidenceScore}%
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold font-display text-on-surface">
            Investment Committee Verdict
          </h3>
        </div>

        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40 shrink-0">
          Source: {agent}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
            Executive Synthesis & Strategic Rationale
          </span>
          <p className="text-sm md:text-base text-on-surface leading-relaxed">
            {recommendationText}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/70 border border-outline-variant/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Flag size={15} />
              <span>Immediate Next Action</span>
            </div>
            <p className="text-xs md:text-sm text-on-surface font-medium leading-relaxed">
              {config.actionAdvice}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Horizon: 90 Days</span>
            <ArrowRight size={14} className="text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
