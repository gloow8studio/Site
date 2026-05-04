import os
import re

base_dir = r"c:\Users\luisc\Downloads\Site3D AnimaMotion"
html_path = os.path.join(base_dir, "amarelo.html")
fotos_dir = os.path.join(base_dir, "fotos")

# Generate the projects array
projects_js = "    const vyraProjects = [\n"
id_counter = 1

if os.path.exists(fotos_dir):
    for filename in os.listdir(fotos_dir):
        if filename.endswith((".png", ".jpg", ".jpeg", ".webp")):
            # determine category roughly
            category = "interior"
            if "ChatGPT" in filename:
                category = "illustration"
            elif "Gemini" in filename:
                category = "concept"
            elif "Paleta" in filename or "simbol" in filename:
                category = "branding"
            
            title = filename.replace('.png', '').replace('.jpg', '').replace('.jpeg', '')
            # escape quotes
            title = title.replace('"', '\\"')
            filename_escaped = filename.replace('"', '\\"')
            
            projects_js += f"""        {{
            id: {id_counter},
            file: "{filename_escaped}",
            title: "{title}",
            category: "{category}",
            desc: "Imagem gerada e salva no diretório fotos.",
            tech: ["Photoshop", "AI"]
        }},\n"""
            id_counter += 1

projects_js += "    ];\n"

