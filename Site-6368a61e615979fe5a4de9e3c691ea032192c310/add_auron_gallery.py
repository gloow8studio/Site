import os
import re

base_dir = r"c:\Users\luisc\Downloads\Site3D AnimaMotion"
html_path = os.path.join(base_dir, "laranja.html")
fotos_dir = os.path.join(base_dir, "fotos auron")

# Generate the projects array
projects_js = "    const auronProjects = [\n"
id_counter = 1

if os.path.exists(fotos_dir):
    for filename in os.listdir(fotos_dir):
        if filename.endswith((".png", ".jpg", ".jpeg", ".webp")):
            # determine category roughly for architecture
            category = "exterior"
            if "int" in filename.lower() or "interno" in filename.lower():
                category = "interior"
            elif "maq" in filename.lower() or "maquete" in filename.lower():
                category = "maquete"
            
            title = filename.replace('.png', '').replace('.jpg', '').replace('.jpeg', '')
            # Clean up title (remove WhatsApp junk)
            if "WhatsApp Image" in title:
                title = f"Projeto Auron {id_counter}"
            
            # escape quotes
            title = title.replace('"', '\\"')
            filename_escaped = filename.replace('"', '\\"')
            
            projects_js += f"""        {{
            id: {id_counter},
            file: "{filename_escaped}",
            title: "{title}",
            category: "{category}",
            desc: "Render fotorrealista de alta qualidade desenvolvido pelo núcleo AURON ARCHVIZ.",
            tech: ["D5 Render", "SketchUp", "Corona"]
        }},\n"""
            id_counter += 1

projects_js += "    ];\n"

