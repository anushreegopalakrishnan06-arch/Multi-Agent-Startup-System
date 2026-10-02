import React from "react";
import { CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";

export default function AgentStatus({ agents = [], currentStep = 0, errorMsg = null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {agents.map((ag) => {
        const isDone = currentStep > ag.step;
        const isCurrent = currentStep === ag.step;
        const isFailed = currentStep === -1 && currentStep + 1 === ag.step;
        const isWaiting = currentStep < ag.step;

        const IconComponent = ag.icon;

        return (
          <div
            key={ag.step}
            className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              isCurrent
                ? "glass-panel-high border-primary/50 shadow-lg shadow-primary/10 ring-2 ring-primary/20 scale-[1.02]"
                : isDone
                ? "glass-panel border-emerald-500/30 bg-emerald-500/5"
                : isFailed
                ? "glass-panel border-rose-500/30 bg-rose-500/5"
                : "glass-panel border-outline-variant/30 opacity-60"
            }`}
          >
            {/* Status indicator bar at top */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${
                isDone
                  ? "bg-emerald-500"
                  : isCurrent
                  ? "bg-primary animate-pulse"
                  : isFailed
                  ? "bg-rose-500"
                  : "bg-transparent"
              }`}
            />

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className={`p-2.5 rounded-xl ${ag.bg} ${ag.color} shrink-0`}>
                <IconComponent size={20} />
              </div>

              {/* Status Badge */}
              {isDone ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={12} />
                  <span>Done</span>
                </span>
              ) : isCurrent ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Active</span>
                </span>
              ) : isFailed ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  <AlertCircle size={12} />
                  <span>Failed</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant/60 bg-surface-container px-2.5 py-0.5 rounded-full">
                  <Clock size={12} />
                  <span>Queued</span>
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold font-display text-on-surface mb-1">
              {ag.name}
            </h4>

            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
              {isCurrent
                ? "Synthesizing live intelligence and market parameters..."
                : isDone
                ? "Analysis verified and integrated into strategy model."
                : isWaiting
                ? "Awaiting inputs from preceding agent in pipeline."
                : ag.role}
            </p>
          </div>
        );
      })}
    </div>
  );
}
