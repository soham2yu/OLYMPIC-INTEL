import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "Global Olympic Sports Performance Analysis API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    SAMPLE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "data", "sample")
    CANONICAL_DATA_PATH: str = os.path.join(DATA_DIR, "canonical_olympic_events_1992_2026.csv")
    HOSTS_METADATA_PATH: str = os.path.join(DATA_DIR, "hosts_metadata.json")
    NOC_REGIONS_PATH: str = os.path.join(DATA_DIR, "noc_regions.json")
    INVESTMENT_DATA_PATH: str = os.path.join(DATA_DIR, "demo_investment_data.csv")
    INVESTMENT_TEMPLATE_PATH: str = os.path.join(SAMPLE_DIR, "investment_template.csv")

settings = Settings()
