import io
import json
import pandas as pd
from typing import Optional, List
from fastapi import APIRouter, Query, UploadFile, File, HTTPException, Response
from fastapi.responses import StreamingResponse
from app.analytics.engine import engine
from app.schemas.filters import GlobalFilterParams, FilterOptionsResponse
from app.schemas.overview import OverviewResponse
from app.schemas.medals import MedalsResponse, CountryProfileResponse
from app.schemas.sports import SportsResponse, SportDetailResponse
from app.schemas.athletes import AthletesResponse
from app.schemas.regions import RegionsResponse
from app.schemas.investment import InvestmentResponse
from app.schemas.hosts import HostsResponse
from app.schemas.timeline import TimelineResponse
from app.schemas.data_management import UploadValidationResponse, ColumnMappingRequest

router = APIRouter()

def parse_filter_query(
    start_year: Optional[int] = Query(1992),
    end_year: Optional[int] = Query(2026),
    season: Optional[str] = Query("All"),
    countries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    sports: Optional[List[str]] = Query(None),
    gender: Optional[str] = Query("All"),
    medal_type: Optional[str] = Query("All"),
    metric_mode: Optional[str] = Query("event_medals")
) -> GlobalFilterParams:
    return GlobalFilterParams(
        start_year=start_year,
        end_year=end_year,
        season=season,
        countries=countries,
        regions=regions,
        sports=sports,
        gender=gender,
        medal_type=medal_type,
        metric_mode=metric_mode
    )

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "dataset_name": engine.active_dataset_name,
        "is_custom_dataset": engine.is_custom_dataset,
        "total_records": len(engine.df),
        "editions_count": engine.df['edition'].nunique() if not engine.df.empty else 0
    }

@router.get("/metadata")
def get_metadata():
    return {
        "dataset_name": engine.active_dataset_name,
        "is_custom": engine.is_custom_dataset,
        "total_records": len(engine.df),
        "distinct_athletes": int(engine.df['athlete_id'].nunique()) if not engine.df.empty else 0,
        "distinct_countries": int(engine.df['country_noc'].nunique()) if not engine.df.empty else 0,
        "distinct_sports": int(engine.df['sport'].nunique()) if not engine.df.empty else 0,
        "year_min": int(engine.df['year'].min()) if not engine.df.empty else 1992,
        "year_max": int(engine.df['year'].max()) if not engine.df.empty else 2026,
        "coverage": "1992 to 2026 (Summer & Winter)",
        "verified_hosts_count": len(engine.hosts_data),
        "investment_data_available": not engine.investment_df.empty,
        "is_investment_demo": bool(engine.investment_df['is_demo'].any()) if 'is_demo' in engine.investment_df.columns else False
    }

@router.get("/filters", response_model=FilterOptionsResponse)
def get_filters():
    return engine.get_filter_options()

@router.get("/overview", response_model=OverviewResponse)
def get_overview(
    start_year: Optional[int] = 1992,
    end_year: Optional[int] = 2026,
    season: Optional[str] = "All",
    countries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    sports: Optional[List[str]] = Query(None),
    gender: Optional[str] = "All",
    medal_type: Optional[str] = "All",
    metric_mode: Optional[str] = "event_medals"
):
    params = GlobalFilterParams(
        start_year=start_year, end_year=end_year, season=season, countries=countries,
        regions=regions, sports=sports, gender=gender, medal_type=medal_type, metric_mode=metric_mode
    )
    return engine.get_overview(params)

@router.get("/medals/countries", response_model=MedalsResponse)
def get_medal_countries(
    start_year: Optional[int] = 1992,
    end_year: Optional[int] = 2026,
    season: Optional[str] = "All",
    countries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    sports: Optional[List[str]] = Query(None),
    gender: Optional[str] = "All",
    medal_type: Optional[str] = "All",
    metric_mode: Optional[str] = "event_medals"
):
    params = GlobalFilterParams(
        start_year=start_year, end_year=end_year, season=season, countries=countries,
        regions=regions, sports=sports, gender=gender, medal_type=medal_type, metric_mode=metric_mode
    )
    return engine.get_medal_rankings(params)

