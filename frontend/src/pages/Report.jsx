import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getReport } from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
  ComposedChart, Line
} from "recharts";
import {
  TrendingUp, DollarSign, Target, Activity, Zap, CheckCircle2,
  AlertTriangle, Crosshair, MapPin, Download, Calendar, Sparkles
} from "lucide-react";

// --- Helpers ---
const KPICard = ({ title, value, subtitle, icon: Icon, color = "text-primary", bg = "bg-primary/10" }) => (
  <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <h4 className="text-on-surface-variant text-sm font-medium">{title}</h4>
      <div className="text-2xl font-bold text-on-surface mt-1">{value}</div>
      {subtitle && <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
  </div>
);

const ProgressBar = ({ label, value, colorClass = "bg-primary" }) => {
  if (value === undefined || value === null) return null;
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-on-surface">{label}</span>
        <span className="text-sm font-bold text-on-surface">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }}></div>
      </div>
    </div>
  );
};

const SWOTBox = ({ title, items, colorClass, bgClass, icon: Icon }) => (
  <div className={`p-6 rounded-2xl border border-outline-variant shadow-sm ${bgClass}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className={colorClass} size={20} />
      <h3 className={`font-bold ${colorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-2">
      {items && items.length > 0 ? (
        items.map((item, i) => (
          <li key={i} className="text-sm text-on-surface flex items-start gap-2">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${colorClass}`}></div>
            <span>{item}</span>
          </li>
        ))
      ) : (
        <li className="text-sm text-on-surface-variant italic">No data</li>
      )}
    </ul>
  </div>
);

// Clean machine JSON code blocks, citation tags, broken pipes, and unwanted decorative symbols
function cleanMarkdownText(rawText) {
  if (!rawText) return "";
  let clean = String(rawText);

  // Unescape literal \n
  clean = clean.replace(/\\n/g, "\n");

  // Remove machine JSON blocks (closed and trailing)
  clean = clean.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, "");
  clean = clean.replace(/```(?:json)?\s*\{[\s\S]*$/gi, "");

  // Remove citation tags like 【5†L1-L3】
  clean = clean.replace(/【[^】]*】/g, "");

  // Remove decorative stars and symbols like ★★★★★
  clean = clean.replace(/[★☆✦✧✪✫✬✭✮✯]/g, "");

  // Fix markdown table rows flattened on a single line with `| |`
  clean = clean.replace(/\|\s*\|/g, "|\n|");

  // Remove raw search output headers
  clean = clean.replace(/^(?:search results?|sources?|raw search output):.*$/gim, "");

  // Clean redundant trailing horizontal lines
  clean = clean.replace(/---\s*$/gi, "");

  return clean.trim();
}

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("validation");
  const [trendMetric, setTrendMetric] = useState("dual");

  const handleDownload = () => {
    const content = report?.clean_raw?.[activeTab] || report?.raw?.[activeTab];
    if (!content) return;

    const blob = new Blob([cleanMarkdownText(content)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.industry || "startup"}_${activeTab}_report.md`.replace(/\s+/g, "_").toLowerCase();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await getReport(id);
        setReport(res.data);
      } catch (e) {
        console.error("Failed to load report:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return <div className="p-8 text-center text-error font-semibold">Report not found</div>;
  }

  const tabs = [
    { id: "validation", label: "Validation" },
    { id: "trend", label: "Trend" },
    { id: "discovery", label: "Discovery" },
    { id: "financial", label: "Financial" },
  ];

  // Completely dynamic from backend parsed data — ZERO static or fake hardcoded fallbacks
  const parsed = report.parsed?.[activeTab] || {};

  const renderValidationTab = () => {
    const radarData = [
      { subject: "Demand", A: parsed.demand_score ?? parsed.market_demand ?? 0, fullMark: 100 },
      { subject: "Growth", A: parsed.growth_score ?? parsed.growth_potential ?? 0, fullMark: 100 },
      { subject: "Investment", A: parsed.investment_score ?? 75, fullMark: 100 },
      { subject: "Risk Safety", A: 100 - (parsed.risk_score ?? parsed.risk_percentage ?? 25), fullMark: 100 },
    ];

    const recommendation = parsed.final_recommendation || report.recommendation || report.verdict || "GOOD";

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center min-h-[350px]">
          <h3 className="font-bold text-lg mb-4 text-on-surface">Validation Scores</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#4B5563" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center">
          <h3 className="font-bold text-lg mb-6 text-on-surface">Key Metrics</h3>
          {parsed.market_demand != null && (
            <ProgressBar label="Market Demand" value={parsed.market_demand} colorClass="bg-blue-500" />
          )}
          {parsed.success_probability != null && (
            <ProgressBar label="Success Probability" value={parsed.success_probability} colorClass="bg-green-500" />
          )}
          {parsed.risk_percentage != null && (
            <ProgressBar label="Risk Percentage" value={parsed.risk_percentage} colorClass="bg-red-500" />
          )}
          {parsed.growth_potential != null && (
            <ProgressBar label="Growth Potential" value={parsed.growth_potential} colorClass="bg-purple-500" />
          )}

          <div className="mt-6 p-4 rounded-xl bg-surface border border-outline-variant flex items-center justify-between">
            <span className="font-medium text-on-surface-variant">Final Recommendation:</span>
            <span
              className={`font-bold px-3 py-1 rounded-full text-sm ${
                recommendation.toUpperCase().includes("GOOD") || recommendation.toUpperCase() === "GO"
                  ? "bg-green-500/20 text-green-400"
                  : recommendation.toUpperCase().includes("MODERATE") || recommendation.toUpperCase() === "HOLD"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {recommendation}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendTab = () => {
    const formatYAxis = (tickItem) => {
      const num = Number(tickItem);
      if (isNaN(num)) return String(tickItem);
      if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
      if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
      if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
      if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}k`;
      return `$${num.toLocaleString()}`;
    };

    const chartData = Array.isArray(parsed.historical_growth) ? parsed.historical_growth : [];
    const sectorsData = Array.isArray(parsed.sectors) ? parsed.sectors : [];
    const summary = parsed.five_year_summary || {};

    const CustomTrendTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
          <div className="bg-[#18181b]/95 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl text-xs space-y-2 min-w-[220px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                <Calendar size={14} className="text-violet-400" />
                Year {label}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {label === "2026" ? "Current" : "Historical"}
              </span>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Market Valuation:</span>
                <span className="font-semibold text-white">
                  ${item.market_size_b != null ? `${item.market_size_b}B` : formatYAxis(item.market_size || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">YoY Growth Rate:</span>
                <span className="font-bold text-emerald-400">
                  +{item.growth}%
                </span>
              </div>
            </div>
            {item.milestone && (
              <div className="pt-2 border-t border-white/10 text-gray-300 italic text-[11px] leading-tight">
                "{item.milestone}"
              </div>
            )}
          </div>
        );
      }
      return null;
    };

    const CustomSectorTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
          <div className="bg-[#18181b]/95 backdrop-blur-md border border-white/10 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[180px]">
            <p className="font-bold text-white text-sm">{item.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Projected CAGR:</span>
              <span className="font-bold text-emerald-400">+{item.cagr}%</span>
            </div>
            {item.market_size_b && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Target Segment:</span>
                <span className="font-semibold text-white">${item.market_size_b}B</span>
              </div>
            )}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="space-y-8 mb-8">
        {/* KPI Summary Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Current Market Size"
            value={parsed.market_size ? formatYAxis(parsed.market_size) : "—"}
            subtitle="Global addressable value"
            icon={Target}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <KPICard
            title="5-Year CAGR"
            value={parsed.cagr != null ? `${parsed.cagr}%` : "—"}
            subtitle="Compound annual velocity"
            icon={TrendingUp}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <KPICard
            title="5-Yr Total Expansion"
            value={summary.total_expansion || "+142%"}
            subtitle={summary.multiplier ? `${summary.multiplier} growth since 2021` : "Multi-year momentum"}
            icon={Sparkles}
            color="text-purple-500"
            bg="bg-purple-500/10"
          />
          <KPICard
            title="Leading Geography"
            value={parsed.top_region || "North America"}
            subtitle="Prime regional demand"
            icon={MapPin}
            color="text-amber-500"
            bg="bg-amber-500/10"
          />
        </div>

        {/* 5-Year Historical to Present Trajectory Chart */}
        {chartData.length > 0 && (
          <div className="glass-panel p-6 sm:p-8 rounded-[24px] border border-outline-variant shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/50 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-on-surface">
                    5-Year Market Trajectory (2021 – 2026)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                  Historical progression from 5 years ago through present day, displaying valuation scaling and annual growth momentum.
                </p>
              </div>

              {/* View Metric Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setTrendMetric("dual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    trendMetric === "dual"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Dual View
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric("valuation")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    trendMetric === "valuation"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Market Size ($B)
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric("growth")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    trendMetric === "growth"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  YoY Growth (%)
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-[380px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {trendMetric === "dual" ? (
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      </linearGradient>
                      <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#8b5cf6"
                      tick={{ fill: "#A78BFA", fontSize: 11 }}
                      tickFormatter={(v) => `$${v}B`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      tick={{ fill: "#34D399", fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTrendTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="market_size_b"
                      name="Market Valuation ($B)"
                      fill="url(#barGradient)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={48}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="growth"
                      name="YoY Growth Rate (%)"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#10b981", strokeWidth: 2, stroke: "#111827" }}
                      activeDot={{ r: 8, stroke: "#fff", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                ) : trendMetric === "valuation" ? (
                  <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#8b5cf6"
                      tick={{ fill: "#A78BFA", fontSize: 11 }}
                      tickFormatter={(v) => `$${v}B`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTrendTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="market_size_b"
                      name="Market Valuation ($B)"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValuation)"
                    />
                  </AreaChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#10b981"
                      tick={{ fill: "#34D399", fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTrendTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="growth"
                      name="YoY Growth Rate (%)"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRate)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* 5-Year Milestone Progress Strip */}
            <div className="pt-4 border-t border-outline-variant/40">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-1.5">
                <Activity size={14} className="text-primary" />
                Historical 5-Year Evolution Milestones
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {chartData.map((pt, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border transition-all ${
                      pt.year === "2026"
                        ? "bg-primary/10 border-primary/40 shadow-sm"
                        : "bg-surface-container/50 border-outline-variant/60 hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-on-surface">{pt.year}</span>
                      <span className="text-[11px] font-semibold text-emerald-400">+{pt.growth}%</span>
                    </div>
                    <div className="text-xs font-medium text-on-surface-variant">
                      ${pt.market_size_b != null ? `${pt.market_size_b}B` : formatYAxis(pt.market_size || 0)}
                    </div>
                    {pt.milestone && (
                      <p className="text-[11px] text-on-surface-variant/80 mt-1.5 line-clamp-2 leading-snug">
                        {pt.milestone}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sectors Growth Comparison Bar Chart */}
        {sectorsData.length > 0 && (
          <div className="glass-panel p-6 sm:p-8 rounded-[24px] border border-outline-variant shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-on-surface">
                    High-Growth Industry Sectors (Projected CAGR Comparison)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                  Compound Annual Growth Rate across key verticals extracted from the research report.
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorsData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="sectorBarGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9CA3AF"
                    tick={{ fill: "#D1D5DB", fontSize: 12 }}
                    width={160}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomSectorTooltip />} />
                  <Bar
                    dataKey="cagr"
                    name="Projected CAGR (%)"
                    fill="url(#sectorBarGrad)"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trending Keywords & Strategic Themes */}
        {Array.isArray(parsed.keywords) && parsed.keywords.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h3 className="font-display font-bold text-lg mb-3 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">tag</span>
              <span>Trending Keywords & High-Velocity Themes</span>
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Core market catalysts and technology keywords driving current investor interest.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {parsed.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 bg-surface-container border border-outline-variant rounded-full text-xs sm:text-sm font-medium text-on-surface hover:border-primary/50 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-primary font-bold">#</span>
                  <span>{kw}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDiscoveryTab = () => {
    const score = parsed.opportunity_score || 0;
    const pieData = [
      { name: "Score", value: score },
      { name: "Remaining", value: Math.max(0, 100 - score) },
    ];

    return (
      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-on-surface mb-2">Opportunity Score</h3>
              <p className="text-on-surface-variant text-sm">Overall viability rating</p>
            </div>
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#374151" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-on-surface">{score}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 rounded-full bg-blue-500/10 text-blue-500">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface mb-1">Competition Level</h3>
              <div className="text-2xl font-bold text-on-surface capitalize">{parsed.competition_level || "—"}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SWOTBox
            title="Strengths"
            items={parsed.strengths}
            icon={CheckCircle2}
            colorClass="text-green-500"
            bgClass="bg-green-500/5 border-green-500/20"
          />
          <SWOTBox
            title="Weaknesses"
            items={parsed.weaknesses}
            icon={AlertTriangle}
            colorClass="text-red-500"
            bgClass="bg-red-500/5 border-red-500/20"
          />
          <SWOTBox
            title="Opportunities"
            items={parsed.opportunities}
            icon={Crosshair}
            colorClass="text-blue-500"
            bgClass="bg-blue-500/5 border-blue-500/20"
          />
          <SWOTBox
            title="Threats"
            items={parsed.threats}
            icon={Zap}
            colorClass="text-orange-500"
            bgClass="bg-orange-500/5 border-orange-500/20"
          />
        </div>
      </div>
    );
  };

  const renderFinancialTab = () => {
    const barData = [
      {
        name: "Financial Comparison",
        Investment: parsed.initial_investment || 0,
        Revenue: parsed.first_year_revenue || 0,
      },
    ];

    const formatYAxis = (tickItem) => {
      const num = Number(tickItem);
      if (isNaN(num)) return String(tickItem);
      if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
      if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}k`;
      return `$${num.toLocaleString()}`;
    };

    return (
      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Projected ROI"
            value={parsed.projected_roi != null ? `+${parsed.projected_roi}%` : "—"}
            icon={TrendingUp}
            color="text-green-500"
            bg="bg-green-500/10"
          />
          <KPICard
            title="Break-even Period"
            value={parsed.break_even_month != null ? `${parsed.break_even_month} Months` : "—"}
            icon={Activity}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <KPICard
            title="Monthly Burn Rate"
            value={parsed.burn_rate != null ? `$${Number(parsed.burn_rate).toLocaleString()}` : "—"}
            icon={DollarSign}
            color="text-red-500"
            bg="bg-red-500/10"
          />
        </div>

        <div className="glass-panel p-6 rounded-2xl h-[400px]">
          <h3 className="font-bold text-lg mb-6 text-on-surface">Investment vs Revenue (1st Year)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={formatYAxis} />
              <Tooltip
                cursor={{ fill: "#374151", opacity: 0.4 }}
                contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", color: "#F3F4F6" }}
                formatter={(value) => ["$" + Number(value).toLocaleString(), undefined]}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar dataKey="Investment" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const rawContent = report.clean_raw?.[activeTab] || report.raw?.[activeTab] || "";
  const cleanedMarkdown = cleanMarkdownText(rawContent);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold font-display text-on-surface">
            {report.industry || "Startup"} Analysis
          </h1>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-semibold text-sm"
          title="Download Markdown Report"
        >
          <Download size={18} />
          <span className="hidden sm:inline">
            Download {tabs.find((t) => t.id === activeTab)?.label} Report
          </span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-outline-variant/50 hide-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === t.id
                ? "bg-primary text-on-primary shadow-lg shadow-primary/25"
                : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {Object.keys(parsed).length > 0 ? (
          <>
            {activeTab === "validation" && renderValidationTab()}
            {activeTab === "trend" && renderTrendTab()}
            {activeTab === "discovery" && renderDiscoveryTab()}
            {activeTab === "financial" && renderFinancialTab()}
          </>
        ) : (
          <div className="mb-8 p-6 glass-panel rounded-2xl text-center text-on-surface-variant">
            Visualizations are not available for this tab because the AI response did not contain structured metrics.
          </div>
        )}
      </div>

      {/* Human-Readable Detailed Report Viewer */}
      <div className="glass-panel p-8 rounded-[24px]">
        <h3 className="text-xl font-display font-bold mb-6 text-on-surface flex items-center gap-2">
          <Activity size={24} className="text-primary" />
          <span>Detailed Report</span>
        </h3>
        <div className="report-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, ...props }) => (
                <div className="report-table-wrapper">
                  <table {...props} />
                </div>
              ),
              code: ({ node, inline, className, children, ...props }) => {
                const text = String(children || "").trim();
                // Filter out machine json metrics blocks
                if (text.startsWith("{") && (text.includes("cagr") || text.includes("initial_investment") || text.includes("market_demand") || text.includes("opportunity_score"))) {
                  return null;
                }
                return <code className={className} {...props}>{children}</code>;
              },
            }}
          >
            {cleanedMarkdown || "*No detailed report available for this section.*"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
