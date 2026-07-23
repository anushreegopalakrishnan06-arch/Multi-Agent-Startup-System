import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { getReports, getDashboardStats } from "../services/api";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total_analyses: 0, avg_score: null, high_risk_count: 0, recent_activities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reportsRes, statsRes] = await Promise.all([getReports(), getDashboardStats()]);
        setReports(reportsRes.data || []);
        setStats(statsRes.data || {});
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const scoreColor = (score) => {
    if (score == null) return "var(--color-on-surface-variant)";
    if (score >= 80) return "var(--color-emerald-500)";
    if (score >= 60) return "var(--color-amber-500)";
    return "var(--color-error)";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try { return new Date(dateStr).toLocaleDateString(); } catch { return dateStr; }
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 md:p-8 rounded-[24px]">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold" style={{ color: "var(--color-primary)" }}>
            Welcome back, <span className="text-gradient">{currentUser?.name || currentUser?.email?.split("@")[0] || "Entrepreneur"}</span>
          </h2>
          <p className="mt-2 max-w-2xl" style={{ color: "var(--color-on-surface-variant)" }}>
            Your Startup Intelligence Platform is ready. Analyze trends, validate ideas, and project financials.
          </p>
        </div>
        <Link to="/dashboard/new"
          className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wide uppercase transition-all hover:scale-[1.02] hover:shadow-lg"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Analysis
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Analyses", value: loading ? "—" : stats.total_analyses, icon: "analytics", color: "var(--color-agent-trend)" },
          { label: "Avg Success Score", value: loading ? "—" : (stats.avg_score != null ? `${Math.round(stats.avg_score)}%` : "N/A"), icon: "trending_up", color: "var(--color-agent-discovery)" },
          { label: "High Risk Ideas", value: loading ? "—" : stats.high_risk_count, icon: "warning", color: "var(--color-agent-financial)" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }}
            className="glass-panel rounded-[24px] p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-on-surface-variant)" }}>{stat.label}</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.color }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--color-primary)" }}>{stat.icon}</span>
              </div>
            </div>
            <div className="text-3xl font-display font-bold" style={{ color: "var(--color-primary)" }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Reports + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports List */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-[24px] overflow-hidden">
            <div className="p-6 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <h3 className="font-display text-lg font-semibold" style={{ color: "var(--color-primary)" }}>Recent Reports</h3>
              <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Your latest multi-agent business validations</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-3xl" style={{ color: "var(--color-surface-tint)" }}>progress_activity</span>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: "var(--color-outline-variant)" }}>description</span>
                  <p className="font-display font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>No reports yet</p>
                  <p className="text-sm mb-6" style={{ color: "var(--color-on-surface-variant)" }}>Start your first AI analysis to see results here.</p>
                  <Link to="/dashboard/new"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    Start Analysis
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <Link key={report.id} to={`/dashboard/report/${report.id}`}
                      className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      style={{ background: "var(--color-surface-container-low)" }}>
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--color-on-surface)" }}>{report.industry || "Unnamed Analysis"}</h4>
                        <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                          Budget: ${report.budget} • {formatDate(report.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {report.score != null && (
                          <div className="text-right">
                            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Score</div>
                            <div className="font-bold text-lg" style={{ color: scoreColor(report.score) }}>{Math.round(report.score)}%</div>
                          </div>
                        )}
                        <span className="material-symbols-outlined" style={{ color: "var(--color-outline)" }}>arrow_forward</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <div className="glass-panel rounded-[24px] overflow-hidden h-full">
            <div className="p-6 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <h3 className="font-display text-lg font-semibold" style={{ color: "var(--color-primary)" }}>Recent Activity</h3>
            </div>
            <div className="p-6">
              {(stats.recent_activities || []).length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "var(--color-on-surface-variant)" }}>No recent activity</p>
              ) : (
                <div className="space-y-6">
                  {stats.recent_activities.map((act, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="relative mt-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-primary)" }} />
                        {i < stats.recent_activities.length - 1 && (
                          <div className="absolute top-3 left-1/2 -ml-[1px] w-[2px] h-8" style={{ background: "var(--color-outline-variant)" }} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{act.title}</p>
                        <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{act.description}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
                          {act.time ? formatDate(act.time) : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
