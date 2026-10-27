import { GlobalFilterState, FilterOptions, AppMetadata } from '../types/filters';
import {
  OverviewData, MedalsData, CountryProfileData, SportsData, SportDetailData,
  AthletesData, RegionsData, InvestmentData, HostsData, TimelineData, DataQualityReport
} from '../types/analytics';

const BASE_URL = '/api';

function buildQueryParams(filters?: Partial<GlobalFilterState>, extraParams?: Record<string, any>): string {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.startYear !== undefined) params.append('start_year', filters.startYear.toString());
    if (filters.endYear !== undefined) params.append('end_year', filters.endYear.toString());
    if (filters.season && filters.season !== 'All') params.append('season', filters.season);
    if (filters.gender && filters.gender !== 'All') params.append('gender', filters.gender);
    if (filters.medalType && filters.medalType !== 'All') params.append('medal_type', filters.medalType);
    if (filters.metricMode) params.append('metric_mode', filters.metricMode);

    if (filters.countries && filters.countries.length > 0) {
      filters.countries.forEach(c => params.append('countries', c));
    }
    if (filters.regions && filters.regions.length > 0) {
      filters.regions.forEach(r => params.append('regions', r));
    }
    if (filters.sports && filters.sports.length > 0) {
      filters.sports.forEach(s => params.append('sports', s));
    }
  }

  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, v.toString());
      }
    });
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export const api = {
  // Metadata & filters
  async getMetadata(): Promise<AppMetadata> {
    const res = await fetch(`${BASE_URL}/metadata`);
    if (!res.ok) throw new Error('Failed to load metadata');
    return res.json();
  },

  async getFilters(): Promise<FilterOptions> {
    const res = await fetch(`${BASE_URL}/filters`);
    if (!res.ok) throw new Error('Failed to load filter options');
    return res.json();
  },

  // Overview
  async getOverview(filters?: GlobalFilterState): Promise<OverviewData> {
    const query = buildQueryParams(filters);
    const res = await fetch(`${BASE_URL}/overview${query}`);
    if (!res.ok) throw new Error('Failed to load overview data');
    return res.json();
  },

  // Medals
  async getMedals(filters?: GlobalFilterState): Promise<MedalsData> {
    const query = buildQueryParams(filters);
    const res = await fetch(`${BASE_URL}/medals/countries${query}`);
    if (!res.ok) throw new Error('Failed to load medal rankings');
    return res.json();
  },

  async getCountryProfile(noc: string, metricMode: string = 'event_medals'): Promise<CountryProfileData> {
    const res = await fetch(`${BASE_URL}/medals/country/${noc}?metric_mode=${metricMode}`);
    if (!res.ok) throw new Error(`Failed to load profile for ${noc}`);
    return res.json();
  },

  // Sports
  async getSports(filters?: GlobalFilterState, minAthletes: number = 20): Promise<SportsData> {
    const query = buildQueryParams(filters, { min_athletes: minAthletes });
    const res = await fetch(`${BASE_URL}/sports/performance${query}`);
    if (!res.ok) throw new Error('Failed to load sports performance data');
    return res.json();
  },

  async getSportDetail(sportName: string): Promise<SportDetailData> {
    const res = await fetch(`${BASE_URL}/sports/detail/${encodeURIComponent(sportName)}`);
    if (!res.ok) throw new Error(`Failed to load details for ${sportName}`);
    return res.json();
  },

  // Athletes
  async getAthletes(filters?: GlobalFilterState): Promise<AthletesData> {
    const query = buildQueryParams(filters);
    const res = await fetch(`${BASE_URL}/athletes/participation${query}`);
    if (!res.ok) throw new Error('Failed to load athlete participation');
    return res.json();
  },

  async getAthletesTable(params: { query?: string; sport?: string; country?: string; medal_only?: boolean; page?: number; page_size?: number }) {
    const query = buildQueryParams(undefined, params);
    const res = await fetch(`${BASE_URL}/athletes/table${query}`);
    if (!res.ok) throw new Error('Failed to load athlete table');
    return res.json();
  },

  // Regions
  async getRegions(filters?: GlobalFilterState): Promise<RegionsData> {
    const query = buildQueryParams(filters);
    const res = await fetch(`${BASE_URL}/regions/performance${query}`);
    if (!res.ok) throw new Error('Failed to load regional performance');
    return res.json();
  },

  // Investment
  async getInvestment(cycle?: string, metricMode: string = 'event_medals'): Promise<InvestmentData> {
    const query = buildQueryParams(undefined, { cycle, metric_mode: metricMode });
    const res = await fetch(`${BASE_URL}/investment/performance${query}`);
    if (!res.ok) throw new Error('Failed to load investment performance');
    return res.json();
  },

  // Hosts
  async getHosts(metricMode: string = 'event_medals'): Promise<HostsData> {
    const res = await fetch(`${BASE_URL}/hosts/performance?metric_mode=${metricMode}`);
    if (!res.ok) throw new Error('Failed to load host-nation analysis');
    return res.json();
  },

  // Timeline
  async getTimeline(): Promise<TimelineData> {
    const res = await fetch(`${BASE_URL}/timeline`);
    if (!res.ok) throw new Error('Failed to load Olympic timeline');
    return res.json();
  },

  // Data management
  async validateFile(file: File): Promise<DataQualityReport> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/data/validate`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Validation failed' }));
      throw new Error(err.detail || 'Validation failed');
    }
    return res.json();
  },

  async uploadFile(file: File, mapping?: Record<string, string>): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (mapping) {
      formData.append('mapping_json', JSON.stringify(mapping));
    }
    const res = await fetch(`${BASE_URL}/data/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async resetData(): Promise<any> {
    const res = await fetch(`${BASE_URL}/data/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset dataset');
    return res.json();
  },

  getExportUrl(exportType: string, filters?: GlobalFilterState): string {
    const query = buildQueryParams(filters, { export_type: exportType });
    return `${BASE_URL}/data/export${query}`;
  },

  getTemplateUrl(templateType: string): string {
    return `${BASE_URL}/data/template/${templateType}`;
  }
};
