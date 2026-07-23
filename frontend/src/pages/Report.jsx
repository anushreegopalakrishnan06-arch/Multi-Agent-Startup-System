import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getReport } from "../services/api";
import ReactMarkdown from "react-markdown";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, DollarSign, Target, Activity, Zap, CheckCircle2, AlertTriangle, Crosshair, MapPin, Download } from "lucide-react";

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

const ProgressBar = ({ label, value, colorClass = "bg-primary" }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-on-surface">{label}</span>
      <span className="text-sm font-bold text-on-surface">{value}%</span>
    </div>
    <div className="w-full bg-surface-variant rounded-full h-2.5">
      <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const SWOTBox = ({ title, items, colorClass, bgClass, icon: Icon }) => (
  <div className={`p-6 rounded-2xl border border-outline-variant shadow-sm ${bgClass}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className={colorClass} size={20} />
      <h3 className={`font-bold ${colorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-2">
      {items && items.length > 0 ? items.map((item, i) => (
        <li key={i} className="text-sm text-on-surface flex items-start gap-2">
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${colorClass}`}></div>
          {item}
        </li>
      )) : <li className="text-sm text-on-surface-variant italic">No data</li>}
    </ul>
  </div>
);

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("validation");

  const handleDownload = () => {
    const content = report?.raw?.[activeTab];
    if (!content) return;
    
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.industry || "startup"}_${activeTab}_report.md`.replace(/\s+/g, '_').toLowerCase();
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
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-center flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!report) return <div className="p-8 text-center text-error">Report not found</div>;

  const tabs = [
    { id: "validation", label: "Validation" },
    { id: "trend", label: "Trend" },
    { id: "discovery", label: "Discovery" },
    { id: "financial", label: "Financial" },
  ];
  
  const parsed = report.parsed?.[activeTab] || {};

  const renderValidationTab = () => {
    const radarData = [
      { subject: 'Demand', A: parsed.demand_score || 0, fullMark: 100 },
      { subject: 'Growth', A: parsed.growth_score || 0, fullMark: 100 },
      { subject: 'Investment', A: parsed.investment_score || 0, fullMark: 100 },
      { subject: 'Risk', A: 100 - (parsed.risk_score || 0), fullMark: 100 },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center min-h-[350px]">
          <h3 className="font-bold text-lg mb-4 text-on-surface">Validation Scores</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#4B5563" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center">
          <h3 className="font-bold text-lg mb-6 text-on-surface">Key Metrics</h3>
          <ProgressBar label="Market Demand" value={parsed.market_demand || 0} colorClass="bg-blue-500" />
          <ProgressBar label="Success Probability" value={parsed.success_probability || 0} colorClass="bg-green-500" />
          <ProgressBar label="Risk Percentage" value={parsed.risk_percentage || 0} colorClass="bg-red-500" />
          <ProgressBar label="Growth Potential" value={parsed.growth_potential || 0} colorClass="bg-purple-500" />
          
          <div className="mt-6 p-4 rounded-xl bg-surface border border-outline-variant flex items-center justify-between">
            <span className="font-medium text-on-surface-variant">Final Recommendation:</span>
            <span className={`font-bold px-3 py-1 rounded-full text-sm ${
              parsed.final_recommendation === 'GOOD' ? 'bg-green-500/20 text-green-400' :
              parsed.final_recommendation === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {parsed.final_recommendation || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendTab = () => {
    const formatYAxis = (tickItem) => {
      if (tickItem >= 1000000) return (tickItem / 1000000).toFixed(1) + 'M';
      if (tickItem >= 1000) return (tickItem / 1000).toFixed(1) + 'k';
      return tickItem;
    };
    
    const chartData = Array.isArray(parsed.historical_growth) ? parsed.historical_growth : [];

    return (
      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard 
            title="Market Size" 
            value={`$${formatYAxis(parsed.market_size || 0)}`} 
            icon={Target} 
            color="text-blue-500" 
            bg="bg-blue-500/10" 
          />
          <KPICard 
            title="CAGR" 
            value={`${parsed.cagr || 0}%`} 
            icon={TrendingUp} 
            color="text-green-500" 
            bg="bg-green-500/10" 
          />
          <KPICard 
            title="Top Region" 
            value={parsed.top_region || 'N/A'} 
            icon={MapPin} 
            color="text-purple-500" 
            bg="bg-purple-500/10" 
          />
        </div>
        
        {chartData.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl h-[400px]">
            <h3 className="font-bold text-lg mb-6 text-on-surface">Market Growth Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Area type="monotone" dataKey="growth" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {parsed.keywords && parsed.keywords.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-4 text-on-surface">Trending Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {parsed.keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-surface border border-outline-variant rounded-full text-sm text-on-surface-variant">
                  #{kw}
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
      { name: 'Score', value: score },
      { name: 'Remaining', value: 100 - score }
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
               <div className="text-2xl font-bold text-on-surface capitalize">{parsed.competition_level || 'N/A'}</div>
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
        name: 'Financial Comparison',
        Investment: parsed.initial_investment || 0,
        Revenue: parsed.first_year_revenue || 0,
      }
    ];

    const formatYAxis = (tickItem) => {
      if (tickItem >= 1000) return '$' + (tickItem / 1000).toFixed(0) + 'k';
      return '$' + tickItem;
    };

    return (
      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard 
            title="Projected ROI" 
            value={`${parsed.projected_roi || 0}%`} 
            icon={TrendingUp} 
            color="text-green-500" 
            bg="bg-green-500/10" 
          />
          <KPICard 
            title="Break-even Period" 
            value={`${parsed.break_even_month || 0} Months`} 
            icon={Activity} 
            color="text-blue-500" 
            bg="bg-blue-500/10" 
          />
          <KPICard 
            title="Monthly Burn Rate" 
            value={`$${(parsed.burn_rate || 0).toLocaleString()}`} 
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
                cursor={{ fill: '#374151', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                formatter={(value) => ['$' + value.toLocaleString(), undefined]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Investment" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors">← Back</Link>
          <h1 className="text-3xl font-bold font-display text-on-surface">{report.industry} Analysis</h1>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-semibold text-sm"
          title="Download Markdown Report"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Download {tabs.find(t => t.id === activeTab)?.label} Report</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-outline-variant/50 hide-scrollbar">
        {tabs.map(t => (
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
            Visualizations are not available for this tab because the AI response could not be parsed into strict metrics.
          </div>
        )}
      </div>

      <div className="glass-panel p-8 rounded-[24px]">
        <h3 className="text-xl font-display font-bold mb-6 text-on-surface flex items-center gap-2">
          <Activity size={24} className="text-primary" />
          Detailed Report
        </h3>
        <div className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-primary prose-primary">
          <ReactMarkdown>
            {report.raw?.[activeTab] || "*No detailed report available for this section.*"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
