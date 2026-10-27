import React, { useState } from 'react';
import { X, Search, RotateCcw, Check } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters, filterOptions, resetFilters } = useFilters();
  const [countrySearch, setCountrySearch] = useState('');
  const [sportSearch, setSportSearch] = useState('');

  if (!isOpen || !filterOptions) return null;

  const filteredCountries = filterOptions.countries.filter(
    c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.noc.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredSports = filterOptions.sports.filter(
    s => s.toLowerCase().includes(sportSearch.toLowerCase())
  );

  const toggleCountry = (noc: string) => {
    setFilters(prev => {
      const exists = prev.countries.includes(noc);
      return {
        ...prev,
        countries: exists ? prev.countries.filter(c => c !== noc) : [...prev.countries, noc]
      };
    });
  };

  const toggleRegion = (region: string) => {
    setFilters(prev => {
      const exists = prev.regions.includes(region);
      return {
        ...prev,
        regions: exists ? prev.regions.filter(r => r !== region) : [...prev.regions, region]
      };
    });
  };

  const toggleSport = (sport: string) => {
    setFilters(prev => {
      const exists = prev.sports.includes(sport);
      return {
        ...prev,
        sports: exists ? prev.sports.filter(s => s !== sport) : [...prev.sports, sport]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Global Analytics Filters</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Filters apply dynamically to all dashboards, charts, rankings, and statistical analyses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year Range & Season */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Olympic Year Range ({filters.startYear} – {filters.endYear})
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={filterOptions.min_year}
                  max={filters.endYear}
                  value={filters.startYear}
                  onChange={(e) => setFilters(prev => ({ ...prev, startYear: parseInt(e.target.value) || filterOptions.min_year }))}
                  className="w-24 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-yellow-500"
                />
                <span className="text-slate-500 text-xs">to</span>
                <input
                  type="number"
                  min={filters.startYear}
                  max={filterOptions.max_year}
                  value={filters.endYear}
                  onChange={(e) => setFilters(prev => ({ ...prev, endYear: parseInt(e.target.value) || filterOptions.max_year }))}
                  className="w-24 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-yellow-500"
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, startYear: 1992, endYear: 2026 }))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] rounded text-slate-300"
                  >
                    All (1992-2026)
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, startYear: 2008, endYear: 2026 }))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] rounded text-slate-300"
                  >
                    Recent (2008+)
                  </button>
                </div>
              </div>
            </div>

            {/* Season Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Games Season
              </label>
              <div className="flex gap-2">
                {['All', 'Summer', 'Winter'].map((sn) => (
                  <button
                    key={sn}
                    onClick={() => setFilters(prev => ({ ...prev, season: sn as any }))}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                      filters.season === sn
                        ? 'bg-yellow-500/15 border-yellow-500/50 text-yellow-400 font-semibold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sn === 'All' ? 'Summer & Winter' : `${sn} Games`}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Athlete Gender
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'All', label: 'All Genders' },
                  { id: 'M', label: 'Men' },
                  { id: 'F', label: 'Women' }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setFilters(prev => ({ ...prev, gender: g.id as any }))}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                      filters.gender === g.id
                        ? 'bg-sky-500/15 border-sky-500/50 text-sky-400 font-semibold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Medal Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Medal Type
              </label>
              <div className="flex gap-2">
                {['All', 'Gold', 'Silver', 'Bronze'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilters(prev => ({ ...prev, medalType: m as any }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      filters.medalType === m
                        ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-400 font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Continental Regions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Continental Regions ({filters.regions.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.regions.map((reg) => {
                  const isSelected = filters.regions.includes(reg);
                  return (
                    <button
                      key={reg}
                      onClick={() => toggleRegion(reg)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-400 font-semibold'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {reg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column: Countries & Sports search */}
          <div className="space-y-4">
            {/* Country Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Countries / NOCs ({filters.countries.length} selected)
                </label>
                {filters.countries.length > 0 && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, countries: [] }))}
                    className="text-[11px] text-yellow-400 hover:underline"
                  >
                    Clear Countries
                  </button>
                )}
              </div>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div className="h-44 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60 p-2 space-y-1">
                {filteredCountries.slice(0, 80).map((c) => {
                  const isSelected = filters.countries.includes(c.noc);
                  return (
                    <button
                      key={c.noc}
                      onClick={() => toggleCountry(c.noc)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-yellow-500/20 text-yellow-300 font-medium'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono ml-2">
                        {c.noc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sports Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Sports & Disciplines ({filters.sports.length} selected)
                </label>
                {filters.sports.length > 0 && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, sports: [] }))}
                    className="text-[11px] text-yellow-400 hover:underline"
                  >
                    Clear Sports
                  </button>
                )}
              </div>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sports..."
                  value={sportSearch}
                  onChange={(e) => setSportSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div className="h-40 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60 p-2 space-y-1">
                {filteredSports.slice(0, 60).map((sp) => {
                  const isSelected = filters.sports.includes(sp);
                  return (
                    <button
                      key={sp}
                      onClick={() => toggleSport(sp)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-300 font-medium'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span>{sp}</span>
                      {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {filters.countries.length + filters.regions.length + filters.sports.length} filter criteria active
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-yellow-500/20 transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
