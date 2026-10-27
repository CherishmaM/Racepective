import urllib.request
import json

r1 = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/circuits?season=current').read())
circuits = r1.get('data', [])
r2 = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/seasons/current/races').read())
schedule = r2.get('data', [])
r3 = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/races/next').read())
upcoming_race = r3.get('data')

upcoming_round = upcoming_race.get('round', 19)

def get_circuit_race(circuit_id):
    if not circuit_id:
        return None
    cid = circuit_id.lower().replace("-", "").replace("_", "").replace(" ", "")
    for r in schedule:
        rcid = (r.get("circuit", {}).get("circuit_id") or "").lower().replace("-", "").replace("_", "").replace(" ", "")
        if rcid == cid:
            return r
    return None

upcoming_list = []
past_list = []

for c in circuits:
    race = get_circuit_race(c.get("circuit_id"))
    if race:
        if race.get("state") == "UPCOMING" or race.get("round", 0) >= upcoming_round:
            upcoming_list.append((race.get("round", 999), c.get("circuit_name"), race.get("race_name")))
        else:
            past_list.append((race.get("round", 999), c.get("circuit_name"), race.get("race_name")))
    else:
        past_list.append((999, c.get("circuit_name"), "Non-calendar"))

upcoming_list.sort(key=lambda x: x[0])
past_list.sort(key=lambda x: x[0])

print("=== UPCOMING RACES SECTION (AT THE TOP) ===")
for round_num, cname, rname in upcoming_list:
    print(f"Round {round_num:2}: {rname} @ {cname}")

print("\n=== PAST CIRCUITS SECTION (BELOW) ===")
for round_num, cname, rname in past_list:
    print(f"Round {round_num:2}: {rname} @ {cname}")
