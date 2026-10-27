import React, { useEffect, useState } from 'react';
import { X, Award, Users, Trophy, Info } from 'lucide-react';
import { api } from '../../services/api';
import { SportDetailData } from '../../types/analytics';
import { ChartSkeleton } from './LoadingSkeleton';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SportModalProps {
  sport: string | null;
  onClose: () => void;
}

export const SportModal: React.FC<SportModalProps> = ({ sport, onClose }) => {
  const [detail, setDetail] = useState<SportDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sport) {
      setDetail(null);
      return;
    }
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getSportDetail(sport);
        setDetail(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load sport details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [sport]);

  if (!sport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-12">
            <ChartSkeleton height="h-80" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            <p>{error}</p>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {detail.sport}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                  {detail.season} Olympic Discipline
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Historical performance across {detail.events_count} distinct events and {detail.distinct_athletes.toLocaleString()} participating athletes.
              </p>
            </div>

            {/* Quick KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-yellow-400" /> Total Medals</span>
                <p className="text-xl font-bold text-white mt-1">{detail.total_medals}</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-sky-400" /> Athletes</span>
                <p className="text-xl font-bold text-white mt-1">{detail.distinct_athletes.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500" /> Events</span>
                <p className="text-xl font-bold text-white mt-1">{detail.events_count}</p>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Participation & Medal Trend Over Time</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detail.edition_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="edition" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
                    <Line type="monotone" dataKey="athletes" name="Athletes" stroke="#38bdf8" strokeWidth={2} />
                    <Line type="monotone" dataKey="medals" name="Medals" stroke="#eab308" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Countries Table */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Leading Nations in {detail.sport}</h3>
              <div className="space-y-1.5">
                {detail.top_countries.slice(0, 6).map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800 text-xs">
                    <span className="font-medium text-slate-200">{c.country_name} ({c.country_noc})</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">{c.gold} Gold</span>
                      <span className="text-slate-400">{c.silver} Silver</span>
                      <span className="text-amber-500">{c.bronze} Bronze</span>
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-white font-semibold">{c.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metric Explanation Banner */}
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Critical Metric Notice:</p>
                <p className="text-[11px] text-yellow-200/90 mt-0.5">
                  In team and crew sports (such as Rowing Eights, Basketball, Relays), multiple physical medal awards are granted per event podium. Dividends of medal rows over distinct athlete entries reflect podium crew size, not individual athlete returns or sports system efficiency.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
