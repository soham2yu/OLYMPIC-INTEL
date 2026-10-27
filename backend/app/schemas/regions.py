from typing import List, Dict, Optional
from pydantic import BaseModel

class RegionSummary(BaseModel):
    region: str
    total_medals: int
    gold: int
    silver: int
    bronze: int
    athletes: int
    participating_nocs: int
    medal_winning_nocs: int
    noc_attainment_rate: float # % of participating NOCs with >= 1 medal
    medals_per_100_athletes: float

class RegionalTrendItem(BaseModel):
    edition: str
    year: int
    season: str
    region: str
    medals: int
    athletes: int

class CountryRegionRow(BaseModel):
    country_noc: str
    country_name: str
    region: str
    medals: int
    gold: int
    athletes: int

class RegionsResponse(BaseModel):
    regional_summaries: List[RegionSummary]
    regional_trends: List[RegionalTrendItem]
    countries_by_region: List[CountryRegionRow]
    total_medals: int
    total_athletes: int
    mapping_source: str