@router.get("/medals/country/{noc}", response_model=CountryProfileResponse)
def get_country_profile(noc: str, metric_mode: Optional[str] = "event_medals"):
    return engine.get_country_profile(noc, metric_mode=metric_mode)

@router.get("/sports/performance", response_model=SportsResponse)
def get_sports_performance(
    min_athletes: Optional[int] = 20,
    start_year: Optional[int] = 1992,
    end_year: Optional[int] = 2026,
    season: Optional[str] = "All",
    countries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    sports: Optional[List[str]] = Query(None),
    gender: Optional[str] = "All",
    medal_type: Optional[str] = "All",
    metric_mode: Optional[str] = "event_medals"
):
    params = GlobalFilterParams(
        start_year=start_year, end_year=end_year, season=season, countries=countries,
        regions=regions, sports=sports, gender=gender, medal_type=medal_type, metric_mode=metric_mode
    )
    return engine.get_sports_analysis(min_athletes=min_athletes, filters=params)

@router.get("/sports/detail/{sport_name}", response_model=SportDetailResponse)
def get_sport_detail(sport_name: str):
    res = engine.get_sport_detail(sport_name)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.get("/athletes/participation", response_model=AthletesResponse)
def get_athlete_participation(
    start_year: Optional[int] = 1992,
    end_year: Optional[int] = 2026,
    season: Optional[str] = "All",
    countries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    sports: Optional[List[str]] = Query(None),
    gender: Optional[str] = "All"
):
    params = GlobalFilterParams(
        start_year=start_year, end_year=end_year, season=season, countries=countries,
        regions=regions, sports=sports, gender=gender
    )
    return engine.get_athlete_analysis(params)

@router.get("/athletes/table")
def get_athletes_table(
    query: Optional[str] = "",
    sport: Optional[str] = None,
    country: Optional[str] = None,
    medal_only: Optional[bool] = False,
    page: Optional[int] = 1,
    page_size: Optional[int] = 25
):
    return engine.search_athletes_table(
        query=query or "", sport=sport, country=country, medal_only=medal_only,
        page=page or 1, page_size=page_size or 25
    )

@router.get("/regions/performance", response_model=RegionsResponse)
def get_regions_performance(
    start_year: Optional[int] = 1992,
    end_year: Optional[int] = 2026,
    season: Optional[str] = "All",
    countries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    sports: Optional[List[str]] = Query(None),
    gender: Optional[str] = "All",
    medal_type: Optional[str] = "All",
    metric_mode: Optional[str] = "event_medals"
):
    params = GlobalFilterParams(
        start_year=start_year, end_year=end_year, season=season, countries=countries,
        regions=regions, sports=sports, gender=gender, medal_type=medal_type, metric_mode=metric_mode
    )
    return engine.get_regional_analysis(params)

@router.get("/investment/performance", response_model=InvestmentResponse)
def get_investment_performance(
    cycle: Optional[str] = None,
    metric_mode: Optional[str] = "event_medals"
):
    return engine.get_investment_analysis(cycle=cycle, metric_mode=metric_mode)

@router.get("/hosts/performance", response_model=HostsResponse)
def get_hosts_performance(metric_mode: Optional[str] = "event_medals"):
    return engine.get_hosts_analysis(metric_mode=metric_mode)

@router.get("/timeline", response_model=TimelineResponse)
def get_timeline():
    return engine.get_timeline()

@router.post("/data/validate", response_model=UploadValidationResponse)
async def validate_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are currently supported.")
    
    contents = await file.read()
    try:
        content_str = contents.decode('utf-8', errors='replace')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file encoding: {str(e)}")

    validation_result = engine.validate_uploaded_file(content_str, file.filename)
    return validation_result

