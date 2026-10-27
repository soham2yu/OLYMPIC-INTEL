import React, { useEffect, useState } from 'react';
import {
  Flame,
  TrendingUp,
  Award,
  Sun,
  Snowflake,
  Info,
  Calendar,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api } from '../services/api';
import { HostsData } from '../types/analytics';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const HostAnalysisPage: React.FC = () => {
  const { filters, setSelectedCountryForModal } = useFilters();
  const [data, setData] = useState<HostsData | null>(null);
  const [selectedTrajectoryHost, setSelectedTrajectoryHost] = useState<string>('FRA');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getHosts(filters.metricMode);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load host-nation analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchHosts();
  }, [filters.metricMode]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error || !data) {
    return <div className="p-8 text-center text-red-400 bg-slate-900 rounded-2xl">{error || 'Error loading host analysis'}</div>;
  }

  const { host_editions, host_trajectories, comparison_table, summer_avg_lift, winter_avg_lift, causal_disclaimer } = data;

  const currentTrajectory = host_trajectories.find(t => t.country_noc === selectedTrajectoryHost) || host_trajectories[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-500" />
            Host-Nation Performance & Advantage Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical before-during-after hosting trajectories and home-soil medal lift quantification.
          </p>
        </div>
      </div>

      {/* Lift Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-yellow-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-yellow-500/20 text-yellow-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Summer Host Average Lift</span>
            <p className="text-2xl font-black text-white mt-0.5">+{summer_avg_lift} Medals</p>
            <p className="text-[10px] text-yellow-400">Above adjacent cycle baseline</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Winter Host Average Lift</span>
            <p className="text-2xl font-black text-white mt-0.5">+{winter_avg_lift} Medals</p>
            <p className="text-[10px] text-sky-400">Above adjacent cycle baseline</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300">
            <Calendar className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Verified Host Editions</span>
            <p className="text-2xl font-black text-white mt-0.5">{host_editions.length} Editions</p>
            <p className="text-[10px] text-slate-400">From 1992 to Milano 2026</p>
          </div>
        </div>
      </div>

      {/* Trajectory: Before, During, and After Hosting */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              Before, During, and After Hosting Trajectory
            </h2>
            <p className="text-xs text-slate-400">Comparing Olympic cycles surrounding the host year</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Host Country:</span>
            <select
              value={selectedTrajectoryHost}
              onChange={(e) => setSelectedTrajectoryHost(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-yellow-500"
            >
              {host_trajectories.map((t) => (
                <option key={t.country_noc} value={t.country_noc}>
                  {t.country_name} ({t.host_edition})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentTrajectory && (
          <div>
            <p className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg mb-3">
              {currentTrajectory.observation}
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentTrajectory.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="edition_label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    formatter={(val, name, item) => [`${val} Medals`, `Edition: ${item.payload.edition}`]}
                  />
                  <Line type="monotone" dataKey="medals" stroke="#eab308" strokeWidth={3} dot={{ r: 5, fill: '#eab308' }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="gold" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Host Nation Comparison Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <h2 className="text-sm font-bold text-white">Verified Host Nations Ledger (1992 - 2026)</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Edition</th>
                <th className="py-2.5 px-3">Host City & Nation</th>
                <th className="py-2.5 px-3">Season</th>
                <th className="py-2.5 px-3 text-right">Host Medals</th>
                <th className="py-2.5 px-3 text-right">Host Rank</th>
                <th className="py-2.5 px-3 text-right">Pre-Host Medals</th>
                <th className="py-2.5 px-3 text-right">Post-Host Medals</th>
                <th className="py-2.5 px-3 text-right font-bold text-yellow-400">Home Soil Lift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {comparison_table.map((row) => (
                <tr
                  key={row.edition}
                  onClick={() => setSelectedCountryForModal(row.host_noc)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-white">{row.edition}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-200">{row.city}, {row.host_country}</span>
                    <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {row.host_noc}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        row.season === 'Summer' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-sky-500/10 text-sky-400'
                      }`}
                    >
                      {row.season}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">{row.host_medals}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400 font-mono">#{row.host_rank}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{row.pre_host_medals ?? '—'}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{row.post_host_medals ?? '—'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-yellow-400">
                    {row.home_advantage_lift > 0 ? `+${row.home_advantage_lift}%` : `${row.home_advantage_lift}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-Causal Scientific Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-200 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Non-Causal Statistical Standards:
        </p>
        <p className="text-[11px] leading-relaxed">{causal_disclaimer}</p>
      </div>
    </div>
  );
};
