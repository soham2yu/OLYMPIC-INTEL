import React, { useState } from 'react';
import { Menu, Printer, Download, Database, Layers, Info } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { api } from '../../services/api';
import { PrintReportModal } from '../common/PrintReportModal';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  collapsed: boolean;
  overviewSummary?: any;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  collapsed,
  overviewSummary,
}) => {
  const { filters, updateFilter, metadata, backendStatus, setIsConfigModalOpen } = useFilters();
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showMetricTooltip, setShowMetricTooltip] = useState<boolean>(false);

  const handleExport = (type: string) => {
    const url = api.getExportUrl(type, filters);
    window.open(url, '_blank');
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 transition-all duration-300 flex items-center justify-between px-4 lg:px-6 ${
          collapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
        }`}
      >
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-yellow-400" />
              {metadata?.dataset_name || '1992-2026 Olympic Dataset'}
              {metadata?.is_custom && (
                <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-400 text-[10px] rounded font-bold">CUSTOM</span>
              )}
            </span>

            {/* Backend Connectivity Status Button */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1.5 ${
                backendStatus === 'connected'
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400 hover:border-emerald-600'
                  : backendStatus === 'connecting'
                  ? 'bg-amber-950/60 border-amber-800/80 text-amber-400 hover:border-amber-600'
                  : 'bg-rose-950/80 border-rose-800/80 text-rose-400 hover:border-rose-600 animate-pulse'
              }`}
              title="Click to check or configure Render backend connection"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-400'
                    : backendStatus === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-400'
                }`}
              />
              {backendStatus === 'connected'
                ? 'Render Online'
                : backendStatus === 'connecting'
                ? 'Waking Up...'
                : 'Connect API'}
            </button>
          </div>
        </div>

        {/* Right: Metric Mode Toggle, Print Report, Export */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Metric Mode Toggle */}
          <div className="relative flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => updateFilter('metricMode', 'event_medals')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filters.metricMode === 'event_medals'
                  ? 'bg-yellow-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Official Event Medals: 1 medal per podium position"
            >
              Event Medals
            </button>
            <button
              onClick={() => updateFilter('metricMode', 'athlete_medals')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filters.metricMode === 'athlete_medals'
                  ? 'bg-yellow-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Athlete Medal Awards: Counts all individual medal recipients (relays, rowing eights)"
            >
              Athlete Awards
            </button>
            <button
              onClick={() => setShowMetricTooltip(!showMetricTooltip)}
              className="p-1 text-slate-400 hover:text-yellow-400 ml-0.5"
              title="Explain counting metric"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {showMetricTooltip && (
              <div className="absolute right-0 top-10 w-72 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-[11px] text-slate-300 z-50 animate-fade-in">
                <p className="font-bold text-yellow-400 mb-1">Counting Rule Standards:</p>
                <p className="mb-1.5">
                  <strong className="text-white">Event Medals:</strong> Standard Olympic medal table metric. Team events (e.g. Rowing 8+, Relays) award exactly 1 gold, 1 silver, 1 bronze per event.
                </p>
                <p>
                  <strong className="text-white">Athlete Awards:</strong> Counts every podium athlete who received a physical medal. An 8-person rowing boat awards 9 medals (8 rowers + 1 coxswain).
                </p>
              </div>
            )}
          </div>

          {/* Export Quick Button */}
          <button
            onClick={() => handleExport('medals')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            title="Download CSV export"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>

          {/* Executive Report Button */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 rounded-lg text-xs font-semibold shadow-md shadow-yellow-500/10 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Executive Report</span>
          </button>
        </div>
      </header>

      {/* Print Report Modal */}
      <PrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        summaryData={overviewSummary}
      />
    </>
  );
};
