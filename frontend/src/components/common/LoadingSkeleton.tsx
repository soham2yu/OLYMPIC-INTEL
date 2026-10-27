import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-8 bg-slate-800 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-800/80 rounded-xl"></div>
        ))}
      </div>
      <div className="h-72 bg-slate-800/60 rounded-xl"></div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-72' }) => {
  return (
    <div className={`w-full ${height} bg-slate-800/50 rounded-xl animate-pulse flex items-center justify-center border border-slate-800/80`}>
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-yellow-400 animate-spin" />
        <span className="text-xs uppercase tracking-wider">Rendering visualization...</span>
      </div>
    </div>
  );
};
