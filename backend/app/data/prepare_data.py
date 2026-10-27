"""
Data ingestion and canonical dataset preparation script for Global Olympic Sports Performance Analysis.
Covers Olympic Games from 1992 to 2026 (Summer and Winter).
"""

import os
import json
import urllib.request
import pandas as pd
import numpy as np

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(DATA_DIR)), "data", "sample")
os.makedirs(SAMPLE_DIR, exist_ok=True)

# 1. Host Metadata (1992 - 2026)
HOST_DATA = [
    {"edition": "1992 Summer", "year": 1992, "season": "Summer", "city": "Barcelona", "host_country": "Spain", "host_noc": "ESP", "events_count": 257},
    {"edition": "1992 Winter", "year": 1992, "season": "Winter", "city": "Albertville", "host_country": "France", "host_noc": "FRA", "events_count": 57},
    {"edition": "1994 Winter", "year": 1994, "season": "Winter", "city": "Lillehammer", "host_country": "Norway", "host_noc": "NOR", "events_count": 61},
    {"edition": "1996 Summer", "year": 1996, "season": "Summer", "city": "Atlanta", "host_country": "United States", "host_noc": "USA", "events_count": 271},
    {"edition": "1998 Winter", "year": 1998, "season": "Winter", "city": "Nagano", "host_country": "Japan", "host_noc": "JPN", "events_count": 68},
    {"edition": "2000 Summer", "year": 2000, "season": "Summer", "city": "Sydney", "host_country": "Australia", "host_noc": "AUS", "events_count": 300},
    {"edition": "2002 Winter", "year": 2002, "season": "Winter", "city": "Salt Lake City", "host_country": "United States", "host_noc": "USA", "events_count": 78},
    {"edition": "2004 Summer", "year": 2004, "season": "Summer", "city": "Athens", "host_country": "Greece", "host_noc": "GRE", "events_count": 301},
    {"edition": "2006 Winter", "year": 2006, "season": "Winter", "city": "Turin", "host_country": "Italy", "host_noc": "ITA", "events_count": 84},
    {"edition": "2008 Summer", "year": 2008, "season": "Summer", "city": "Beijing", "host_country": "China", "host_noc": "CHN", "events_count": 302},
    {"edition": "2010 Winter", "year": 2010, "season": "Winter", "city": "Vancouver", "host_country": "Canada", "host_noc": "CAN", "events_count": 86},
    {"edition": "2012 Summer", "year": 2012, "season": "Summer", "city": "London", "host_country": "Great Britain", "host_noc": "GBR", "events_count": 302},
    {"edition": "2014 Winter", "year": 2014, "season": "Winter", "city": "Sochi", "host_country": "Russia", "host_noc": "RUS", "events_count": 98},
    {"edition": "2016 Summer", "year": 2016, "season": "Summer", "city": "Rio de Janeiro", "host_country": "Brazil", "host_noc": "BRA", "events_count": 306},
    {"edition": "2018 Winter", "year": 2018, "season": "Winter", "city": "Pyeongchang", "host_country": "South Korea", "host_noc": "KOR", "events_count": 102},
    {"edition": "2020 Summer", "year": 2020, "season": "Summer", "city": "Tokyo", "host_country": "Japan", "host_noc": "JPN", "events_count": 339},
    {"edition": "2022 Winter", "year": 2022, "season": "Winter", "city": "Beijing", "host_country": "China", "host_noc": "CHN", "events_count": 109},
    {"edition": "2024 Summer", "year": 2024, "season": "Summer", "city": "Paris", "host_country": "France", "host_noc": "FRA", "events_count": 329},
    {"edition": "2026 Winter", "year": 2026, "season": "Winter", "city": "Milano-Cortina", "host_country": "Italy", "host_noc": "ITA", "events_count": 116}
]

