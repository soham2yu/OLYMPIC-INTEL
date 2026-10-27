# ==========================================
# STAGE 1: Build the React TypeScript Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Python Backend Runtime
# ==========================================
FROM python:3.11-slim AS production
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend code, data, and docs
COPY backend/ ./backend/
COPY data/ ./data/
COPY docs/ ./docs/

# Copy built frontend static assets into backend static folder
COPY --from=frontend-builder /app/frontend/dist ./backend/static

WORKDIR /app/backend

# Expose port (default 8000)
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start Uvicorn production server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
