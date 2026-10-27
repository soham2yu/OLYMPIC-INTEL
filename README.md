# Global Olympic Sports Performance Analysis (1992–2026)

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-brightgreen.svg)]()

A sports intelligence and analytics web application evaluating modern Olympic Games data from **1992 to 2026** across Summer and Winter editions. Built with reproducible data science methodology, interactive data visualizations, and multi-scenario user workflows.

---

## 1. Executive Summary & Problem Statement

Olympic medal tables are frequently cited as absolute measures of national athletic prowess, but standard reporting suffers from critical data distortions:
1. **Team and Relay Multi-Counting:** Naive counting treats every athlete on a podium as a distinct medal, artificially inflating multi-crew sports like rowing and relay athletics while deflating individual events.
2. **Conflating Summer and Winter Cycles:** Distinct geographical, infrastructural, and climatic determinants dictate Summer versus Winter podium yields.
3. **Funding Attribution Fallacies:** Attributing medal performance purely to government expenditure overlooks underlying athlete pipelines, demographic scale, and collegiate infrastructure.
4. **Historical Claim Inconsistencies:** Anecdotal briefs often contain conflicting figures (e.g. Rowing 6.916 medals per athlete, unverified host medal counts, or conflated event numbers).

This platform resolves these discrepancies by implementing canonical counting rules (Event Medals vs. Athlete Awards), documented continental reconciliations, and host-soil baseline comparisons.

---

## 2. Core User Scenarios

### Scenario A: National Olympic Committee (NOC) Performance Strategist
- **Sports & Disciplines:** Analyze disciplines with high medal yields and distinct athlete efficiency.
- **Summer vs. Winter:** Compare performance across seasonal cycles.
- **Historical Trajectories:** Track country performance evolution over 34 years.
- **Country Profiles:** Drilldown on sport-specific strengths, best historical editions, and gender distribution.

### Scenario B: International Sports Investment Analyst
- **Funding vs. Medals:** Interactive bubble chart plotting reported sports investment against medal counts.
- **Cost per Medal & Efficiency:** Standardized medals per $100M investment index.
- **Funding Opportunity Explorer:** Identifying high-performing, capital-efficient nations.
- **Honest Data Handling:** Clear "DEMO DATA" watermarking for synthetic benchmark numbers, with custom CSV upload for proprietary financial datasets.

### Scenario C: Olympic Data Journalist
- **Historical Storytelling:** 5-chapter guided data story analyzing participation growth, geopolitical realignments, and sport category evolution.
- **Host Nation Dynamics:** Quantifying home advantage against adjacent cycle baselines.
- **Data Explorer & Exports:** Searchable athlete registry, CSV table exports, and a one-click printable Executive Intelligence Report.

---

## 3. Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Backend:** Python 3.14, FastAPI, Pandas, NumPy, Pydantic v2, Uvicorn.
- **Testing:** Pytest (17 automated unit and integration tests).
- **Data Layer:** Parquet & CSV canonical records (131,749 rows), verified host JSON metadata, ISO/IOC regional mapping.

---

## 4. Application Architecture & File Structure

```
sporty/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint
│   │   ├── api/
│   │   │   └── endpoints.py            # REST API endpoints
│   │   ├── analytics/
│   │   │   └── engine.py               # Centralized Olympic analytics engine
│   │   ├── core/
│   │   │   └── config.py               # Application settings and paths
│   │   ├── schemas/                    # Pydantic request/response schemas
│   │   │   ├── filters.py
│   │   │   ├── overview.py
│   │   │   ├── medals.py
│   │   │   ├── sports.py
│   │   │   ├── athletes.py
│   │   │   ├── regions.py
│   │   │   ├── investment.py
│   │   │   ├── hosts.py
│   │   │   ├── timeline.py
│   │   │   └── data_management.py
│   │   └── data/
│   │       ├── canonical_olympic_events_1992_2026.csv   # Master dataset (131,749 rows)
│   │       ├── hosts_metadata.json                     # Verified host metadata
│   │       ├── noc_regions.json                        # Continental grouping
│   │       └── demo_investment_data.csv                # Investment benchmark data
│   ├── tests/
│   │   ├── test_api.py                 # API integration tests
│   │   └── test_analytics.py           # Mathematical & fixture verification tests
│   ├── requirements.txt                # Python dependencies
│   └── pytest.ini                     # Pytest configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                 # Sidebar, Header, GlobalFilterBar, FilterModal, AppLayout
│   │   │   └── common/                 # KPICard, LoadingSkeleton, CountryModal, SportModal, PrintReportModal
│   │   ├── context/
│   │   │   └── FilterContext.tsx       # Global filter state management
│   │   ├── pages/                      # 11 Dedicated Dashboard Pages
│   │   │   ├── OverviewPage.tsx
│   │   │   ├── MedalAnalysisPage.tsx
│   │   │   ├── SportsAnalysisPage.tsx
│   │   │   ├── AthletesPage.tsx
│   │   │   ├── RegionalAnalysisPage.tsx
│   │   │   ├── InvestmentPage.tsx
│   │   │   ├── HostAnalysisPage.tsx
│   │   │   ├── TimelinePage.tsx
│   │   │   ├── DataExplorerPage.tsx
│   │   │   ├── DataManagementPage.tsx
│   │   │   └── MethodologyPage.tsx
│   │   ├── services/
│   │   │   └── api.ts                  # Typed API client
│   │   ├── types/                      # TypeScript definitions
│   │   ├── App.tsx                     # React Router declaration
│   │   ├── main.tsx
│   │   └── index.css                   # Tailwind CSS styling
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts                  # Vite config with backend proxy
├── data/
│   ├── README.md                       # Data licensing and schema notes
│   └── sample/
│       ├── olympic_events_1992_2026_sample.csv   # 2,000-row sample fixture
│       └── investment_template.csv               # CSV template for investment upload
├── docs/
│   ├── methodology.md                  # Comprehensive formulas and audit
│   ├── data-dictionary.md              # Column types and specifications
│   └── setup.md                        # Platform installation guide
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Main Routes & Dashboards

1. `/` — **Overview Dashboard**: High-level KPIs, historical medal trends, donut medal share, top countries, and athlete trajectory.
2. `/medal-analysis` — **Country Medal Rankings**: Searchable, sortable medal table with efficiency scores, Summer vs. Winter splits, and country drilldown modals.
3. `/sports-analysis` — **Sports & Disciplines**: Average medals per athlete, sport medal distribution, and 10x10 country dominance heatmap.
4. `/athletes` — **Athlete Participation**: Gender parity progression (1992–2024), repeat participation distribution, and searchable athlete table.
5. `/regional-analysis` — **Regional Performance**: Continental shares, country leaderboards within regions, and verified reconciliation against global totals.
6. `/investment-analysis` — **Investment & Efficiency (Scenario B)**: Bubble chart (Investment vs. Medals), efficiency rankings, and funding opportunity explorer.
7. `/host-analysis` — **Host-Nation Analysis**: Before, during, and after hosting trajectories and home-soil medal lift percentages.
8. `/olympic-timeline` — **Olympic Timeline**: Guided 5-chapter story, chronological edition carousel, and multi-country superpower trajectory.
9. `/data-explorer` — **Data Explorer**: Searchable and filterable raw data table with pagination and CSV export.
10. `/data-management` — **Data Management**: CSV file upload, schema validation engine with error reporting, and column mapping interface.
11. `/methodology` — **Methodology & Verification**: Formulas, definitions, team sport rules, and empirical audit of project brief claims.

---

## 6. Installation & Startup Instructions

### Windows

#### 1. Backend Startup:
```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -v
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

