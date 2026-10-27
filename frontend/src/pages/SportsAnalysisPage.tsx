import React, { useEffect, useState } from 'react';
import {
  Dumbbell,
  Info,
  Filter,
  Trophy,
  Sliders,
  Grid3X3,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api } from '../services/api';
import { SportsData } from '../types/analytics';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const SportsAnalysisPage: React.FC = () => {
  const { filters, setSelectedSportForModal, setSelectedCountryForModal } = useFilters();
  const [data, setData] = useState<SportsData | null>(null);
  const [minAthletes, setMinAthletes] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getSports(filters, minAthletes);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load sports performance data');
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, [filters, minAthletes]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error || !data) {
    return <div className="p-8 text-center text-red-400 bg-slate-900 rounded-2xl">{error || 'Error loading sports data'}</div>;
  }

  const { avg_medals_per_athlete, medal_performance, country_strength_heatmap, available_sports, available_countries } = data;

  // Top 15 sports for bar charts
  const topAvgSports = avg_medals_per_athlete.slice(0, 15);
  const topMedalSports = medal_performance.slice(0, 15);

  // Extract unique countries and sports present in heatmap
  const heatmapSports = Array.from(new Set(country_strength_heatmap.map(h => h.sport))).slice(0, 10);
  const heatmapCountries = Array.from(new Set(country_strength_heatmap.map(h => h.country_noc))).slice(0, 10);

  const getHeatmapMedals = (noc: string, sport: string) => {
    const item = country_strength_heatmap.find(h => h.country_noc === noc && h.sport === sport);
    return item ? item.medals : 0;
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-slate-900/60 text-slate-700';
    if (count <= 3) return 'bg-yellow-500/15 text-yellow-300 font-medium';
    if (count <= 10) return 'bg-yellow-500/35 text-yellow-200 font-semibold';
    if (count <= 25) return 'bg-yellow-500/60 text-slate-950 font-bold';
    return 'bg-yellow-400 text-slate-950 font-black shadow-md shadow-yellow-500/30';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Dumbbell className="w-6 h-6 text-yellow-400" />
            Sports & Discipline Performance Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Athletic medal density, country dominance heatmaps, and transparent crew/team event metric definitions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <Sliders className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-slate-400">Min Athletes:</span>
            <input
              type="range"
              min="5"
              max="150"
              value={minAthletes}
              onChange={(e) => setMinAthletes(parseInt(e.target.value))}
              className="w-20 accent-yellow-400 cursor-pointer"
            />
            <span className="font-mono text-white font-bold">{minAthletes}</span>
          </div>
        </div>
      </div>

      {/* Critical Metric Rule Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 via-slate-900 to-slate-900 border border-yellow-500/30 text-xs text-yellow-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-yellow-300">Methodology Guideline: Athlete-to-Medal Ratio</p>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            In team events (Rowing Eights, Basketball, Relays), multiple podium medals are awarded per event. For instance, in Rowing Men's Eights, 9 athletes receive a medal for a single event podium position. Dividing medal records by athletes reflects crew sizing and multi-event qualification, not individual athlete returns or national funding efficiency.
          </p>
        </div>
      </div>

      {/* Grid 1: Avg Medals per Athlete & Stacked Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Medals per Athlete */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                Medal Awards per Athlete by Sport
              </h2>
              <p className="text-xs text-slate-400">Total podium awards divided by distinct participating athletes</p>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              ≥ {minAthletes} athletes
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topAvgSports}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedSportForModal(e.activePayload[0].payload.sport);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="sport" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Bar dataKey="avg_medals_per_athlete" name="Medals / Athlete" fill="#38bdf8" radius={[0, 4, 4, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stacked Medal Distribution by Sport */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Medal Performance by Sport (Top 15)
            </h2>
            <p className="text-xs text-slate-400">Total Gold, Silver, and Bronze awards won per discipline</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topMedalSports}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedSportForModal(e.activePayload[0].payload.sport);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="sport" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Legend />
                <Bar dataKey="gold" name="Gold" fill="#eab308" stackId="a" cursor="pointer" />
                <Bar dataKey="silver" name="Silver" fill="#94a3b8" stackId="a" cursor="pointer" />
                <Bar dataKey="bronze" name="Bronze" fill="#d97706" stackId="a" cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Heatmap: Country Strength by Sport */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-yellow-400" />
              Country Dominance Matrix (Top 10 Nations × Top 10 Sports)
            </h2>
            <p className="text-xs text-slate-400">Event medals won by country across leading Olympic sports</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Low</span>
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700"></span>
            <span className="w-3 h-3 rounded bg-yellow-500/20"></span>
            <span className="w-3 h-3 rounded bg-yellow-500/50"></span>
            <span className="w-3 h-3 rounded bg-yellow-400"></span>
            <span>High</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-center text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold">Nation \ Sport</th>
                {heatmapSports.map((sp) => (
                  <th
                    key={sp}
                    onClick={() => setSelectedSportForModal(sp)}
                    className="py-2.5 px-2 font-medium cursor-pointer hover:text-white truncate max-w-[90px]"
                    title={sp}
                  >
                    {sp}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {heatmapCountries.map((noc) => (
                <tr key={noc} className="hover:bg-slate-800/40">
                  <td
                    onClick={() => setSelectedCountryForModal(noc)}
                    className="py-2.5 px-3 text-left font-bold text-white cursor-pointer hover:text-yellow-400 flex items-center gap-1.5"
                  >
                    <span>{noc}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </td>
                  {heatmapSports.map((sp) => {
                    const count = getHeatmapMedals(noc, sp);
                    return (
                      <td key={sp} className="py-2 px-1">
                        <div
                          className={`w-full py-1.5 rounded-lg text-xs transition-transform hover:scale-105 cursor-pointer ${getHeatmapColor(
                            count
                          )}`}
                          onClick={() => setSelectedSportForModal(sp)}
                          title={`${noc} won ${count} medals in ${sp}`}
                        >
                          {count > 0 ? count : '·'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
