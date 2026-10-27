from typing import List, Dict, Optional
from pydantic import BaseModel

class SportAthleteMedalItem(BaseModel):
    sport: str
    season: str
    athletes: int
    athlete_medal_awards: int
    event_medals: int
    distinct_medal_winners: int
    avg_medals_per_athlete: float # medal awards / athletes
    distinct_winner_rate: float # distinct medal winners / athletes (%)
    events_count: int

class SportMedalDistribution(BaseModel):
    sport: str
    gold: int
    silver: int
    bronze: int
    total: int

class HeatmapCell(BaseModel):
    country_noc: str
    country_name: str
    sport: str
    medals: int
    gold: int

class SportPopularityItem(BaseModel):
    edition: str
    year: int
    season: str
    sport: str
    athletes: int
    events: int
    medals: int

class SportDetailResponse(BaseModel):
    sport: str
    season: str
    total_medals: int
    distinct_athletes: int
    events_count: int
    top_countries: List[Dict]
    gender_breakdown: Dict[str, int]
    edition_trends: List[SportPopularityItem]
    definition_notes: Dict[str, str]

class SportsResponse(BaseModel):
    avg_medals_per_athlete: List[SportAthleteMedalItem]
    medal_performance: List[SportMedalDistribution]
    country_strength_heatmap: List[HeatmapCell]
    available_sports: List[str]
    available_countries: List[str]
    total_sports: int
