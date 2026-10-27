# Olympic Dataset Documentation (1992–2026)

## 1. Overview
This directory contains canonical datasets, metadata, and schemas for the **Global Olympic Sports Performance Analysis** platform, spanning modern Olympic Games from Barcelona 1992 to Milano-Cortina 2026.

## 2. Directory Structure
```
data/
├── README.md                          # Data documentation & license notices
└── sample/
    ├── olympic_events_1992_2026_sample.csv   # 2,000-row sample fixture
    └── investment_template.csv               # CSV template for investment upload
```

Backend data assets are mirrored in `backend/app/data/`:
- `canonical_olympic_events_1992_2026.csv`: Master dataset (131,749 athlete-event records).
- `hosts_metadata.json`: Host city, host country, NOC, and event counts for all 19 editions.
- `noc_regions.json`: Canonical ISO/IOC continent mapping (Africa, Asia, Europe, North America, South America, Oceania).
- `demo_investment_data.csv`: Synthetic sports funding benchmark data clearly labeled as DEMO DATA.

## 3. Data Sources & Provenance
1. **Historical Records (1992–2016):**
   - Source: Kaggle Olympic History dataset / Sports-Reference Olympic archive.
   - License: CC0 Public Domain.
   - Covers: Barcelona 1992 through Rio 2016 (Summer & Winter).
2. **Modern Games (2018–2024):**
   - PyeongChang 2018 Winter, Tokyo 2020 Summer (held 2021), Beijing 2022 Winter, and Paris 2024 Summer.
   - Sourced from official Olympic Committee competition reports.
3. **Milano-Cortina 2026 Winter Program:**
   - 116 scheduled medal events across 16 winter sports disciplines.
   - Marked with scheduled event status with official results pending competition.

## 4. Counting Standard Disclaimer
- **Event Medals:** 1 medal per event podium position per country (standard IOC medal table).
- **Athlete Medal Awards:** 1 medal award per podium athlete (counts all relay/crew members).
