import urllib.request
import urllib.parse
import json
import io

print("=== TESTING CSV VALIDATION & UPLOAD ===")

# Test 1: Valid sample CSV
sample_csv = """athlete_id,athlete_name,gender,country_noc,country_name,region,year,season,edition,city,sport,event,medal
99901,Test Runner,M,KEN,Kenya,Africa,2024,Summer,2024 Summer,Paris,Athletics,Athletics Men's Marathon,Gold
99902,Test Swimmer,F,USA,United States,North America,2024,Summer,2024 Summer,Paris,Swimming,Swimming Women's 100m,Silver
"""

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="test_upload.csv"\r\n'
    f'Content-Type: text/csv\r\n\r\n'
    f'{sample_csv}\r\n'
    f'--{boundary}--\r\n'
).encode('utf-8')

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/data/validate',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

res = urllib.request.urlopen(req)
val_json = json.loads(res.read().decode('utf-8'))
print(f"Validation Status: {val_json['status']}")
print(f"Passed Validation: {val_json['quality_summary']['passed_validation']}")
print(f"Total Rows: {val_json['quality_summary']['total_rows']}")
assert val_json['quality_summary']['passed_validation'] is True

# Test 2: Invalid CSV validation (out-of-bounds year)
invalid_csv = """athlete_id,athlete_name,gender,country_noc,year,sport,event,medal
101,Alien,M,USA,3050,Athletics,100m,Gold
"""
body_inv = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="invalid.csv"\r\n'
    f'Content-Type: text/csv\r\n\r\n'
    f'{invalid_csv}\r\n'
    f'--{boundary}--\r\n'
).encode('utf-8')

req_inv = urllib.request.Request(
    'http://127.0.0.1:8000/api/data/validate',
    data=body_inv,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)
res_inv = urllib.request.urlopen(req_inv)
inv_json = json.loads(res_inv.read().decode('utf-8'))
print(f"Invalid File Caught: Passed = {inv_json['quality_summary']['passed_validation']}, Errors = {len(inv_json['quality_summary']['errors'])}")
assert len(inv_json['quality_summary']['errors']) > 0

# Test 3: Reset dataset
req_reset = urllib.request.Request('http://127.0.0.1:8000/api/data/reset', data=b'', method='POST')
res_reset = urllib.request.urlopen(req_reset)
reset_json = json.loads(res_reset.read().decode('utf-8'))
print(f"Reset Result: {reset_json['message']} (Rows: {reset_json['rows_count']})")
assert reset_json['rows_count'] > 100000

print("\nUPLOAD AND VALIDATION TESTS PASSED!")
