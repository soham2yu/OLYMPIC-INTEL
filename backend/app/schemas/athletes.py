from typing import List, Dict, Optional
from pydantic import BaseModel

class AthleteEditionParticipation(BaseModel):
    edition: str
    year: int
    season: str
    total_athletes: int
    men: int
    women: int
    countries_count: int

class AthleteTableRow(BaseModel):
    athlete_id: int
    athlete_name: str
    gender: str
    country_noc: str
    country_name: str
    sport: str
    event: str
    year: int
    season: str
    edition: str
    medal: Optional[str]

class RepeatParticipationItem(BaseModel):
    editions_attended: int # 1, 2, 3, 4, 5+
    athlete_count: int
    percentage: float

class AthletesResponse(BaseModel):
    edition_trends: List[AthleteEditionParticipation]
    gender_distribution_overall: Dict[str, int]
    repeat_participation: List[RepeatParticipationItem]
    top_participating_countries: List[Dict] # {country_noc, country_name, athletes}
    top_participating_sports: List[Dict] # {sport, athletes}
    total_athletes: int
    total_records: int