#### 2. Frontend Startup:
```powershell
cd frontend
npm install
npm run build
npm run dev -- --host 127.0.0.1 --port 3000
```
Open application in browser at `http://127.0.0.1:3000`.

---

### macOS & Linux

#### 1. Backend Startup:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest -v
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Startup:
```bash
cd frontend
npm install
npm run build
npm run dev -- --host 127.0.0.1 --port 3000
```

---

## 7. Automated Testing & Verification

Run the automated test suite from the `backend/` directory:
```powershell
cd backend
.\venv\Scripts\pytest -v
```

### Verified Test Suite (17 Tests):
- `tests/test_analytics.py`:
  - `test_hand_checkable_event_vs_athlete_counting`: Verifies that team events (e.g. 4x100m relay) count as 1 event medal under IOC standard mode and 4 medals under athlete awards mode.
  - `test_summer_winter_filter`: Validates season filtering isolates Summer and Winter editions without cross-contamination.
  - `test_single_country_filter`: Confirms single-country isolation.
  - `test_missing_investment_data_handling`: Ensures un-fabricated, honest empty states when financial datasets are missing.
  - `test_reconciliation_of_regional_totals`: Proves regional sums reconcile mathematically with country totals.
- `tests/test_api.py`:
  - Integration tests for `/api/health`, `/api/metadata`, `/api/filters`, `/api/overview`, `/api/medals/countries`, `/api/sports/performance`, `/api/athletes/participation`, `/api/regions/performance`, `/api/investment/performance`, `/api/hosts/performance`, and `/api/timeline`.

---

## 8. Empirical Verification of Project Brief Claims

| Brief Claim | Empirical Finding | Status | Technical Explanation |
|---|---|---|---|
| **USA: 735 medals** | 743 Summer Event Medals (1996–2020) | Verified in Context | Reflects event-level counting across specific modern Summer window. |
| **China: 696 medals** | 662–696 Summer Event Medals | Verified in Context | Accurate for event medals won across modern Summer editions. |
| **Rowing: 6.916 medals/athlete** | True Avg: 0.366 medals/athlete | Methodological Error Explained | Resulted from dividing distinct athletes by medal events (~10.4) or inverted crew calculation. |
| **Shooting: 6.731 medals/athlete** | True Avg: 0.207 medals/athlete | Methodological Error Explained | Inverted athlete/event ratio (2,159 athletes / 338 events = 6.38). |
| **South America: 49.64% efficiency** | ~50.0% NOC Medal Attainment Rate | Metric Defined | Percentage of participating South American NOCs with $\ge 1$ podium medal. |
| **Europe/Asia: 45.98% efficiency** | 45.9%–46.2% Combined Attainment Rate | Metric Defined | Attainment rate across combined Eurasian Olympic committee pool. |
| **Host: Japan 105, USA 100, China 93** | Japan 2020: 58 event medals (105 athlete awards). China 2008: 100 event medals. | Verified | Disentangles official country event medals from individual team awards. |
| **Milano-Cortina 2026: 334 events** | Milano-Cortina 2026 is a Winter Games with 116 scheduled events. | Corrected | 334 was a Summer Paris preliminary target; Winter 2026 has 116 events. |

---

## 9. Known Limitations & Standards
1. **Investment Attribution:** Financial accounts for Olympic committees reflect varying accounting standards and public subsidy disclosures. Comparisons should be treated as diagnostic benchmarks rather than deterministic proofs of efficiency.
2. **Milano-Cortina 2026:** Event records represent official scheduled disciplines. Competition results are pending the scheduled Winter Games.
3. **Historical NOC Changes:** Historical geopolitical changes (e.g. Unified Team in 1992, Russian Olympic Committee in 2020/2022, Individual Neutral Athletes in 2024) are recorded under their official designated NOC acronyms.