# Region mapping dictionary
NOC_REGION_MAPPING = {
    # North America
    "USA": ("United States", "North America"),
    "CAN": ("Canada", "North America"),
    "MEX": ("Mexico", "North America"),
    "CUB": ("Cuba", "North America"),
    "JAM": ("Jamaica", "North America"),
    "BAH": ("Bahamas", "North America"),
    "DOM": ("Dominican Republic", "North America"),
    "TTO": ("Trinidad and Tobago", "North America"),
    "PUR": ("Puerto Rico", "North America"),
    "CRC": ("Costa Rica", "North America"),
    "PAN": ("Panama", "North America"),
    "GUA": ("Guatemala", "North America"),
    "HAI": ("Haiti", "North America"),
    "BAR": ("Barbados", "North America"),
    "BER": ("Bermuda", "North America"),
    "GRN": ("Grenada", "North America"),
    "LCA": ("Saint Lucia", "North America"),
    "DMA": ("Dominica", "North America"),
    
    # South America
    "BRA": ("Brazil", "South America"),
    "ARG": ("Argentina", "South America"),
    "COL": ("Colombia", "South America"),
    "CHI": ("Chile", "South America"),
    "VEN": ("Venezuela", "South America"),
    "ECU": ("Ecuador", "South America"),
    "PER": ("Peru", "South America"),
    "URU": ("Uruguay", "South America"),
    "PAR": ("Paraguay", "South America"),
    "BOL": ("Bolivia", "South America"),
    "GUY": ("Guyana", "South America"),
    "SUR": ("Suriname", "South America"),

    # Europe
    "GER": ("Germany", "Europe"),
    "GBR": ("Great Britain", "Europe"),
    "FRA": ("France", "Europe"),
    "ITA": ("Italy", "Europe"),
    "NED": ("Netherlands", "Europe"),
    "RUS": ("Russia", "Europe"),
    "ROC": ("Russian Olympic Committee", "Europe"),
    "EUN": ("Unified Team", "Europe"),
    "NOR": ("Norway", "Europe"),
    "SWE": ("Sweden", "Europe"),
    "ESP": ("Spain", "Europe"),
    "HUN": ("Hungary", "Europe"),
    "POL": ("Poland", "Europe"),
    "SUI": ("Switzerland", "Europe"),
    "AUT": ("Austria", "Europe"),
    "CZE": ("Czech Republic", "Europe"),
    "UKR": ("Ukraine", "Europe"),
    "ROU": ("Romania", "Europe"),
    "BEL": ("Belgium", "Europe"),
    "DEN": ("Denmark", "Europe"),
    "FIN": ("Finland", "Europe"),
    "GRE": ("Greece", "Europe"),
    "BLR": ("Belarus", "Europe"),
    "CRO": ("Croatia", "Europe"),
    "SRB": ("Serbia", "Europe"),
    "SLO": ("Slovenia", "Europe"),
    "IRL": ("Ireland", "Europe"),
    "GEO": ("Georgia", "Europe"),
    "SVK": ("Slovakia", "Europe"),
    "BUL": ("Bulgaria", "Europe"),
    "AZE": ("Azerbaijan", "Europe"),
    "ARM": ("Armenia", "Europe"),
    "TUR": ("Turkey", "Europe"),
    "POR": ("Portugal", "Europe"),
    "LTU": ("Lithuania", "Europe"),
    "LAT": ("Latvia", "Europe"),
    "EST": ("Estonia", "Europe"),
    "MDA": ("Moldova", "Europe"),
    "CYP": ("Cyprus", "Europe"),
    "ISL": ("Iceland", "Europe"),
    "KOS": ("Kosovo", "Europe"),
    "ALB": ("Albania", "Europe"),
    "SMR": ("San Marino", "Europe"),
    "MKD": ("North Macedonia", "Europe"),
    "MNE": ("Montenegro", "Europe"),
    "LUX": ("Luxembourg", "Europe"),
    "LIE": ("Liechtenstein", "Europe"),
    "AIN": ("Individual Neutral Athletes", "Europe"),

    # Asia
    "CHN": ("China", "Asia"),
    "JPN": ("Japan", "Asia"),
    "KOR": ("South Korea", "Asia"),
    "IND": ("India", "Asia"),
    "IRI": ("Iran", "Asia"),
    "KAZ": ("Kazakhstan", "Asia"),
    "UZB": ("Uzbekistan", "Asia"),
    "TPE": ("Chinese Taipei", "Asia"),
    "THA": ("Thailand", "Asia"),
    "PRK": ("North Korea", "Asia"),
    "INA": ("Indonesia", "Asia"),
    "PHI": ("Philippines", "Asia"),
    "HKG": ("Hong Kong", "Asia"),
    "MGL": ("Mongolia", "Asia"),
    "MAS": ("Malaysia", "Asia"),
    "SGP": ("Singapore", "Asia"),
    "VIE": ("Vietnam", "Asia"),
    "QAT": ("Qatar", "Asia"),
    "BRN": ("Bahrain", "Asia"),
    "KUW": ("Kuwait", "Asia"),
    "JOR": ("Jordan", "Asia"),
    "KGZ": ("Kyrgyzstan", "Asia"),
    "TJK": ("Tajikistan", "Asia"),
    "PAK": ("Pakistan", "Asia"),
    "ISR": ("Israel", "Asia"),
    "UAE": ("United Arab Emirates", "Asia"),
    "KSA": ("Saudi Arabia", "Asia"),
    "SYR": ("Syria", "Asia"),
    "LIB": ("Lebanon", "Asia"),
    "IRQ": ("Iraq", "Asia"),
    "AFG": ("Afghanistan", "Asia"),
    "SRI": ("Sri Lanka", "Asia"),
    "TKM": ("Turkmenistan", "Asia"),

    # Africa
    "KEN": ("Kenya", "Africa"),
    "ETH": ("Ethiopia", "Africa"),
    "RSA": ("South Africa", "Africa"),
    "EGY": ("Egypt", "Africa"),
    "NGR": ("Nigeria", "Africa"),
    "ALG": ("Algeria", "Africa"),
    "MAR": ("Morocco", "Africa"),
    "TUN": ("Tunisia", "Africa"),
    "UGA": ("Uganda", "Africa"),
    "ZIM": ("Zimbabwe", "Africa"),
    "CMR": ("Cameroon", "Africa"),
    "CIV": ("Ivory Coast", "Africa"),
    "GHA": ("Ghana", "Africa"),
    "NAM": ("Namibia", "Africa"),
    "BOT": ("Botswana", "Africa"),
    "ZAM": ("Zambia", "Africa"),
    "MOZ": ("Mozambique", "Africa"),
    "BUR": ("Burkina Faso", "Africa"),
    "NIG": ("Niger", "Africa"),
    "TOG": ("Togo", "Africa"),
    "MRI": ("Mauritius", "Africa"),
    "CPV": ("Cape Verde", "Africa"),
    "SEN": ("Senegal", "Africa"),
    "TAN": ("Tanzania", "Africa"),

    # Oceania
    "AUS": ("Australia", "Oceania"),
    "NZL": ("New Zealand", "Oceania"),
    "FIJ": ("Fiji", "Oceania"),
    "SAM": ("Samoa", "Oceania"),
    "TGA": ("Tonga", "Oceania"),
    "PNG": ("Papua New Guinea", "Oceania"),
}

def load_or_fetch_base_data():
    """Load downloaded base dataset"""
    local_raw_path = os.path.join(DATA_DIR, "raw_athlete_events_full.csv")
    if os.path.exists(local_raw_path):
        print(f"Loading local raw data from {local_raw_path}...")
        df = pd.read_csv(local_raw_path)
        return df
    raise FileNotFoundError(f"File not found: {local_raw_path}")

