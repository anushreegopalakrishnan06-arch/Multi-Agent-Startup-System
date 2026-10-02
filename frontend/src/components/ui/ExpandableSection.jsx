import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle2 } from "lucide-react";

export default function ExpandableSection({
  title,
  paragraphs = [],
  bulletPoints = [],
  agentName,
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if ((!paragraphs || paragraphs.length === 0) && (!bulletPoints || bulletPoints.length === 0)) {
    return null;
  }

  // Display preview: first paragraph or first 2 bullet points
  const previewParagraph = paragraphs[0] || "";
  const remainingParagraphs = paragraphs.slice(1);
  const hasMore = remainingParagraphs.length > 0 || (paragraphs.length > 0 && bulletPoints.length > 0) || previewParagraph.length > 280;

  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-base font-bold font-display text-on-surface flex items-center gap-2">
          <FileText size={16} className="text-primary shrink-0" />
          <span>{title}</span>
        </h4>
        {agentName && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant shrink-0">
            {agentName}
          </span>
        )}
      </div>

      {/* First paragraph / preview */}
      {previewParagraph && (
        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed mb-3">
          {!expanded && previewParagraph.length > 280
            ? `${previewParagraph.slice(0, 280)}...`
            : previewParagraph}
        </p>
      )}

      {/* Bullet points preview (if no paragraph, show first 2) */}
      {!expanded && paragraphs.length === 0 && bulletPoints.length > 0 && (
        <ul className="space-y-1.5 mb-2">
          {bulletPoints.slice(0, 2).map((bp, i) => (
            <li key={i} className="text-xs text-on-surface-variant flex items-start gap-2">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span>{bp}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Expanded full content */}
      {expanded && (
        <div className="space-y-3 pt-2 border-t border-outline-variant/20 animate-spring-in">
          {remainingParagraphs.map((p, idx) => (
            <p key={idx} className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              {p}
            </p>
          ))}

          {bulletPoints.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface block mb-2">
                Key Strategic Takeaways
              </span>
              <ul className="space-y-2">
                {bulletPoints.map((bp, bIdx) => (
                  <li key={bIdx} className="text-xs md:text-sm text-on-surface-variant flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{bp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Toggle Read More */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
        >
          <span>{expanded ? "Show Less" : "Read Full Strategic Analysis"}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
}
