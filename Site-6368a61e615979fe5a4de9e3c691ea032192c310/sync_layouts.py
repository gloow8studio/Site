import os

base_dir = r"c:\Users\luisc\Downloads\Site3D AnimaMotion"
amarelo_path = os.path.join(base_dir, "amarelo.html")
laranja_path = os.path.join(base_dir, "laranja.html")

# Read laranja.html to get the template
with open(laranja_path, 'r', encoding='utf-8') as f:
    laranja_content = f.read()

# Markers
start_marker = "<!-- ========================================== -->"
laranja_section_marker = "<!-- SEÇÃO GALERIA AURON"
vyra_section_marker = "<!-- SEÇÃO GALERIA VYRA"
end_marker = "  <script src=\"bg-canvas.js\">"

# Find template in laranja
l_start = laranja_content.find(laranja_section_marker)
if l_start == -1:
    print("Could not find Auron section start")
    exit(1)
# Backtrack to find the line before it with the divider
l_divider_start = laranja_content.rfind(start_marker, 0, l_start)
if l_divider_start != -1:
    l_start = l_divider_start

l_end = laranja_content.find(end_marker, l_start)
if l_end == -1:
    print("Could not find Auron section end")
    exit(1)

# Backtrack from end_marker to find the last </div> closing the page-container
# Actually, the template should end before the closing divs that come before the script
l_template_end = laranja_content.rfind("  </div>", l_start, l_end)
l_template_end = laranja_content.rfind("  </div>", l_start, l_template_end) # Twice to go before the page-container closing

template = laranja_content[l_start:l_template_end]

# Adapt to Vyra identity
template = template.replace('#FF6D00', '#FFD700')
template = template.replace('#FF8C00', '#FFB300')
template = template.replace('rgba(255, 109, 0', 'rgba(255, 215, 0')
template = template.replace('AURON', 'VYRA')
template = template.replace('auron', 'vyra')
template = template.replace('Auron', 'Vyra')
template = template.replace('Renders de Alto Padrão, Maquetes 3D e Realismo.', 'Design de Interiores, Identidade Visual e Ilustração Digital.')
template = template.replace('fotos auron/', 'fotos/')

# Read amarelo
with open(amarelo_path, 'r', encoding='utf-8') as f:
    amarelo_content = f.read()

# Find existing section in amarelo
a_start = amarelo_content.find(vyra_section_marker)
if a_start == -1:
    print("Could not find Vyra section start")
    exit(1)
a_divider_start = amarelo_content.rfind(start_marker, 0, a_start)
if a_divider_start != -1:
    a_start = a_divider_start

a_end = amarelo_content.find(end_marker, a_start)
if a_end == -1:
    print("Could not find Vyra section end")
    exit(1)

a_template_end = amarelo_content.rfind("  </div>", a_start, a_end)
a_template_end = amarelo_content.rfind("  </div>", a_start, a_template_end)

# Preserve vyraProjects from amarelo
# Extract existing vyraProjects
v_projects_start = amarelo_content.find("const vyraProjects = [", a_start, a_end)
v_projects_end = amarelo_content.find("];", v_projects_start) + 2
projects_code = amarelo_content[v_projects_start:v_projects_end]

# Replace the template projects with the original ones
t_projects_start = template.find("const vyraProjects = [")
t_projects_end = template.find("];", t_projects_start) + 2
template = template[:t_projects_start] + projects_code + template[t_projects_end:]

# Construct final content
new_amarelo = amarelo_content[:a_start] + template + amarelo_content[a_template_end:]

with open(amarelo_path, 'w', encoding='utf-8') as f:
    f.write(new_amarelo)

print("Success! Amarelo.html gallery updated and synchronized.")
