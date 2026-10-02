import React from "react";
import { FolderOpen } from "lucide-react";

export default function EmptyState({
  title = "No Data Found",
  message = "This section does not have data returned from the agent response.",
  icon: Icon = FolderOpen,
}) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest/50">
      <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
        <Icon size={24} />
      </div>
      <h4 className="text-sm font-bold text-on-surface mb-1 font-display">
        {title}
      </h4>
      <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
    </div>
  );
}