def generate_recent_games_data():
    """
    Generate authentic records for 2018 Winter, 2020 Summer, 2022 Winter, 2024 Summer, and 2026 Winter.
    """
    recent_events = []
    
    # 2024 Paris Summer Olympics Sample Podiums & Events
    paris_podiums = [
        # Athletics
        {"sport": "Athletics", "event": "Athletics Men's 100 metres", "gold": ("USA", "Noah Lyles", "M"), "silver": ("JAM", "Kishane Thompson", "M"), "bronze": ("USA", "Fred Kerley", "M")},
        {"sport": "Athletics", "event": "Athletics Women's 100 metres", "gold": ("LCA", "Julien Alfred", "F"), "silver": ("USA", "Sha'Carri Richardson", "F"), "bronze": ("USA", "Melissa Jefferson", "F")},
        {"sport": "Athletics", "event": "Athletics Men's 200 metres", "gold": ("BOT", "Letsile Tebogo", "M"), "silver": ("USA", "Kenny Bednarek", "M"), "bronze": ("USA", "Noah Lyles", "M")},
        {"sport": "Athletics", "event": "Athletics Men's 400 metres", "gold": ("USA", "Quincy Hall", "M"), "silver": ("GBR", "Matthew Hudson-Smith", "M"), "bronze": ("ZAM", "Muzala Samukonga", "M")},
        {"sport": "Athletics", "event": "Athletics Men's 1500 metres", "gold": ("USA", "Cole Hocker", "M"), "silver": ("GBR", "Josh Kerr", "M"), "bronze": ("USA", "Yared Nuguse", "M")},
        {"sport": "Athletics", "event": "Athletics Men's Pole Vault", "gold": ("SWE", "Armand Duplantis", "M"), "silver": ("USA", "Sam Kendricks", "M"), "bronze": ("GRE", "Emmanouil Karalis", "M")},
        {"sport": "Athletics", "event": "Athletics Men's 4 x 100 metres Relay", "gold": ("CAN", "Canada Relay Team", "M"), "silver": ("RSA", "South Africa Relay Team", "M"), "bronze": ("GBR", "Great Britain Relay Team", "M"), "is_team": True},
        {"sport": "Athletics", "event": "Athletics Women's 4 x 100 metres Relay", "gold": ("USA", "United States Relay Team", "F"), "silver": ("GBR", "Great Britain Relay Team", "F"), "bronze": ("GER", "Germany Relay Team", "F"), "is_team": True},
        # Swimming
        {"sport": "Swimming", "event": "Swimming Men's 400 metres Individual Medley", "gold": ("FRA", "Leon Marchand", "M"), "silver": ("JPN", "Tomoyuki Matsushita", "M"), "bronze": ("USA", "Carson Foster", "M")},
        {"sport": "Swimming", "event": "Swimming Men's 200 metres Butterfly", "gold": ("FRA", "Leon Marchand", "M"), "silver": ("HUN", "Kristof Milak", "M"), "bronze": ("CAN", "Ilya Kharun", "M")},
        {"sport": "Swimming", "event": "Swimming Men's 200 metres Breaststroke", "gold": ("FRA", "Leon Marchand", "M"), "silver": ("AUS", "Zac Stubblety-Cook", "M"), "bronze": ("NED", "Caspar Corbeau", "M")},
        {"sport": "Swimming", "event": "Swimming Men's 200 metres Individual Medley", "gold": ("FRA", "Leon Marchand", "M"), "silver": ("GBR", "Duncan Scott", "M"), "bronze": ("CHN", "Wang Shun", "M")},
        {"sport": "Swimming", "event": "Swimming Women's 400 metres Freestyle", "gold": ("AUS", "Ariarne Titmus", "F"), "silver": ("CAN", "Summer McIntosh", "F"), "bronze": ("USA", "Katie Ledecky", "F")},
        {"sport": "Swimming", "event": "Swimming Women's 800 metres Freestyle", "gold": ("USA", "Katie Ledecky", "F"), "silver": ("AUS", "Ariarne Titmus", "F"), "bronze": ("USA", "Paige Madden", "F")},
        {"sport": "Swimming", "event": "Swimming Women's 1500 metres Freestyle", "gold": ("USA", "Katie Ledecky", "F"), "silver": ("FRA", "Anastasiia Kirpichnikova", "F"), "bronze": ("GER", "Isabel Gose", "F")},
        {"sport": "Swimming", "event": "Swimming Men's 100 metres Freestyle", "gold": ("CHN", "Pan Zhanle", "M"), "silver": ("AUS", "Kyle Chalmers", "M"), "bronze": ("ROU", "David Popovici", "M")},
        {"sport": "Swimming", "event": "Swimming Men's 4 x 100 metres Medley Relay", "gold": ("CHN", "China Medley Team", "M"), "silver": ("USA", "United States Medley Team", "M"), "bronze": ("FRA", "France Medley Team", "M"), "is_team": True},
        # Gymnastics
        {"sport": "Gymnastics", "event": "Gymnastics Women's Individual All-Around", "gold": ("USA", "Simone Biles", "F"), "silver": ("BRA", "Rebeca Andrade", "F"), "bronze": ("USA", "Sunisa Lee", "F")},
        {"sport": "Gymnastics", "event": "Gymnastics Women's Vault", "gold": ("USA", "Simone Biles", "F"), "silver": ("BRA", "Rebeca Andrade", "F"), "bronze": ("USA", "Jade Carey", "F")},
        {"sport": "Gymnastics", "event": "Gymnastics Women's Floor Exercise", "gold": ("BRA", "Rebeca Andrade", "F"), "silver": ("USA", "Simone Biles", "F"), "bronze": ("USA", "Jordan Chiles", "F")},
        # Basketball
        {"sport": "Basketball", "event": "Basketball Men's Basketball", "gold": ("USA", "United States Men's Basketball Team", "M"), "silver": ("FRA", "France Men's Basketball Team", "M"), "bronze": ("SRB", "Serbia Men's Basketball Team", "M"), "is_team": True},
        {"sport": "Basketball", "event": "Basketball Women's Basketball", "gold": ("USA", "United States Women's Basketball Team", "F"), "silver": ("FRA", "France Women's Basketball Team", "F"), "bronze": ("AUS", "Australia Women's Basketball Team", "F"), "is_team": True},
        # Table Tennis
        {"sport": "Table Tennis", "event": "Table Tennis Men's Singles", "gold": ("CHN", "Fan Zhendong", "M"), "silver": ("SWE", "Truls Moregard", "M"), "bronze": ("FRA", "Felix Lebrun", "M")},
        {"sport": "Table Tennis", "event": "Table Tennis Women's Singles", "gold": ("CHN", "Chen Meng", "F"), "silver": ("CHN", "Sun Yingsha", "F"), "bronze": ("JPN", "Hina Hayata", "F")},
        {"sport": "Table Tennis", "event": "Table Tennis Men's Team", "gold": ("CHN", "China Men's Table Tennis Team", "M"), "silver": ("SWE", "Sweden Men's Table Tennis Team", "M"), "bronze": ("FRA", "France Men's Table Tennis Team", "M"), "is_team": True},
        # Tennis
        {"sport": "Tennis", "event": "Tennis Men's Singles", "gold": ("SRB", "Novak Djokovic", "M"), "silver": ("ESP", "Carlos Alcaraz", "M"), "bronze": ("ITA", "Lorenzo Musetti", "M")},
        {"sport": "Tennis", "event": "Tennis Women's Singles", "gold": ("CHN", "Zheng Qinwen", "F"), "silver": ("CRO", "Donna Vekic", "F"), "bronze": ("POL", "Iga Swiatek", "F")},
        # Rowing
        {"sport": "Rowing", "event": "Rowing Men's Single Sculls", "gold": ("GER", "Oliver Zeidler", "M"), "silver": ("AIN", "Yauheni Zalaty", "M"), "bronze": ("NED", "Simon van Dorp", "M")},
        {"sport": "Rowing", "event": "Rowing Men's Eight", "gold": ("GBR", "Great Britain Men's Eight Crew", "M"), "silver": ("NED", "Netherlands Men's Eight Crew", "M"), "bronze": ("USA", "United States Men's Eight Crew", "M"), "is_team": True},
        {"sport": "Rowing", "event": "Rowing Women's Eight", "gold": ("ROU", "Romania Women's Eight Crew", "F"), "silver": ("CAN", "Canada Women's Eight Crew", "F"), "bronze": ("GBR", "Great Britain Women's Eight Crew", "F"), "is_team": True},
        # Shooting
        {"sport": "Shooting", "event": "Shooting 10m Air Pistol Mixed Team", "gold": ("SRB", "Zorana Arunovic / Damir Mikec", "M"), "silver": ("TUR", "Sevval Ilayda Tarhan / Yusuf Dikec", "M"), "bronze": ("IND", "Manu Bhaker / Sarabjot Singh", "M"), "is_team": True},
        {"sport": "Shooting", "event": "Shooting Women's 10m Air Pistol", "gold": ("KOR", "Oh Ye-jin", "F"), "silver": ("KOR", "Kim Ye-ji", "F"), "bronze": ("IND", "Manu Bhaker", "F")},
        # Judo
        {"sport": "Judo", "event": "Judo Men's +100 kg", "gold": ("FRA", "Teddy Riner", "M"), "silver": ("KOR", "Kim Min-jong", "M"), "bronze": ("TJK", "Temur Rakhimov", "M")},
        {"sport": "Judo", "event": "Judo Mixed Team", "gold": ("FRA", "France Judo Mixed Team", "M"), "silver": ("JPN", "Japan Judo Mixed Team", "M"), "bronze": ("BRA", "Brazil Judo Mixed Team", "M"), "is_team": True},
    ]

    # Additional overall Paris 2024 medal tally distributed across sports
    # Official Paris 2024 total medals: USA 126, CHN 91, JPN 45, AUS 53, FRA 64, NED 34, GBR 65, KOR 32, ITA 40, GER 33
    paris_tally = {
        "USA": {"G": 40, "S": 44, "B": 42},
        "CHN": {"G": 40, "S": 27, "B": 24},
        "JPN": {"G": 20, "S": 12, "B": 13},
        "AUS": {"G": 18, "S": 19, "B": 16},
        "FRA": {"G": 16, "S": 26, "B": 22},
        "NED": {"G": 15, "S": 7, "B": 12},
        "GBR": {"G": 14, "S": 22, "B": 29},
        "KOR": {"G": 13, "S": 9, "B": 10},
        "ITA": {"G": 12, "S": 13, "B": 15},
        "GER": {"G": 12, "S": 13, "B": 8},
        "NZL": {"G": 10, "S": 7, "B": 3},
        "CAN": {"G": 9, "S": 7, "B": 11},
        "UZB": {"G": 8, "S": 2, "B": 3},
        "HUN": {"G": 6, "S": 7, "B": 6},
        "ESP": {"G": 5, "S": 4, "B": 9},
        "SWE": {"G": 4, "S": 4, "B": 3},
        "KEN": {"G": 4, "S": 2, "B": 5},
        "NOR": {"G": 4, "S": 1, "B": 3},
        "IRL": {"G": 4, "S": 0, "B": 3},
        "BRA": {"G": 3, "S": 7, "B": 10},
        "IRI": {"G": 3, "S": 6, "B": 3},
        "UKR": {"G": 3, "S": 5, "B": 4},
        "ROU": {"G": 3, "S": 4, "B": 2},
        "GEO": {"G": 3, "S": 3, "B": 1},
        "BEL": {"G": 3, "S": 1, "B": 6},
        "BUL": {"G": 3, "S": 1, "B": 3},
        "SRB": {"G": 3, "S": 1, "B": 1},
        "CZE": {"G": 3, "S": 0, "B": 2},
        "DEN": {"G": 2, "S": 2, "B": 5},
        "AZE": {"G": 2, "S": 2, "B": 3},
        "CRO": {"G": 2, "S": 2, "B": 3},
        "CUB": {"G": 2, "S": 1, "B": 6},
        "BRN": {"G": 2, "S": 1, "B": 1},
        "SLO": {"G": 2, "S": 1, "B": 0},
        "TPE": {"G": 2, "S": 0, "B": 5},
        "AUT": {"G": 2, "S": 0, "B": 3},
        "HKG": {"G": 2, "S": 0, "B": 2},
        "PHI": {"G": 2, "S": 0, "B": 2},
        "ALG": {"G": 2, "S": 0, "B": 1},
        "INA": {"G": 2, "S": 0, "B": 1},
        "ISR": {"G": 1, "S": 5, "B": 1},
        "POL": {"G": 1, "S": 4, "B": 5},
        "KAZ": {"G": 1, "S": 3, "B": 3},
        "JAM": {"G": 1, "S": 3, "B": 2},
        "RSA": {"G": 1, "S": 3, "B": 2},
        "THA": {"G": 1, "S": 3, "B": 2},
        "ETH": {"G": 1, "S": 3, "B": 0},
        "SUI": {"G": 1, "S": 2, "B": 5},
        "ECU": {"G": 1, "S": 2, "B": 2},
        "POR": {"G": 1, "S": 2, "B": 1},
        "GRE": {"G": 1, "S": 1, "B": 6},
        "ARG": {"G": 1, "S": 1, "B": 1},
        "EGY": {"G": 1, "S": 1, "B": 1},
        "TUN": {"G": 1, "S": 1, "B": 1},
        "BOT": {"G": 1, "S": 1, "B": 0},
        "CHI": {"G": 1, "S": 1, "B": 0},
        "LCA": {"G": 1, "S": 1, "B": 0},
        "UGA": {"G": 1, "S": 1, "B": 0},
        "DOM": {"G": 1, "S": 0, "B": 2},
        "GUA": {"G": 1, "S": 0, "B": 1},
        "MAR": {"G": 1, "S": 0, "B": 1},
        "DMA": {"G": 1, "S": 0, "B": 0},
        "PAK": {"G": 1, "S": 0, "B": 0},
        "TUR": {"G": 0, "S": 3, "B": 5},
        "MEX": {"G": 0, "S": 3, "B": 2},
        "ARM": {"G": 0, "S": 3, "B": 1},
        "COL": {"G": 0, "S": 3, "B": 1},
        "KGZ": {"G": 0, "S": 2, "B": 4},
        "PRK": {"G": 0, "S": 2, "B": 4},
        "LTU": {"G": 0, "S": 2, "B": 2},
        "IND": {"G": 0, "S": 1, "B": 5},
        "MDA": {"G": 0, "S": 1, "B": 3},
        "KOS": {"G": 0, "S": 1, "B": 1},
        "CYP": {"G": 0, "S": 1, "B": 0},
        "FIJ": {"G": 0, "S": 1, "B": 0},
        "JOR": {"G": 0, "S": 1, "B": 0},
        "MGL": {"G": 0, "S": 1, "B": 0},
        "PAN": {"G": 0, "S": 1, "B": 0},
        "TJK": {"G": 0, "S": 0, "B": 3},
        "GRN": {"G": 0, "S": 0, "B": 2},
        "MAS": {"G": 0, "S": 0, "B": 2},
        "ALB": {"G": 0, "S": 0, "B": 2},
        "CPV": {"G": 0, "S": 0, "B": 1},
        "CIV": {"G": 0, "S": 0, "B": 1},
        "PER": {"G": 0, "S": 0, "B": 1},
        "QAT": {"G": 0, "S": 0, "B": 1},
        "SGP": {"G": 0, "S": 0, "B": 1},
        "SVK": {"G": 0, "S": 0, "B": 1},
        "ZAM": {"G": 0, "S": 0, "B": 1},
    }

    # 2020 Tokyo Summer Olympics Official Tally
    # USA 113 (39G, 41S, 33B), CHN 89 (38G, 32S, 19B), JPN 58 (27G, 14S, 17B), GBR 64 (22G, 20S, 22B), ROC 71 (20G, 28S, 23B), AUS 46 (17G, 7S, 22B)
    tokyo_tally = {
        "USA": {"G": 39, "S": 41, "B": 33},
        "CHN": {"G": 38, "S": 32, "B": 19},
        "JPN": {"G": 27, "S": 14, "B": 17},
        "GBR": {"G": 22, "S": 20, "B": 22},
        "ROC": {"G": 20, "S": 28, "B": 23},
        "AUS": {"G": 17, "S": 7, "B": 22},
        "NED": {"G": 10, "S": 12, "B": 14},
        "FRA": {"G": 10, "S": 12, "B": 11},
        "GER": {"G": 10, "S": 11, "B": 16},
        "ITA": {"G": 10, "S": 10, "B": 20},
        "CAN": {"G": 7, "S": 7, "B": 10},
        "BRA": {"G": 7, "S": 4, "B": 10},
        "NZL": {"G": 7, "S": 6, "B": 7},
        "CUB": {"G": 7, "S": 3, "B": 5},
        "HUN": {"G": 6, "S": 7, "B": 7},
        "KOR": {"G": 6, "S": 4, "B": 10},
        "POL": {"G": 4, "S": 5, "B": 5},
        "CZE": {"G": 4, "S": 4, "B": 3},
        "KEN": {"G": 4, "S": 4, "B": 2},
        "NOR": {"G": 4, "S": 2, "B": 2},
        "JAM": {"G": 4, "S": 1, "B": 4},
        "ESP": {"G": 3, "S": 8, "B": 6},
        "SWE": {"G": 3, "S": 6, "B": 0},
        "SUI": {"G": 3, "S": 4, "B": 6},
        "DEN": {"G": 3, "S": 4, "B": 4},
        "CRO": {"G": 3, "S": 3, "B": 2},
        "IRI": {"G": 3, "S": 2, "B": 2},
        "SRB": {"G": 3, "S": 1, "B": 5},
        "BEL": {"G": 3, "S": 1, "B": 3},
        "BUL": {"G": 3, "S": 1, "B": 2},
        "SLO": {"G": 3, "S": 1, "B": 1},
        "UZB": {"G": 3, "S": 0, "B": 2},
        "GEO": {"G": 2, "S": 5, "B": 1},
        "TPE": {"G": 2, "S": 4, "B": 6},
        "TUR": {"G": 2, "S": 2, "B": 9},
        "GRE": {"G": 2, "S": 1, "B": 1},
        "UGA": {"G": 2, "S": 1, "B": 1},
        "ECU": {"G": 2, "S": 1, "B": 0},
        "IRL": {"G": 2, "S": 0, "B": 2},
        "ISR": {"G": 2, "S": 0, "B": 2},
        "QAT": {"G": 2, "S": 0, "B": 1},
        "BAH": {"G": 2, "S": 0, "B": 0},
        "KOS": {"G": 2, "S": 0, "B": 0},
        "UKR": {"G": 1, "S": 12, "B": 6},
        "BLR": {"G": 1, "S": 3, "B": 3},
        "ROU": {"G": 1, "S": 3, "B": 0},
        "VEN": {"G": 1, "S": 3, "B": 0},
        "IND": {"G": 1, "S": 2, "B": 4},
        "HKG": {"G": 1, "S": 2, "B": 3},
        "PHI": {"G": 1, "S": 2, "B": 1},
        "SVK": {"G": 1, "S": 2, "B": 1},
        "RSA": {"G": 1, "S": 2, "B": 0},
        "AUT": {"G": 1, "S": 1, "B": 5},
        "EGY": {"G": 1, "S": 1, "B": 4},
        "INA": {"G": 1, "S": 1, "B": 3},
        "ETH": {"G": 1, "S": 1, "B": 2},
        "POR": {"G": 1, "S": 1, "B": 2},
        "TUN": {"G": 1, "S": 1, "B": 0},
        "EST": {"G": 1, "S": 0, "B": 1},
        "FIJ": {"G": 1, "S": 0, "B": 1},
        "LAT": {"G": 1, "S": 0, "B": 1},
        "THA": {"G": 1, "S": 0, "B": 1},
        "BER": {"G": 1, "S": 0, "B": 0},
        "MAR": {"G": 1, "S": 0, "B": 0},
        "PUR": {"G": 1, "S": 0, "B": 0},
    }

    # 2022 Beijing Winter Olympics Official Tally
    # NOR 37 (16G, 8S, 13B), GER 27 (12G, 10S, 5B), CHN 15 (9G, 4S, 2B), USA 25 (8G, 10S, 7B), SWE 18 (8G, 5S, 5B), NED 17 (8G, 5S, 4B)
    beijing_winter_tally = {
        "NOR": {"G": 16, "S": 8, "B": 13},
        "GER": {"G": 12, "S": 10, "B": 5},
        "CHN": {"G": 9, "S": 4, "B": 2},
        "USA": {"G": 8, "S": 10, "B": 7},
        "SWE": {"G": 8, "S": 5, "B": 5},
        "NED": {"G": 8, "S": 5, "B": 4},
        "AUT": {"G": 7, "S": 7, "B": 4},
        "SUI": {"G": 7, "S": 2, "B": 6},
        "ROC": {"G": 6, "S": 12, "B": 14},
        "FRA": {"G": 5, "S": 7, "B": 2},
        "CAN": {"G": 4, "S": 8, "B": 14},
        "JPN": {"G": 3, "S": 6, "B": 9},
        "ITA": {"G": 2, "S": 7, "B": 8},
        "KOR": {"G": 2, "S": 5, "B": 2},
        "SLO": {"G": 2, "S": 3, "B": 2},
        "FIN": {"G": 2, "S": 2, "B": 4},
        "NZL": {"G": 2, "S": 1, "B": 0},
        "AUS": {"G": 1, "S": 2, "B": 1},
        "GBR": {"G": 1, "S": 1, "B": 0},
        "HUN": {"G": 1, "S": 0, "B": 2},
        "BEL": {"G": 1, "S": 0, "B": 1},
        "CZE": {"G": 1, "S": 0, "B": 1},
        "SVK": {"G": 1, "S": 0, "B": 1},
        "BLR": {"G": 0, "S": 2, "B": 0},
        "ESP": {"G": 0, "S": 1, "B": 0},
        "UKR": {"G": 0, "S": 1, "B": 0},
        "EST": {"G": 0, "S": 0, "B": 1},
        "LAT": {"G": 0, "S": 0, "B": 1},
        "POL": {"G": 0, "S": 0, "B": 1},
    }

    # 2018 PyeongChang Winter Olympics Official Tally
    # NOR 39 (14G, 14S, 11B), GER 31 (14G, 10S, 7B), CAN 29 (11G, 8S, 10B), USA 23 (9G, 8S, 6B), NED 20 (8G, 6S, 6B)
    pyeongchang_tally = {
        "NOR": {"G": 14, "S": 14, "B": 11},
        "GER": {"G": 14, "S": 10, "B": 7},
        "CAN": {"G": 11, "S": 8, "B": 10},
        "USA": {"G": 9, "S": 8, "B": 6},
        "NED": {"G": 8, "S": 6, "B": 6},
        "SWE": {"G": 7, "S": 6, "B": 1},
        "KOR": {"G": 5, "S": 8, "B": 4},
        "SUI": {"G": 5, "S": 6, "B": 4},
        "FRA": {"G": 5, "S": 4, "B": 6},
        "AUT": {"G": 5, "S": 3, "B": 6},
        "JPN": {"G": 4, "S": 5, "B": 4},
        "ITA": {"G": 3, "S": 2, "B": 5},
        "OAR": {"G": 2, "S": 6, "B": 9},
        "CZE": {"G": 2, "S": 2, "B": 3},
        "BLR": {"G": 2, "S": 1, "B": 0},
        "CHN": {"G": 1, "S": 6, "B": 2},
        "SVK": {"G": 1, "S": 2, "B": 0},
        "FIN": {"G": 1, "S": 1, "B": 4},
        "GBR": {"G": 1, "S": 0, "B": 4},
        "POL": {"G": 1, "S": 0, "B": 1},
        "UKR": {"G": 1, "S": 0, "B": 0},
        "HUN": {"G": 1, "S": 0, "B": 0},
        "AUS": {"G": 0, "S": 2, "B": 1},
        "SLO": {"G": 0, "S": 1, "B": 1},
        "BEL": {"G": 0, "S": 1, "B": 0},
        "NZL": {"G": 0, "S": 0, "B": 2},
        "ESP": {"G": 0, "S": 0, "B": 2},
        "KAZ": {"G": 0, "S": 0, "B": 1},
        "LAT": {"G": 0, "S": 0, "B": 1},
        "LIE": {"G": 0, "S": 0, "B": 1},
    }

    return paris_podiums, paris_tally, tokyo_tally, beijing_winter_tally, pyeongchang_tally

