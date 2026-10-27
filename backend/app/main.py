import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import router as api_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Comprehensive Olympic sports intelligence analytics platform (1992-2026).",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix="/api")

# Serve frontend production build if available
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(settings.BASE_DIR)), "frontend", "dist")
if not os.path.exists(frontend_dist):
    frontend_dist = os.path.join(settings.BASE_DIR, "static")

if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/")
    def root():
        return {
            "app": settings.APP_NAME,
            "version": settings.VERSION,
            "docs": "/docs",
            "api": "/api"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
