import React, { useEffect, useState } from 'react';
import {
  History,
  BookOpen,
  Calendar,
  Award,
  Users,
  Globe2,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { TimelineData, TimelineEditionSummary } from '../types/analytics';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const TimelinePage: React.FC = () => {
  const [data, setData] = useState<TimelineData | null>(null);
  const [selectedEditionIdx, setSelectedEditionIdx] = useState<number>(0);
  const [activeStoryChapter, setActiveStoryChapter] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getTimeline();
        setData(res);
        if (res.editions.length > 0) {
          // Default to recent edition (e.g. Paris 2024)
          const pIdx = res.editions.findIndex(e => e.year === 2024);
          setSelectedEditionIdx(pIdx >= 0 ? pIdx : res.editions.length - 1);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error || !data) {
    return <div className="p-8 text-center text-red-400 bg-slate-900 rounded-2xl">{error || 'Error loading timeline'}</div>;
  }

  const { editions, guided_story, default_trajectories } = data;
  const currentEdition: TimelineEditionSummary = editions[selectedEditionIdx] || editions[0];
  const currentChapter = guided_story.find(c => c.chapter_index === activeStoryChapter) || guided_story[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Scenario C: Olympic Data Storyteller</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Historical Olympic Timeline & Guided Data Story
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Chronological journey through 34 years of Olympic history (1992 - 2026) with verified historical milestones.
          </p>
        </div>
      </div>

      {/* Guided Story Chapter Tabs */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider border-b border-slate-800 pb-3">
          <BookOpen className="w-4 h-4" />
          <span>Curated Olympic Intelligence Narrative (5 Chapters)</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {guided_story.map((ch) => (
            <button
              key={ch.chapter_index}
              onClick={() => setActiveStoryChapter(ch.chapter_index)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left flex items-center gap-2 ${
                activeStoryChapter === ch.chapter_index
                  ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeStoryChapter === ch.chapter_index ? 'bg-slate-950 text-yellow-400' : 'bg-slate-700 text-white'
              }`}>
                {ch.chapter_index}
              </span>
              <span>{ch.title}</span>
            </button>
          ))}
        </div>

        {/* Story Body */}
        {currentChapter && (
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Chapter {currentChapter.chapter_index} · {currentChapter.subtitle}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{currentChapter.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{currentChapter.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {currentChapter.key_findings.map((f, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-[10px] uppercase">
                    <Sparkles className="w-3 h-3" /> Finding {i + 1}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{f}</p>
                </div>
              ))}
            </div>

            {/* Supporting metrics pills */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
              {Object.entries(currentChapter.supporting_metrics).map(([k, v]) => (
                <span key={k} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                  <strong className="text-slate-400 mr-1.5">{k}:</strong>
                  <span className="text-yellow-400 font-bold">{v}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chronological Edition Carousel / Selector */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          Chronological Olympic Edition Explorer (Click to Inspect)
        </h2>

        {/* Scrollable Edition Badges */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {editions.map((ed, idx) => (
            <button
              key={ed.edition}
              onClick={() => setSelectedEditionIdx(idx)}
              className={`shrink-0 px-3 py-2 rounded-xl text-left border transition-all ${
                selectedEditionIdx === idx
                  ? 'bg-yellow-500/15 border-yellow-500/60 shadow-lg shadow-yellow-500/10'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-white">{ed.year}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                  ed.season === 'Summer' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-sky-500/20 text-sky-400'
                }`}>
                  {ed.season}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[110px] mt-0.5">{ed.city}</p>
            </button>
          ))}
        </div>

        {/* Edition Spotlight Card */}
        {currentEdition && (
          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  Olympic Spotlight · {currentEdition.edition}
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">
                  {currentEdition.city}, {currentEdition.host_country}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">{currentEdition.key_milestone}</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Leading Nation</span>
                <span className="font-bold text-yellow-400 text-sm">{currentEdition.top_country}</span>
                <span className="text-[10px] text-slate-400 block">({currentEdition.top_country_gold} Gold)</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Medals</span>
                <p className="text-xl font-bold text-white mt-1">{currentEdition.total_medals}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Athletes</span>
                <p className="text-xl font-bold text-sky-400 mt-1">{currentEdition.athletes_count.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nations / NOCs</span>
                <p className="text-xl font-bold text-white mt-1">{currentEdition.participating_countries}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Disciplines</span>
                <p className="text-xl font-bold text-amber-500 mt-1">{currentEdition.sports_count}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Country Trajectory Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            Top Superpower Trajectories Over Modern Olympic History (1992-2026)
          </h2>
          <p className="text-xs text-slate-400">Longitudinal medal progression across Olympic editions</p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="edition" type="category" allowDuplicatedCategory={false} stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-30} textAnchor="end" height={45} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
              <Legend />
              {default_trajectories.slice(0, 5).map((t, i) => {
                const colors = ['#eab308', '#ef4444', '#38bdf8', '#22c55e', '#a855f7'];
                return (
                  <Line
                    key={t.country_noc}
                    data={t.editions}
                    dataKey="medals"
                    name={t.country_name}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
