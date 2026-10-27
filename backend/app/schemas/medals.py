from typing import List, Optional, Dict
from pydantic import BaseModel

class CountryMedalRankItem(BaseModel):
    rank: int
    country_noc: str
    country_name: str
    region: str
    gold: int
    silver: int
    bronze: int
    total: int
    athlete_count: int
    efficiency: float # medals per 100 athletes

class EditionMedalCount(BaseModel):
    edition: str
    year: int
    season: str
    gold: int
    silver: int
    bronze: int
    total: int

class CountryProfileResponse(BaseModel):
    country_noc: str
    country_name: str
    region: str
    total_medals: int
    gold_medals: int
    silver_medals: int
    bronze_medals: int
    distinct_athletes: int
    participating_editions: int
    best_edition: Optional[str]
    best_edition_medals: int
    summer_medals: int
    winter_medals: int
    gender_breakdown: Dict[str, int] # Men, Women
    top_sports: List[Dict] # {sport: str, gold: int, silver: int, bronze: int, total: int}
    edition_history: List[EditionMedalCount]
    host_performance: List[Dict] # {edition: str, medals: int, is_host: bool}

class CountryCompareItem(BaseModel):
    edition: str
    year: int
    season: str
    country1_medals: int
    country2_medals: int

class MedalsResponse(BaseModel):
    rankings: List[CountryMedalRankItem]
    edition_trends: List[EditionMedalCount]
    summer_vs_winter: Dict[str, Dict[str, int]]
    gender_medals: Dict[str, Dict[str, int]]
    total_countries: int