# The new HTML section
new_section = f"""

<!-- ========================================== -->
<!-- SEÇÃO GALERIA VYRA - PORTFÓLIO IMPACTANTE  -->
<!-- ========================================== -->
<section id="vyra-gallery-section" style="padding: 80px 20px; background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%); position: relative; overflow: visible;">
    
    <!-- Efeitos de Fundo -->
    <div class="hex-grid-bg" style="position: absolute; top:0; left:0; width:100%; height:100%; opacity: 0.05; pointer-events: none; background-image: url('data:image/svg+xml,...');"></div>
    
    <div class="container" style="max-width: 1400px; margin: 0 auto; position: relative; z-index: 2;">
        
        <!-- Cabeçalho da Seção -->
        <div class="section-header" style="text-align: center; margin-bottom: 60px;">
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 3rem; color: #FFD700; text-shadow: 0 0 20px rgba(255, 215, 0, 0.6); margin-bottom: 10px;">
                VYRA <span style="color: #fff;">ARCHIVES</span>
            </h2>
            <p style="font-family: 'Rajdhani', sans-serif; font-size: 1.2rem; color: #ccc; max-width: 700px; margin: 0 auto;">
                Explore a curadoria visual. Design de Interiores, Identidade Visual e Ilustração Digital.
                <br><span style="color: #FFB300; font-size: 0.9rem;">* Scroll down to enter the gallery *</span>
            </p>
            
            <!-- Filtros de Categoria -->
            <div class="gallery-filters" style="margin-top: 30px; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <button class="filter-btn active" data-filter="all" style="background: transparent; border: 1px solid #FFD700; color: #FFD700; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">TODOS</button>
                <button class="filter-btn" data-filter="interior" style="background: transparent; border: 1px solid #555; color: #aaa; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">Interiores</button>
                <button class="filter-btn" data-filter="branding" style="background: transparent; border: 1px solid #555; color: #aaa; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">Branding</button>
                <button class="filter-btn" data-filter="illustration" style="background: transparent; border: 1px solid #555; color: #aaa; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">Ilustração</button>
                <button class="filter-btn" data-filter="concept" style="background: transparent; border: 1px solid #555; color: #aaa; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">Concept</button>
            </div>
        </div>

        <!-- Grid de Imagens (Masonry) -->
        <div id="gallery-grid" class="gallery-masonry" style="column-count: 3; column-gap: 20px; position: relative;">
            <!-- As imagens serão injetadas aqui via JavaScript -->
            <div style="text-align: center; grid-column: 1/-1; color: #FFD700; font-family: 'Orbitron'; padding: 50px;">
                Carregando acervo VYRA...
            </div>
        </div>

        <!-- Botão de Upload Simulado -->
        <div style="text-align: center; margin-top: 60px;">
            <label for="vyra-upload-2" class="upload-btn-wrapper" style="cursor: pointer;">
                <button style="background: linear-gradient(45deg, #FFB300, #FFD700); border: none; padding: 15px 40px; color: #000; font-family: 'Orbitron'; font-weight: bold; font-size: 1rem; clip-path: polygon(5% 0, 100% 0, 95% 100%, 0% 100%); box-shadow: 0 0 15px rgba(255, 179, 0, 0.4); transition: transform 0.2s;" onclick="document.getElementById('vyra-upload-2').click()">
                    + ENVIAR IMAGEM (SIMULADO)
                </button>
                <input type="file" id="vyra-upload-2" name="myfile" style="display:none;" accept="image/*" onchange="simulateUpload(this)" />
            </label>
            <p style="color: #666; font-size: 0.8rem; margin-top: 10px; font-family: 'Rajdhani'">O upload é apenas visual no frontend.</p>
        </div>
    </div>
</section>

<!-- LIGHTBOX MODAL (VISUALIZADOR COMPLETO) -->
<div id="vyra-lightbox-2" class="lightbox-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9999; backdrop-filter: blur(10px); transition: opacity 0.3s;">
    
    <!-- Botão Fechar -->
    <button id="lb-close-2" style="position: absolute; top: 20px; right: 30px; background: none; border: none; color: #fff; font-size: 3rem; cursor: pointer; z-index: 10001; transition: color 0.3s;">&times;</button>

    <div class="lightbox-content" style="display: flex; height: 100%; width: 100%; max-width: 1600px; margin: 0 auto; padding: 20px; box-sizing: border-box;">
        
        <!-- Área da Imagem -->
        <div class="lb-image-container" style="flex: 2; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
            <img id="lb-img-2" src="" alt="Full View" style="max-width: 100%; max-height: 85vh; object-fit: contain; transition: transform 0.2s ease; cursor: zoom-in; box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);" />
            
            <!-- Controles Flutuantes da Imagem -->
            <div class="lb-controls" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; background: rgba(0,0,0,0.6); padding: 10px 20px; border-radius: 30px; border: 1px solid #FFD700;">
                <button id="lb-zoom-in-2" title="Zoom In" style="background: none; border: none; color: #FFD700; font-size: 1.2rem; cursor: pointer;">🔍+</button>
                <button id="lb-zoom-out-2" title="Zoom Out" style="background: none; border: none; color: #FFD700; font-size: 1.2rem; cursor: pointer;">🔍-</button>
                <button id="lb-reset-2" title="Reset Zoom" style="background: none; border: none; color: #fff; font-size: 0.9rem; cursor: pointer; font-family: 'Rajdhani'">RESET</button>
                <div style="width: 1px; background: #555; margin: 0 5px;"></div>
                <button id="lb-download-2" title="Download" style="background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer;">⬇</button>
                <button id="lb-fullscreen-2" title="Fullscreen" style="background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer;">⛶</button>
            </div>
        </div>

        <!-- Painel de Informações (Conceito) -->
        <div class="lb-info-panel" style="flex: 1; background: rgba(10, 10, 10, 0.8); border-left: 2px solid #FFD700; padding: 40px; display: flex; flex-direction: column; justify-content: center; color: #fff; overflow-y: auto; min-width: 300px;">
            <h3 id="lb-title-2" style="font-family: 'Orbitron'; color: #FFD700; font-size: 2rem; margin-bottom: 10px; text-transform: uppercase;">Título do Projeto</h3>
            <span id="lb-category-2" style="color: #888; font-family: 'Rajdhani'; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; display: block;">Categoria</span>
            
            <div class="info-block" style="margin-bottom: 25px;">
                <h4 style="color: #fff; font-family: 'Rajdhani'; font-size: 1.1rem; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">CONCEITO & DESIGN</h4>
                <p id="lb-desc-2" style="font-family: 'Rajdhani'; font-size: 1rem; line-height: 1.6; color: #ddd;">Descrição detalhada do projeto...</p>
            </div>

            <div class="info-block" style="margin-bottom: 25px;">
                <h4 style="color: #fff; font-family: 'Rajdhani'; font-size: 1.1rem; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">DETALHES TÉCNICOS</h4>
                <ul id="lb-tech-2" style="font-family: 'Rajdhani'; font-size: 0.95rem; color: #aaa; list-style: none; padding: 0;">
                    <li>• Software: Photoshop / Blender</li>
                    <li>• Ano: 2024</li>
                </ul>
            </div>

            <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid #333;">
                <p style="font-family: 'Orbitron'; font-size: 0.8rem; color: #FFD700;">VYRA DESIGN SYSTEM</p>
            </div>
        </div>
    </div>
</div>

<!-- ESTILOS CSS ESPECÍFICOS DA GALERIA -->
<style>
    /* Responsividade do Grid Masonry */
    @media (max-width: 1024px) {{
        .gallery-masonry {{ column-count: 2; }}
        .lightbox-content {{ flex-direction: column; overflow-y: scroll; }}
        .lb-image-container {{ flex: none; height: 50vh; }}
        .lb-info-panel {{ flex: none; height: auto; border-left: none; border-top: 2px solid #FFD700; }}
    }}
    @media (max-width: 600px) {{
        .gallery-masonry {{ column-count: 1; }}
        .lb-info-panel {{ padding: 20px; }}
    }}

    /* Card da Imagem */
    .gallery-item-2 {{
        break-inside: avoid;
        margin-bottom: 20px;
        position: relative;
        background: #111;
        border: 1px solid #333;
        transition: all 0.4s ease;
        cursor: pointer;
        overflow: hidden;
        display: block; /* Para garantir a exibição */
    }}

    .gallery-item-2:hover {{
        border-color: #FFD700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        transform: translateY(-5px);
    }}

    .gallery-item-2 img {{
        width: 100%;
        height: auto;
        display: block;
        transition: transform 0.5s ease;
    }}

    .gallery-item-2:hover img {{
        transform: scale(1.05);
    }}

    /* Overlay no Hover */
    .item-overlay-2 {{
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
        padding: 20px;
        box-sizing: border-box;
        opacity: 0;
        transition: opacity 0.3s ease;
    }}

    .gallery-item-2:hover .item-overlay-2 {{
        opacity: 1;
    }}

    .item-title-2 {{
        color: #FFD700;
        font-family: 'Orbitron', sans-serif;
        font-size: 1.1rem;
        margin: 0;
    }}

    .item-cat-2 {{
        color: #fff;
        font-family: 'Rajdhani', sans-serif;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }}

    /* Botões de Filtro Ativos */
    #vyra-gallery-section .filter-btn.active {{
        background: #FFD700 !important;
        color: #000 !important;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    }}
    
    #vyra-gallery-section .filter-btn:hover:not(.active) {{
        border-color: #FFD700 !important;
        color: #FFD700 !important;
    }}
</style>

<!-- LÓGICA JAVASCRIPT -->
<script>
{projects_js}

    const galleryGrid2 = document.getElementById('gallery-grid');
    const lightbox2 = document.getElementById('vyra-lightbox-2');
    
    // Elementos do Lightbox
    const lbImg2 = document.getElementById('lb-img-2');
    const lbTitle2 = document.getElementById('lb-title-2');
    const lbCategory2 = document.getElementById('lb-category-2');
    const lbDesc2 = document.getElementById('lb-desc-2');
    const lbTech2 = document.getElementById('lb-tech-2');
    
    let currentZoom2 = 1;

    // Função para Renderizar Galeria
    function renderGallery2(filter = 'all') {{
        galleryGrid2.innerHTML = '';
        
        const filteredProjects = filter === 'all' 
            ? vyraProjects 
            : vyraProjects.filter(p => p.category === filter);

        if(filteredProjects.length === 0) {{
            galleryGrid2.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#666;">Nenhum projeto nesta categoria.</div>';
            return;
        }}

        filteredProjects.forEach(project => {{
            const item = document.createElement('div');
            item.className = 'gallery-item-2';
            item.onclick = () => openLightbox2(project);

            // Caminho da imagem
            const imgPath = `fotos/${{project.file}}`;

            item.innerHTML = `
                <img src="${{imgPath}}" alt="${{project.title}}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/111/FFD700?text=Image+Not+Found'">
                <div class="item-overlay-2">
                    <h3 class="item-title-2">${{project.title}}</h3>
                    <span class="item-cat-2">${{project.category}}</span>
                </div>
            `;
            galleryGrid2.appendChild(item);
        }});
    }}

    // Abrir Lightbox
    function openLightbox2(project) {{
        lbImg2.src = `fotos/${{project.file}}`;
        lbTitle2.innerText = project.title;
        lbCategory2.innerText = project.category;
        lbDesc2.innerText = project.desc;
        
        // Limpar e preencher lista técnica
        lbTech2.innerHTML = '';
        project.tech.forEach(t => {{
            const li = document.createElement('li');
            li.innerText = `• ${{t}}`;
            lbTech2.appendChild(li);
        }});

        lightbox2.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Travar scroll do fundo
        currentZoom2 = 1;
        lbImg2.style.transform = `scale(${{currentZoom2}})`;
    }}

    // Fechar Lightbox
    function closeLightbox2() {{
        lightbox2.style.display = 'none';
        document.body.style.overflow = 'auto';
        lbImg2.src = '';
    }}

    // Controles do Lightbox
    document.getElementById('lb-close-2').onclick = closeLightbox2;
    
    // Fechar ao clicar fora da imagem
    lightbox2.onclick = (e) => {{
        if(e.target === lightbox2 || e.target.classList.contains('lb-image-container')) closeLightbox2();
    }}

    // Zoom Controls
    document.getElementById('lb-zoom-in-2').onclick = () => {{
        if(currentZoom2 < 3) {{ currentZoom2 += 0.5; updateZoom2(); }}
    }};
    document.getElementById('lb-zoom-out-2').onclick = () => {{
        if(currentZoom2 > 0.5) {{ currentZoom2 -= 0.5; updateZoom2(); }}
    }};
    document.getElementById('lb-reset-2').onclick = () => {{
        currentZoom2 = 1; updateZoom2();
    }};

    function updateZoom2() {{
        lbImg2.style.transform = `scale(${{currentZoom2}})`;
        lbImg2.style.cursor = currentZoom2 > 1 ? 'grab' : 'zoom-in';
    }}

    // Download
    document.getElementById('lb-download-2').onclick = () => {{
        const link = document.createElement('a');
        link.href = lbImg2.src;
        link.download = lbTitle2.innerText.replace(/\s+/g, '_') + '.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }};

    // Fullscreen
    document.getElementById('lb-fullscreen-2').onclick = () => {{
        if (!document.fullscreenElement) {{
            lightbox2.requestFullscreen().catch(err => {{
                alert(`Erro ao tentar tela cheia: ${{err.message}}`);
            }});
        }} else {{
            document.exitFullscreen();
        }}
    }};

    // Filtros
    document.querySelectorAll('#vyra-gallery-section .filter-btn').forEach(btn => {{
        btn.addEventListener('click', () => {{
            document.querySelectorAll('#vyra-gallery-section .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGallery2(btn.dataset.filter);
        }});
    }});

    // Simulação de Upload
    function simulateUpload(input) {{
        if (input.files && input.files[0]) {{
            const reader = new FileReader();
            reader.onload = function(e) {{
                alert("✅ Arquivo recebido pelo sistema VYRA! (Simulação visual apenas)");
                const newProject = {{ 
                    id: Date.now(), 
                    file: e.target.result, 
                    title: input.files[0].name, 
                    category: "interior", 
                    desc: "Projeto enviado pelo usuário.", 
                    tech: ["Upload"] 
                }};
                
                // create the image element manually as data uri is too long to put in vyraProjects array as a filename simply.
                // Or we handle it by adding to the DOM directly:
                const item = document.createElement('div');
                item.className = 'gallery-item-2';
                item.onclick = () => openLightbox2({{...newProject, file: ''}}); // the click won't perfectly work with data url as `fotos/${{file}}`, so we inject directly
                
                item.innerHTML = `
                    <img src="${{e.target.result}}" alt="${{newProject.title}}">
                    <div class="item-overlay-2">
                        <h3 class="item-title-2">${{newProject.title}}</h3>
                        <span class="item-cat-2">${{newProject.category}}</span>
                    </div>
                `;
                item.onclick = () => {{
                    lbImg2.src = e.target.result;
                    lbTitle2.innerText = newProject.title;
                    lbCategory2.innerText = newProject.category;
                    lbDesc2.innerText = newProject.desc;
                    lbTech2.innerHTML = '<li>• Upload</li>';
                    lightbox2.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    currentZoom2 = 1;
                    lbImg2.style.transform = `scale(${{currentZoom2}})`;
                }};
                galleryGrid2.prepend(item);
            }}
            reader.readAsDataURL(input.files[0]);
        }}
    }}

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {{
        renderGallery2();
    }});

</script>
"""

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "    </div>\n  </div>\n  <script src=\"bg-canvas.js\"></script>\n</body>\n\n</html>"

if target in content:
    new_content = content.replace(target, new_section + "\n" + target)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Sucesso!")
else:
    print("Target content not found!")
    # Try another target just in case
    target2 = "    </div>\n  </div>\n  <script src=\"bg-canvas.js\"></script>\n</body>"
    if target2 in content:
        new_content = content.replace(target2, new_section + "\n" + target2)
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Sucesso!")
    else:
        print("Could not locate injection point")

