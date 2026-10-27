from typing import List, Dict, Optional
from pydantic import BaseModel

class InvestmentBubbleItem(BaseModel):
    country_noc: str
    country_name: str
    region: str
    investment_amount_m: float
    currency: str
    reporting_year: int
    olympic_cycle: str
    medals: int
    gold_medals: int
    athletes: int
    medals_per_billion: float
    cost_per_medal_m: float
    is_demo: bool

class InvestmentEfficiencyItem(BaseModel):
    rank: int
    country_noc: str
    country_name: str
    region: str
    investment_amount_m: float
    medals: int
    efficiency_score: float # Medals per $100M
    tier: str # High Efficiency, Moderate, Capital Intensive

class RegionalInvestmentItem(BaseModel):
    region: str
    total_investment_m: float
    total_medals: int
    medals_per_billion: float
    countries_reported: int

class FundingOpportunityItem(BaseModel):
    country_noc: str
    country_name: str
    region: str
    medals: int
    investment_amount_m: float
    cost_per_medal_m: float
    category: str # "High Efficiency Under-Funded", "Potential Scale", "High Return"
    rationale: str

class InvestmentResponse(BaseModel):
    has_data: bool
    is_demo_data: bool
    data_notice: str
    bubble_data: List[InvestmentBubbleItem]
    efficiency_rankings: List[InvestmentEfficiencyItem]
    regional_comparison: List[RegionalInvestmentItem]
    opportunities: List[FundingOpportunityItem]
    reporting_cycles: List[str]
    currencies_included: List[str]
    methodology_caveat: str
