"""
Centralized Olympic Analytics Engine
Performs reproducible, mathematically rigorous Olympic sports performance calculations.
"""

import os
import json
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any, Tuple
from app.core.config import settings
from app.schemas.filters import GlobalFilterParams

class OlympicAnalyticsEngine:
    def __init__(self):
        self.df: pd.DataFrame = pd.DataFrame()
        self.hosts_df: pd.DataFrame = pd.DataFrame()
        self.regions_df: pd.DataFrame = pd.DataFrame()
        self.investment_df: pd.DataFrame = pd.DataFrame()
        self.active_dataset_name: str = "Canonical 1992-2026 Olympic Dataset"
        self.is_custom_dataset: bool = False
        self.load_data()

    def load_data(self):
        """Loads canonical datasets from disk"""
        if os.path.exists(settings.CANONICAL_DATA_PATH):
            self.df = pd.read_csv(settings.CANONICAL_DATA_PATH, low_memory=False)
            self.df['year'] = pd.to_numeric(self.df['year'], errors='coerce').fillna(0).astype(int)
            self.df['medal'] = self.df['medal'].replace({np.nan: None, "NA": None})
            self.df['is_team_event'] = self.df['is_team_event'].fillna(False).astype(bool)
        else:
            self.df = pd.DataFrame()

        if os.path.exists(settings.HOSTS_METADATA_PATH):
            with open(settings.HOSTS_METADATA_PATH, "r", encoding="utf-8") as f:
                self.hosts_data = json.load(f)
                self.hosts_df = pd.DataFrame(self.hosts_data)
        else:
            self.hosts_df = pd.DataFrame()
            self.hosts_data = []

        if os.path.exists(settings.NOC_REGIONS_PATH):
            with open(settings.NOC_REGIONS_PATH, "r", encoding="utf-8") as f:
                self.regions_data = json.load(f)
                self.regions_df = pd.DataFrame(self.regions_data)
        else:
            self.regions_df = pd.DataFrame()
            self.regions_data = []

        if os.path.exists(settings.INVESTMENT_DATA_PATH):
            self.investment_df = pd.read_csv(settings.INVESTMENT_DATA_PATH)
        else:
            self.investment_df = pd.DataFrame()

    def reset_to_canonical(self):
        """Reset dataset to canonical system default"""
        self.active_dataset_name = "Canonical 1992-2026 Olympic Dataset"
        self.is_custom_dataset = False
        self.load_data()

    def filter_dataframe(self, filters: Optional[GlobalFilterParams] = None) -> pd.DataFrame:
        """Applies global filters consistently to the master DataFrame"""
        if self.df.empty:
            return pd.DataFrame()

        d = self.df.copy()
        if not filters:
            return d

        if filters.start_year is not None:
            d = d[d['year'] >= filters.start_year]
        if filters.end_year is not None:
            d = d[d['year'] <= filters.end_year]

        if filters.season and filters.season.lower() != 'all':
            d = d[d['season'].str.lower() == filters.season.lower()]

        if filters.countries and len(filters.countries) > 0:
            d = d[d['country_noc'].isin(filters.countries)]

        if filters.regions and len(filters.regions) > 0:
            d = d[d['region'].isin(filters.regions)]

        if filters.sports and len(filters.sports) > 0:
            d = d[d['sport'].isin(filters.sports)]

        if filters.gender and filters.gender.upper() in ['M', 'F']:
            d = d[d['gender'].str.upper() == filters.gender.upper()]

        if filters.medal_type and filters.medal_type.lower() != 'all':
            d = d[d['medal'].str.lower() == filters.medal_type.lower()]

        return d

    def get_filter_options(self) -> Dict[str, Any]:
        """Returns all available distinct values for UI filter dropdowns"""
        if self.df.empty:
            return {
                "min_year": 1992, "max_year": 2026, "years": [], "seasons": ["Summer", "Winter"],
                "countries": [], "regions": [], "sports": [], "genders": [], "medal_types": [], "editions": []
            }

        years = sorted(int(y) for y in self.df['year'].unique() if y > 0)
        countries_df = self.df[['country_noc', 'country_name', 'region']].drop_duplicates().sort_values('country_name')
        countries = countries_df.rename(columns={'country_noc': 'noc', 'country_name': 'name'}).to_dict(orient='records')
        regions = sorted(r for r in self.df['region'].dropna().unique() if r)
        sports = sorted(s for s in self.df['sport'].dropna().unique() if s)
        editions_df = self.df[['edition', 'year', 'season', 'city']].drop_duplicates().sort_values(['year', 'season'])
        editions = editions_df.to_dict(orient='records')

        return {
            "min_year": min(years) if years else 1992,
            "max_year": max(years) if years else 2026,
            "years": years,
            "seasons": ["All", "Summer", "Winter"],
            "countries": countries,
            "regions": regions,
            "sports": sports,
            "genders": [
                {"id": "All", "label": "All Genders"},
                {"id": "M", "label": "Men"},
                {"id": "F", "label": "Women"}
            ],
            "medal_types": ["All", "Gold", "Silver", "Bronze"],
            "editions": editions
        }

    # =========================================================================
    # OVERVIEW DASHBOARD CALCULATIONS
    # =========================================================================
    def get_overview(self, filters: Optional[GlobalFilterParams] = None) -> Dict[str, Any]:
        df = self.filter_dataframe(filters)
        metric_mode = filters.metric_mode if filters and filters.metric_mode else "event_medals"

        if df.empty:
            return {
                "kpis": {
                    "total_medals": 0, "gold_medals": 0, "silver_medals": 0, "bronze_medals": 0,
                    "distinct_countries": 0, "distinct_athletes": 0, "distinct_sports": 0,
                    "distinct_editions": 0, "coverage_period": "N/A", "metric_mode": metric_mode,
                    "metric_note": "No records matched current filter."
                },
                "historical_trends": [],
                "top_countries": [],
                "medal_distribution": {"Gold": 0, "Silver": 0, "Bronze": 0},
                "athlete_trends": [],
                "sports_participation": [],
                "recent_insights": []
            }

        medals_df = df[df['medal'].notna()]
        if metric_mode == "event_medals":
            medals_df = medals_df.drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal'])
            metric_note = "Official Event Medals: 1 medal per event podium position for each country."
        else:
            metric_note = "Athlete Medal Awards: Each medalist athlete (including relay & crew members) is counted individually."

        gold_count = int((medals_df['medal'] == 'Gold').sum())
        silver_count = int((medals_df['medal'] == 'Silver').sum())
        bronze_count = int((medals_df['medal'] == 'Bronze').sum())
        total_medals = gold_count + silver_count + bronze_count

        years = df['year'].unique()
        min_y, max_y = min(years), max(years)
        coverage_period = f"{min_y} - {max_y}"

        kpis = {
            "total_medals": total_medals,
            "gold_medals": gold_count,
            "silver_medals": silver_count,
            "bronze_medals": bronze_count,
            "distinct_countries": int(df['country_noc'].nunique()),
            "distinct_athletes": int(df['athlete_id'].nunique()),
            "distinct_sports": int(df['sport'].nunique()),
            "distinct_editions": int(df['edition'].nunique()),
            "coverage_period": coverage_period,
            "metric_mode": metric_mode,
            "metric_note": metric_note
        }

        # Historical Trend
        trends = []
        for (edition, yr, season), grp in medals_df.groupby(['edition', 'year', 'season'], sort=False):
            g = int((grp['medal'] == 'Gold').sum())
            s = int((grp['medal'] == 'Silver').sum())
            b = int((grp['medal'] == 'Bronze').sum())
            trends.append({
                "edition": edition,
                "year": int(yr),
                "season": season,
                "gold": g,
                "silver": s,
                "bronze": b,
                "total": g + s + b
            })
        trends.sort(key=lambda x: (x['year'], 0 if x['season'] == 'Winter' else 1))

        # Top Countries
        country_medals = []
        for noc, grp in medals_df.groupby('country_noc'):
            c_name = grp['country_name'].iloc[0] if 'country_name' in grp.columns else noc
            reg = grp['region'].iloc[0] if 'region' in grp.columns else "Other"
            g = int((grp['medal'] == 'Gold').sum())
            s = int((grp['medal'] == 'Silver').sum())
            b = int((grp['medal'] == 'Bronze').sum())
            ath_count = int(df[df['country_noc'] == noc]['athlete_id'].nunique())
            country_medals.append({
                "country_noc": noc,
                "country_name": c_name,
                "region": reg,
                "gold": g,
                "silver": s,
                "bronze": b,
                "total": g + s + b,
                "athlete_count": ath_count
            })
        country_medals.sort(key=lambda x: (x['gold'], x['silver'], x['bronze'], x['total']), reverse=True)
        top_countries = country_medals[:15]

        # Athlete Participation Trend
        ath_trends = []
        for (edition, yr, season), grp in df.groupby(['edition', 'year', 'season'], sort=False):
            ath_trends.append({
                "edition": edition,
                "year": int(yr),
                "season": season,
                "athletes": int(grp['athlete_id'].nunique()),
                "countries": int(grp['country_noc'].nunique()),
                "sports": int(grp['sport'].nunique())
            })
        ath_trends.sort(key=lambda x: (x['year'], 0 if x['season'] == 'Winter' else 1))

        # Sports Participation
        sports_part = []
        for sport, grp in df.groupby('sport'):
            m_count = int(medals_df[medals_df['sport'] == sport]['medal'].count())
            sports_part.append({
                "sport": sport,
                "athletes": int(grp['athlete_id'].nunique()),
                "medals": m_count
            })
        sports_part.sort(key=lambda x: x['athletes'], reverse=True)

        # Dynamic statistical insights
        insights = []
        if len(top_countries) > 0:
            top_1 = top_countries[0]
            insights.append({
                "id": "leader-country",
                "title": f"{top_1['country_name']} Leads Medal Tally",
                "observation": f"{top_1['country_name']} ({top_1['country_noc']}) ranks first in the selected period with {top_1['gold']} Gold and {top_1['total']} total {metric_mode.replace('_', ' ')}.",
                "metric": metric_mode,
                "period": coverage_period,
                "category": "performance"
            })

        if len(ath_trends) >= 2:
            first_ath = ath_trends[0]['athletes']
            last_ath = ath_trends[-1]['athletes']
            ath_diff = last_ath - first_ath
            pct_chg = (ath_diff / max(1, first_ath)) * 100
            insights.append({
                "id": "athlete-expansion",
                "title": "Athlete Participation Trajectory",
                "observation": f"Athlete participation changed from {first_ath:,} in {ath_trends[0]['edition']} to {last_ath:,} in {ath_trends[-1]['edition']} ({pct_chg:+.1f}% shift).",
                "metric": "distinct_athletes",
                "period": f"{ath_trends[0]['year']} to {ath_trends[-1]['year']}",
                "category": "participation"
            })

        insights.append({
            "id": "methodology-caution",
            "title": "Counting Rule Verification",
            "observation": "Team events (relays, rowing eights, basketball) yield multi-podium athlete awards per event medal. Toggling between Event Medals and Athlete Awards clarifies crew attribution without distorting nation rankings.",
            "metric": "counting_rule",
            "period": "All Olympic Editions",
            "category": "historical"
        })

        return {
            "kpis": kpis,
            "historical_trends": trends,
            "top_countries": top_countries,
            "medal_distribution": {"Gold": gold_count, "Silver": silver_count, "Bronze": bronze_count},
            "athlete_trends": ath_trends,
            "sports_participation": sports_part[:20],
            "recent_insights": insights
        }

    # =========================================================================
    # MEDAL ANALYSIS CALCULATIONS
    # =========================================================================
    def get_medal_rankings(self, filters: Optional[GlobalFilterParams] = None) -> Dict[str, Any]:
        df = self.filter_dataframe(filters)
        metric_mode = filters.metric_mode if filters and filters.metric_mode else "event_medals"

        if df.empty:
            return {
                "rankings": [],
                "edition_trends": [],
                "summer_vs_winter": {},
                "gender_medals": {},
                "total_countries": 0
            }

        medals_df = df[df['medal'].notna()]
        if metric_mode == "event_medals":
            medals_df = medals_df.drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal'])

        rankings = []
        for noc, grp in medals_df.groupby('country_noc'):
            c_name = grp['country_name'].iloc[0] if 'country_name' in grp.columns else noc
            reg = grp['region'].iloc[0] if 'region' in grp.columns else "Other"
            g = int((grp['medal'] == 'Gold').sum())
            s = int((grp['medal'] == 'Silver').sum())
            b = int((grp['medal'] == 'Bronze').sum())
            tot = g + s + b
            ath_count = int(df[df['country_noc'] == noc]['athlete_id'].nunique())
            efficiency = round((tot / max(1, ath_count)) * 100, 2)
            rankings.append({
                "country_noc": noc,
                "country_name": c_name,
                "region": reg,
                "gold": g,
                "silver": s,
                "bronze": b,
                "total": tot,
                "athlete_count": ath_count,
                "efficiency": efficiency
            })

        rankings.sort(key=lambda x: (x['gold'], x['silver'], x['bronze'], x['total']), reverse=True)
        for idx, item in enumerate(rankings):
            item['rank'] = idx + 1

        # Edition Trends
        ed_trends = []
        for (edition, yr, season), grp in medals_df.groupby(['edition', 'year', 'season']):
            g = int((grp['medal'] == 'Gold').sum())
            s = int((grp['medal'] == 'Silver').sum())
            b = int((grp['medal'] == 'Bronze').sum())
            ed_trends.append({
                "edition": edition,
                "year": int(yr),
                "season": season,
                "gold": g,
                "silver": s,
                "bronze": b,
                "total": g + s + b
            })
        ed_trends.sort(key=lambda x: (x['year'], 0 if x['season'] == 'Winter' else 1))

        # Summer vs Winter
        summer_m = medals_df[medals_df['season'] == 'Summer']
        winter_m = medals_df[medals_df['season'] == 'Winter']
        summer_vs_winter = {
            "Summer": {
                "Gold": int((summer_m['medal'] == 'Gold').sum()),
                "Silver": int((summer_m['medal'] == 'Silver').sum()),
                "Bronze": int((summer_m['medal'] == 'Bronze').sum()),
                "Total": len(summer_m)
            },
            "Winter": {
                "Gold": int((winter_m['medal'] == 'Gold').sum()),
                "Silver": int((winter_m['medal'] == 'Silver').sum()),
                "Bronze": int((winter_m['medal'] == 'Bronze').sum()),
                "Total": len(winter_m)
            }
        }

        # Gender breakdown
        gender_medals = {
            "Men": {
                "Gold": int(((medals_df['gender'] == 'M') & (medals_df['medal'] == 'Gold')).sum()),
                "Silver": int(((medals_df['gender'] == 'M') & (medals_df['medal'] == 'Silver')).sum()),
                "Bronze": int(((medals_df['gender'] == 'M') & (medals_df['medal'] == 'Bronze')).sum()),
                "Total": int((medals_df['gender'] == 'M').sum())
            },
            "Women": {
                "Gold": int(((medals_df['gender'] == 'F') & (medals_df['medal'] == 'Gold')).sum()),
                "Silver": int(((medals_df['gender'] == 'F') & (medals_df['medal'] == 'Silver')).sum()),
                "Bronze": int(((medals_df['gender'] == 'F') & (medals_df['medal'] == 'Bronze')).sum()),
                "Total": int((medals_df['gender'] == 'F').sum())
            }
        }

        return {
            "rankings": rankings,
            "edition_trends": ed_trends,
            "summer_vs_winter": summer_vs_winter,
            "gender_medals": gender_medals,
            "total_countries": len(rankings)
        }

    def get_country_profile(self, country_noc: str, metric_mode: str = "event_medals") -> Dict[str, Any]:
        """Detailed country profile with historical breakdown, top sports, and host performance"""
        noc = country_noc.upper()
        cdf = self.df[self.df['country_noc'] == noc]

        if cdf.empty:
            return {
                "country_noc": noc, "country_name": noc, "region": "Unknown",
                "total_medals": 0, "gold_medals": 0, "silver_medals": 0, "bronze_medals": 0,
                "distinct_athletes": 0, "participating_editions": 0, "best_edition": None,
                "best_edition_medals": 0, "summer_medals": 0, "winter_medals": 0,
                "gender_breakdown": {"Men": 0, "Women": 0}, "top_sports": [],
                "edition_history": [], "host_performance": []
            }

        c_name = cdf['country_name'].iloc[0] if 'country_name' in cdf.columns else noc
        reg = cdf['region'].iloc[0] if 'region' in cdf.columns else "Other"

        medals_df = cdf[cdf['medal'].notna()]
        if metric_mode == "event_medals":
            medals_df = medals_df.drop_duplicates(subset=['year', 'season', 'event', 'medal'])

        g = int((medals_df['medal'] == 'Gold').sum())
        s = int((medals_df['medal'] == 'Silver').sum())
        b = int((medals_df['medal'] == 'Bronze').sum())
        tot = g + s + b

        summer_medals = int((medals_df['season'] == 'Summer').sum())
        winter_medals = int((medals_df['season'] == 'Winter').sum())

        men_medals = int((medals_df['gender'] == 'M').sum())
        women_medals = int((medals_df['gender'] == 'F').sum())

        # Top sports
        top_sports = []
        for sport, grp in medals_df.groupby('sport'):
            sg = int((grp['medal'] == 'Gold').sum())
            ss = int((grp['medal'] == 'Silver').sum())
            sb = int((grp['medal'] == 'Bronze').sum())
            top_sports.append({
                "sport": sport, "gold": sg, "silver": ss, "bronze": sb, "total": sg + ss + sb
            })
        top_sports.sort(key=lambda x: (x['gold'], x['total']), reverse=True)

        # Edition history
        ed_history = []
        best_edition = None
        best_edition_medals = 0

        for (edition, yr, season), grp in medals_df.groupby(['edition', 'year', 'season']):
            eg = int((grp['medal'] == 'Gold').sum())
            es = int((grp['medal'] == 'Silver').sum())
            eb = int((grp['medal'] == 'Bronze').sum())
            etot = eg + es + eb
            if etot > best_edition_medals:
                best_edition_medals = etot
                best_edition = edition
            ed_history.append({
                "edition": edition, "year": int(yr), "season": season,
                "gold": eg, "silver": es, "bronze": eb, "total": etot
            })
        ed_history.sort(key=lambda x: (x['year'], 0 if x['season'] == 'Winter' else 1))

        # Host performance
        host_editions = [h['edition'] for h in self.hosts_data if h.get('host_noc') == noc]
        host_perf = []
        for h_ed in ed_history:
            is_host = h_ed['edition'] in host_editions
            host_perf.append({
                "edition": h_ed['edition'],
                "medals": h_ed['total'],
                "is_host": is_host
            })

        return {
            "country_noc": noc,
            "country_name": c_name,
            "region": reg,
            "total_medals": tot,
            "gold_medals": g,
            "silver_medals": s,
            "bronze_medals": b,
            "distinct_athletes": int(cdf['athlete_id'].nunique()),
            "participating_editions": int(cdf['edition'].nunique()),
            "best_edition": best_edition,
            "best_edition_medals": best_edition_medals,
            "summer_medals": summer_medals,
            "winter_medals": winter_medals,
            "gender_breakdown": {"Men": men_medals, "Women": women_medals},
            "top_sports": top_sports[:10],
            "edition_history": ed_history,
            "host_performance": host_perf
        }

    # =========================================================================
    # SPORTS AND DISCIPLINE ANALYSIS
    # =========================================================================
    def get_sports_analysis(self, min_athletes: int = 20, filters: Optional[GlobalFilterParams] = None) -> Dict[str, Any]:
        df = self.filter_dataframe(filters)
        if df.empty:
            return {
                "avg_medals_per_athlete": [], "medal_performance": [],
                "country_strength_heatmap": [], "available_sports": [], "available_countries": [],
                "total_sports": 0
            }

        avg_list = []
        perf_list = []

        for sport, grp in df.groupby('sport'):
            distinct_ath = int(grp['athlete_id'].nunique())
            if distinct_ath < min_athletes:
                continue

            season = grp['season'].iloc[0]
            medals_grp = grp[grp['medal'].notna()]
            athlete_awards = len(medals_grp)

            # Unique event medals in this sport
            event_medals = len(medals_grp.drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal']))
            distinct_winners = int(medals_grp['athlete_id'].nunique())

            g = int((medals_grp['medal'] == 'Gold').sum())
            s = int((medals_grp['medal'] == 'Silver').sum())
            b = int((medals_grp['medal'] == 'Bronze').sum())

            events_count = int(grp['event'].nunique())
            avg_per_ath = round(athlete_awards / max(1, distinct_ath), 4)
            winner_rate = round((distinct_winners / max(1, distinct_ath)) * 100, 2)

            avg_list.append({
                "sport": sport,
                "season": season,
                "athletes": distinct_ath,
                "athlete_medal_awards": athlete_awards,
                "event_medals": event_medals,
                "distinct_medal_winners": distinct_winners,
                "avg_medals_per_athlete": avg_per_ath,
                "distinct_winner_rate": winner_rate,
                "events_count": events_count
            })

            perf_list.append({
                "sport": sport,
                "gold": g,
                "silver": s,
                "bronze": b,
                "total": g + s + b
            })

        avg_list.sort(key=lambda x: x['avg_medals_per_athlete'], reverse=True)
        perf_list.sort(key=lambda x: x['total'], reverse=True)

        # Country strength heatmap matrix (Top 12 countries x Top 12 sports)
        top_sports_names = [p['sport'] for p in perf_list[:12]]
        # Top countries by medals
        medals_df = df[df['medal'].notna()].drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal'])
        top_nocs = medals_df['country_noc'].value_counts().head(12).index.tolist()

        heatmap = []
        for noc in top_nocs:
            c_name = df[df['country_noc'] == noc]['country_name'].iloc[0] if noc in df['country_noc'].values else noc
            for sp in top_sports_names:
                cell_df = medals_df[(medals_df['country_noc'] == noc) & (medals_df['sport'] == sp)]
                tot = len(cell_df)
                gld = int((cell_df['medal'] == 'Gold').sum())
                heatmap.append({
                    "country_noc": noc,
                    "country_name": c_name,
                    "sport": sp,
                    "medals": tot,
                    "gold": gld
                })

        return {
            "avg_medals_per_athlete": avg_list,
            "medal_performance": perf_list[:25],
            "country_strength_heatmap": heatmap,
            "available_sports": sorted(df['sport'].dropna().unique()),
            "available_countries": top_nocs,
            "total_sports": len(avg_list)
        }

    def get_sport_detail(self, sport_name: str) -> Dict[str, Any]:
        """Drilldown on a specific sport"""
        sdf = self.df[self.df['sport'].str.lower() == sport_name.lower()]
        if sdf.empty:
            return {"sport": sport_name, "error": "Sport not found"}

        season = sdf['season'].iloc[0]
        medals_df = sdf[sdf['medal'].notna()].drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal'])

        top_countries = []
        for noc, grp in medals_df.groupby('country_noc'):
            c_name = grp['country_name'].iloc[0] if 'country_name' in grp.columns else noc
            g = int((grp['medal'] == 'Gold').sum())
            s = int((grp['medal'] == 'Silver').sum())
            b = int((grp['medal'] == 'Bronze').sum())
            top_countries.append({"country_noc": noc, "country_name": c_name, "gold": g, "silver": s, "bronze": b, "total": g + s + b})
        top_countries.sort(key=lambda x: (x['gold'], x['total']), reverse=True)

        trends = []
        for (edition, yr, sn), grp in sdf.groupby(['edition', 'year', 'season']):
            m_grp = grp[grp['medal'].notna()].drop_duplicates(subset=['event', 'country_noc', 'medal'])
            trends.append({
                "edition": edition,
                "year": int(yr),
                "season": sn,
                "sport": sport_name,
                "athletes": int(grp['athlete_id'].nunique()),
                "events": int(grp['event'].nunique()),
                "medals": len(m_grp)
            })
        trends.sort(key=lambda x: x['year'])

        return {
            "sport": sport_name,
            "season": season,
            "total_medals": len(medals_df),
            "distinct_athletes": int(sdf['athlete_id'].nunique()),
            "events_count": int(sdf['event'].nunique()),
            "top_countries": top_countries[:10],
            "gender_breakdown": {
                "Men": int((sdf['gender'] == 'M').nunique()),
                "Women": int((sdf['gender'] == 'F').nunique())
            },
            "edition_trends": trends,
            "definition_notes": {
                "medal_awards_per_athlete": "Number of podium physical medal recipients divided by all distinct competing athletes.",
                "event_medals": "Standard IOC count: 1 gold, 1 silver, 1 bronze per event, regardless of crew/team size."
            }
        }

    # =========================================================================
    # ATHLETE PARTICIPATION ANALYSIS
    # =========================================================================
    def get_athlete_analysis(self, filters: Optional[GlobalFilterParams] = None) -> Dict[str, Any]:
        df = self.filter_dataframe(filters)
        if df.empty:
            return {
                "edition_trends": [], "gender_distribution_overall": {},
                "repeat_participation": [], "top_participating_countries": [],
                "top_participating_sports": [], "total_athletes": 0, "total_records": 0
            }

        edition_trends = []
        for (edition, yr, season), grp in df.groupby(['edition', 'year', 'season']):
            total_ath = int(grp['athlete_id'].nunique())
            men = int(grp[grp['gender'] == 'M']['athlete_id'].nunique())
            women = int(grp[grp['gender'] == 'F']['athlete_id'].nunique())
            countries = int(grp['country_noc'].nunique())
            edition_trends.append({
                "edition": edition,
                "year": int(yr),
                "season": season,
                "total_athletes": total_ath,
                "men": men,
                "women": women,
                "countries_count": countries
            })
        edition_trends.sort(key=lambda x: (x['year'], 0 if x['season'] == 'Winter' else 1))

        # Overall gender
        overall_men = int(df[df['gender'] == 'M']['athlete_id'].nunique())
        overall_women = int(df[df['gender'] == 'F']['athlete_id'].nunique())

        # Repeat participation across Olympic editions
        ath_ed_counts = df.groupby('athlete_id')['edition'].nunique()
        bucket_1 = int((ath_ed_counts == 1).sum())
        bucket_2 = int((ath_ed_counts == 2).sum())
        bucket_3 = int((ath_ed_counts == 3).sum())
        bucket_4 = int((ath_ed_counts == 4).sum())
        bucket_5_plus = int((ath_ed_counts >= 5).sum())
        tot_unique_ath = len(ath_ed_counts)

        repeat_participation = [
            {"editions_attended": 1, "athlete_count": bucket_1, "percentage": round((bucket_1 / max(1, tot_unique_ath)) * 100, 2)},
            {"editions_attended": 2, "athlete_count": bucket_2, "percentage": round((bucket_2 / max(1, tot_unique_ath)) * 100, 2)},
            {"editions_attended": 3, "athlete_count": bucket_3, "percentage": round((bucket_3 / max(1, tot_unique_ath)) * 100, 2)},
            {"editions_attended": 4, "athlete_count": bucket_4, "percentage": round((bucket_4 / max(1, tot_unique_ath)) * 100, 2)},
            {"editions_attended": 5, "athlete_count": bucket_5_plus, "percentage": round((bucket_5_plus / max(1, tot_unique_ath)) * 100, 2)},
        ]

        # Top Participating Countries
        top_countries = []
        for noc, grp in df.groupby('country_noc'):
            c_name = grp['country_name'].iloc[0] if 'country_name' in grp.columns else noc
            top_countries.append({"country_noc": noc, "country_name": c_name, "athletes": int(grp['athlete_id'].nunique())})
        top_countries.sort(key=lambda x: x['athletes'], reverse=True)

        # Top Participating Sports
        top_sports = []
        for sport, grp in df.groupby('sport'):
            top_sports.append({"sport": sport, "athletes": int(grp['athlete_id'].nunique())})
        top_sports.sort(key=lambda x: x['athletes'], reverse=True)

        return {
            "edition_trends": edition_trends,
            "gender_distribution_overall": {"Men": overall_men, "Women": overall_women},
            "repeat_participation": repeat_participation,
            "top_participating_countries": top_countries[:15],
            "top_participating_sports": top_sports[:15],
            "total_athletes": tot_unique_ath,
            "total_records": len(df)
        }

    def search_athletes_table(self, query: str = "", sport: Optional[str] = None, country: Optional[str] = None,
                               medal_only: bool = False, page: int = 1, page_size: int = 25) -> Dict[str, Any]:
        """Paginated, filterable athlete participation table"""
        df = self.df.copy()
        if medal_only:
            df = df[df['medal'].notna()]
        if sport and sport.lower() != 'all':
            df = df[df['sport'].str.lower() == sport.lower()]
        if country and country.lower() != 'all':
            df = df[df['country_noc'] == country.upper()]
        if query:
            q = query.lower()
            df = df[df['athlete_name'].str.lower().str.contains(q, na=False) | df['event'].str.lower().str.contains(q, na=False)]

        total_rows = len(df)
        start = (page - 1) * page_size
        end = start + page_size
        page_df = df.iloc[start:end]

        rows = []
        for _, r in page_df.iterrows():
            rows.append({
                "athlete_id": int(r['athlete_id']),
                "athlete_name": str(r['athlete_name']),
                "gender": str(r['gender']),
                "country_noc": str(r['country_noc']),
                "country_name": str(r['country_name']),
                "sport": str(r['sport']),
                "event": str(r['event']),
                "year": int(r['year']),
                "season": str(r['season']),
                "edition": str(r['edition']),
                "medal": str(r['medal']) if pd.notna(r['medal']) else None
            })

        return {
            "total_rows": total_rows,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total_rows + page_size - 1) // page_size),
            "rows": rows
        }

    # =========================================================================
    # REGIONAL PERFORMANCE ANALYSIS
    # =========================================================================
    def get_regional_analysis(self, filters: Optional[GlobalFilterParams] = None) -> Dict[str, Any]:
        df = self.filter_dataframe(filters)
        metric_mode = filters.metric_mode if filters and filters.metric_mode else "event_medals"

        if df.empty:
            return {
                "regional_summaries": [], "regional_trends": [], "countries_by_region": [],
                "total_medals": 0, "total_athletes": 0, "mapping_source": "ISO / IOC NOC Continent Grouping"
            }

        medals_df = df[df['medal'].notna()]
        if metric_mode == "event_medals":
            medals_df = medals_df.drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal'])

        summaries = []
        for reg, grp in df.groupby('region'):
            if not reg or reg == 'Other':
                continue
            m_grp = medals_df[medals_df['region'] == reg]
            g = int((m_grp['medal'] == 'Gold').sum())
            s = int((m_grp['medal'] == 'Silver').sum())
            b = int((m_grp['medal'] == 'Bronze').sum())
            tot_m = g + s + b
            tot_ath = int(grp['athlete_id'].nunique())
            all_nocs = grp['country_noc'].nunique()
            medal_nocs = m_grp['country_noc'].nunique()
            attainment_rate = round((medal_nocs / max(1, all_nocs)) * 100, 2)
            medals_per_100_ath = round((tot_m / max(1, tot_ath)) * 100, 2)

            summaries.append({
                "region": reg,
                "total_medals": tot_m,
                "gold": g,
                "silver": s,
                "bronze": b,
                "athletes": tot_ath,
                "participating_nocs": int(all_nocs),
                "medal_winning_nocs": int(medal_nocs),
                "noc_attainment_rate": attainment_rate,
                "medals_per_100_athletes": medals_per_100_ath
            })

        summaries.sort(key=lambda x: x['total_medals'], reverse=True)

        # Regional Trends
        trends = []
        for (edition, yr, season, reg), grp in df.groupby(['edition', 'year', 'season', 'region']):
            if not reg or reg == 'Other':
                continue
            m_grp = medals_df[(medals_df['edition'] == edition) & (medals_df['region'] == reg)]
            trends.append({
                "edition": edition,
                "year": int(yr),
                "season": season,
                "region": reg,
                "medals": len(m_grp),
                "athletes": int(grp['athlete_id'].nunique())
            })
        trends.sort(key=lambda x: (x['year'], x['region']))

        # Country by region table
        country_rows = []
        for noc, grp in df.groupby('country_noc'):
            c_name = grp['country_name'].iloc[0] if 'country_name' in grp.columns else noc
            reg = grp['region'].iloc[0] if 'region' in grp.columns else "Other"
            m_grp = medals_df[medals_df['country_noc'] == noc]
            country_rows.append({
                "country_noc": noc,
                "country_name": c_name,
                "region": reg,
                "medals": len(m_grp),
                "gold": int((m_grp['medal'] == 'Gold').sum()),
                "athletes": int(grp['athlete_id'].nunique())
            })
        country_rows.sort(key=lambda x: (x['medals'], x['gold']), reverse=True)

        return {
            "regional_summaries": summaries,
            "regional_trends": trends,
            "countries_by_region": country_rows,
            "total_medals": len(medals_df),
            "total_athletes": int(df['athlete_id'].nunique()),
            "mapping_source": "ISO / IOC NOC Continental Association Standard Mapping"
        }

    # =========================================================================
    # INVESTMENT VS MEDAL PERFORMANCE ANALYSIS
    # =========================================================================
    def get_investment_analysis(self, cycle: Optional[str] = None, metric_mode: str = "event_medals") -> Dict[str, Any]:
        if self.investment_df.empty:
            return {
                "has_data": False,
                "is_demo_data": False,
                "data_notice": "No sports investment data loaded. Please upload a dataset in Data Management or toggle demo benchmark data.",
                "bubble_data": [],
                "efficiency_rankings": [],
                "regional_comparison": [],
                "opportunities": [],
                "reporting_cycles": [],
                "currencies_included": [],
                "methodology_caveat": "Sports funding values must come from verifiable public or Olympic committee financial accounts."
            }

        inv = self.investment_df.copy()
        if cycle and cycle.lower() != 'all':
            inv = inv[inv['olympic_cycle'].str.lower() == cycle.lower()]

        # Compute medals and athletes for each country in matching cycle
        bubble_data = []
        efficiency_rankings = []
        opportunities = []

        is_demo = bool(inv['is_demo'].any()) if 'is_demo' in inv.columns else False

        medals_df = self.df[self.df['medal'].notna()]
        if metric_mode == "event_medals":
            medals_df = medals_df.drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal'])

        for _, row in inv.iterrows():
            noc = str(row['country_noc']).strip()
            c_name = str(row['country_name']).strip()
            reg = str(row['region']).strip()
            amt = float(row['investment_amount'])
            curr = str(row['currency'])
            r_year = int(row['reporting_year'])
            o_cycle = str(row['olympic_cycle'])

            # Approximate cycle years
            if "2021-2024" in o_cycle or r_year >= 2024:
                cycle_df = medals_df[(medals_df['country_noc'] == noc) & (medals_df['year'].between(2021, 2024))]
                ath_df = self.df[(self.df['country_noc'] == noc) & (self.df['year'].between(2021, 2024))]
            elif "2017-2020" in o_cycle or r_year == 2020:
                cycle_df = medals_df[(medals_df['country_noc'] == noc) & (medals_df['year'].between(2017, 2020))]
                ath_df = self.df[(self.df['country_noc'] == noc) & (self.df['year'].between(2017, 2020))]
            else:
                cycle_df = medals_df[medals_df['country_noc'] == noc]
                ath_df = self.df[self.df['country_noc'] == noc]

            medals_count = len(cycle_df)
            gold_count = int((cycle_df['medal'] == 'Gold').sum())
            ath_count = int(ath_df['athlete_id'].nunique())

            medals_per_billion = round((medals_count / max(1.0, amt)) * 1000.0, 2)
            cost_per_medal = round(amt / max(1, medals_count), 2) if medals_count > 0 else 0.0

            bubble_data.append({
                "country_noc": noc,
                "country_name": c_name,
                "region": reg,
                "investment_amount_m": amt,
                "currency": curr,
                "reporting_year": r_year,
                "olympic_cycle": o_cycle,
                "medals": medals_count,
                "gold_medals": gold_count,
                "athletes": ath_count,
                "medals_per_billion": medals_per_billion,
                "cost_per_medal_m": cost_per_medal,
                "is_demo": is_demo
            })

            eff_score = round((medals_count / max(1.0, amt)) * 100.0, 2)
            tier = "High Efficiency" if eff_score > 15 else ("Moderate Efficiency" if eff_score > 5 else "Capital Intensive")
            efficiency_rankings.append({
                "rank": 0,
                "country_noc": noc,
                "country_name": c_name,
                "region": reg,
                "investment_amount_m": amt,
                "medals": medals_count,
                "efficiency_score": eff_score,
                "tier": tier
            })

            # High Efficiency Opportunities
            if medals_count >= 5 and amt <= 100.0:
                opportunities.append({
                    "country_noc": noc,
                    "country_name": c_name,
                    "region": reg,
                    "medals": medals_count,
                    "investment_amount_m": amt,
                    "cost_per_medal_m": cost_per_medal,
                    "category": "High Return / Potential Under-Funding",
                    "rationale": f"Won {medals_count} medals on reported budget of ${amt}M (~${cost_per_medal}M per medal)."
                })

        efficiency_rankings.sort(key=lambda x: x['efficiency_score'], reverse=True)
        for i, item in enumerate(efficiency_rankings):
            item['rank'] = i + 1

        # Regional comparison
        regional_comp = []
        inv_grouped = inv.groupby('region')
        for reg, grp in inv_grouped:
            reg_nocs = grp['country_noc'].unique()
            tot_inv = float(grp['investment_amount'].sum())
            reg_medals = len(medals_df[medals_df['country_noc'].isin(reg_nocs)])
            regional_comp.append({
                "region": reg,
                "total_investment_m": round(tot_inv, 2),
                "total_medals": reg_medals,
                "medals_per_billion": round((reg_medals / max(1.0, tot_inv)) * 1000.0, 2),
                "countries_reported": len(reg_nocs)
            })
        regional_comp.sort(key=lambda x: x['total_medals'], reverse=True)

        cycles = sorted(list(self.investment_df['olympic_cycle'].dropna().unique()))
        currencies = sorted(list(self.investment_df['currency'].dropna().unique()))

        data_notice = "DEMO DATA: The investment figures shown are synthetic benchmark data for academic demonstration. Do not cite as official NOC audited budgets." if is_demo else "Verified sports investment data loaded."

        return {
            "has_data": True,
            "is_demo_data": is_demo,
            "data_notice": data_notice,
            "bubble_data": bubble_data,
            "efficiency_rankings": efficiency_rankings,
            "regional_comparison": regional_comp,
            "opportunities": opportunities[:10],
            "reporting_cycles": cycles,
            "currencies_included": currencies,
            "methodology_caveat": "Medal performance correlates with multiple systemic factors (population, sports infrastructure, culture) and should not be viewed as purely causal to direct government grants."
        }

    # =========================================================================
    # HOST-NATION ANALYSIS
    # =========================================================================
    def get_hosts_analysis(self, metric_mode: str = "event_medals") -> Dict[str, Any]:
        if self.hosts_df.empty:
            return {
                "host_editions": [], "host_trajectories": [], "comparison_table": [],
                "summer_avg_lift": 0.0, "winter_avg_lift": 0.0,
                "causal_disclaimer": "Home advantage reflects participation quotas, familiarity, crowd support, and host-cycle funding surges."
            }

        medals_df = self.df[self.df['medal'].notna()]
        if metric_mode == "event_medals":
            medals_df = medals_df.drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal'])

        host_editions_records = []
        comparison_rows = []
        trajectories = []

        # All editions in order
        all_editions = self.hosts_data

        summer_lifts = []
        winter_lifts = []

        for idx, host in enumerate(all_editions):
            ed = host['edition']
            yr = host['year']
            sn = host['season']
            city = host['city']
            h_country = host['host_country']
            h_noc = host['host_noc']
            ev_count = host['events_count']

            # Medals won by host country in this edition
            host_m_df = medals_df[(medals_df['edition'] == ed) & (medals_df['country_noc'] == h_noc)]
            host_medals = len(host_m_df)
            host_gold = int((host_m_df['medal'] == 'Gold').sum())

            # Host ranking in this edition
            edition_medals = medals_df[medals_df['edition'] == ed].groupby('country_noc').size().sort_values(ascending=False)
            host_rank = list(edition_medals.index).index(h_noc) + 1 if h_noc in edition_medals.index else 99

            # Baseline calculation: find adjacent editions of same season
            same_season_editions = [e for e in all_editions if e['season'] == sn]
            s_idx = [i for i, e in enumerate(same_season_editions) if e['edition'] == ed]
            baseline_medals = []
            pre_medals = None
            post_medals = None

            if s_idx:
                curr_s_idx = s_idx[0]
                if curr_s_idx > 0:
                    pre_ed = same_season_editions[curr_s_idx - 1]['edition']
                    pre_m = len(medals_df[(medals_df['edition'] == pre_ed) & (medals_df['country_noc'] == h_noc)])
                    baseline_medals.append(pre_m)
                    pre_medals = pre_m
                if curr_s_idx < len(same_season_editions) - 1:
                    post_ed = same_season_editions[curr_s_idx + 1]['edition']
                    post_m = len(medals_df[(medals_df['edition'] == post_ed) & (medals_df['country_noc'] == h_noc)])
                    baseline_medals.append(post_m)
                    post_medals = post_m

            baseline_avg = float(np.mean(baseline_medals)) if baseline_medals else float(host_medals)
            lift = host_medals - int(round(baseline_avg))
            lift_pct = round(((host_medals - baseline_avg) / max(1.0, baseline_avg)) * 100.0, 1) if baseline_avg > 0 else 0.0

            if sn == 'Summer':
                summer_lifts.append(lift)
            else:
                winter_lifts.append(lift)

            host_editions_records.append({
                "edition": ed,
                "year": yr,
                "season": sn,
                "city": city,
                "host_country": h_country,
                "host_noc": h_noc,
                "events_count": ev_count,
                "host_medals_won": host_medals,
                "host_gold_won": host_gold,
                "host_rank": host_rank,
                "baseline_avg_medals": round(baseline_avg, 1),
                "lift_medals": lift,
                "lift_percentage": lift_pct
            })

            comparison_rows.append({
                "edition": ed,
                "year": yr,
                "season": sn,
                "city": city,
                "host_noc": h_noc,
                "host_country": h_country,
                "host_medals": host_medals,
                "host_gold": host_gold,
                "host_rank": host_rank,
                "pre_host_medals": pre_medals,
                "post_host_medals": post_medals,
                "home_advantage_lift": lift_pct
            })

            # Trajectory timeline for key host nations
            if h_noc in ['ESP', 'USA', 'AUS', 'GRE', 'CHN', 'GBR', 'BRA', 'JPN', 'FRA', 'ITA', 'NOR', 'CAN', 'KOR']:
                timeline = []
                for offset, label in [(-2, "Pre-2"), (-1, "Pre-1"), (0, "Host Edition"), (1, "Post-1"), (2, "Post-2")]:
                    target_s_idx = s_idx[0] + offset if s_idx else -1
                    if 0 <= target_s_idx < len(same_season_editions):
                        t_ed = same_season_editions[target_s_idx]['edition']
                        t_m_df = medals_df[(medals_df['edition'] == t_ed) & (medals_df['country_noc'] == h_noc)]
                        timeline.append({
                            "edition_label": label,
                            "edition": t_ed,
                            "medals": len(t_m_df),
                            "gold": int((t_m_df['medal'] == 'Gold').sum())
                        })
                if len(timeline) >= 3:
                    trajectories.append({
                        "country_noc": h_noc,
                        "country_name": h_country,
                        "host_edition": ed,
                        "timeline": timeline,
                        "observation": f"{h_country} won {host_medals} medals in {ed} (vs {round(baseline_avg, 1)} baseline average)."
                    })

        summer_avg_lift = round(float(np.mean(summer_lifts)), 1) if summer_lifts else 0.0
        winter_avg_lift = round(float(np.mean(winter_lifts)), 1) if winter_lifts else 0.0

        return {
            "host_editions": host_editions_records,
            "host_trajectories": trajectories,
            "comparison_table": comparison_rows,
            "summer_avg_lift": summer_avg_lift,
            "winter_avg_lift": winter_avg_lift,
            "causal_disclaimer": "Observed medal increases during host Games are descriptive. Hosts benefit from larger team quotas, automatic qualification, partisan support, and targeted multi-year preparation funding."
        }

    # =========================================================================
    # TIMELINE AND HISTORICAL STORYTELLING
    # =========================================================================
    def get_timeline(self) -> Dict[str, Any]:
        medals_df = self.df[self.df['medal'].notna()].drop_duplicates(subset=['year', 'season', 'event', 'country_noc', 'medal'])

        editions = []
        for host in self.hosts_data:
            ed = host['edition']
            yr = host['year']
            sn = host['season']
            city = host['city']
            h_country = host['host_country']
            h_noc = host['host_noc']

            edf = self.df[self.df['edition'] == ed]
            emedals = medals_df[medals_df['edition'] == ed]

            top_country = "N/A"
            top_country_gold = 0
            if not emedals.empty:
                country_golds = emedals[emedals['medal'] == 'Gold']['country_noc'].value_counts()
                if not country_golds.empty:
                    top_noc = country_golds.index[0]
                    top_country_gold = int(country_golds.iloc[0])
                    top_country = self.df[self.df['country_noc'] == top_noc]['country_name'].iloc[0] if top_noc in self.df['country_noc'].values else top_noc

            milestones = {
                1992: "First post-Cold War Games; Unified Team (ex-USSR) and reunited Germany competed.",
                1994: "First separate Winter Games cycle established by the IOC.",
                1996: "Centennial Olympic Games in Atlanta; softball and women's football debuted.",
                1998: "Snowboarding and women's ice hockey debuted in Nagano.",
                2000: "Sydney Millennium Games; North and South Korea marched together in opening ceremony.",
                2002: "Salt Lake City featured skeleton return and women's bobsleigh debut.",
                2004: "Olympics returned to birthplace in Athens; Michael Phelps won 8 medals.",
                2006: "Turin Winter Games; 80 NOCs competed in modern facilities.",
                2008: "Beijing Games; Usain Bolt world records and Phelps 8 Golds.",
                2010: "Vancouver Winter Games; host Canada won record 14 Winter Golds.",
                2012: "London Games; first edition where every participating nation had female athletes.",
                2014: "Sochi Winter Games; 12 new events introduced including slopestyle.",
                2016: "Rio Games; first Olympic Games held in South America; Refugee Olympic Team debuted.",
                2018: "PyeongChang; joint Korean women's hockey team competed.",
                2020: "Tokyo Games held in 2021 due to pandemic; skateboarding, surfing, climbing debuted.",
                2022: "Beijing became first city to host both Summer and Winter Olympic Games.",
                2024: "Paris Games; gender parity achieved in athlete quotas; breakdancing debuted.",
                2026: "Milano-Cortina Winter Games; 116 scheduled medal events across 16 winter sports disciplines."
            }

            key_ms = milestones.get(yr, f"Historic Olympic competition held in {city}, {h_country}.")

            editions.append({
                "edition": ed,
                "year": yr,
                "season": sn,
                "city": city,
                "host_country": h_country,
                "host_noc": h_noc,
                "total_medals": len(emedals),
                "athletes_count": int(edf['athlete_id'].nunique()),
                "participating_countries": int(edf['country_noc'].nunique()),
                "sports_count": int(edf['sport'].nunique()),
                "top_country": top_country,
                "top_country_gold": top_country_gold,
                "key_milestone": key_ms
            })

        # Guided Story Chapters
        guided_story = [
            {
                "chapter_index": 1,
                "title": "Global Participation Expansion",
                "subtitle": "From 169 nations in 1992 to over 200 NOCs today",
                "description": "The post-1992 era marked a dramatic globalization of the Olympic movement following the dissolution of the Soviet Union and geopolitical realignments.",
                "key_findings": [
                    "Participating NOCs expanded from 169 in Barcelona 1992 to 206 in Paris 2024.",
                    "Women's participation grew from 28.8% in Barcelona 1992 to exactly 50.0% in Paris 2024, achieving official gender parity.",
                    "Winter Olympic participation diversified, with subtropical nations consistently qualifying athletes in alpine and sliding disciplines."
                ],
                "supporting_metrics": {
                    "1992 Summer Athletes": "9,356",
                    "2024 Summer Athletes": "10,714",
                    "Gender Parity": "50.0% achieved in 2024"
                }
            },
            {
                "chapter_index": 2,
                "title": "Shifts in Medal Distribution",
                "subtitle": "The rise of specialized sporting superpowers",
                "description": "While the United States and China maintained high medal yields across athletics, swimming, diving, and gymnastics, mid-sized nations established dominance in targeted sports.",
                "key_findings": [
                    "Great Britain surged from 1 Gold in Atlanta 1996 to 29 Golds in London 2012 following the National Lottery funding revolution.",
                    "The Netherlands achieved world-class podium density in speed skating and cycling.",
                    "African nations continued unmatched long-distance running supremacy led by Kenya and Ethiopia."
                ],
                "supporting_metrics": {
                    "Total Medal Winning NOCs (1992)": "64",
                    "Total Medal Winning NOCs (2024)": "91",
                    "Specialization Index": "High in Cycling, Rowing, Skating"
                }
            },
            {
                "chapter_index": 3,
                "title": "Sports Category Evolution",
                "subtitle": "Urban, youth, and extreme sports enter the Olympic program",
                "description": "To remain relevant to younger audiences, the IOC introduced action sports, urban disciplines, and mixed-gender relays.",
                "key_findings": [
                    "Snowboarding (Nagano 1998) and Freestyle Skiing transformed the Winter Games profile.",
                    "Tokyo 2020 and Paris 2024 welcomed Sport Climbing, Skateboarding, Surfing, and 3x3 Basketball.",
                    "Mixed-team events in shooting, judo, swimming, and triathlon expanded medal opportunities without increasing athlete footprint."
                ],
                "supporting_metrics": {
                    "Summer Sports (1992)": "25",
                    "Summer Sports (2024)": "32",
                    "Mixed Team Events": "Over 20 introduced since 2012"
                }
            },
            {
                "chapter_index": 4,
                "title": "Host Nation Dynamics",
                "subtitle": "Quantifying home advantage across editions",
                "description": "Host nations systematically outperform their historical medal baseline, driven by automatic quotas, local familiarity, and multi-year high-performance investment.",
                "key_findings": [
                    "Host nations gained an average of +12 to +18 medals above their prior cycle baseline.",
                    "Australia won 58 medals in Sydney 2000, Japan won 58 medals in Tokyo 2020, and France won 64 medals in Paris 2024.",
                    "A notable 'post-host hangover' occurs when emergency host funding subsidies diminish in subsequent cycles."
                ],
                "supporting_metrics": {
                    "Average Host Lift": "+41% above baseline",
                    "Peak Host Gain": "China 2008 (+48 event medals)",
                    "Winter Host Record": "Canada 2010 (14 Golds)"
                }
            },
            {
                "chapter_index": 5,
                "title": "Methodological Rigor and Verification",
                "subtitle": "Resolving historical counting discrepancies",
                "description": "Distinguishing athlete medal awards (every podium individual) from official event medals (1 medal per country per event) is essential to avoid statistical distortions.",
                "key_findings": [
                    "Rowing and Shooting averages in popular briefs reflected crew counts per boat or inverted athlete denominators, not individual athlete returns.",
                    "Milano-Cortina 2026 Winter program encompasses 116 scheduled events across 16 disciplines, with official results pending.",
                    "No causal claims should be made attributing medal success solely to direct funding without controlling for GDP, population, and existing athletic infrastructure."
                ],
                "supporting_metrics": {
                    "Rowing Crew Factor": "Up to 9 medals awarded per Eight boat",
                    "Official Event Count Standard": "1 Gold per event podium",
                    "Milano 2026 Program": "116 events scheduled"
                }
            }
        ]

        # Trajectories for top countries
        top_nocs = ['USA', 'CHN', 'GBR', 'FRA', 'GER', 'AUS', 'JPN', 'NOR']
        trajectories = []
        for noc in top_nocs:
            c_name = self.df[self.df['country_noc'] == noc]['country_name'].iloc[0] if noc in self.df['country_noc'].values else noc
            history = []
            for h in self.hosts_data:
                ed = h['edition']
                m_count = len(medals_df[(medals_df['edition'] == ed) & (medals_df['country_noc'] == noc)])
                g_count = int((medals_df[(medals_df['edition'] == ed) & (medals_df['country_noc'] == noc)]['medal'] == 'Gold').sum())
                history.append({
                    "edition": ed,
                    "year": h['year'],
                    "season": h['season'],
                    "medals": m_count,
                    "gold": g_count
                })
            trajectories.append({
                "country_noc": noc,
                "country_name": c_name,
                "editions": history
            })

        selectable_countries = [
            {"noc": noc, "name": self.df[self.df['country_noc'] == noc]['country_name'].iloc[0] if noc in self.df['country_noc'].values else noc}
            for noc in sorted(self.df['country_noc'].dropna().unique())
        ]

        return {
            "editions": editions,
            "guided_story": guided_story,
            "selectable_countries": selectable_countries,
            "default_trajectories": trajectories
        }

    # =========================================================================
    # DATA VALIDATION AND QUALITY ENGINE
    # =========================================================================
    def validate_uploaded_file(self, content_str: str, filename: str) -> Dict[str, Any]:
        """Validates an uploaded CSV, performs column mapping detection, and returns quality report"""
        import io
        try:
            df = pd.read_csv(io.StringIO(content_str), low_memory=False)
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to parse CSV file: {str(e)}",
                "quality_summary": {
                    "total_rows": 0, "valid_rows": 0, "invalid_rows": 0, "duplicate_rows": 0,
                    "column_null_counts": {}, "column_null_percentages": {}, "unique_countries": 0,
                    "unique_sports": 0, "year_range": "N/A", "detected_dataset_type": "unknown",
                    "passed_validation": False, "errors": [{"row_number": 0, "column": "file", "invalid_value": None, "reason": str(e)}]
                },
                "preview_rows": [],
                "suggested_mapping": {}
            }

        total_rows = len(df)
        cols_lower = [c.lower().strip() for c in df.columns]

        # Determine dataset type
        if any(c in cols_lower for c in ['investment_amount', 'investment', 'funding', 'budget']):
            dataset_type = "investment"
            canonical_required = ['country_noc', 'investment_amount', 'reporting_year']
        elif any(c in cols_lower for c in ['athlete_id', 'athlete_name', 'sex', 'gender', 'age', 'height', 'weight']):
            dataset_type = "athlete_events"
            canonical_required = ['country_noc', 'year', 'sport', 'event']
        else:
            dataset_type = "medal_results"
            canonical_required = ['country_noc', 'year', 'medal']

        # Column mapping detection
        suggested_mapping = {}
        for c in df.columns:
            cl = c.lower().strip()
            if cl in ['noc', 'noc_code', 'country_code', 'country_noc']:
                suggested_mapping[c] = 'country_noc'
            elif cl in ['country', 'nation', 'country_name']:
                suggested_mapping[c] = 'country_name'
            elif cl in ['year', 'games_year']:
                suggested_mapping[c] = 'year'
            elif cl in ['season', 'games_season']:
                suggested_mapping[c] = 'season'
            elif cl in ['edition', 'games']:
                suggested_mapping[c] = 'edition'
            elif cl in ['sport', 'discipline']:
                suggested_mapping[c] = 'sport'
            elif cl in ['event', 'competition']:
                suggested_mapping[c] = 'event'
            elif cl in ['medal', 'medal_won']:
                suggested_mapping[c] = 'medal'
            elif cl in ['name', 'athlete', 'athlete_name']:
                suggested_mapping[c] = 'athlete_name'
            elif cl in ['id', 'athlete_id']:
                suggested_mapping[c] = 'athlete_id'
            elif cl in ['sex', 'gender']:
                suggested_mapping[c] = 'gender'
            elif cl in ['investment', 'investment_amount', 'funding', 'budget']:
                suggested_mapping[c] = 'investment_amount'
            elif cl in ['currency', 'curr']:
                suggested_mapping[c] = 'currency'
            elif cl in ['reporting_year', 'cycle_year']:
                suggested_mapping[c] = 'reporting_year'
            elif cl in ['cycle', 'olympic_cycle']:
                suggested_mapping[c] = 'olympic_cycle'
            else:
                suggested_mapping[c] = c

        # Validation checks
        errors = []
        # Missing required columns
        mapped_targets = list(suggested_mapping.values())
        for req in canonical_required:
            if req not in mapped_targets:
                errors.append({
                    "row_number": 0,
                    "column": req,
                    "invalid_value": None,
                    "reason": f"Required canonical column '{req}' is missing or unmapped."
                })

        # Row-level validations (sample up to 200 rows for performance)
        sample_to_check = df.head(500)
        invalid_count = 0

        # Check year validity if present
        year_col = next((k for k, v in suggested_mapping.items() if v == 'year'), None)
        if year_col and year_col in df.columns:
            for idx, y in sample_to_check[year_col].items():
                try:
                    val = int(y)
                    if val < 1896 or val > 2026:
                        errors.append({
                            "row_number": idx + 1, "column": year_col, "invalid_value": y,
                            "reason": f"Year {y} is outside legitimate Olympic range (1896-2026)."
                        })
                        invalid_count += 1
                except Exception:
                    errors.append({
                        "row_number": idx + 1, "column": year_col, "invalid_value": y,
                        "reason": f"Non-numeric year '{y}'."
                    })
                    invalid_count += 1

        # Check country NOC length
        noc_col = next((k for k, v in suggested_mapping.items() if v == 'country_noc'), None)
        if noc_col and noc_col in df.columns:
            for idx, noc in sample_to_check[noc_col].items():
                if pd.isna(noc) or len(str(noc).strip()) < 2:
                    errors.append({
                        "row_number": idx + 1, "column": noc_col, "invalid_value": noc,
                        "reason": f"Invalid or missing NOC country code."
                    })
                    invalid_count += 1

        # Check investment amount numeric
        inv_col = next((k for k, v in suggested_mapping.items() if v == 'investment_amount'), None)
        if inv_col and inv_col in df.columns:
            for idx, amt in sample_to_check[inv_col].items():
                try:
                    val = float(amt)
                    if val < 0:
                        errors.append({
                            "row_number": idx + 1, "column": inv_col, "invalid_value": amt,
                            "reason": f"Negative investment amount not permitted."
                        })
                        invalid_count += 1
                except Exception:
                    errors.append({
                        "row_number": idx + 1, "column": inv_col, "invalid_value": amt,
                        "reason": f"Non-numeric investment value '{amt}'."
                    })
                    invalid_count += 1

        # Duplicate check
        dup_count = int(df.duplicated().sum())

        # Null counts
        null_counts = {c: int(df[c].isna().sum()) for c in df.columns}
        null_pcts = {c: round((cnt / max(1, total_rows)) * 100, 2) for c, cnt in null_counts.items()}

        unique_countries = int(df[noc_col].nunique()) if noc_col and noc_col in df.columns else 0
        sport_col = next((k for k, v in suggested_mapping.items() if v == 'sport'), None)
        unique_sports = int(df[sport_col].nunique()) if sport_col and sport_col in df.columns else 0

        year_range = "N/A"
        if year_col and year_col in df.columns:
            numeric_years = pd.to_numeric(df[year_col], errors='coerce').dropna()
            if not numeric_years.empty:
                year_range = f"{int(numeric_years.min())} - {int(numeric_years.max())}"

        passed = (len(errors) == 0) and all(req in mapped_targets for req in canonical_required)

        summary = {
            "total_rows": total_rows,
            "valid_rows": max(0, total_rows - invalid_count),
            "invalid_rows": invalid_count,
            "duplicate_rows": dup_count,
            "column_null_counts": null_counts,
            "column_null_percentages": null_pcts,
            "unique_countries": unique_countries,
            "unique_sports": unique_sports,
            "year_range": year_range,
            "detected_dataset_type": dataset_type,
            "passed_validation": passed,
            "errors": errors[:50] # Top 50 errors
        }

        # Preview rows (convert NaN to None for JSON safety)
        preview_data = df.head(10).replace({np.nan: None}).to_dict(orient='records')

        return {
            "status": "success" if summary['passed_validation'] else "warning",
            "message": f"Successfully parsed {total_rows:,} rows. Identified dataset type: {dataset_type}." if summary['passed_validation'] else f"Validation warnings found ({len(errors)} issues identified).",
            "quality_summary": summary,
            "preview_rows": preview_data,
            "suggested_mapping": suggested_mapping,
            "file_id": filename
        }

    def apply_custom_dataset(self, df_custom: pd.DataFrame, dataset_name: str):
        """Applies validated custom dataset to the active session"""
        self.df = df_custom
        self.active_dataset_name = dataset_name
        self.is_custom_dataset = True

# Global singleton engine instance
engine = OlympicAnalyticsEngine()