@router.post("/data/upload")
async def upload_and_apply_dataset(file: UploadFile = File(...), mapping_json: Optional[str] = None):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    contents = await file.read()
    content_str = contents.decode('utf-8', errors='replace')
    val_res = engine.validate_uploaded_file(content_str, file.filename)

    if not val_res['quality_summary']['passed_validation']:
        raise HTTPException(status_code=400, detail="File failed validation checks. Review error summary.")

    # Parse and apply mapping if provided
    raw_df = pd.read_csv(io.StringIO(content_str), low_memory=False)
    if mapping_json:
        try:
            mapping = json.loads(mapping_json)
            raw_df = raw_df.rename(columns=mapping)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid column mapping: {str(e)}")

    # Ensure required columns exist
    if 'year' in raw_df.columns:
        raw_df['year'] = pd.to_numeric(raw_df['year'], errors='coerce').fillna(0).astype(int)
    if 'is_team_event' not in raw_df.columns:
        raw_df['is_team_event'] = False
    if 'athlete_id' not in raw_df.columns:
        raw_df['athlete_id'] = range(1, len(raw_df) + 1)
    if 'region' not in raw_df.columns and 'country_noc' in raw_df.columns:
        region_map = {r['country_noc']: r['region'] for r in engine.regions_data}
        raw_df['region'] = raw_df['country_noc'].map(region_map).fillna("Other")

    engine.apply_custom_dataset(raw_df, file.filename)
    return {
        "status": "success",
        "message": f"Successfully activated dataset '{file.filename}' with {len(raw_df):,} records.",
        "active_dataset": file.filename,
        "rows_count": len(raw_df)
    }

@router.post("/data/reset")
def reset_dataset():
    engine.reset_to_canonical()
    return {
        "status": "success",
        "message": "Reset to canonical 1992-2026 Olympic dataset successfully.",
        "active_dataset": engine.active_dataset_name,
        "rows_count": len(engine.df)
    }

@router.get("/data/export")
def export_data(
    export_type: str = "medals",
    start_year: Optional[int] = 1992,
    end_year: Optional[int] = 2026,
    season: Optional[str] = "All",
    metric_mode: Optional[str] = "event_medals"
):
    params = GlobalFilterParams(start_year=start_year, end_year=end_year, season=season, metric_mode=metric_mode)
    
    if export_type == "medals":
        res = engine.get_medal_rankings(params)
        export_df = pd.DataFrame(res['rankings'])
    elif export_type == "sports":
        res = engine.get_sports_analysis(min_athletes=1, filters=params)
        export_df = pd.DataFrame(res['avg_medals_per_athlete'])
    elif export_type == "regions":
        res = engine.get_regional_analysis(params)
        export_df = pd.DataFrame(res['regional_summaries'])
    elif export_type == "hosts":
        res = engine.get_hosts_analysis(metric_mode=metric_mode)
        export_df = pd.DataFrame(res['host_editions'])
    elif export_type == "raw_filtered":
        export_df = engine.filter_dataframe(params).head(5000)
    else:
        res = engine.get_overview(params)
        export_df = pd.DataFrame(res['top_countries'])

    stream = io.StringIO()
    export_df.to_csv(stream, index=False)
    stream.seek(0)

    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=olympic_{export_type}_export.csv"}
    )
    return response

@router.get("/data/template/{template_type}")
def get_template(template_type: str):
    if template_type == "investment":
        sample_df = pd.DataFrame([
            {"country_noc": "USA", "country_name": "United States", "region": "North America", "investment_amount": 1250.0, "currency": "USD", "reporting_year": 2024, "olympic_cycle": "2021-2024"},
            {"country_noc": "GBR", "country_name": "Great Britain", "region": "Europe", "investment_amount": 420.0, "currency": "USD", "reporting_year": 2024, "olympic_cycle": "2021-2024"},
            {"country_noc": "FRA", "country_name": "France", "region": "Europe", "investment_amount": 550.0, "currency": "USD", "reporting_year": 2024, "olympic_cycle": "2021-2024"},
        ])
    else:
        sample_df = pd.DataFrame([
            {"athlete_id": 1001, "athlete_name": "Sample Athlete", "gender": "M", "country_noc": "USA", "country_name": "United States", "region": "North America", "year": 2024, "season": "Summer", "edition": "2024 Summer", "city": "Paris", "sport": "Athletics", "event": "Athletics Men's 100 metres", "medal": "Gold"}
        ])

    stream = io.StringIO()
    sample_df.to_csv(stream, index=False)
    stream.seek(0)

    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={template_type}_template.csv"}
    )