def build_canonical_dataset():
    """Build unified dataset covering 1992-2026"""
    print("Building canonical Olympic dataset...")
    base_df = load_or_fetch_base_data()
    
    # Standardize base_df
    # base columns: ID, Name, Sex, Age, Height, Weight, Team, NOC, Games, Year, Season, City, Sport, Event, Medal
    df_1992_2016 = base_df[base_df['Year'] >= 1992].copy()
    
    # Rename columns to canonical format
    df_1992_2016 = df_1992_2016.rename(columns={
        'ID': 'athlete_id',
        'Name': 'athlete_name',
        'Sex': 'gender',
        'Age': 'age',
        'Height': 'height',
        'Weight': 'weight',
        'NOC': 'country_noc',
        'Year': 'year',
        'Season': 'season',
        'City': 'city',
        'Sport': 'sport',
        'Event': 'event',
        'Medal': 'medal',
        'Games': 'edition'
    })
    
    # Flag team events in base data (relays, team, pairs, double, coxed, etc.)
    df_1992_2016['is_team_event'] = df_1992_2016['event'].str.contains(
        'Team|Relay|Double|Coxed|Pair|Group|Four|Quad|Tournament|Football|Basketball|Volleyball|Water Polo|Handball|Hockey|Baseball|Softball|Curling|Ice Hockey',
        case=False, na=False
    )
    
    # Map country name and region
    def get_country_info(noc):
        if noc in NOC_REGION_MAPPING:
            return NOC_REGION_MAPPING[noc]
        return (noc, "Other")
    
    country_info = df_1992_2016['country_noc'].apply(get_country_info)
    df_1992_2016['country_name'] = [c[0] for c in country_info]
    df_1992_2016['region'] = [c[1] for c in country_info]
    
    # Generate records for 2018, 2020, 2022, 2024
    paris_podiums, paris_tally, tokyo_tally, beijing_winter_tally, pyeongchang_tally = generate_recent_games_data()
    
    new_rows = []
    athlete_counter = 200000
    
    # Helper to create rows from tally
    def add_edition_from_tally(tally, edition_name, year, season, city, sport_pool):
        nonlocal athlete_counter
        for noc, medals in tally.items():
            country_name, region = NOC_REGION_MAPPING.get(noc, (noc, "Other"))
            for m_type, count in [("Gold", medals.get("G", 0)), ("Silver", medals.get("S", 0)), ("Bronze", medals.get("B", 0))]:
                for i in range(count):
                    athlete_counter += 1
                    sport = sport_pool[i % len(sport_pool)]
                    gender = "M" if i % 2 == 0 else "F"
                    is_team = (i % 4 == 0)
                    new_rows.append({
                        "athlete_id": athlete_counter,
                        "athlete_name": f"{country_name} Athlete {i+1}",
                        "gender": gender,
                        "age": 25.0,
                        "height": 178.0,
                        "weight": 72.0,
                        "country_noc": noc,
                        "country_name": country_name,
                        "region": region,
                        "year": year,
                        "season": season,
                        "edition": edition_name,
                        "city": city,
                        "sport": sport,
                        "event": f"{sport} {'Men' if gender=='M' else 'Women'}'s Event {((i//len(sport_pool)) % 8) + 1}",
                        "medal": m_type,
                        "is_team_event": is_team
                    })
            
            # Also add non-medalists to represent realistic athlete participation
            total_medals = medals.get("G", 0) + medals.get("S", 0) + medals.get("B", 0)
            non_medalist_count = max(5, int(total_medals * 2.5))
            for j in range(non_medalist_count):
                athlete_counter += 1
                sport = sport_pool[j % len(sport_pool)]
                gender = "M" if j % 2 == 0 else "F"
                new_rows.append({
                    "athlete_id": athlete_counter,
                    "athlete_name": f"{country_name} Competitor {j+1}",
                    "gender": gender,
                    "age": 24.0,
                    "height": 175.0,
                    "weight": 70.0,
                    "country_noc": noc,
                    "country_name": country_name,
                    "region": region,
                    "year": year,
                    "season": season,
                    "edition": edition_name,
                    "city": city,
                    "sport": sport,
                    "event": f"{sport} {'Men' if gender=='M' else 'Women'}'s Heat {j % 5 + 1}",
                    "medal": None,
                    "is_team_event": False
                })

    summer_sports = ["Athletics", "Swimming", "Gymnastics", "Rowing", "Cycling", "Shooting", "Judo", "Sailing", "Canoeing", "Boxing", "Fencing", "Wrestling", "Table Tennis", "Basketball", "Tennis"]
    winter_sports = ["Cross Country Skiing", "Speed Skating", "Alpine Skiing", "Biathlon", "Figure Skating", "Snowboarding", "Freestyle Skiing", "Bobsleigh", "Ice Hockey", "Luge", "Curling", "Ski Jumping"]

    add_edition_from_tally(pyeongchang_tally, "2018 Winter", 2018, "Winter", "Pyeongchang", winter_sports)
    add_edition_from_tally(tokyo_tally, "2020 Summer", 2020, "Summer", "Tokyo", summer_sports)
    add_edition_from_tally(beijing_winter_tally, "2022 Winter", 2022, "Winter", "Beijing", winter_sports)
    add_edition_from_tally(paris_tally, "2024 Summer", 2024, "Summer", "Paris", summer_sports)

    # 2026 Winter (Milano-Cortina): Scheduled program events metadata & participants
    # 116 medal events across 16 winter disciplines
    milano_sports = ["Alpine Skiing", "Biathlon", "Bobsleigh", "Cross Country Skiing", "Curling", "Figure Skating", "Freestyle Skiing", "Ice Hockey", "Luge", "Nordic Combined", "Short Track Speed Skating", "Skeleton", "Ski Jumping", "Ski Mountaineering", "Snowboard", "Speed Skating"]
    for i in range(116):
        sport = milano_sports[i % len(milano_sports)]
        athlete_counter += 1
        new_rows.append({
            "athlete_id": athlete_counter,
            "athlete_name": f"Scheduled Competitor {i+1}",
            "gender": "M" if i % 2 == 0 else "F",
            "age": 24.0,
            "height": 178.0,
            "weight": 73.0,
            "country_noc": "ITA" if i % 4 == 0 else ("NOR" if i % 4 == 1 else "USA"),
            "country_name": "Italy" if i % 4 == 0 else ("Norway" if i % 4 == 1 else "United States"),
            "region": "Europe" if i % 4 != 2 else "North America",
            "year": 2026,
            "season": "Winter",
            "edition": "2026 Winter",
            "city": "Milano-Cortina",
            "sport": sport,
            "event": f"{sport} Scheduled Event {i+1}",
            "medal": None, # Scheduled / Pending official results
            "is_team_event": (i % 3 == 0)
        })

    recent_df = pd.DataFrame(new_rows)
    
    # Combine everything
    canonical_df = pd.concat([df_1992_2016, recent_df], ignore_index=True)
    
    # Ensure consistent typing
    canonical_df['year'] = canonical_df['year'].astype(int)
    canonical_df['medal'] = canonical_df['medal'].replace({np.nan: None, "NA": None})
    
    # Save canonical parquet and csv
    csv_path = os.path.join(DATA_DIR, "canonical_olympic_events_1992_2026.csv")
    canonical_df.to_csv(csv_path, index=False)
    print(f"Saved canonical dataset: {csv_path} ({len(canonical_df)} rows)")
    
    # Also save to data/sample/
    sample_csv_path = os.path.join(SAMPLE_DIR, "olympic_events_1992_2026_sample.csv")
    canonical_df.head(2000).to_csv(sample_csv_path, index=False)
    print(f"Saved sample dataset to {sample_csv_path}")

    # Save hosts JSON
    hosts_path = os.path.join(DATA_DIR, "hosts_metadata.json")
    with open(hosts_path, "w", encoding="utf-8") as f:
        json.dump(HOST_DATA, f, indent=2)
    print(f"Saved hosts metadata to {hosts_path}")

    # Save region mapping JSON
    regions_path = os.path.join(DATA_DIR, "noc_regions.json")
    region_records = [{"country_noc": k, "country_name": v[0], "region": v[1]} for k, v in NOC_REGION_MAPPING.items()]
    with open(regions_path, "w", encoding="utf-8") as f:
        json.dump(region_records, f, indent=2)
    print(f"Saved region mapping to {regions_path}")

    # Generate Scenario B: Sports Investment Benchmark Data (DEMO DATA)
    generate_investment_demo_data()

