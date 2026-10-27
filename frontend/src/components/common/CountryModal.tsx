import React, { useEffect, useState } from 'react';
import { X, Award, Users, Calendar, Trophy, Globe, Flame } from 'lucide-react';
import { api } from '../../services/api';
import { CountryProfileData } from '../../types/analytics';
import { ChartSkeleton } from './LoadingSkeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface CountryModalProps {
  noc: string | null;
  onClose: () => void;
  metricMode?: string;
}

export const CountryModal: React.FC<CountryModalProps> = ({ noc, onClose, metricMode = 'event_medals' }) => {
  const [profile, setProfile] = useState<CountryProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noc) {
      setProfile(null);
      return;
    }
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getCountryProfile(noc, metricMode);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [noc, metricMode]);

  if (!noc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-12">
            <ChartSkeleton height="h-96" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            <p>{error}</p>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-800 pb-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-bold text-xl">
                {profile.country_noc}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {profile.country_name}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {profile.region}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Olympic Performance Profile ({profile.participating_editions} editions represented)
                </p>
              </div>
            </div>

            {/* Top Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-yellow-400" /> Total Medals</span>
                <p className="text-xl font-bold text-white mt-1">{profile.total_medals}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{profile.gold_medals} Gold · {profile.silver_medals} Silver · {profile.bronze_medals} Bronze</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-sky-400" /> Athletes</span>
                <p className="text-xl font-bold text-white mt-1">{profile.distinct_athletes.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{profile.gender_breakdown.Men} Men · {profile.gender_breakdown.Women} Women</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500" /> Best Edition</span>
                <p className="text-xl font-bold text-white mt-1 truncate">{profile.best_edition || 'N/A'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{profile.best_edition_medals} medals won</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400" /> Season Split</span>
                <p className="text-xl font-bold text-white mt-1">{profile.summer_medals} <span className="text-xs text-slate-400">Sum</span> / {profile.winter_medals} <span className="text-xs text-slate-400">Win</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Historical distribution</p>
              </div>
            </div>

            {/* Edition History Chart */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Medals by Olympic Edition Over Time
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profile.edition_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="edition" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-30} textAnchor="end" height={40} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
                    <Legend />
                    <Bar dataKey="gold" name="Gold" fill="#eab308" stackId="a" />
                    <Bar dataKey="silver" name="Silver" fill="#94a3b8" stackId="a" />
                    <Bar dataKey="bronze" name="Bronze" fill="#d97706" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Sports & Host Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Top 5 Strongest Sports</h3>
                <div className="space-y-2">
                  {profile.top_sports.slice(0, 5).map((sp, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 text-xs">
                      <span className="font-medium text-slate-200">{sp.sport}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">{sp.gold}G</span>
                        <span className="text-slate-400">{sp.silver}S</span>
                        <span className="text-amber-500">{sp.bronze}B</span>
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-white font-semibold">{sp.total}</span>
                      </div>
                    </div>
                  ))}
                  {profile.top_sports.length === 0 && (
                    <p className="text-xs text-slate-500 py-4 text-center">No medal records in this period.</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Hosting History & Advantage</h3>
                <div className="space-y-2">
                  {profile.host_performance.filter(h => h.is_host).map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs">
                      <span className="font-medium text-yellow-300">Host Edition: {h.edition}</span>
                      <span className="font-bold text-yellow-400">{h.medals} medals</span>
                    </div>
                  ))}
                  {profile.host_performance.filter(h => h.is_host).length === 0 && (
                    <p className="text-xs text-slate-400 p-3 bg-slate-800/60 rounded-lg">
                      {profile.country_name} has not hosted an Olympic edition between 1992 and 2026.
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-2">
                    Note: A nation's medal total reflects sporting investment, population, and athlete preparation. Medals alone do not represent the total quality of public healthcare or grassroots sports systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
