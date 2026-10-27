import { GlobalFilterState, FilterOptions, AppMetadata } from '../types/filters';
import {
  OverviewData, MedalsData, CountryProfileData, SportsData, SportDetailData,
  AthletesData, RegionsData, InvestmentData, HostsData, TimelineData, DataQualityReport
} from '../types/analytics';

/**
 * Resolves the active backend API base URL in order of precedence:
 * 1. Runtime override in window.localStorage (enables instant live debugging / connection without redeploy)
 * 2. Vite environment variable import.meta.env.VITE_API_URL (configured in Vercel project settings)
 * 3. Fallback '/api' (for local Vite dev proxy to localhost:8000)
 */
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('OLYMPIC_API_URL');
    if (saved && saved.trim()) {
      const clean = saved.trim().replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  return '/api';
};

export const setCustomApiUrl = (url: string | null): void => {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('OLYMPIC_API_URL');
  } else {
    localStorage.setItem('OLYMPIC_API_URL', url.trim());
  }
};

export const getCustomApiUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('OLYMPIC_API_URL');
};

/**
 * Intelligent fetch wrapper with retry support for Render free-tier cold boot (sleep -> wake)
 */
async function fetchWithColdStartRetry(
  url: string,
  options?: RequestInit,
  retries: number = 3,
  delayMs: number = 3000
): Promise<Response> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      // If status 502/503/504, server is often starting up on Render
      if ([502, 503, 504].includes(res.status) && attempt < retries) {
        console.warn(`[API] Received status ${res.status}. Server waking up, retrying in ${delayMs}ms (attempt ${attempt + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      return res;
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        console.warn(`[API] Network error (${err.message}). Retrying in ${delayMs}ms (attempt ${attempt + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error(`Network request failed after ${retries} retries`);
}

/**
 * Validates and decodes JSON response with diagnostic error reporting
 */
async function parseJsonResponse<T>(res: Response, fallbackMsg: string): Promise<T> {
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let detail = '';

    if (contentType.includes('application/json')) {
      try {
        const errorBody = await res.json();
        detail = errorBody.detail || errorBody.message || '';
      } catch {}
    } else {
      // Returned HTML error page (e.g. 502 Bad Gateway from proxy)
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        detail = 'Backend server on Render is waking up from idle or unreachable. Please wait 30 seconds and retry.';
      }
    }

    throw new Error(detail || `${fallbackMsg} (HTTP ${res.status})`);
  }

  return res.json();
}

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
  // Health & diagnostics
  async checkHealth(targetBaseUrl?: string): Promise<{ status: string; total_records: number; dataset_name: string }> {
    const base = targetBaseUrl ? targetBaseUrl.replace(/\/+$/, '') : getBaseUrl();
    const url = base.endsWith('/api') ? `${base}/health` : `${base}/api/health`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    return res.json();
  },

  // Metadata & filters
  async getMetadata(): Promise<AppMetadata> {
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/metadata`);
    return parseJsonResponse<AppMetadata>(res, 'Failed to load metadata');
  },

  async getFilters(): Promise<FilterOptions> {
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/filters`);
    return parseJsonResponse<FilterOptions>(res, 'Failed to load filter options');
  },

  // Overview
  async getOverview(filters?: GlobalFilterState): Promise<OverviewData> {
    const query = buildQueryParams(filters);
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/overview${query}`);
    return parseJsonResponse<OverviewData>(res, 'Failed to load overview data');
  },

  // Medals
  async getMedals(filters?: GlobalFilterState): Promise<MedalsData> {
    const query = buildQueryParams(filters);
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/medals/countries${query}`);
    return parseJsonResponse<MedalsData>(res, 'Failed to load medal rankings');
  },

  async getCountryProfile(noc: string, metricMode: string = 'event_medals'): Promise<CountryProfileData> {
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/medals/country/${noc}?metric_mode=${metricMode}`);
    return parseJsonResponse<CountryProfileData>(res, `Failed to load profile for ${noc}`);
  },

  // Sports
  async getSports(filters?: GlobalFilterState, minAthletes: number = 20): Promise<SportsData> {
    const query = buildQueryParams(filters, { min_athletes: minAthletes });
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/sports/performance${query}`);
    return parseJsonResponse<SportsData>(res, 'Failed to load sports performance data');
  },

  async getSportDetail(sportName: string): Promise<SportDetailData> {
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/sports/detail/${encodeURIComponent(sportName)}`);
    return parseJsonResponse<SportDetailData>(res, `Failed to load details for ${sportName}`);
  },

  // Athletes
  async getAthletes(filters?: GlobalFilterState): Promise<AthletesData> {
    const query = buildQueryParams(filters);
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/athletes/participation${query}`);
    return parseJsonResponse<AthletesData>(res, 'Failed to load athlete participation');
  },

  async getAthletesTable(params: { query?: string; sport?: string; country?: string; medal_only?: boolean; page?: number; page_size?: number }) {
    const query = buildQueryParams(undefined, params);
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/athletes/table${query}`);
    return parseJsonResponse<any>(res, 'Failed to load athlete table');
  },

  // Regions
  async getRegions(filters?: GlobalFilterState): Promise<RegionsData> {
    const query = buildQueryParams(filters);
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/regions/performance${query}`);
    return parseJsonResponse<RegionsData>(res, 'Failed to load regional performance');
  },

  // Investment
  async getInvestment(cycle?: string, metricMode: string = 'event_medals'): Promise<InvestmentData> {
    const query = buildQueryParams(undefined, { cycle, metric_mode: metricMode });
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/investment/performance${query}`);
    return parseJsonResponse<InvestmentData>(res, 'Failed to load investment performance');
  },

  // Hosts
  async getHosts(metricMode: string = 'event_medals'): Promise<HostsData> {
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/hosts/performance?metric_mode=${metricMode}`);
    return parseJsonResponse<HostsData>(res, 'Failed to load host-nation analysis');
  },

  // Timeline
  async getTimeline(): Promise<TimelineData> {
    const res = await fetchWithColdStartRetry(`${getBaseUrl()}/timeline`);
    return parseJsonResponse<TimelineData>(res, 'Failed to load Olympic timeline');
  },

  // Data management
  async validateFile(file: File): Promise<DataQualityReport> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${getBaseUrl()}/data/validate`, {
      method: 'POST',
      body: formData,
    });
    return parseJsonResponse<DataQualityReport>(res, 'Validation failed');
  },

  async uploadFile(file: File, mapping?: Record<string, string>): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (mapping) {
      formData.append('mapping_json', JSON.stringify(mapping));
    }
    const res = await fetch(`${getBaseUrl()}/data/upload`, {
      method: 'POST',
      body: formData,
    });
    return parseJsonResponse<any>(res, 'Upload failed');
  },

  async resetData(): Promise<any> {
    const res = await fetch(`${getBaseUrl()}/data/reset`, { method: 'POST' });
    return parseJsonResponse<any>(res, 'Failed to reset dataset');
  },

  getExportUrl(exportType: string, filters?: GlobalFilterState): string {
    const query = buildQueryParams(filters, { export_type: exportType });
    return `${getBaseUrl()}/data/export${query}`;
  },

  getTemplateUrl(templateType: string): string {
    return `${getBaseUrl()}/data/template/${templateType}`;
  }
};
