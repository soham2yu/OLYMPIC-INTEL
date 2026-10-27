export interface OverviewData {
  kpis: {
    total_medals: number;
    gold_medals: number;
    silver_medals: number;
    bronze_medals: number;
    distinct_countries: number;
    distinct_athletes: number;
    distinct_sports: number;
    distinct_editions: number;
    coverage_period: string;
    metric_mode: string;
    metric_note: string;
  };
  historical_trends: {
    edition: string;
    year: number;
    season: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  }[];
  top_countries: {
    country_noc: string;
    country_name: string;
    region: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
    athlete_count: number;
  }[];
  medal_distribution: {
    Gold: number;
    Silver: number;
    Bronze: number;
  };
  athlete_trends: {
    edition: string;
    year: number;
    season: string;
    athletes: number;
    countries: number;
    sports: number;
  }[];
  sports_participation: {
    sport: string;
    athletes: number;
    medals: number;
  }[];
  recent_insights: {
    id: string;
    title: string;
    observation: string;
    metric: string;
    period: string;
    category: string;
  }[];
}

export interface MedalRankItem {
  rank: number;
  country_noc: string;
  country_name: string;
  region: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  athlete_count: number;
  efficiency: number;
}

export interface MedalsData {
  rankings: MedalRankItem[];
  edition_trends: {
    edition: string;
    year: number;
    season: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  }[];
  summer_vs_winter: Record<string, { Gold: number; Silver: number; Bronze: number; Total: number }>;
  gender_medals: Record<string, { Gold: number; Silver: number; Bronze: number; Total: number }>;
  total_countries: number;
}

export interface CountryProfileData {
  country_noc: string;
  country_name: string;
  region: string;
  total_medals: number;
  gold_medals: number;
  silver_medals: number;
  bronze_medals: number;
  distinct_athletes: number;
  participating_editions: number;
  best_edition: string | null;
  best_edition_medals: number;
  summer_medals: number;
  winter_medals: number;
  gender_breakdown: { Men: number; Women: number };
  top_sports: { sport: string; gold: number; silver: number; bronze: number; total: number }[];
  edition_history: { edition: string; year: number; season: string; gold: number; silver: number; bronze: number; total: number }[];
  host_performance: { edition: string; medals: number; is_host: boolean }[];
}

export interface SportsData {
  avg_medals_per_athlete: {
    sport: string;
    season: string;
    athletes: number;
    athlete_medal_awards: number;
    event_medals: number;
    distinct_medal_winners: number;
    avg_medals_per_athlete: number;
    distinct_winner_rate: number;
    events_count: number;
  }[];
  medal_performance: {
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  }[];
  country_strength_heatmap: {
    country_noc: string;
    country_name: string;
    sport: string;
    medals: number;
    gold: number;
  }[];
  available_sports: string[];
  available_countries: string[];
  total_sports: number;
}

export interface SportDetailData {
  sport: string;
  season: string;
  total_medals: number;
  distinct_athletes: number;
  events_count: number;
  top_countries: { country_noc: string; country_name: string; gold: number; silver: number; bronze: number; total: number }[];
  gender_breakdown: { Men: number; Women: number };
  edition_trends: { edition: string; year: number; season: string; sport: string; athletes: number; events: number; medals: number }[];
  definition_notes: Record<string, string>;
}

export interface AthletesData {
  edition_trends: {
    edition: string;
    year: number;
    season: string;
    total_athletes: number;
    men: number;
    women: number;
    countries_count: number;
  }[];
  gender_distribution_overall: { Men: number; Women: number };
  repeat_participation: {
    editions_attended: number;
    athlete_count: number;
    percentage: number;
  }[];
  top_participating_countries: { country_noc: string; country_name: string; athletes: number }[];
  top_participating_sports: { sport: string; athletes: number }[];
  total_athletes: number;
  total_records: number;
}

