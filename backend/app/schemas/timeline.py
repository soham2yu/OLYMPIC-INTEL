from typing import List, Dict, Optional
from pydantic import BaseModel

class TimelineEditionSummary(BaseModel):
    edition: str
    year: int
    season: str
    city: str
    host_country: str
    host_noc: str
    total_medals: int
    athletes_count: int
    participating_countries: int
    sports_count: int
    top_country: str
    top_country_gold: int
    key_milestone: str

class GuidedStoryChapter(BaseModel):
    chapter_index: int
    title: str
    subtitle: str
    description: str
    key_findings: List[str]
    supporting_metrics: Dict[str, str]

class CountryTimelineTrajectory(BaseModel):
    country_noc: str
    country_name: str
    editions: List[Dict] # {edition, year, season, medals, gold, rank}

class TimelineResponse(BaseModel):
    editions: List[TimelineEditionSummary]
    guided_story: List[GuidedStoryChapter]
    selectable_countries: List[Dict]
    default_trajectories: List[CountryTimelineTrajectory]