# The new HTML section
new_section = f"""

<!-- ========================================== -->
<!-- SEÇÃO GALERIA AURON - ARCHVIZ PREMIUM      -->
<!-- ========================================== -->
<section id="auron-gallery-section" style="padding: 80px 20px; background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%); position: relative; overflow: visible;">
    
    <!-- Efeitos de Fundo -->
    <div class="hex-grid-bg" style="position: absolute; top:0; left:0; width:100%; height:100%; opacity: 0.05; pointer-events: none; background-image: url('data:image/svg+xml,...');"></div>
    
    <div class="container" style="max-width: 1400px; margin: 0 auto; position: relative; z-index: 2;">
        
        <!-- Cabeçalho da Seção -->
        <div class="section-header" style="text-align: center; margin-bottom: 60px;">
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 3rem; color: #FF6D00; text-shadow: 0 0 20px rgba(255, 109, 0, 0.6); margin-bottom: 10px;">
                AURON <span style="color: #fff;">ARCHIVES</span>
            </h2>
            <p style="font-family: 'Rajdhani', sans-serif; font-size: 1.2rem; color: #ccc; max-width: 700px; margin: 0 auto;">
                Explore a excelência em visualização. Renders de Alto Padrão, Maquetes 3D e Realismo.
                <br><span style="color: #FF8C00; font-size: 0.9rem;">* Scroll down to enter the gallery *</span>
            </p>
            
            <!-- Filtros de Categoria -->
            <div class="gallery-filters" style="margin-top: 30px; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <button class="filter-btn active" data-filter="all" style="background: transparent; border: 1px solid #FF6D00; color: #FF6D00; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">TODOS</button>
                <button class="filter-btn" data-filter="exterior" style="background: transparent; border: 1px solid #555; color: #aaa; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">EXTERIORES</button>
                <button class="filter-btn" data-filter="interior" style="background: transparent; border: 1px solid #555; color: #aaa; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">INTERIORES</button>
                <button class="filter-btn" data-filter="maquete" style="background: transparent; border: 1px solid #555; color: #aaa; padding: 10px 25px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; text-transform: uppercase; transition: 0.3s; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);">MAQUETES</button>
            </div>
        </div>

        <!-- Grid de Imagens (Masonry) -->
        <div id="gallery-grid-2" class="gallery-masonry" style="column-count: 3; column-gap: 20px; position: relative;">
            <!-- As imagens serão injetadas aqui via JavaScript -->
            <div style="text-align: center; grid-column: 1/-1; color: #FF6D00; font-family: 'Orbitron'; padding: 50px;">
                Carregando acervo AURON...
            </div>
        </div>

        <!-- Botão de Upload Simulado -->
        <div style="text-align: center; margin-top: 60px;">
            <label for="auron-upload-2" class="upload-btn-wrapper" style="cursor: pointer;">
                <button style="background: linear-gradient(45deg, #FF8C00, #FF6D00); border: none; padding: 15px 40px; color: #000; font-family: 'Orbitron'; font-weight: bold; font-size: 1rem; clip-path: polygon(5% 0, 100% 0, 95% 100%, 0% 100%); box-shadow: 0 0 15px rgba(255, 109, 0, 0.4); transition: transform 0.2s;" onclick="document.getElementById('auron-upload-2').click()">
                    + ENVIAR RENDER (SIMULADO)
                </button>
                <input type="file" id="auron-upload-2" name="myfile" style="display:none;" accept="image/*" onchange="simulateUpload2(this)" />
            </label>
            <p style="color: #666; font-size: 0.8rem; margin-top: 10px; font-family: 'Rajdhani'">O upload é apenas visual no frontend.</p>
        </div>
    </div>
</section>

<!-- LIGHTBOX MODAL (VISUALIZADOR COMPLETO) -->
<div id="auron-lightbox-2" class="lightbox-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9999; backdrop-filter: blur(10px); transition: opacity 0.3s;">
    
    <!-- Botão Fechar -->
    <button id="lb-close-auron" style="position: absolute; top: 20px; right: 40px; background: none; border: none; color: #FF6D00; font-size: 5rem; cursor: pointer; z-index: 999999; transition: color 0.3s; text-shadow: 0 0 20px rgba(0,0,0,0.8);">&times;</button>

    <div class="lightbox-content" style="display: flex; height: 100%; width: 100%; max-width: 1600px; margin: 0 auto; padding: 20px; box-sizing: border-box;">
        
        <!-- Área da Imagem -->
        <div class="lb-image-container" id="auron-img-container" style="flex: 2; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 8px;">
            <img id="lb-img-auron" src="" alt="Full View" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; transition: transform 0.2s ease; cursor: zoom-in; box-shadow: 0 0 30px rgba(255, 109, 0, 0.2);" />
            
            <!-- Controles Flutuantes da Imagem -->
            <div class="lb-controls" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 15px; background: rgba(0,0,0,0.8); padding: 8px 25px; border-radius: 30px; border: 1px solid #FF6D00;">
                <button id="lb-zoom-in-auron" title="Zoom In" style="background: none; border: none; color: #FF6D00; font-size: 1.8rem; cursor: pointer; display: flex; align-items: center; padding: 0;">+</button>
                <button id="lb-zoom-out-auron" title="Zoom Out" style="background: none; border: none; color: #FF6D00; font-size: 1.8rem; cursor: pointer; display: flex; align-items: center; padding: 0; margin-top: -3px;">-</button>
                <button id="lb-reset-auron" title="Reset Zoom" style="background: none; border: none; color: #fff; font-size: 0.9rem; cursor: pointer; font-family: 'Rajdhani'; display: flex; align-items: center; padding: 0;">RESET</button>
                <div style="width: 1px; height: 16px; background: #555; margin: 0 5px;"></div>
                <button id="lb-download-auron" title="Download" style="background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; padding: 0;">⬇</button>
                <button id="lb-fullscreen-auron" title="Fullscreen" style="background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; padding: 0;">⛶</button>
            </div>
        </div>

        <!-- Painel de Informações (Conceito) -->
        <div class="lb-info-panel" style="flex: 1; background: rgba(10, 10, 10, 0.8); border-left: 2px solid #FF6D00; padding: 40px; display: flex; flex-direction: column; justify-content: flex-start; color: #fff; overflow-y: auto; min-width: 300px;">
            <h3 id="lb-title-auron" style="font-family: 'Orbitron'; color: #FF6D00; font-size: 2rem; margin-bottom: 10px; text-transform: uppercase; word-break: break-word; line-height: 1.2;">Título do Projeto</h3>
            <span id="lb-category-auron" style="color: #888; font-family: 'Rajdhani'; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; display: block;">Categoria</span>
            
            <div class="info-block" style="margin-bottom: 25px;">
                <h4 style="color: #fff; font-family: 'Rajdhani'; font-size: 1.1rem; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">CONCEITO & DESIGN</h4>
                <p id="lb-desc-auron" style="font-family: 'Rajdhani'; font-size: 1rem; line-height: 1.6; color: #ddd;">Descrição detalhada do projeto...</p>
            </div>

            <div class="info-block" style="margin-bottom: 25px;">
                <h4 style="color: #fff; font-family: 'Rajdhani'; font-size: 1.1rem; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">DETALHES TÉCNICOS</h4>
                <ul id="lb-tech-auron" style="font-family: 'Rajdhani'; font-size: 0.95rem; color: #aaa; list-style: none; padding: 0;">
                    <li>• Software: Photoshop / Blender</li>
                    <li>• Ano: 2024</li>
                </ul>
            </div>

            <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid #333;">
                <p style="font-family: 'Orbitron'; font-size: 0.8rem; color: #FF6D00;">AURON DESIGN SYSTEM</p>
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
        .lb-info-panel {{ flex: none; height: auto; border-left: none; border-top: 2px solid #FF6D00; }}
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
        display: block;
    }}

    .gallery-item-2:hover {{
        border-color: #FF6D00;
        box-shadow: 0 0 20px rgba(255, 109, 0, 0.3);
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
        color: #FF6D00;
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

    /* Fullscreen adjustments */
    .lb-image-container:fullscreen {{
        background-color: #000 !important;
        border-radius: 0 !important;
    }}
    .lb-image-container:-webkit-full-screen {{
        background-color: #000 !important;
        border-radius: 0 !important;
    }}

    /* Botões de Filtro Ativos */
    #auron-gallery-section .filter-btn.active {{
        background: #FF6D00 !important;
        color: #000 !important;
        box-shadow: 0 0 15px rgba(255, 109, 0, 0.5);
    }}
    
    #auron-gallery-section .filter-btn:hover:not(.active) {{
        border-color: #FF6D00 !important;
        color: #FF6D00 !important;
    }}
</style>

<!-- LÓGICA JAVASCRIPT -->
<script>
{projects_js}

    const galleryGridAuron = document.getElementById('gallery-grid-2');
    const lightboxAuron = document.getElementById('auron-lightbox-2');
    
    // Elementos do Lightbox
    const lbImgAuron = document.getElementById('lb-img-auron');
    const lbTitleAuron = document.getElementById('lb-title-auron');
    const lbCategoryAuron = document.getElementById('lb-category-auron');
    const lbDescAuron = document.getElementById('lb-desc-auron');
    const lbTechAuron = document.getElementById('lb-tech-auron');
    
    let currentZoomAuron = 1;

    // Função para Renderizar Galeria
    function renderGalleryAuron(filter = 'all') {{
        galleryGridAuron.innerHTML = '';
        
        const filteredProjects = filter === 'all' 
            ? auronProjects 
            : auronProjects.filter(p => p.category === filter);

        if(filteredProjects.length === 0) {{
            galleryGridAuron.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#666;">Nenhum projeto nesta categoria.</div>';
            return;
        }}

        filteredProjects.forEach(project => {{
            const item = document.createElement('div');
            item.className = 'gallery-item-2';
            item.onclick = () => openLightboxAuron(project);

            // Caminho da imagem
            const imgPath = `fotos auron/${{project.file}}`;

            item.innerHTML = `
                <img src="${{imgPath}}" alt="${{project.title}}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/111/FF6D00?text=Image+Not+Found'">
                <div class="item-overlay-2">
                    <h3 class="item-title-2">${{project.title}}</h3>
                    <span class="item-cat-2">${{project.category}}</span>
                </div>
            `;
            galleryGridAuron.appendChild(item);
        }});
    }}

    // Abrir Lightbox
    function openLightboxAuron(project) {{
        if (project.file) {{
            lbImgAuron.src = `fotos auron/${{project.file}}`;
        }}
        lbTitleAuron.innerText = project.title;
        lbCategoryAuron.innerText = project.category;
        lbDescAuron.innerText = project.desc;
        
        // Limpar e preencher lista técnica
        lbTechAuron.innerHTML = '';
        project.tech.forEach(t => {{
            const li = document.createElement('li');
            li.innerText = `• ${{t}}`;
            lbTechAuron.appendChild(li);
        }});

        lightboxAuron.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        currentZoomAuron = 1;
        lbImgAuron.style.transform = `scale(${{currentZoomAuron}})`;
    }}

    // Fechar Lightbox
    function closeLightboxAuron() {{
        lightboxAuron.style.display = 'none';
        document.body.style.overflow = 'auto';
        lbImgAuron.src = '';
    }}

    // Controles do Lightbox
    document.getElementById('lb-close-auron').onclick = closeLightboxAuron;
    
    // Fechar ao clicar fora da imagem
    lightboxAuron.onclick = (e) => {{
        if(e.target === lightboxAuron || e.target.classList.contains('lb-image-container')) closeLightboxAuron();
    }}

    // Zoom Controls
    document.getElementById('lb-zoom-in-auron').onclick = () => {{
        if(currentZoomAuron < 3) {{ currentZoomAuron += 0.5; updateZoomAuron(); }}
    }};
    document.getElementById('lb-zoom-out-auron').onclick = () => {{
        if(currentZoomAuron > 0.5) {{ currentZoomAuron -= 0.5; updateZoomAuron(); }}
    }};
    document.getElementById('lb-reset-auron').onclick = () => {{
        currentZoomAuron = 1; updateZoomAuron();
    }};

    function updateZoomAuron() {{
        lbImgAuron.style.transform = `scale(${{currentZoomAuron}})`;
        lbImgAuron.style.cursor = currentZoomAuron > 1 ? 'grab' : 'zoom-in';
    }}

    // Download
    document.getElementById('lb-download-auron').onclick = () => {{
        const link = document.createElement('a');
        link.href = lbImgAuron.src;
        link.download = lbTitleAuron.innerText.replace(/\s+/g, '_') + '.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }};

    // Fullscreen
    document.getElementById('lb-fullscreen-auron').onclick = () => {{
        const imgContainer = document.getElementById('auron-img-container');
        if (!document.fullscreenElement) {{
            if (imgContainer.requestFullscreen) {{
                imgContainer.requestFullscreen().catch(err => {{
                    console.error(`Erro ao tentar tela cheia: ${{err.message}}`);
                }});
            }} else if (imgContainer.webkitRequestFullscreen) {{
                imgContainer.webkitRequestFullscreen();
            }}
        }} else {{
            if (document.exitFullscreen) {{
                document.exitFullscreen();
            }} else if (document.webkitExitFullscreen) {{
                document.webkitExitFullscreen();
            }}
        }}
    }};

    // Filtros
    document.querySelectorAll('#auron-gallery-section .filter-btn').forEach(btn => {{
        btn.addEventListener('click', () => {{
            document.querySelectorAll('#auron-gallery-section .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGalleryAuron(btn.dataset.filter);
        }});
    }});

    // Simulação de Upload
    function simulateUpload2(input) {{
        if (input.files && input.files[0]) {{
            const reader = new FileReader();
            reader.onload = function(e) {{
                alert("✅ Arquivo recebido pelo sistema AURON! (Simulação visual apenas)");
                const newProject = {{ 
                    id: Date.now(), 
                    file: e.target.result, 
                    title: input.files[0].name, 
                    category: "exterior", 
                    desc: "Render enviado pelo usuário.", 
                    tech: ["Upload"] 
                }};
                
                const item = document.createElement('div');
                item.className = 'gallery-item-2';
                
                item.innerHTML = `
                    <img src="${{e.target.result}}" alt="${{newProject.title}}">
                    <div class="item-overlay-2">
                        <h3 class="item-title-2">${{newProject.title}}</h3>
                        <span class="item-cat-2">${{newProject.category}}</span>
                    </div>
                `;
                item.onclick = () => {{
                    lbImgAuron.src = e.target.result;
                    lbTitleAuron.innerText = newProject.title;
                    lbCategoryAuron.innerText = newProject.category;
                    lbDescAuron.innerText = newProject.desc;
                    lbTechAuron.innerHTML = '<li>• Upload</li>';
                    lightboxAuron.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    currentZoomAuron = 1;
                    lbImgAuron.style.transform = `scale(${{currentZoomAuron}})`;
                }};
                galleryGridAuron.prepend(item);
            }}
            reader.readAsDataURL(input.files[0]);
        }}
    }}

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {{
        document.body.appendChild(lightboxAuron);
        renderGalleryAuron();
    }});

</script>
"""

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "  </div>\n\n  <script src=\"bg-canvas.js\"></script>"

if target in content:
    new_content = content.replace(target, new_section + "\n" + target)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Sucesso!")
else:
    print("Target content not found!")
