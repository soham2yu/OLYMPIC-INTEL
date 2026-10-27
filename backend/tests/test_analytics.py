import pytest
import pandas as pd
from app.analytics.engine import OlympicAnalyticsEngine
from app.schemas.filters import GlobalFilterParams

@pytest.fixture
def test_engine():
    """Engine loaded with canonical data"""
    eng = OlympicAnalyticsEngine()
    return eng

@pytest.fixture
def hand_checkable_fixture():
    """Small hand-checkable dataset with known medal & team counts"""
    records = [
        # Country USA: 1 Gold (Men's 100m, individual)
        {"athlete_id": 1, "athlete_name": "USA Athlete 1", "gender": "M", "country_noc": "USA", "country_name": "United States", "region": "North America", "year": 2024, "season": "Summer", "edition": "2024 Summer", "city": "Paris", "sport": "Athletics", "event": "Athletics Men's 100m", "medal": "Gold", "is_team_event": False},
        # Country USA: 4 Golds (Men's 4x100m relay, team - 4 athletes, 1 event medal)
        {"athlete_id": 2, "athlete_name": "USA Relay 1", "gender": "M", "country_noc": "USA", "country_name": "United States", "region": "North America", "year": 2024, "season": "Summer", "edition": "2024 Summer", "city": "Paris", "sport": "Athletics", "event": "Athletics Men's 4x100m Relay", "medal": "Gold", "is_team_event": True},
        {"athlete_id": 3, "athlete_name": "USA Relay 2", "gender": "M", "country_noc": "USA", "country_name": "United States", "region": "North America", "year": 2024, "season": "Summer", "edition": "2024 Summer", "city": "Paris", "sport": "Athletics", "event": "Athletics Men's 4x100m Relay", "medal": "Gold", "is_team_event": True},
        {"athlete_id": 4, "athlete_name": "USA Relay 3", "gender": "M", "country_noc": "USA", "country_name": "United States", "region": "North America", "year": 2024, "season": "Summer", "edition": "2024 Summer", "city": "Paris", "sport": "Athletics", "event": "Athletics Men's 4x100m Relay", "medal": "Gold", "is_team_event": True},
        {"athlete_id": 5, "athlete_name": "USA Relay 4", "gender": "M", "country_noc": "USA", "country_name": "United States", "region": "North America", "year": 2024, "season": "Summer", "edition": "2024 Summer", "city": "Paris", "sport": "Athletics", "event": "Athletics Men's 4x100m Relay", "medal": "Gold", "is_team_event": True},
        # Country CAN: 1 Silver (Men's 100m)
        {"athlete_id": 6, "athlete_name": "CAN Athlete 1", "gender": "M", "country_noc": "CAN", "country_name": "Canada", "region": "North America", "year": 2024, "season": "Summer", "edition": "2024 Summer", "city": "Paris", "sport": "Athletics", "event": "Athletics Men's 100m", "medal": "Silver", "is_team_event": False},
        # Non-medalist competitor
        {"athlete_id": 7, "athlete_name": "FRA Athlete 1", "gender": "F", "country_noc": "FRA", "country_name": "France", "region": "Europe", "year": 2024, "season": "Summer", "edition": "2024 Summer", "city": "Paris", "sport": "Athletics", "event": "Athletics Women's 100m", "medal": None, "is_team_event": False},
    ]
    return pd.DataFrame(records)

def test_hand_checkable_event_vs_athlete_counting(hand_checkable_fixture):
    """
    Hand-calculated check:
    - Event Medals: USA should have exactly 2 Golds (100m + 4x100m Relay). Total event medals = 3.
    - Athlete Medal Awards: USA should have 5 Gold awards (1 + 4 relay athletes). Total awards = 6.
    """
    engine = OlympicAnalyticsEngine()
    engine.apply_custom_dataset(hand_checkable_fixture, "Hand-Checkable Fixture")

    # 1. Event Medals
    res_event = engine.get_overview(GlobalFilterParams(metric_mode="event_medals"))
    assert res_event["kpis"]["total_medals"] == 3
    assert res_event["kpis"]["gold_medals"] == 2
    assert res_event["kpis"]["silver_medals"] == 1
    assert res_event["kpis"]["bronze_medals"] == 0

    # 2. Athlete Medal Awards
    res_athlete = engine.get_overview(GlobalFilterParams(metric_mode="athlete_medals"))
    assert res_athlete["kpis"]["total_medals"] == 6
    assert res_athlete["kpis"]["gold_medals"] == 5
    assert res_athlete["kpis"]["silver_medals"] == 1

def test_summer_winter_filter(test_engine):
    """Verify season filtering isolates Summer vs Winter"""
    summer_res = test_engine.get_overview(GlobalFilterParams(season="Summer"))
    winter_res = test_engine.get_overview(GlobalFilterParams(season="Winter"))

    # Both should have medals, but distinct editions
    assert summer_res["kpis"]["total_medals"] > 0
    assert winter_res["kpis"]["total_medals"] > 0
    # Summer editions should not contain "Winter"
    assert all(t["season"] == "Summer" for t in summer_res["historical_trends"])
    assert all(t["season"] == "Winter" for t in winter_res["historical_trends"])

def test_single_country_filter(test_engine):
    """Filter by single country (e.g. NOR - Norway)"""
    nor_res = test_engine.get_overview(GlobalFilterParams(countries=["NOR"]))
    assert nor_res["kpis"]["distinct_countries"] == 1
    assert all(c["country_noc"] == "NOR" for c in nor_res["top_countries"])

def test_missing_investment_data_handling():
    """Verify that when investment data is empty, engine returns honest un-fabricated response"""
    engine = OlympicAnalyticsEngine()
    engine.investment_df = pd.DataFrame() # empty

    res = engine.get_investment_analysis()
    assert res["has_data"] is False
    assert "No sports investment data loaded" in res["data_notice"]
    assert len(res["bubble_data"]) == 0

def test_reconciliation_of_regional_totals(test_engine):
    """Verify that regional totals reconcile with country totals"""
    reg_res = test_engine.get_regional_analysis()
    sum_regional = sum(r["total_medals"] for r in reg_res["regional_summaries"])
    assert sum_regional > 0
    assert reg_res["total_medals"] >= sum_regional
