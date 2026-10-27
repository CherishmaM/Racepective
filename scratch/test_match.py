import urllib.request
import json

r1 = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/circuits?season=current').read())
circuits = r1.get('data', [])
r2 = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/seasons/current/races').read())
schedule = r2.get('data', [])

print(f"Total circuits: {len(circuits)}, Total schedule races: {len(schedule)}")
sched_cids = {r.get('circuit', {}).get('circuit_id'): r for r in schedule}

for c in circuits:
    cid = c.get('circuit_id')
    r = sched_cids.get(cid)
    if r:
        print(f"{cid:20} -> Round {r.get('round'):2} | {r.get('state'):10} | {r.get('race_name')}")
    else:
        print(f"{cid:20} -> NOT IN SCHEDULE")
