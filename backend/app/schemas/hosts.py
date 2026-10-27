from typing import List, Dict, Optional
from pydantic import BaseModel

class HostEditionRecord(BaseModel):
    edition: str
    year: int
    season: str
    city: str
    host_country: str
    host_noc: str
    events_count: int
    host_medals_won: int
    host_gold_won: int
    host_rank: int
    baseline_avg_medals: float # Average medals in adjacent editions
    lift_medals: int # Difference during host edition
    lift_percentage: float # Percentage improvement

class HostTrajectoryItem(BaseModel):
    edition_label: str # "Pre-2", "Pre-1", "Host Edition", "Post-1", "Post-2"
    edition: str
    medals: int
    gold: int

class HostCountryTrajectory(BaseModel):
    country_noc: str
    country_name: str
    host_edition: str
    timeline: List[HostTrajectoryItem]
    observation: str

class HostComparisonRow(BaseModel):
    edition: str
    year: int
    season: str
    city: str
    host_noc: str
    host_country: str
    host_medals: int
    host_gold: int
    host_rank: int
    pre_host_medals: Optional[int]
    post_host_medals: Optional[int]
    home_advantage_lift: float

class HostsResponse(BaseModel):
    host_editions: List[HostEditionRecord]
    host_trajectories: List[HostCountryTrajectory]
    comparison_table: List[HostComparisonRow]
    summer_avg_lift: float
    winter_avg_lift: float
    causal_disclaimer: str
