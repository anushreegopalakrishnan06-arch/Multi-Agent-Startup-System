import React from "react";

export function SkeletonCard() {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-surface-container rounded-md" />
        <div className="h-8 w-8 rounded-xl bg-surface-container" />
      </div>
      <div className="h-8 w-40 bg-surface-container rounded-lg" />
      <div className="space-y-2 pt-2 border-t border-outline-variant/20">
        <div className="h-3 w-full bg-surface-container rounded" />
        <div className="h-3 w-3/4 bg-surface-container rounded" />
      </div>
    </div>
  );
}

export function SkeletonIdea() {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 bg-surface-container rounded-full" />
        <div className="h-5 w-24 bg-surface-container rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-surface-container rounded-lg" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-surface-container rounded" />
        <div className="h-3 w-5/6 bg-surface-container rounded" />
      </div>
      <div className="h-10 w-full bg-surface-container rounded-xl" />
    </div>
  );
}
