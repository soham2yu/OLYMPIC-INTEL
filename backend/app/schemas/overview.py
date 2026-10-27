from typing import List, Optional
from pydantic import BaseModel

class OverviewKPIs(BaseModel):
    total_medals: int
    gold_medals: int
    silver_medals: int
    bronze_medals: int
    distinct_countries: int
    distinct_athletes: int
    distinct_sports: int
    distinct_editions: int
    coverage_period: str
    metric_mode: str
    metric_note: str

class TrendItem(BaseModel):
    edition: str
    year: int
    season: str
    gold: int
    silver: int
    bronze: int
    total: int

class CountryMedalItem(BaseModel):
    country_noc: str
    country_name: str
    region: str
    gold: int
    silver: int
    bronze: int
    total: int
    athlete_count: int

class ParticipationTrendItem(BaseModel):
    edition: str
    year: int
    season: str
    athletes: int
    countries: int
    sports: int

class SportParticipationItem(BaseModel):
    sport: str
    athletes: int
    medals: int

class InsightItem(BaseModel):
    id: str
    title: str
    observation: str
    metric: str
    period: str
    category: str # "performance", "participation", "historical"

class OverviewResponse(BaseModel):
    kpis: OverviewKPIs
    historical_trends: List[TrendItem]
    top_countries: List[CountryMedalItem]
    medal_distribution: dict # {Gold: int, Silver: int, Bronze: int}
    athlete_trends: List[ParticipationTrendItem]
    sports_participation: List[SportParticipationItem]
    recent_insights: List[InsightItem]
