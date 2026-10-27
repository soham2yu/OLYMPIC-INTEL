from typing import Optional, List
from pydantic import BaseModel, Field

class GlobalFilterParams(BaseModel):
    start_year: Optional[int] = Field(default=1992, description="Start year filter")
    end_year: Optional[int] = Field(default=2026, description="End year filter")
    season: Optional[str] = Field(default="All", description="Summer, Winter, or All")
    countries: Optional[List[str]] = Field(default=None, description="Country NOC codes")
    regions: Optional[List[str]] = Field(default=None, description="Regions")
    sports: Optional[List[str]] = Field(default=None, description="Sports")
    gender: Optional[str] = Field(default="All", description="All, M, or F")
    medal_type: Optional[str] = Field(default="All", description="All, Gold, Silver, or Bronze")
    metric_mode: Optional[str] = Field(default="event_medals", description="event_medals or athlete_medals")

class FilterOptionsResponse(BaseModel):
    min_year: int
    max_year: int
    years: List[int]
    seasons: List[str]
    countries: List[dict] # {noc: str, name: str, region: str}
    regions: List[str]
    sports: List[str]
    genders: List[dict] # {id: str, label: str}
    medal_types: List[str]
    editions: List[dict] # {edition: str, year: int, season: str, city: str}
