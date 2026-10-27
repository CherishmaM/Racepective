import urllib.request, json
req = urllib.request.urlopen('http://127.0.0.1:8000/api/circuits?season=current')
circuits = json.loads(req.read().decode('utf-8'))['data']
print(f"Total circuits: {len(circuits)}")
for c in circuits:
    cid = c.get('circuit_id')
    cname = c.get('circuit_name')
    loc = c.get('location', {})
    country = loc.get('country')
    print(f"{cid:20s} | {cname:40s} | {country}")
