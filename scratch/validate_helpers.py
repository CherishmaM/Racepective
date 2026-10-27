import re, json

def parse_svg_path_bounds(d):
    nums = [float(n) for n in re.findall(r'[-+]?\d*\.?\d+', d)]
    xs = nums[0::2]
    ys = nums[1::2]
    return min(xs), max(xs), min(ys), max(ys)

print("Bounding parser ready")
