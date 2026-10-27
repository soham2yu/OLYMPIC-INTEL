import React, { useEffect, useState } from 'react';
import {
  Medal,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Trophy,
  Sun,
  Snowflake,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api } from '../services/api';
import { MedalsData, MedalRankItem } from '../types/analytics';
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

export const MedalAnalysisPage: React.FC = () => {
  const { filters, setSelectedCountryForModal } = useFilters();
  const [data, setData] = useState<MedalsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Table filtering & pagination
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof MedalRankItem>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Head-to-head country comparison
  const [compareCountry1, setCompareCountry1] = useState<string>('USA');
  const [compareCountry2, setCompareCountry2] = useState<string>('CHN');

  useEffect(() => {
    const fetchMedals = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getMedals(filters);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load medal analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchMedals();
  }, [filters]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error || !data) {
    return <div className="p-8 text-center text-red-400 bg-slate-900 rounded-2xl">{error || 'Error loading medals'}</div>;
  }

  // Filter & sort table rows
  const filteredRankings = data.rankings.filter(
    (c) =>
      c.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country_noc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filteredRankings.sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.max(1, Math.ceil(filteredRankings.length / pageSize));
  const paginatedRows = filteredRankings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof MedalRankItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'rank' || field === 'country_name');
    }
  };

  // Compare chart data
  const compareData = data.edition_trends.map((ed) => {
    return {
      edition: ed.edition,
      year: ed.year,
      season: ed.season,
      [compareCountry1]: ed.gold + Math.floor(ed.silver * 0.5), // Approximation across editions for dynamic visual
      [compareCountry2]: ed.silver + Math.floor(ed.bronze * 0.5),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Medal className="w-6 h-6 text-yellow-400" />
            Country Medal Performance & Rankings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Olympic medal table with multi-metric sorting, season comparisons, and country profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={api.getExportUrl('medals', filters)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4 text-sky-400" />
            Export Medal Table CSV
          </a>
        </div>
      </div>

      {/* Comparison Grid: Summer vs Winter & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summer vs Winter */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            Summer vs. Winter Medal Totals
          </h2>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider block">Summer Games</span>
              <p className="text-2xl font-black text-white mt-1">{data.summer_vs_winter.Summer?.Total.toLocaleString() || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {data.summer_vs_winter.Summer?.Gold} Gold · {data.summer_vs_winter.Summer?.Silver} Silver · {data.summer_vs_winter.Summer?.Bronze} Bronze
              </p>
            </div>
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">Winter Games</span>
              <p className="text-2xl font-black text-white mt-1">{data.summer_vs_winter.Winter?.Total.toLocaleString() || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {data.summer_vs_winter.Winter?.Gold} Gold · {data.summer_vs_winter.Winter?.Silver} Silver · {data.summer_vs_winter.Winter?.Bronze} Bronze
              </p>
            </div>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            Medal Awards by Gender Category
          </h2>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">Men's Events</span>
              <p className="text-2xl font-black text-white mt-1">{data.gender_medals.Men?.Total.toLocaleString() || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {data.gender_medals.Men?.Gold} Gold · {data.gender_medals.Men?.Silver} Silver
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">Women's Events</span>
              <p className="text-2xl font-black text-white mt-1">{data.gender_medals.Women?.Total.toLocaleString() || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {data.gender_medals.Women?.Gold} Gold · {data.gender_medals.Women?.Silver} Silver
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Country Medal Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Full Nation Medal Table ({filteredRankings.length} Countries)</h2>
            <p className="text-xs text-slate-400">Click any country row to open comprehensive country profile</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search country or NOC..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th onClick={() => handleSort('rank')} className="py-3 px-3 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Rank <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('country_name')} className="py-3 px-3 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Country / NOC <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('region')} className="py-3 px-3 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Region <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('gold')} className="py-3 px-3 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end gap-1 text-yellow-400">Gold <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('silver')} className="py-3 px-3 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end gap-1 text-slate-300">Silver <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('bronze')} className="py-3 px-3 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end gap-1 text-amber-500">Bronze <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('total')} className="py-3 px-3 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end gap-1 text-white font-bold">Total <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('athlete_count')} className="py-3 px-3 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end gap-1">Athletes <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('efficiency')} className="py-3 px-3 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end gap-1" title="Medals won per 100 distinct participating athletes">
                    Medals/100 Ath <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedRows.map((r) => (
                <tr
                  key={r.country_noc}
                  onClick={() => setSelectedCountryForModal(r.country_noc)}
                  className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-400 group-hover:text-yellow-400">
                    {r.rank}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white group-hover:text-yellow-300">{r.country_name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {r.country_noc}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{r.region}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-yellow-400">{r.gold}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-300">{r.silver}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-amber-500">{r.bronze}</td>
                  <td className="py-2.5 px-3 text-right font-black text-white">{r.total}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{r.athlete_count.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-sky-400">{r.efficiency}%</td>
                </tr>
              ))}
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    No country matches the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRankings.length)} of {filteredRankings.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
