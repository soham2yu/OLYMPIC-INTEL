import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Award,
  Filter,
  Flame,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api } from '../services/api';
import { AthletesData } from '../types/analytics';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AthletesPage: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<AthletesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Searchable athlete table state
  const [tableQuery, setTableQuery] = useState<string>('');
  const [tableMedalOnly, setTableMedalOnly] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tablePage, setTablePage] = useState<number>(1);
  const [tableTotalPages, setTableTotalPages] = useState<number>(1);
  const [tableTotalRows, setTableTotalRows] = useState<number>(0);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getAthletes(filters);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load athlete data');
      } finally {
        setLoading(false);
      }
    };
    fetchAthletes();
  }, [filters]);

  // Load paginated athlete explorer table
  useEffect(() => {
    const fetchTable = async () => {
      try {
        setLoadingTable(true);
        const res = await api.getAthletesTable({
          query: tableQuery,
          medal_only: tableMedalOnly,
          page: tablePage,
          page_size: 20,
        });
        setTableData(res.rows);
        setTableTotalPages(res.total_pages);
        setTableTotalRows(res.total_rows);
      } catch (err) {
        console.error('Error fetching athletes table:', err);
      } finally {
        setLoadingTable(false);
      }
    };
    const debounce = setTimeout(fetchTable, 250);
    return () => clearTimeout(debounce);
  }, [tableQuery, tableMedalOnly, tablePage]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error || !data) {
    return <div className="p-8 text-center text-red-400 bg-slate-900 rounded-2xl">{error || 'Error loading athlete data'}</div>;
  }

  const { edition_trends, gender_distribution_overall, repeat_participation, top_participating_countries } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-sky-400" />
            Athlete Participation & Demographics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing {data.total_athletes.toLocaleString()} distinct athletes, gender equality milestones, and multi-games competitors.
          </p>
        </div>
      </div>

      {/* Grid 1: Gender Equality Trend & Repeat Participation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Equality Evolution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Men vs. Women Participation Evolution
            </h2>
            <p className="text-xs text-slate-400">Tracking progress toward full gender parity (1992 - 2024)</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={edition_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="edition" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-30} textAnchor="end" height={45} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Legend />
                <Line type="monotone" dataKey="men" name="Men Athletes" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="women" name="Women Athletes" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repeat Participation Across Editions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Olympic Career Longevity (Editions Attended)
            </h2>
            <p className="text-xs text-slate-400">Frequency distribution of athletes competing in multiple Olympic Games</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repeat_participation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="editions_attended" stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `${v} Games`} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Bar dataKey="athlete_count" name="Athletes" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Athlete Search & Explorer Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Searchable Athlete Registry</h2>
            <p className="text-xs text-slate-400">Search by athlete name, sport, or Olympic event ({tableTotalRows.toLocaleString()} entries)</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={tableMedalOnly}
                onChange={(e) => {
                  setTableMedalOnly(e.target.checked);
                  setTablePage(1);
                }}
                className="rounded accent-yellow-400 cursor-pointer"
              />
              <span>Medalists Only</span>
            </label>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search athlete or event..."
                value={tableQuery}
                onChange={(e) => {
                  setTableQuery(e.target.value);
                  setTablePage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Athlete</th>
                <th className="py-2.5 px-3">Gender</th>
                <th className="py-2.5 px-3">Country / NOC</th>
                <th className="py-2.5 px-3">Sport</th>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Edition</th>
                <th className="py-2.5 px-3 text-right">Medal Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-semibold text-white">{row.athlete_name}</td>
                  <td className="py-2 px-3 text-slate-400">{row.gender === 'M' ? 'Men' : 'Women'}</td>
                  <td className="py-2 px-3">
                    <span className="font-medium text-slate-200">{row.country_name}</span>
                    <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {row.country_noc}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">{row.sport}</td>
                  <td className="py-2 px-3 text-slate-400 max-w-xs truncate">{row.event}</td>
                  <td className="py-2 px-3 text-slate-400">{row.edition}</td>
                  <td className="py-2 px-3 text-right">
                    {row.medal ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          row.medal === 'Gold'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                            : row.medal === 'Silver'
                            ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                            : 'bg-amber-600/20 text-amber-500 border border-amber-600/40'
                        }`}
                      >
                        {row.medal}
                      </span>
                    ) : (
                      <span className="text-slate-600">Participant</span>
                    )}
                  </td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    {loadingTable ? 'Searching records...' : 'No athletes matched your query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Page {tablePage} of {tableTotalPages} ({tableTotalRows.toLocaleString()} total entries)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTablePage((p) => Math.max(1, p - 1))}
              disabled={tablePage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-white">{tablePage}</span>
            <button
              onClick={() => setTablePage((p) => Math.min(tableTotalPages, p + 1))}
              disabled={tablePage === tableTotalPages}
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
