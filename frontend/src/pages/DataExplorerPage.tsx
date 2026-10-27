import React, { useEffect, useState } from 'react';
import {
  Database,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const DataExplorerPage: React.FC = () => {
  const { filters, filterOptions, setSelectedCountryForModal, setSelectedSportForModal } = useFilters();
  const [query, setQuery] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [medalOnly, setMedalOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.getAthletesTable({
          query,
          sport: selectedSport !== 'All' ? selectedSport : undefined,
          country: selectedCountry !== 'All' ? selectedCountry : undefined,
          medal_only: medalOnly,
          page,
          page_size: pageSize,
        });
        setData(res.rows);
        setTotalPages(res.total_pages);
        setTotalRows(res.total_rows);
      } catch (err) {
        console.error('Error fetching data explorer table:', err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchData, 250);
    return () => clearTimeout(debounce);
  }, [query, selectedSport, selectedCountry, medalOnly, page, pageSize]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-yellow-400" />
            Interactive Olympic Data Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and export the canonical master dataset of athlete participation and medal outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={api.getExportUrl('raw_filtered', filters)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4 text-sky-400" />
            Export Filtered CSV
          </a>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search athlete, event, city..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* Sport selector */}
          {filterOptions && (
            <select
              value={selectedSport}
              onChange={(e) => {
                setSelectedSport(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="All">All Sports</option>
              {filterOptions.sports.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {/* Country selector */}
          {filterOptions && (
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="All">All Countries</option>
              {filterOptions.countries.map((c) => (
                <option key={c.noc} value={c.noc}>{c.name} ({c.noc})</option>
              ))}
            </select>
          )}

          {/* Medal checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={medalOnly}
              onChange={(e) => {
                setMedalOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded accent-yellow-400 cursor-pointer"
            />
            <span>Medalists Only</span>
          </label>
        </div>

        {/* Page size */}
        <div className="flex items-center gap-2 text-slate-400">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Athlete</th>
                <th className="py-2.5 px-3">Gender</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3">Sport</th>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Edition</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white">{r.athlete_name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.gender === 'M' ? 'Men' : 'Women'}</td>
                  <td
                    className="py-2.5 px-3 cursor-pointer hover:text-yellow-400"
                    onClick={() => setSelectedCountryForModal(r.country_noc)}
                  >
                    <span className="font-medium text-slate-200">{r.country_name}</span>
                    <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {r.country_noc}
                    </span>
                  </td>
                  <td
                    className="py-2.5 px-3 text-slate-300 cursor-pointer hover:text-sky-400"
                    onClick={() => setSelectedSportForModal(r.sport)}
                  >
                    {r.sport}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 max-w-sm truncate">{r.event}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.edition}</td>
                  <td className="py-2.5 px-3 text-right">
                    {r.medal ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.medal === 'Gold'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                            : r.medal === 'Silver'
                            ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                            : 'bg-amber-600/20 text-amber-500 border border-amber-600/40'
                        }`}
                      >
                        {r.medal}
                      </span>
                    ) : (
                      <span className="text-slate-600">Participant</span>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Loading records...' : 'No records match current filter criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRows)} of {totalRows.toLocaleString()} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-white">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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
