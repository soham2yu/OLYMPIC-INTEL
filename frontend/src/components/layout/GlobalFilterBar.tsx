import React, { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, Calendar, Sun, Snowflake } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { FilterModal } from './FilterModal';

export const GlobalFilterBar: React.FC = () => {
  const { filters, setFilters, updateFilter, resetFilters, activeFilterCount } = useFilters();
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  const removeCountry = (noc: string) => {
    updateFilter('countries', filters.countries.filter(c => c !== noc));
  };

  const removeRegion = (reg: string) => {
    updateFilter('regions', filters.regions.filter(r => r !== reg));
  };

  const removeSport = (sp: string) => {
    updateFilter('sports', filters.sports.filter(s => s !== sp));
  };

  return (
    <>
      <div className="sticky top-16 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Season selector */}
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => updateFilter('season', 'All')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filters.season === 'All' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Games
              </button>
              <button
                onClick={() => updateFilter('season', 'Summer')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  filters.season === 'Summer' ? 'bg-yellow-500/20 text-yellow-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3 h-3 text-yellow-400" />
                Summer
              </button>
              <button
                onClick={() => updateFilter('season', 'Winter')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  filters.season === 'Winter' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Snowflake className="w-3 h-3 text-sky-400" />
                Winter
              </button>
            </div>

            {/* Quick Year Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-yellow-400" />
              <span>{filters.startYear} – {filters.endYear}</span>
            </div>

            {/* Filter Modal Trigger Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-400" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-yellow-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Active Chips & Clear All */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.countries.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-[11px] text-yellow-300"
              >
                {c}
                <button onClick={() => removeCountry(c)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.regions.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-300"
              >
                {r}
                <button onClick={() => removeRegion(r)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.sports.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300"
              >
                {s}
                <button onClick={() => removeSport(s)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.gender !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                Gender: {filters.gender === 'M' ? 'Men' : 'Women'}
                <button onClick={() => updateFilter('gender', 'All')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.medalType !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                Medal: {filters.medalType}
                <button onClick={() => updateFilter('medalType', 'All')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-slate-400 hover:text-white transition-colors"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </>
  );
};
