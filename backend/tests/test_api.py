import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["total_records"] > 0

def test_metadata():
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert data["year_min"] >= 1992
    assert data["year_max"] <= 2026

def test_filters():
    response = client.get("/api/filters")
    assert response.status_code == 200
    data = response.json()
    assert len(data["countries"]) > 0
    assert len(data["sports"]) > 0
    assert "Summer" in data["seasons"]
    assert "Winter" in data["seasons"]

def test_overview_event_medals():
    response = client.get("/api/overview?metric_mode=event_medals")
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["total_medals"] > 0
    assert len(data["top_countries"]) > 0
    assert len(data["historical_trends"]) > 0

def test_overview_athlete_medals():
    response = client.get("/api/overview?metric_mode=athlete_medals")
    assert response.status_code == 200
    data = response.json()
    # Athlete medals should be >= event medals due to crew/team members
    assert data["kpis"]["total_medals"] > 0

def test_medals_countries():
    response = client.get("/api/medals/countries")
    assert response.status_code == 200
    data = response.json()
    assert len(data["rankings"]) > 0
    first_rank = data["rankings"][0]
    assert first_rank["rank"] == 1
    assert first_rank["total"] >= first_rank["gold"]

def test_sports_performance():
    response = client.get("/api/sports/performance?min_athletes=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["avg_medals_per_athlete"]) > 0
    assert len(data["medal_performance"]) > 0

def test_athletes_participation():
    response = client.get("/api/athletes/participation")
    assert response.status_code == 200
    data = response.json()
    assert len(data["edition_trends"]) > 0
    assert data["total_athletes"] > 0

def test_regional_performance():
    response = client.get("/api/regions/performance")
    assert response.status_code == 200
    data = response.json()
    assert len(data["regional_summaries"]) > 0
    assert data["total_medals"] > 0

def test_investment_performance():
    response = client.get("/api/investment/performance")
    assert response.status_code == 200
    data = response.json()
    assert data["has_data"] is True
    assert len(data["bubble_data"]) > 0

def test_hosts_performance():
    response = client.get("/api/hosts/performance")
    assert response.status_code == 200
    data = response.json()
    assert len(data["host_editions"]) > 0

def test_timeline():
    response = client.get("/api/timeline")
    assert response.status_code == 200
    data = response.json()
    assert len(data["editions"]) > 0
    assert len(data["guided_story"]) == 5
