export interface GlobalFilterState {
  startYear: number;
  endYear: number;
  season: 'All' | 'Summer' | 'Winter';
  countries: string[];
  regions: string[];
  sports: string[];
  gender: 'All' | 'M' | 'F';
  medalType: 'All' | 'Gold' | 'Silver' | 'Bronze';
  metricMode: 'event_medals' | 'athlete_medals';
}

export interface FilterOptions {
  min_year: number;
  max_year: number;
  years: number[];
  seasons: string[];
  countries: { noc: string; name: string; region: string }[];
  regions: string[];
  sports: string[];
  genders: { id: string; label: string }[];
  medal_types: string[];
  editions: { edition: string; year: number; season: string; city: string }[];
}

export interface AppMetadata {
  dataset_name: string;
  is_custom: boolean;
  total_records: number;
  distinct_athletes: number;
  distinct_countries: number;
  distinct_sports: number;
  year_min: number;
  year_max: number;
  coverage: string;
  verified_hosts_count: number;
  investment_data_available: boolean;
  is_investment_demo: boolean;
}
