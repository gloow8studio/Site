import os
import re

base_dir = r"c:\Users\luisc\Downloads\Site3D AnimaMotion"
laranja_path = os.path.join(base_dir, "laranja.html")
roxo_path = os.path.join(base_dir, "roxo.html")
videos_dir = os.path.join(base_dir, "videos auron")

# 1. Scan videos auron
video_files = []
if os.path.exists(videos_dir):
    for f in os.listdir(videos_dir):
        if f.endswith(".mp4"):
            video_files.append(f)

# 2. Extract from roxo.html
with open(roxo_path, 'r', encoding='utf-8') as f:
    roxo_content = f.read()

# Extract CSS (Netflix Style + Player Modal)
css_match = re.search(r'/\* --- Video Grid \(Netflix Style\) ---\ \*/(.*?)/\* --- Custom Video Player Modal ---\ \*/(.*?)(?=</style>)', roxo_content, re.DOTALL)
css_content = css_match.group(0) if css_match else ""

# Extract HTML (Netflix Style Section + Player Modal + Toast)
html_match = re.search(r'<!-- Netflix Style Section -->(.*?)<div class=\"toast\" id=\"toast\">.*?</div>', roxo_content, re.DOTALL)
html_content = html_match.group(0) if html_match else ""

# Extract JS
js_match = re.search(r'// --- NETFLIX STYLE VIDEO PLAYER LOGIC ---\ \*/(.*?)\}\)\(\);', roxo_content, re.DOTALL)
js_content = js_match.group(0) if js_match else ""

# 3. Adapt for AURON (Orange Theme)
theme_color = "#FF6D00"
theme_rgb = "255, 109, 0"

css_content = css_content.replace("#AA00FF", theme_color)
css_content = css_content.replace("170, 0, 255", theme_rgb)
css_content = css_content.replace("170,0,255", theme_rgb)

html_content = html_content.replace("ZYNTH", "AURON")
html_content = html_content.replace("#AA00FF", theme_color)

# Create video list for JS
video_list_js = "        const auronVideos = [\n"
for v in video_files:
    title = v.replace("_MP4.mp4", "").replace(".mp4", "").replace("_", " ")
    video_list_js += f'            {{ title: "{title}", src: "videos auron/{v}", duration: "4K Render" }},\n'
video_list_js += "        ];"

# Replace demoVideos with our list
js_content = re.sub(r'const demoVideos = \[.*?\];', video_list_js, js_content, flags=re.DOTALL)
js_content = js_content.replace("demoVideos", "auronVideos")
js_content = js_content.replace("video_zynth.mp4", "auron_video.mp4")
js_content = js_content.replace("videos/", "videos auron/")

# Wrap JS in a script tag if it's not already
final_js = f"<script>\n{js_content}\n}})();\n</script>"

# 4. Inject into laranja.html
with open(laranja_path, 'r', encoding='utf-8') as f:
    laranja_content = f.read()

# Add CSS to the end of the existing style tag or add a new one
# Finding the last </style>
last_style_index = laranja_content.rfind("</style>")
if last_style_index != -1:
    laranja_content = laranja_content[:last_style_index] + "\n\n" + css_content + "\n" + laranja_content[last_style_index:]

# Add HTML before the closing tag of page-container (line 693 in previous view)
insertion_point = laranja_content.rfind("  </div>\n\n  <script src=\"bg-canvas.js\">")
if insertion_point != -1:
    laranja_content = laranja_content[:insertion_point] + "\n\n" + html_content + "\n" + laranja_content[insertion_point:]

# Add JS before the end of body
last_script_index = laranja_content.rfind("</body>")
if last_script_index != -1:
    laranja_content = laranja_content[:last_script_index] + "\n\n" + final_js + "\n" + laranja_content[last_script_index:]

with open(laranja_path, 'w', encoding='utf-8') as f:
    f.write(laranja_content)

print("Sucesso! Seção de vídeo adicionada com tema Auron.")
