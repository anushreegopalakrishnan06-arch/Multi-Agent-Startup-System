import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { CheckCircle2, AlertTriangle, XCircle, Zap, Target, TrendingUp } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-surface-container rounded-2xl p-6 border border-outline-variant ${className}`}>
    {children}
  </div>
);

const ScoreRing = ({ score, label }) => {
  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-surface-container-highest ${getScoreColor(score)}`}>
        <span className="text-2xl font-bold font-display">{score}</span>
      </div>
      <span className="mt-3 text-sm font-medium text-on-surface-variant uppercase tracking-wider">{label}</span>
    </div>
  );
};

const ValidationCharts = ({ data }) => {
  if (!data) return null;

  const radarData = [
    { subject: 'Demand', A: data.demand_score || 0, fullMark: 100 },
    { subject: 'Growth', A: data.growth_score || 0, fullMark: 100 },
    { subject: 'Investment', A: data.investment_score || 0, fullMark: 100 },
    { subject: 'Risk', A: 100 - (data.risk_score || 0), fullMark: 100 }, // Invert risk for radar (higher is better)
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <Card className="flex flex-col items-center justify-center min-h-[300px]">
        <h4 className="text-lg font-bold mb-4 w-full text-left">Category Scores</h4>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#444" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a9b1d6', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1c1b1c', border: '1px solid #444', borderRadius: '8px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <h4 className="text-lg font-bold mb-4">Key Metrics</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-on-surface">Market Demand</span>
                <span className="text-sm font-medium text-primary">{data.market_demand}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${data.market_demand}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-on-surface">Success Probability</span>
                <span className="text-sm font-medium text-emerald-500">{data.success_probability}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${data.success_probability}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-on-surface">Risk Level</span>
                <span className="text-sm font-medium text-rose-500">{data.risk_percentage}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${data.risk_percentage}%` }}></div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="flex items-center gap-4 bg-primary-container/20 border-primary/30">
          <div className="p-3 bg-primary/20 rounded-full text-primary">
            {data.final_recommendation === 'GOOD' ? <CheckCircle2 size={32} /> : 
             data.final_recommendation === 'MODERATE' ? <AlertTriangle size={32} /> : 
             <XCircle size={32} />}
          </div>
          <div>
            <p className="text-sm text-on-surface-variant mb-1">Final Verdict</p>
            <h3 className="text-xl font-bold font-display tracking-wide">{data.final_recommendation} STARTUP IDEA</h3>
          </div>
        </Card>
      </div>
    </div>
  );
};

const TrendCharts = ({ data }) => {
  if (!data) return null;

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/20 text-emerald-500 rounded-2xl"><TrendingUp size={28} /></div>
          <div>
            <p className="text-sm text-on-surface-variant">Expected CAGR</p>
            <p className="text-2xl font-bold">{data.cagr}%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 text-blue-500 rounded-2xl"><Target size={28} /></div>
          <div>
            <p className="text-sm text-on-surface-variant">Market Size</p>
            <p className="text-2xl font-bold">${(data.market_size || 0).toLocaleString()}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 text-purple-500 rounded-2xl"><Zap size={28} /></div>
          <div>
            <p className="text-sm text-on-surface-variant">Top Region</p>
            <p className="text-xl font-bold">{data.top_region}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h4 className="text-lg font-bold mb-4">Historical / Projected Growth</h4>
          {data.historical_growth && data.historical_growth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.historical_growth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1c1b1c', border: '1px solid #444', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="growth" stroke="#10b981" fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-on-surface-variant text-sm">
              Growth projection data not available.
            </div>
          )}
        </Card>

        <Card>
          <h4 className="text-lg font-bold mb-4">Trending Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {data.keywords?.map((kw, i) => (
              <span key={i} className="px-3 py-1.5 bg-surface-container-high border border-outline-variant rounded-full text-sm font-medium">
                #{kw}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const DiscoveryCharts = ({ data }) => {
  if (!data) return null;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 flex justify-center items-center py-8">
          <ScoreRing score={data.opportunity_score} label="Opportunity Score" />
        </Card>
        <Card className="flex-1 flex justify-center items-center py-8 bg-surface-container-high border-none">
          <div className="text-center">
            <p className="text-sm text-on-surface-variant uppercase tracking-wider mb-2">Competition Level</p>
            <h3 className={`text-4xl font-black ${
              data.competition_level?.toLowerCase() === 'low' ? 'text-emerald-500' :
              data.competition_level?.toLowerCase() === 'medium' ? 'text-amber-500' : 'text-rose-500'
            }`}>{data.competition_level}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <h4 className="text-emerald-500 font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">add_circle</span> Strengths
          </h4>
          <ul className="space-y-2">
            {data.strengths?.map((s, i) => <li key={i} className="text-sm text-on-surface-variant">• {s}</li>)}
          </ul>
        </Card>
        <Card className="border-l-4 border-l-rose-500">
          <h4 className="text-rose-500 font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">do_not_disturb_on</span> Weaknesses
          </h4>
          <ul className="space-y-2">
            {data.weaknesses?.map((s, i) => <li key={i} className="text-sm text-on-surface-variant">• {s}</li>)}
          </ul>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <h4 className="text-blue-500 font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">lightbulb</span> Opportunities
          </h4>
          <ul className="space-y-2">
            {data.opportunities?.map((s, i) => <li key={i} className="text-sm text-on-surface-variant">• {s}</li>)}
          </ul>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <h4 className="text-amber-500 font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span> Threats
          </h4>
          <ul className="space-y-2">
            {data.threats?.map((s, i) => <li key={i} className="text-sm text-on-surface-variant">• {s}</li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
};

const FinancialCharts = ({ data }) => {
  if (!data) return null;

  const barData = [
    { name: 'Financials', Investment: data.initial_investment || 0, Revenue: data.first_year_revenue || 0 }
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-on-surface-variant mb-1">Projected ROI</p>
          <p className="text-3xl font-bold text-emerald-500">+{data.projected_roi}%</p>
        </Card>
        <Card>
          <p className="text-sm text-on-surface-variant mb-1">Break-even</p>
          <p className="text-3xl font-bold text-blue-400">{data.break_even_month} <span className="text-lg">Months</span></p>
        </Card>
        <Card>
          <p className="text-sm text-on-surface-variant mb-1">Monthly Burn Rate</p>
          <p className="text-3xl font-bold text-rose-400">${(data.burn_rate || 0).toLocaleString()}</p>
        </Card>
      </div>

      <Card>
        <h4 className="text-lg font-bold mb-6">Investment vs Year 1 Revenue</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" tickFormatter={(val) => `$${val/1000}k`} />
            <RechartsTooltip 
              cursor={{fill: '#2a2a2a'}}
              contentStyle={{ backgroundColor: '#1c1b1c', border: '1px solid #444', borderRadius: '8px' }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Legend />
            <Bar dataKey="Investment" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export const ReportVisuals = ({ tabId, parsedData }) => {
  if (!parsedData) return null;

  switch (tabId) {
    case 'validation':
      return <ValidationCharts data={parsedData} />;
    case 'trend':
      return <TrendCharts data={parsedData} />;
    case 'discovery':
      return <DiscoveryCharts data={parsedData} />;
    case 'financial':
      return <FinancialCharts data={parsedData} />;
    default:
      return null;
  }
};

export default ReportVisuals;
