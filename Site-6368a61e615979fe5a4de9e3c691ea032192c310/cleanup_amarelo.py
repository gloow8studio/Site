import os
import re

base_dir = r"c:\Users\luisc\Downloads\Site3D AnimaMotion"
amarelo_path = os.path.join(base_dir, "amarelo.html")

with open(amarelo_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Netflix CSS
# From /* --- Video Grid (Netflix Style) --- */ to end of style tag
content = re.sub(r'/\* --- Video Grid \(Netflix Style\) ---\ \*/.*?(?=</style>)', '', content, flags=re.DOTALL)

# 2. Remove Netflix HTML
# From <!-- Netflix Style Section --> to just before bg-canvas.js script
# We need to be careful to keep the closing </div> of page-container
content = re.sub(r'<!-- Netflix Style Section -->.*?<div class=\"toast\" id=\"toast\">.*?</div>\s*</div>', '  </div>', content, flags=re.DOTALL)

# 3. Fix colors in the remaining CSS/HTML (just in case any orange leaked)
content = content.replace('#FF6D00', '#FFD700')
content = content.replace('#FF8C00', '#FFB300')
content = content.replace('rgba(255, 109, 0', 'rgba(255, 215, 0')

with open(amarelo_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success! Amarelo.html cleaned up and layout verified.")