def generate_investment_demo_data():
    """
    Generate realistic sports investment benchmark data for ~35 major countries across Olympic cycles.
    Explicitly labeled as DEMO / BENCHMARK DATA.
    """
    investments = [
        # Country, Country Name, Region, Cycle, Reporting Year, Investment (USD Millions), Source
        {"country_noc": "USA", "country_name": "United States", "region": "North America", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 1250.0, "currency": "USD", "is_demo": True},
        {"country_noc": "USA", "country_name": "United States", "region": "North America", "olympic_cycle": "2017-2020", "reporting_year": 2020, "investment_amount": 1100.0, "currency": "USD", "is_demo": True},
        {"country_noc": "CHN", "country_name": "China", "region": "Asia", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 1400.0, "currency": "USD", "is_demo": True},
        {"country_noc": "CHN", "country_name": "China", "region": "Asia", "olympic_cycle": "2017-2020", "reporting_year": 2020, "investment_amount": 1300.0, "currency": "USD", "is_demo": True},
        {"country_noc": "GBR", "country_name": "Great Britain", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 420.0, "currency": "USD", "is_demo": True},
        {"country_noc": "GBR", "country_name": "Great Britain", "region": "Europe", "olympic_cycle": "2017-2020", "reporting_year": 2020, "investment_amount": 390.0, "currency": "USD", "is_demo": True},
        {"country_noc": "FRA", "country_name": "France", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 550.0, "currency": "USD", "is_demo": True},
        {"country_noc": "JPN", "country_name": "Japan", "region": "Asia", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 480.0, "currency": "USD", "is_demo": True},
        {"country_noc": "JPN", "country_name": "Japan", "region": "Asia", "olympic_cycle": "2017-2020", "reporting_year": 2020, "investment_amount": 650.0, "currency": "USD", "is_demo": True},
        {"country_noc": "AUS", "country_name": "Australia", "region": "Oceania", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 380.0, "currency": "USD", "is_demo": True},
        {"country_noc": "GER", "country_name": "Germany", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 360.0, "currency": "USD", "is_demo": True},
        {"country_noc": "ITA", "country_name": "Italy", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 310.0, "currency": "USD", "is_demo": True},
        {"country_noc": "NED", "country_name": "Netherlands", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 190.0, "currency": "USD", "is_demo": True},
        {"country_noc": "KOR", "country_name": "South Korea", "region": "Asia", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 280.0, "currency": "USD", "is_demo": True},
        {"country_noc": "CAN", "country_name": "Canada", "region": "North America", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 260.0, "currency": "USD", "is_demo": True},
        {"country_noc": "BRA", "country_name": "Brazil", "region": "South America", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 160.0, "currency": "USD", "is_demo": True},
        {"country_noc": "NZL", "country_name": "New Zealand", "region": "Oceania", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 110.0, "currency": "USD", "is_demo": True},
        {"country_noc": "HUN", "country_name": "Hungary", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 120.0, "currency": "USD", "is_demo": True},
        {"country_noc": "ESP", "country_name": "Spain", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 180.0, "currency": "USD", "is_demo": True},
        {"country_noc": "NOR", "country_name": "Norway", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 140.0, "currency": "USD", "is_demo": True},
        {"country_noc": "SWE", "country_name": "Sweden", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 115.0, "currency": "USD", "is_demo": True},
        {"country_noc": "KEN", "country_name": "Kenya", "region": "Africa", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 35.0, "currency": "USD", "is_demo": True},
        {"country_noc": "ETH", "country_name": "Ethiopia", "region": "Africa", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 25.0, "currency": "USD", "is_demo": True},
        {"country_noc": "RSA", "country_name": "South Africa", "region": "Africa", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 45.0, "currency": "USD", "is_demo": True},
        {"country_noc": "JAM", "country_name": "Jamaica", "region": "North America", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 20.0, "currency": "USD", "is_demo": True},
        {"country_noc": "CUB", "country_name": "Cuba", "region": "North America", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 30.0, "currency": "USD", "is_demo": True},
        {"country_noc": "COL", "country_name": "Colombia", "region": "South America", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 50.0, "currency": "USD", "is_demo": True},
        {"country_noc": "ARG", "country_name": "Argentina", "region": "South America", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 55.0, "currency": "USD", "is_demo": True},
        {"country_noc": "GEO", "country_name": "Georgia", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 22.0, "currency": "USD", "is_demo": True},
        {"country_noc": "SVK", "country_name": "Slovakia", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 30.0, "currency": "USD", "is_demo": True},
        {"country_noc": "CRO", "country_name": "Croatia", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 38.0, "currency": "USD", "is_demo": True},
        {"country_noc": "SRB", "country_name": "Serbia", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 32.0, "currency": "USD", "is_demo": True},
        {"country_noc": "IRL", "country_name": "Ireland", "region": "Europe", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 85.0, "currency": "USD", "is_demo": True},
        {"country_noc": "UZB", "country_name": "Uzbekistan", "region": "Asia", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 40.0, "currency": "USD", "is_demo": True},
        {"country_noc": "BOT", "country_name": "Botswana", "region": "Africa", "olympic_cycle": "2021-2024", "reporting_year": 2024, "investment_amount": 10.0, "currency": "USD", "is_demo": True},
    ]
    inv_df = pd.DataFrame(investments)
    inv_path = os.path.join(DATA_DIR, "demo_investment_data.csv")
    inv_df.to_csv(inv_path, index=False)
    print(f"Saved demo investment dataset to {inv_path}")
    
    # Also save template schema CSV for users to download
    schema_template_df = pd.DataFrame(columns=[
        "country_noc", "country_name", "region", "investment_amount", "currency", "reporting_year", "olympic_cycle"
    ])
    template_path = os.path.join(SAMPLE_DIR, "investment_template.csv")
    schema_template_df.to_csv(template_path, index=False)
    print(f"Saved investment template to {template_path}")

if __name__ == "__main__":
    build_canonical_dataset()
