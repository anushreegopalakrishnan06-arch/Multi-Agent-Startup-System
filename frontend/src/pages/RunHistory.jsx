import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getReports, deleteReport } from "../services/api";

export default function RunHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports();
      if (res.status === "success") {
        setReports(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete the report.");
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "Unknown Date";
    const date = new Date(isoStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary opacity-50">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Run History</h2>
          <p className="text-on-surface-variant mt-2">
            Review and manage your past AI startup analysis reports.
          </p>
        </div>
        <Link
          to="/dashboard/new"
          className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-error-container text-on-error-container border border-error/30">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 opacity-50">
            history_toggle_off
          </span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No history yet</h3>
          <p className="text-on-surface-variant mb-6 max-w-sm">
            You haven't run any analysis yet. Start a new analysis to see your reports here.
          </p>
          <Link
            to="/dashboard/new"
            className="px-6 py-2 rounded-xl bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-colors font-semibold"
          >
            Start Analysis
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col hover:border-primary/30 transition-colors"
              style={{ background: "var(--color-surface-container)" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-on-surface truncate pr-2">
                    {report.industry || "Unknown Industry"}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {formatDate(report.date)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="text-on-surface-variant hover:text-error transition-colors p-1"
                  title="Delete Report"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1 p-3 rounded-xl bg-surface-container-highest/50">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
                    Viability Score
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {report.score !== null ? `${report.score}/100` : "N/A"}
                  </p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-surface-container-highest/50">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
                    Risk Level
                  </p>
                  <p className={`text-xl font-bold ${
                    report.risk > 60 ? "text-error" : report.risk > 30 ? "text-amber-500" : "text-emerald-500"
                  }`}>
                    {report.risk !== null ? `${report.risk}%` : "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
                  Budget
                </p>
                <p className="text-sm font-medium text-on-surface">
                  {report.budget}
                </p>
              </div>

              <Link
                to={`/dashboard/report/${report.id}`}
                className="w-full py-2.5 rounded-xl bg-surface-container-highest hover:bg-primary-container text-center text-sm font-bold tracking-wide transition-colors text-primary"
              >
                View Full Report
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
