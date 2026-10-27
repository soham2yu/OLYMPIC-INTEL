import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalFilterState, FilterOptions, AppMetadata } from '../types/filters';
import { api } from '../services/api';

interface FilterContextType {
  filters: GlobalFilterState;
  filterOptions: FilterOptions | null;
  metadata: AppMetadata | null;
  isLoadingOptions: boolean;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  updateFilter: <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  refreshMetadata: () => Promise<void>;
  selectedCountryForModal: string | null;
  setSelectedCountryForModal: (noc: string | null) => void;
  selectedSportForModal: string | null;
  setSelectedSportForModal: (sport: string | null) => void;
}

const defaultFilters: GlobalFilterState = {
  startYear: 1992,
  endYear: 2026,
  season: 'All',
  countries: [],
  regions: [],
  sports: [],
  gender: 'All',
  medalType: 'All',
  metricMode: 'event_medals',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilterState>(defaultFilters);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [metadata, setMetadata] = useState<AppMetadata | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(true);
  const [selectedCountryForModal, setSelectedCountryForModal] = useState<string | null>(null);
  const [selectedSportForModal, setSelectedSportForModal] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoadingOptions(true);
      const [opts, meta] = await Promise.all([
        api.getFilters(),
        api.getMetadata(),
      ]);
      setFilterOptions(opts);
      setMetadata(meta);
      if (opts.min_year && opts.max_year) {
        setFilters(prev => ({
          ...prev,
          startYear: opts.min_year,
          endYear: opts.max_year,
        }));
      }
    } catch (err) {
      console.error('Error loading initial options:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshMetadata = async () => {
    await loadData();
  };

  const updateFilter = <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    if (filterOptions) {
      setFilters({
        ...defaultFilters,
        startYear: filterOptions.min_year,
        endYear: filterOptions.max_year,
      });
    } else {
      setFilters(defaultFilters);
    }
  };

  // Count active non-default filters
  const activeFilterCount =
    (filters.season !== 'All' ? 1 : 0) +
    (filters.countries.length > 0 ? filters.countries.length : 0) +
    (filters.regions.length > 0 ? filters.regions.length : 0) +
    (filters.sports.length > 0 ? filters.sports.length : 0) +
    (filters.gender !== 'All' ? 1 : 0) +
    (filters.medalType !== 'All' ? 1 : 0) +
    (filterOptions && (filters.startYear !== filterOptions.min_year || filters.endYear !== filterOptions.max_year) ? 1 : 0);

  return (
    <FilterContext.Provider
      value={{
        filters,
        filterOptions,
        metadata,
        isLoadingOptions,
        setFilters,
        updateFilter,
        resetFilters,
        activeFilterCount,
        refreshMetadata,
        selectedCountryForModal,
        setSelectedCountryForModal,
        selectedSportForModal,
        setSelectedSportForModal,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
