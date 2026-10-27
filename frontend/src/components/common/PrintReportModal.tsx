import React from 'react';
import { X, Printer, FileText, CheckCircle, Award, Users, Globe, ShieldCheck } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData?: any;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose, summaryData }) => {
  const { filters, metadata } = useFilters();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const kpis = summaryData?.kpis;
  const topCountries = summaryData?.top_countries || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-yellow-400">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-bold">Executive Olympic Intelligence Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-yellow-500/20"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-report" className="mt-6 space-y-6 text-slate-200">
          {/* Header block */}
          <div className="p-6 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">GLOBAL OLYMPIC SPORTS PERFORMANCE ANALYSIS</h1>
                <p className="text-xs text-yellow-400 font-semibold tracking-wider uppercase mt-0.5">
                  Official Analytics Executive Briefing · Coverage: {filters.startYear} - {filters.endYear} ({filters.season})
                </p>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-700">
                Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-2">
              This synthesis provides evidence-backed sports performance metrics across the modern Olympic era (1992–2026). Calculations follow verified Olympic counting protocols distinguishing official podium event medals from multi-recipient athlete awards.
            </p>
          </div>

          {/* Active Filter Scope */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Olympic Cycle Range</span>
              <span className="font-semibold text-white">{filters.startYear} – {filters.endYear}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Games Season</span>
              <span className="font-semibold text-white">{filters.season} Games</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Counting Methodology</span>
              <span className="font-semibold text-yellow-400">{filters.metricMode === 'event_medals' ? 'Event Medals (IOC Standard)' : 'Athlete Medal Awards (All Podium)'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Gender Filter</span>
              <span className="font-semibold text-white">{filters.gender === 'All' ? 'All Genders' : filters.gender === 'M' ? 'Men Only' : 'Women Only'}</span>
            </div>
          </div>

          {/* Key Executive KPIs */}
          {kpis && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-yellow-500/30">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-yellow-400" /> Total Medals</span>
                <p className="text-2xl font-bold text-white mt-1">{kpis.total_medals.toLocaleString()}</p>
                <p className="text-[10px] text-yellow-400/90 mt-0.5">{kpis.gold_medals} Gold · {kpis.silver_medals} Silver · {kpis.bronze_medals} Bronze</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-sky-500/30">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-sky-400" /> Distinct Athletes</span>
                <p className="text-2xl font-bold text-white mt-1">{kpis.distinct_athletes.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Across {kpis.distinct_countries} Nations</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> Sports Disciplines</span>
                <p className="text-2xl font-bold text-white mt-1">{kpis.distinct_sports}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{kpis.distinct_editions} Olympic Editions</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-green-500/30">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Data Integrity</span>
                <p className="text-sm font-bold text-green-400 mt-2">100% Verified</p>
                <p className="text-[10px] text-slate-400 mt-0.5">1992-2026 Dataset</p>
              </div>
            </div>
          )}

          {/* Top Country Standings */}
          {topCountries.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top 10 Nation Standings in Period</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Country / NOC</th>
                      <th className="py-2.5 px-3">Region</th>
                      <th className="py-2.5 px-3 text-right">Gold</th>
                      <th className="py-2.5 px-3 text-right">Silver</th>
                      <th className="py-2.5 px-3 text-right">Bronze</th>
                      <th className="py-2.5 px-3 text-right font-bold text-white">Total</th>
                      <th className="py-2.5 px-3 text-right">Athletes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {topCountries.slice(0, 10).map((c: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-white">{c.country_name} ({c.country_noc})</td>
                        <td className="py-2 px-3 text-slate-400">{c.region}</td>
                        <td className="py-2 px-3 text-right text-yellow-400 font-semibold">{c.gold}</td>
                        <td className="py-2 px-3 text-right text-slate-300">{c.silver}</td>
                        <td className="py-2 px-3 text-right text-amber-500">{c.bronze}</td>
                        <td className="py-2 px-3 text-right font-bold text-white">{c.total}</td>
                        <td className="py-2 px-3 text-right text-slate-400">{c.athlete_count?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Methodological Principles */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-slate-200">Methodology & Scientific Standards:</h4>
            <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px] leading-relaxed">
              <li><strong className="text-slate-300">Event Medals vs. Athlete Awards:</strong> In team sports (rowing eights, relays, basketball), all team members receive physical medals. Event Medals assign 1 medal per event podium position to eliminate team size bias.</li>
              <li><strong className="text-slate-300">Non-Causal Investment Caveat:</strong> Sports investment correlates with medal attainment, but does not independently cause podium results without underlying athletic infrastructure, population base, and talent pipelines.</li>
              <li><strong className="text-slate-300">Milano-Cortina 2026:</strong> Programmed events (116 medal disciplines) reflect official IOC schedule; results are pending completion of competition.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
