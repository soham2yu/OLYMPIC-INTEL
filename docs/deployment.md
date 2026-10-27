# Deployment Guide: Global Olympic Sports Performance Analysis

This guide provides step-by-step instructions for deploying the Olympic Analytics platform to production.

---

## Architecture Overview

The application is structured for flexible deployment:
1. **Unified Single-Container Deployment (Recommended):** The FastAPI backend serves both the `/api/*` endpoints and the compiled React production frontend from a single web service on port 8000.
2. **Decoupled Deployment:** Deploy the React frontend to a static CDN (Vercel, Netlify, Cloudflare Pages) and the FastAPI backend to a Python container service (Render, Railway, Fly.io, AWS App Runner).

---

## Method 1: Render.com (Free / 1-Click Unified Deployment) — Recommended

Render provides free hosting for Docker web services with zero configuration:

1. Push your repository to **GitHub** or **GitLab**.
2. Sign in to [Render.com](https://render.com) and click **New + > Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect `Dockerfile` or `render.yaml`.
5. Select:
   - **Environment:** Docker
   - **Region:** Any (e.g., Oregon or Frankfurt)
   - **Branch:** `master` or `main`
   - **Plan:** Free
6. Click **Create Web Service**.
7. Once deployed (typically 2–3 minutes), Render assigns a free public HTTPS URL (e.g. `https://olympic-sports-analytics.onrender.com`).
   - Dashboard: `https://your-service.onrender.com/`
   - REST API: `https://your-service.onrender.com/api/overview`
   - Swagger Docs: `https://your-service.onrender.com/docs`

---

## Method 2: Railway.app (Unified Container)

1. Sign in to [Railway.app](https://railway.app).
2. Click **New Project > Deploy from GitHub repo**.
3. Select this repository.
4. Railway will automatically build the `Dockerfile` and expose port 8000.
5. In project settings, click **Generate Domain** to get an active HTTPS link.

---

## Method 3: Docker & Docker Compose (Any Cloud VPS or Local Server)

You can run the entire application on any server running Docker:

```bash
# Clone repository
git clone <your-repo-url>
cd sporty

# Build and start container in detached mode
docker compose up -d --build
```

- Web UI & API will be immediately available at: `http://localhost:8000`
- To stop the container: `docker compose down`
- To inspect logs: `docker compose logs -f`

---

## Method 4: Decoupled Deployment (Vercel + Render / Railway)

If you prefer deploying the frontend and backend on separate specialized platforms:

### 1. Deploy the Backend (Render or Railway)
- Deploy the `backend/` folder.
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Note your backend URL (e.g., `https://olympic-api.onrender.com`).

### 2. Deploy the Frontend (Vercel)
- Sign in to [Vercel](https://vercel.com) and import the repository.
- Root Directory: `frontend`
- Framework Preset: `Vite`
- Environment Variables:
  - Add `VITE_API_URL` = `https://olympic-api.onrender.com/api`
- Update `frontend/vercel.json` rewrites to proxy `/api/*` to your backend URL.
- Click **Deploy**.

---

## Method 5: Self-Hosted Linux VPS (Ubuntu / Debian + Nginx + Systemd)

### 1. System Packages & Python Environment
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv nginx nodejs npm git

git clone <repo-url> /var/www/olympic-analysis
cd /var/www/olympic-analysis

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Build frontend
cd ../frontend
npm install
npm run build
```

### 2. Create Systemd Service for FastAPI
Create `/etc/systemd/system/olympic-backend.service`:
```ini
[Unit]
Description=Olympic Sports Analytics FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/olympic-analysis/backend
ExecStart=/var/www/olympic-analysis/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable olympic-backend
sudo systemctl start olympic-backend
```

### 3. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/olympic`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /var/www/olympic-analysis/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # OpenAPI Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }
    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
    }
}
```
Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/olympic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Health Check & Verification

After deployment, verify that your service is healthy:
- Health Check: `GET https://your-domain.com/api/health`
  ```json
  {"status":"healthy","dataset_name":"Canonical 1992-2026 Olympic Dataset","total_records":131749}
  ```
- Dashboard Access: Open `https://your-domain.com/` in your browser.
