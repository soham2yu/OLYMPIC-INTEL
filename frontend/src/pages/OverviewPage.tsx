import React, { useEffect, useState } from 'react';
import {
  Award,
  Users,
  Trophy,
  Globe2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api } from '../services/api';
import { OverviewData } from '../types/analytics';
import { KPICard } from '../components/common/KPICard';
import { LoadingSkeleton, ChartSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { filters, setSelectedCountryForModal, setSelectedSportForModal } = useFilters();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getOverview(filters);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load overview data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error || !data) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-red-500/30 rounded-2xl text-red-400">
        <p className="font-semibold text-lg">{error || 'Unable to load overview data'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, historical_trends, top_countries, medal_distribution, athlete_trends, sports_participation, recent_insights } = data;

  const medalDonutData = [
    { name: 'Gold', value: medal_distribution.Gold, color: '#eab308' },
    { name: 'Silver', value: medal_distribution.Silver, color: '#94a3b8' },
    { name: 'Bronze', value: medal_distribution.Bronze, color: '#d97706' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Olympic Performance Intelligence Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Global Olympic Sports Performance Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {kpis.metric_note} Analysis spanning {kpis.coverage_period} across Summer and Winter Games.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Metric</span>
            <span className="font-semibold text-yellow-400">
              {filters.metricMode === 'event_medals' ? 'Event Medals (IOC)' : 'Athlete Awards (All)'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Medals"
          value={kpis.total_medals}
          subtitle={`${kpis.gold_medals} Gold · ${kpis.silver_medals} Silver · ${kpis.bronze_medals} Bronze`}
          icon={Award}
          variant="gold"
        />
        <KPICard
          title="Distinct Athletes"
          value={kpis.distinct_athletes}
          subtitle={`Across ${kpis.distinct_countries} Nations`}
          icon={Users}
          variant="blue"
        />
        <KPICard
          title="Nations & NOCs"
          value={kpis.distinct_countries}
          subtitle={`${kpis.distinct_sports} Sports Disciplines`}
          icon={Globe2}
          variant="silver"
        />
        <KPICard
          title="Olympic Editions"
          value={kpis.distinct_editions}
          subtitle={kpis.coverage_period}
          icon={Calendar}
          variant="bronze"
        />
      </div>

      {/* Chart Grid 1: Historical Trend & Top Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Medal Trend (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                Historical Medal Trend by Olympic Edition
              </h2>
              <p className="text-xs text-slate-400">Total medals awarded per Olympic Games edition (1992-2026)</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono">
              {historical_trends.length} editions
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historical_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="edition" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-30} textAnchor="end" height={45} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Legend />
                <Line type="monotone" dataKey="gold" name="Gold" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="silver" name="Silver" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bronze" name="Bronze" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="total" name="Total Medals" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medal Distribution Donut (1 Col) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Medal Composition Share
            </h2>
            <p className="text-xs text-slate-400">Distribution between Gold, Silver, and Bronze awards</p>
          </div>

          <div className="h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={medalDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {medalDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-lg font-black text-white">{kpis.total_medals.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-[10px] text-yellow-400 block font-bold">GOLD</span>
              <span className="text-sm font-bold text-white">{kpis.gold_medals}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-400/10 border border-slate-400/20">
              <span className="text-[10px] text-slate-300 block font-bold">SILVER</span>
              <span className="text-sm font-bold text-white">{kpis.silver_medals}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-600/10 border border-amber-600/20">
              <span className="text-[10px] text-amber-500 block font-bold">BRONZE</span>
              <span className="text-sm font-bold text-white">{kpis.bronze_medals}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Grid 2: Top Countries & Athlete Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Countries */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-sky-400" />
                Top Performing Nations (Click to Drilldown)
              </h2>
              <p className="text-xs text-slate-400">Ranked by Gold, Silver, and Bronze medals</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={top_countries.slice(0, 10)}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedCountryForModal(e.activePayload[0].payload.country_noc);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="country_name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Legend />
                <Bar dataKey="gold" name="Gold" fill="#eab308" stackId="a" cursor="pointer" />
                <Bar dataKey="silver" name="Silver" fill="#94a3b8" stackId="a" cursor="pointer" />
                <Bar dataKey="bronze" name="Bronze" fill="#d97706" stackId="a" cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Athlete Participation Trajectory */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              Athlete Participation Trend
            </h2>
            <p className="text-xs text-slate-400">Total distinct athletes participating per edition</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={athlete_trends}>
                <defs>
                  <linearGradient id="athletesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="edition" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-30} textAnchor="end" height={45} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Area type="monotone" dataKey="athletes" name="Distinct Athletes" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#athletesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dynamic Statistical Insights */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-yellow-400" />
          Reproducible Analytical Observations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recent_insights.map((ins) => (
            <div key={ins.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  {ins.category}
                </span>
                <span className="text-[10px] text-slate-500">{ins.period}</span>
              </div>
              <h4 className="text-xs font-bold text-white">{ins.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{ins.observation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
