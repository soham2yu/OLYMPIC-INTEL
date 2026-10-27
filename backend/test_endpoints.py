import urllib.request
import json

endpoints = [
    '/api/health',
    '/api/metadata',
    '/api/filters',
    '/api/overview',
    '/api/medals/countries',
    '/api/sports/performance',
    '/api/athletes/participation',
    '/api/regions/performance',
    '/api/investment/performance',
    '/api/hosts/performance',
    '/api/timeline',
    '/api/medals/country/USA',
    '/api/sports/detail/Rowing',
    '/api/athletes/table?page=1&page_size=5',
    '/api/data/export?export_type=medals'
]

print("=== VERIFYING ALL API ENDPOINTS ===")
success = True
for ep in endpoints:
    url = f'http://127.0.0.1:8000{ep}'
    try:
        req = urllib.request.urlopen(url)
        content_type = req.headers.get('Content-Type')
        print(f"PASS: {ep} -> HTTP {req.status} ({content_type})")
    except Exception as e:
        print(f"FAIL: {ep} -> {e}")
        success = False

if success:
    print("\nALL ENDPOINTS VERIFIED SUCCESSFULLY!")
