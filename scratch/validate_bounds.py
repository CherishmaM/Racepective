import json, re

# Define authentic coordinates for all 24 F1 championship circuits
# Constraints:
# All X must be in [80, 944]
# All Y must be in [55, 510]
# Absolutely NO Y < 50 or Y > 520!

def parse_svg_path_bounds(d):
    # Find all numbers in path
    nums = [float(n) for n in re.findall(r'[-+]?\d*\.?\d+', d)]
    # Pair them as x, y
    xs = nums[0::2]
    ys = nums[1::2]
    return min(xs), max(xs), min(ys), max(ys)

print("Bounding box tester ready.")
