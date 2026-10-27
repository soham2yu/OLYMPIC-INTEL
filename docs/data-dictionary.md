# Olympic Performance Analytics: Data Dictionary

## 1. Athlete-Event Master Dataset (`canonical_olympic_events_1992_2026.csv`)

| Column Name | Data Type | Description | Example Values |
|---|---|---|---|
| `athlete_id` | Integer | Unique identifier for individual athletes | `1001`, `24589` |
| `athlete_name` | String | Full name of the competing athlete | `"Michael Phelps"`, `"Simone Biles"` |
| `gender` | String (1) | Athlete gender category (`M` for Men, `F` for Women) | `"M"`, `"F"` |
| `age` | Float | Competitor age at the time of the event | `24.0`, `28.5` |
| `height` | Float | Athlete height in centimeters (where available) | `188.0` |
| `weight` | Float | Athlete weight in kilograms (where available) | `82.0` |
| `country_noc` | String (3) | National Olympic Committee 3-letter code | `"USA"`, `"CHN"`, `"NOR"`, `"FRA"` |
| `country_name` | String | Common country name corresponding to NOC | `"United States"`, `"France"` |
| `region` | String | Continental association | `"Europe"`, `"Asia"`, `"North America"` |
| `year` | Integer | Four-digit calendar year of the Olympic Games | `1992`, `2008`, `2024`, `2026` |
| `season` | String | Games category: `"Summer"` or `"Winter"` | `"Summer"`, `"Winter"` |
| `edition` | String | Standard edition label (Year + Season) | `"2024 Summer"`, `"2022 Winter"` |
| `city` | String | Host city name | `"Barcelona"`, `"Tokyo"`, `"Paris"` |
| `sport` | String | Official Olympic sports category | `"Athletics"`, `"Swimming"`, `"Rowing"` |
| `event` | String | Specific medal event competition name | `"Rowing Men's Coxed Eights"` |
| `medal` | String / Null | Podium outcome (`"Gold"`, `"Silver"`, `"Bronze"`, or `NULL`) | `"Gold"`, `NULL` |
| `is_team_event` | Boolean | True for relays, multi-athlete crews, and team tournaments | `true`, `false` |

---

## 2. Host Metadata (`hosts_metadata.json`)

| Field | Data Type | Description |
|---|---|---|
| `edition` | String | Edition label (`"1992 Summer"` to `"2026 Winter"`) |
| `year` | Integer | Calendar year |
| `season` | String | `"Summer"` or `"Winter"` |
| `city` | String | Host municipality |
| `host_country` | String | Host sovereign nation |
| `host_noc` | String | 3-letter NOC code of host nation |
| `events_count` | Integer | Total official medal events held |

---

## 3. Sports Investment Dataset (`demo_investment_data.csv`)

| Field | Data Type | Description |
|---|---|---|
| `country_noc` | String (3) | 3-letter NOC code |
| `country_name` | String | Country name |
| `region` | String | Continental association |
| `olympic_cycle` | String | 4-year Olympic quadrennium (`"2021-2024"`, `"2017-2020"`) |
| `reporting_year` | Integer | Calendar year of report |
| `investment_amount` | Float | High-performance expenditure in Millions USD |
| `currency` | String | Reporting currency (`"USD"`) |
| `is_demo` | Boolean | `true` if synthetic benchmark data |
