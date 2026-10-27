import re, json

def validate_circuit(cid, c):
    # Check fullPath
    nums = [float(n) for n in re.findall(r'[-+]?\d*\.?\d+', c['fullPath'])]
    xs = nums[0::2]
    ys = nums[1::2]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    # Check all turns
    for t in c['turns']:
        tx, ty = t['x'], t['y']
        assert 40 <= tx <= 984, f"{cid}: turn {t['id']} x={tx} out of bounds"
        assert 40 <= ty <= 536, f"{cid}: turn {t['id']} y={ty} out of bounds"
        
    # Check bounds
    assert min_x >= 50 and max_x <= 974, f"{cid}: X bounds out [{min_x}, {max_x}]"
    assert min_y >= 50 and max_y <= 526, f"{cid}: Y bounds out [{min_y}, {max_y}]"
    return min_x, max_x, min_y, max_y

print("Validator ready.")
