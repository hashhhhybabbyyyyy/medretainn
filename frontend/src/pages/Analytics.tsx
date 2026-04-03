import React, { useEffect, useState } from 'react';
import {
  getSummary,
  getRetentionTrend,
  getConditionsBreakdown,
  getMLModelInfo,
  getMLFeatureImportance,
  getPatientRiskAnalysis,
  AnalyticsSummary,
  RetentionTrendResponse
} from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Users, AlertTriangle, Activity,
  Brain, Target, ShieldCheck, ChevronRight, Search, Info
} from 'lucide-react';
import KPICards from '../components/KPICards';

const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trendData, setTrendData] = useState<RetentionTrendResponse | null>(null);
  const [conditionsData, setConditionsData] = useState<any>(null);
  const [mlModelInfo, setMlModelInfo] = useState<any>(null);
  const [featureImportance, setFeatureImportance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Insights search state
  const [searchPatientId, setSearchPatientId] = useState('');
  const [patientInsights, setPatientInsights] = useState<any>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, trend, conditions, modelInfo, features] = await Promise.all([
        getSummary(),
        getRetentionTrend(),
        getConditionsBreakdown(),
        getMLModelInfo(),
        getMLFeatureImportance()
      ]);

      setSummary(summaryData);
      setTrendData(trend);
      setConditionsData(conditions);
      setMLModelInfo(modelInfo);
      setFeatureImportance(features);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSearch = async () => {
    if (!searchPatientId.trim()) return;

    setInsightsLoading(true);
    try {
      const [insights, details] = await Promise.all([
        getPatientRiskAnalysis(searchPatientId),
        // Direct fetch for details to avoid dependency loop in api.ts
        fetch(`${(import.meta.env.VITE_API_URL || '/api')}/patients/${searchPatientId}`).then((res: any) => res.json())
      ]);
      setPatientInsights(insights);
      setPatientDetails(details);
    } catch (err: any) {
      console.error('Failed to get patient insights:', err);
      setPatientInsights(null);
      setPatientDetails(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Risk Intelligence</h1>
          <p className="text-slate-400 font-medium">AI-driven predictive analytics for patient retention</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-2xl border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Activity size={14} className="text-blue-500" />
          Live System Monitoring
        </div>
      </div>

      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Retention Trend Chart */}
        <div className="lg:col-span-2 bg-[#141921] p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                <TrendingUp className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Retention Velocity</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Historical Trends (6 Months)</p>
              </div>
            </div>
          </div>

          <div className="h-[350px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData?.trend || []}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => `${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="patient_count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-[#141921] p-8 rounded-[32px] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
              <Brain className="text-indigo-500" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">ML Driver Analysis</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Key Churn Predictors</p>
            </div>
          </div>

          <div className="space-y-6">
            {featureImportance?.features?.map((feat: any, idx: any) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{feat.feature}</span>
                  <span className="text-xs font-black text-indigo-400">{Math.round(feat.importance * 100)}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.03]">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${feat.importance * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed text-indigo-300/70">
                Our Random Forest model (v{mlModelInfo?.version || '1.2.0'}) identifies <b>{featureImportance?.features?.[0]?.feature}</b> as the primary driver of patient attrition in the current quarter.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conditions Pie Chart */}
        <div className="bg-[#141921] p-8 rounded-[32px] border border-white/5 relative group">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <Target className="text-emerald-500" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Condition Distribution</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Population Breakdown</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionsData?.conditions || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="name"
                    stroke="none"
                  >
                    {(conditionsData?.conditions || []).map((entry: any, index: any) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0a0d12', border: 'none', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {conditionsData?.conditions?.map((item: any, idx: any) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][idx % 5] }} />
                    <span className="text-xs font-bold text-slate-400 capitalize">{item.name}</span>
                  </div>
                  <div className="text-lg font-black text-white ml-4">{item.count} <span className="text-[10px] text-slate-600 font-bold uppercase">Patients</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Patient Analyzer */}
        <div className="bg-[#141921] p-8 rounded-[32px] border border-white/5 relative flex flex-col group transition-all hover:border-blue-500/20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="text-blue-500" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Patient Insight</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Individual Risk Profile</p>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative group-focus-within:scale-[1.01] transition-transform duration-300">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                value={searchPatientId}
                onChange={(e: any) => setSearchPatientId(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && handlePatientSearch()}
                placeholder="Enter Patient ID (e.g. PAT-1001)..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
              />
            </div>
            <button
              onClick={handlePatientSearch}
              disabled={insightsLoading}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {insightsLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {patientInsights && patientDetails ? (
            <div className="flex-1 bg-black/40 rounded-3xl p-6 border border-white/10 relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xl font-bold text-white mb-1">{patientDetails.full_name}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{patientDetails.patient_id} • Age {patientDetails.age}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black ${patientInsights.risk_label === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {patientInsights.risk_score.toFixed(1)}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Churn Probability</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contributing Factors</div>
                <div className="flex flex-wrap gap-2">
                  {patientInsights.risk_factors?.map((f: any, i: any) => (
                    <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[11px] font-bold text-slate-300">
                      {f.factor}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1.5">AI Recommendation</div>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {patientInsights.recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center p-12 text-center opacity-40">
              <Activity size={48} className="text-slate-600 mb-6" />
              <p className="text-sm font-medium text-slate-500">Analyze individual patient churn risk<br />using our predictive neural engine</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;