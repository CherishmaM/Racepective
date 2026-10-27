with open(r'C:\Users\sures\.gemini\antigravity\scratch\gridlens\frontend\src\components\circuits\CircuitSectorMap.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
import re
tracks = re.findall(r'(\w+):\s*{\s*circuit_id:', content)
print(f'Total tracks defined: {len(tracks)}')
print('Sample tracks:', tracks[:10])
print(f'sector1Path count: {content.count("sector1Path")}, startFinish count: {content.count("startFinish")}')
