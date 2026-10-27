import re

def check_overlap(t_x, t_y, b_x, b_y, b_w, b_h):
    # Box bounds:
    # x in [b_x, b_x + b_w], y in [b_y, b_y + b_h]
    # Margin of 15px
    return (b_x - 15 <= t_x <= b_x + b_w + 15) and (b_y - 15 <= t_y <= b_y + b_h + 15)

print("Overlap checker ready")
