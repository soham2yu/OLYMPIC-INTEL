import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Download,
  Upload,
  Info,
  DollarSign,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api } from '../services/api';
import { InvestmentData } from '../types/analytics';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const InvestmentPage: React.FC = () => {
  const { filters, setSelectedCountryForModal } = useFilters();
  const [data, setData] = useState<InvestmentData | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<string>('2021-2024');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getInvestment(selectedCycle, filters.metricMode);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load sports investment analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchInvestment();
  }, [selectedCycle, filters.metricMode]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error || !data) {
    return <div className="p-8 text-center text-red-400 bg-slate-900 rounded-2xl">{error || 'Error loading investment analysis'}</div>;
  }

  const { is_demo_data, data_notice, bubble_data, efficiency_rankings, regional_comparison, opportunities, reporting_cycles, methodology_caveat } = data;

  const CustomBubbleTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs space-y-1 text-slate-200">
          <p className="font-bold text-white text-sm">{p.country_name} ({p.country_noc})</p>
          <p className="text-yellow-400 font-semibold">{p.region} · {p.olympic_cycle}</p>
          <div className="pt-1 border-t border-slate-800 space-y-0.5 text-[11px]">
            <p>Reported Investment: <strong className="text-white">${p.investment_amount_m}M {p.currency}</strong></p>
            <p>Medals Won: <strong className="text-yellow-400">{p.medals}</strong> ({p.gold_medals} Gold)</p>
            <p>Efficiency: <strong className="text-sky-400">{p.medals_per_billion} medals / $1B</strong></p>
            <p>Cost per Medal: <strong className="text-emerald-400">${p.cost_per_medal_m}M</strong></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Scenario B: International Sports Investment Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Sports Funding vs. Olympic Medal Efficiency
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Investigating high-performance returns, regional funding gaps, and cost-per-medal metrics.
          </p>
        </div>

        {/* Cycle selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-yellow-500"
          >
            {reporting_cycles.map((c) => (
              <option key={c} value={c}>
                Cycle: {c}
              </option>
            ))}
          </select>
          <a
            href={api.getTemplateUrl('investment')}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Download CSV schema template"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            Schema Template
          </a>
        </div>
      </div>

      {/* DEMO DATA Banner if active */}
      {is_demo_data && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3 shadow-lg shadow-amber-500/5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-amber-500/20 mr-2">
              DEMO BENCHMARK DATA
            </span>
            <span className="text-slate-300 text-xs">{data_notice}</span>
            <p className="text-[11px] text-slate-400 mt-1">
              To evaluate your own financial data, upload an investment CSV matching the canonical schema in <a href="/data-management" className="text-yellow-400 underline font-semibold">Data Management</a>.
            </p>
          </div>
        </div>
      )}

      {/* Bubble Chart: Investment vs Medals */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Investment vs. Medal Performance Correlation
            </h2>
            <p className="text-xs text-slate-400">X: Reported Budget ($M) · Y: Medals Won · Bubble Size: Distinct Athletes</p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis
                type="number"
                dataKey="investment_amount_m"
                name="Investment ($M)"
                stroke="#94a3b8"
                fontSize={10}
                tickFormatter={(v) => `$${v}M`}
                domain={[0, 'auto']}
              />
              <YAxis
                type="number"
                dataKey="medals"
                name="Medals"
                stroke="#94a3b8"
                fontSize={10}
                domain={[0, 'auto']}
              />
              <ZAxis type="number" dataKey="athletes" range={[60, 450]} />
              <Tooltip content={<CustomBubbleTooltip />} />
              <Scatter name="Nations" data={bubble_data} fill="#eab308" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Efficiency Rankings & Funding Opportunity Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medal Efficiency Table */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            Medal Efficiency Rankings (Medals per $100M Reported)
          </h2>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3 text-right">Budget</th>
                  <th className="py-2.5 px-3 text-right">Medals</th>
                  <th className="py-2.5 px-3 text-right font-bold text-yellow-400">Score</th>
                  <th className="py-2.5 px-3">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {efficiency_rankings.map((r) => (
                  <tr
                    key={r.country_noc}
                    onClick={() => setSelectedCountryForModal(r.country_noc)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-mono font-semibold text-slate-400">{r.rank}</td>
                    <td className="py-2 px-3 font-semibold text-white">
                      {r.country_name} <span className="text-[10px] text-slate-400 font-mono">({r.country_noc})</span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">${r.investment_amount_m}M</td>
                    <td className="py-2 px-3 text-right font-bold text-white">{r.medals}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-yellow-400">{r.efficiency_score}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          r.tier === 'High Efficiency'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : r.tier === 'Moderate Efficiency'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {r.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Funding Opportunity Explorer */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Funding Opportunity Explorer (High Performance / Low Budget)
          </h2>
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {opportunities.map((op) => (
              <div
                key={op.country_noc}
                onClick={() => setSelectedCountryForModal(op.country_noc)}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-yellow-500/40 transition-colors cursor-pointer space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    {op.country_name} ({op.country_noc})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-semibold">
                    {op.category}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{op.rationale}</p>
                <div className="flex items-center gap-4 text-[11px] pt-1 text-slate-300 font-mono">
                  <span>Medals: <strong className="text-white">{op.medals}</strong></span>
                  <span>Budget: <strong className="text-white">${op.investment_amount_m}M</strong></span>
                  <span>Cost/Medal: <strong className="text-emerald-400">${op.cost_per_medal_m}M</strong></span>
                </div>
              </div>
            ))}
            {opportunities.length === 0 && (
              <p className="text-xs text-slate-500 p-6 text-center">No countries currently meet the minimum threshold.</p>
            )}
          </div>
        </div>
      </div>

      {/* Non-Causal Caveat */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-200">Scientific Disclaimer:</p>
        <p className="text-[11px] leading-relaxed">{methodology_caveat}</p>
      </div>
    </div>
  );
};
