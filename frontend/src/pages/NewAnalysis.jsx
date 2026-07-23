import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NewAnalysis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ industry: "", budget: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Navigate to workflow with form data
    setTimeout(() => navigate("/dashboard/workflow", { state: { inputs: formData } }), 300);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}>

        <div className="glass-panel rounded-[24px] overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-8 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
            <h1 className="font-display text-3xl font-bold text-gradient">New Business Analysis</h1>
            <p className="mt-2" style={{ color: "var(--color-on-surface-variant)" }}>
              Provide details about your proposed startup or business idea. Our AI agents will analyze trends,
              discover opportunities, forecast financials, and validate your idea.
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    Industry / Domain
                  </label>
                  <input
                    required name="industry" value={formData.industry} onChange={handleChange}
                    placeholder="e.g. Sustainable Manufacturing"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(25,22,35,0.1)]"
                    style={{ background: "var(--color-surface-container-low)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    Budget ($)
                  </label>
                  <input
                    required type="number" name="budget" value={formData.budget} onChange={handleChange}
                    placeholder="e.g. 50000"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(25,22,35,0.1)]"
                    style={{ background: "var(--color-surface-container-low)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end" style={{ borderColor: "var(--color-outline-variant)" }}>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                  {loading ? "Starting..." : "Start AI Analysis"}
                  {!loading && <span className="material-symbols-outlined text-[18px]">rocket_launch</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
