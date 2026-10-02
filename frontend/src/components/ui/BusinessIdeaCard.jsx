import React, { useState } from "react";
import { Sparkles, DollarSign, Users, ChevronDown, ChevronUp, CheckCircle, ArrowRight, Layers } from "lucide-react";

export default function BusinessIdeaCard({ idea, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  if (!idea || !idea.title) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 hover:border-primary/40 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group">
      <div>
        {/* Header Badge & Title */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-xs">
              #{idea.rank || index + 1}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
              Venture Concept
            </span>
          </div>

          {idea.estimatedInvestment && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold shrink-0">
              <DollarSign size={13} />
              <span>{idea.estimatedInvestment}</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold font-display text-on-surface mb-3 group-hover:text-primary transition-colors">
          {idea.title}
        </h3>

        {/* Why this idea could work (Value Proposition) */}
        {idea.whyItWorks && (
          <div className="mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
              Why This Business Could Work
            </span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {idea.whyItWorks}
            </p>
          </div>
        )}

        {/* Core Offering (if available) */}
        {idea.coreOffering && (
          <div className="mb-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
              Core Products & Services
            </span>
            <p className="text-xs text-on-surface leading-relaxed">
              {idea.coreOffering}
            </p>
          </div>
        )}

        {/* Target Customers (if available) */}
        {idea.targetCustomers && (
          <div className="flex items-start gap-2.5 mb-4 text-xs text-on-surface-variant">
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
              <Users size={14} />
            </div>
            <div>
              <span className="font-semibold text-on-surface block">Target Customers</span>
              <span>{idea.targetCustomers}</span>
            </div>
          </div>
        )}
      </div>

      {/* Expandable details for extra fields if returned by agent */}
      <div>
        {idea.rawFields && idea.rawFields.length > 0 && (
          <div className="pt-3 border-t border-outline-variant/30 mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:opacity-80 transition-opacity py-1"
            >
              <span>{expanded ? "Hide Extra Parameters" : `View ${idea.rawFields.length} More Parameters`}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expanded && (
              <div className="mt-2 space-y-2 pt-2 border-t border-outline-variant/20 animate-spring-in">
                {idea.rawFields.map((field, fIdx) => (
                  <div key={fIdx} className="text-xs">
                    <span className="font-semibold text-on-surface block">{field.label}:</span>
                    <span className="text-on-surface-variant">{field.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
