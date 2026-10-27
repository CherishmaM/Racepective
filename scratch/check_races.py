import urllib.request, json
req = urllib.request.urlopen('http://127.0.0.1:8000/api/seasons/current/races')
data = json.loads(req.read().decode('utf-8'))['data']
for r in data:
    c = r.get('circuit', {})
    print(f"Round {r.get('round'):2d}: {r.get('race_name'):30s} -> {c.get('circuit_id'):18s} ({c.get('circuit_name')}) on {r.get('date')}")
