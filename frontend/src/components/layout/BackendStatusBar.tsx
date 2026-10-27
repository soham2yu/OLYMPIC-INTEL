import React from 'react';
import { AlertTriangle, RefreshCw, Settings, CheckCircle2 } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

export const BackendStatusBar: React.FC = () => {
  const { backendStatus, backendError, retryConnection, setIsConfigModalOpen } = useFilters();

  if (backendStatus === 'connected') {
    return null;
  }

  if (backendStatus === 'connecting') {
    return (
      <div className="bg-amber-950/70 border-b border-amber-800/60 px-4 py-2 flex items-center justify-between text-xs text-amber-200 transition-all">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
          <span>
            <strong>Connecting to Backend:</strong> Free-tier servers on Render spin down after idle and take ~30–45s to wake up. Please wait...
          </span>
        </div>
        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="text-amber-400 hover:text-amber-300 underline text-[11px]"
        >
          Connection Settings
        </button>
      </div>
    );
  }

  return (
    <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-200 transition-all">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>
          <strong>Backend Not Reachable:</strong> {backendError || 'Cannot connect to API server.'} (If Render is sleeping, first wake-up takes ~40s).
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => retryConnection()}
          className="px-2.5 py-1 bg-rose-800/70 hover:bg-rose-700 text-white rounded font-medium transition-colors flex items-center gap-1 shadow-sm"
        >
          <RefreshCw className="w-3 h-3" /> Wake Up / Retry
        </button>
        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded font-semibold transition-colors flex items-center gap-1 shadow-sm"
        >
          <Settings className="w-3 h-3" /> Configure URL
        </button>
      </div>
    </div>
  );
};
