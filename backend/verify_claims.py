import pandas as pd
import numpy as np

df = pd.read_csv('backend/app/data/canonical_olympic_events_1992_2026.csv', low_memory=False)
print("=== VERIFICATION OF CLAIMS ===")
print("Total rows:", len(df))
print("Years represented:", sorted(df['year'].unique()))
print("Total athlete medal awards:", int(df['medal'].dropna().count()))

# 1. USA & China medals
# Athlete-level medal awards vs Unique event medals
usa = df[df['country_noc'] == 'USA']
usa_medal_awards = usa['medal'].dropna().count()
usa_event_medals = len(usa.dropna(subset=['medal']).drop_duplicates(subset=['year', 'season', 'event', 'medal']))
print(f"USA Medal Awards (Athlete-level): {usa_medal_awards} | Unique Event Medals: {usa_event_medals}")

chn = df[df['country_noc'] == 'CHN']
chn_medal_awards = chn['medal'].dropna().count()
chn_event_medals = len(chn.dropna(subset=['medal']).drop_duplicates(subset=['year', 'season', 'event', 'medal']))
print(f"China Medal Awards (Athlete-level): {chn_medal_awards} | Unique Event Medals: {chn_event_medals}")

# Summer only:
usa_summer_events = len(usa[(usa['season'] == 'Summer') & (usa['medal'].notna())].drop_duplicates(subset=['year', 'event', 'medal']))
chn_summer_events = len(chn[(chn['season'] == 'Summer') & (chn['medal'].notna())].drop_duplicates(subset=['year', 'event', 'medal']))
print(f"USA Summer Event Medals: {usa_summer_events} | China Summer Event Medals: {chn_summer_events}")

# 2. Sports: Rowing and Shooting
for sport in ['Rowing', 'Shooting']:
    sport_df = df[df['sport'] == sport]
    athletes = sport_df['athlete_id'].nunique()
    medals_awarded = sport_df['medal'].dropna().count()
    medal_events = len(sport_df.dropna(subset=['medal']).drop_duplicates(subset=['year', 'season', 'event', 'medal']))
    distinct_medalists = sport_df[sport_df['medal'].notna()]['athlete_id'].nunique()
    
    # What calculation yields ~6.9?
    # E.g. Athletes per event? Medals per unique medalist?
    print(f"\nSport: {sport}")
    print(f"  Distinct Athletes: {athletes}")
    print(f"  Total Athlete Medal Awards: {medals_awarded}")
    print(f"  Unique Event Medals: {medal_events}")
    print(f"  Distinct Medal Winners: {distinct_medalists}")
    print(f"  Medal Awards / Distinct Athlete: {medals_awarded / max(1, athletes):.4f}")
    print(f"  Athletes / Event Medals: {athletes / max(1, medal_events):.4f}")
    if medal_events > 0:
        print(f"  Medal Awards per Event Medal: {medals_awarded / medal_events:.4f}")

# 3. Host-nation examples: Japan 105, United States 100, China 93
print("\n=== HOST NATION NUMBERS ===")
# Japan in Tokyo 2020:
jpn_2020_awards = df[(df['country_noc'] == 'JPN') & (df['edition'] == '2020 Summer') & (df['medal'].notna())]['medal'].count()
jpn_2020_events = len(df[(df['country_noc'] == 'JPN') & (df['edition'] == '2020 Summer') & (df['medal'].notna())].drop_duplicates(subset=['event', 'medal']))
print(f"Japan Tokyo 2020: Event Medals = {jpn_2020_events}, Athlete Medal Awards = {jpn_2020_awards}")

# USA in Atlanta 1996:
usa_1996_awards = df[(df['country_noc'] == 'USA') & (df['edition'] == '1996 Summer') & (df['medal'].notna())]['medal'].count()
usa_1996_events = len(df[(df['country_noc'] == 'USA') & (df['edition'] == '1996 Summer') & (df['medal'].notna())].drop_duplicates(subset=['event', 'medal']))
print(f"USA Atlanta 1996: Event Medals = {usa_1996_events}, Athlete Medal Awards = {usa_1996_awards}")

# China in Beijing 2008:
chn_2008_awards = df[(df['country_noc'] == 'CHN') & (df['edition'] == '2008 Summer') & (df['medal'].notna())]['medal'].count()
chn_2008_events = len(df[(df['country_noc'] == 'CHN') & (df['edition'] == '2008 Summer') & (df['medal'].notna())].drop_duplicates(subset=['event', 'medal']))
print(f"China Beijing 2008: Event Medals = {chn_2008_events}, Athlete Medal Awards = {chn_2008_awards}")

# 4. Regional Efficiency
print("\n=== REGIONAL TOTALS ===")
for reg, group in df.groupby('region'):
    reg_medals = group['medal'].dropna().count()
    reg_athletes = group['athlete_id'].nunique()
    print(f"Region {reg}: Medals = {reg_medals}, Athletes = {reg_athletes}, Ratio = {reg_medals/max(1, reg_athletes):.4f}")
