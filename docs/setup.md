# Setup & Deployment Guide

## 1. System Requirements
- **Operating System:** Windows, macOS, or Linux.
- **Node.js:** v18.0.0 or higher (v24.x tested).
- **Python:** 3.10 to 3.14 (3.14.5 tested).
- **RAM:** Minimum 4 GB, Recommended 8 GB+.

---

## 2. Installation Instructions (Windows)

### Backend Setup:
```powershell
# Navigate to backend directory
cd backend

# Create Python virtual environment
py -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest -v

# Start FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs will be live at: `http://127.0.0.1:8000/docs`

### Frontend Setup:
```powershell
# Navigate to frontend directory in another terminal
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start local development server
npm run dev -- --host 127.0.0.1 --port 3000
```
Open application in browser: `http://127.0.0.1:3000`

---

## 3. Installation Instructions (macOS & Linux)

### Backend Setup:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest -v
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run build
npm run dev -- --host 127.0.0.1 --port 3000
```

---

## 4. Production Deployment

### Option A: Static Hosting (Vercel / Netlify) + Cloud Run / Render Backend
- **Frontend:** Build with `npm run build` in `frontend/`. Deploy the generated `dist/` directory.
- **Backend:** Deploy the `backend/` folder to Render, AWS App Runner, or Google Cloud Run using the startup command:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### Option B: Docker Containerization
```dockerfile
# Multi-stage Dockerfile available for unified single-port deployment
```
