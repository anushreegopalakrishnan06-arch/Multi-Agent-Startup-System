import React from "react";

export default function AnalysisSection({
  title,
  subtitle,
  agent,
  icon: Icon,
  actions,
  children,
  className = "",
}) {
  if (!children) return null;

  return (
    <section className={`glass-panel p-6 md:p-8 rounded-[24px] border border-outline-variant/30 space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-start gap-3.5">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Icon size={22} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold font-display text-on-surface">
                {title}
              </h2>
              {agent && (
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-surface-container text-primary border border-primary/20">
                  {agent}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs md:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Section Content */}
      <div>{children}</div>
    </section>
  );
}