export interface RegionsData {
  regional_summaries: {
    region: string;
    total_medals: number;
    gold: number;
    silver: number;
    bronze: number;
    athletes: number;
    participating_nocs: number;
    medal_winning_nocs: number;
    noc_attainment_rate: number;
    medals_per_100_athletes: number;
  }[];
  regional_trends: {
    edition: string;
    year: number;
    season: string;
    region: string;
    medals: number;
    athletes: number;
  }[];
  countries_by_region: {
    country_noc: string;
    country_name: string;
    region: string;
    medals: number;
    gold: number;
    athletes: number;
  }[];
  total_medals: number;
  total_athletes: number;
  mapping_source: string;
}

export interface InvestmentData {
  has_data: boolean;
  is_demo_data: boolean;
  data_notice: string;
  bubble_data: {
    country_noc: string;
    country_name: string;
    region: string;
    investment_amount_m: number;
    currency: string;
    reporting_year: number;
    olympic_cycle: string;
    medals: number;
    gold_medals: number;
    athletes: number;
    medals_per_billion: number;
    cost_per_medal_m: number;
    is_demo: boolean;
  }[];
  efficiency_rankings: {
    rank: number;
    country_noc: string;
    country_name: string;
    region: string;
    investment_amount_m: number;
    medals: number;
    efficiency_score: number;
    tier: string;
  }[];
  regional_comparison: {
    region: string;
    total_investment_m: number;
    total_medals: number;
    medals_per_billion: number;
    countries_reported: number;
  }[];
  opportunities: {
    country_noc: string;
    country_name: string;
    region: string;
    medals: number;
    investment_amount_m: number;
    cost_per_medal_m: number;
    category: string;
    rationale: string;
  }[];
  reporting_cycles: string[];
  currencies_included: string[];
  methodology_caveat: string;
}

export interface HostsData {
  host_editions: {
    edition: string;
    year: number;
    season: string;
    city: string;
    host_country: string;
    host_noc: string;
    events_count: number;
    host_medals_won: number;
    host_gold_won: number;
    host_rank: number;
    baseline_avg_medals: number;
    lift_medals: number;
    lift_percentage: number;
  }[];
  host_trajectories: {
    country_noc: string;
    country_name: string;
    host_edition: string;
    timeline: { edition_label: string; edition: string; medals: number; gold: number }[];
    observation: string;
  }[];
  comparison_table: {
    edition: string;
    year: number;
    season: string;
    city: string;
    host_noc: string;
    host_country: string;
    host_medals: number;
    host_gold: number;
    host_rank: number;
    pre_host_medals: number | null;
    post_host_medals: number | null;
    home_advantage_lift: number;
  }[];
  summer_avg_lift: number;
  winter_avg_lift: number;
  causal_disclaimer: string;
}

export interface TimelineEditionSummary {
  edition: string;
  year: number;
  season: string;
  city: string;
  host_country: string;
  host_noc: string;
  total_medals: number;
  athletes_count: number;
  participating_countries: number;
  sports_count: number;
  top_country: string;
  top_country_gold: number;
  key_milestone: string;
}

export interface TimelineData {
  editions: TimelineEditionSummary[];
  guided_story: {
    chapter_index: number;
    title: string;
    subtitle: string;
    description: string;
    key_findings: string[];
    supporting_metrics: Record<string, string>;
  }[];
  selectable_countries: { noc: string; name: string }[];
  default_trajectories: {
    country_noc: string;
    country_name: string;
    editions: { edition: string; year: number; season: string; medals: number; gold: number }[];
  }[];
}

export interface DataQualityReport {
  status: string;
  message: string;
  quality_summary: {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    duplicate_rows: number;
    column_null_counts: Record<string, number>;
    column_null_percentages: Record<string, number>;
    unique_countries: number;
    unique_sports: number;
    year_range: string;
    detected_dataset_type: string;
    passed_validation: boolean;
    errors: { row_number: number; column: string; invalid_value: any; reason: string }[];
  };
  preview_rows: Record<string, any>[];
  suggested_mapping: Record<string, string>;
  file_id?: string;
}
