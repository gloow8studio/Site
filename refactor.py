import os
import re

files = ['pota.html', 'sulfi.html', 'phos.html', 'carbo.html', 'hydro.html', 'oxyn.html', 'yttra.html', 'nitra.html']

intros = {
    'hydro.html': 'Esta nação é composta por vastos oceanos e mares globais que circundam o cinturão central de NOA, onde a vida prospera em suas profundezas azuis. Os habitantes da Nação Hydrogen são conhecidos por sua conexão profunda com a água, suas metrópoles submarinas hidrodinâmicas e suas habilidades avançadas na manipulação e fusão de elementos aquáticos para geração de energia limpa.',
    'carbo.html': 'Com florestas exuberantes de vegetação densa e vastas planícies, a Nação Carbon é o coração da vida orgânica estrutural em NOA. Seus habitantes são mestres em engenharia de supermateriais, agricultura de alta densidade e biotecnologia, utilizando o solo fértil e os recursos naturais baseados em grafeno e nanotubos para sustentar a infraestrutura do planeta.',
    'oxyn.html': 'Habitando a estratosfera, as zonas de alta altitude sobre a Linha do Equador e impressionantes continentes flutuantes suspensos por anomalias magnéticas, esta nação domina os céus. Caracterizada por uma atmosfera perfeitamente rica em oxigênio, os habitantes de Oxyn dominaram a arte da aviação e da engenharia aeroespacial, sendo mundialmente conhecidos por sua habilidade em controlar as correntes de ar e o clima do satélite.',
    'nitra.html': 'Localizada no extremo norte absoluto, sob o brilho eterno e as noites azuis da estrela Nerak, esta nação enfrenta vastas geleiras e paisagens criogênicas desafiadoras. Os habitantes de Nitra são extremamente resilientes; adaptaram-se ao frio congelante através de biologia avançada, utilizando um soro extraído de uma montanha radioativa azul (um fragmento caído da estrela Nerak) injetado diretamente no sangue para alcançar imunidade ao congelamento celular.',
    'phos.html': 'Localizada no extremo sul profundo, esta nação é um ecossistema hostil, vulcânico e jurássico, povoado por dinossauros massivos e dragões titânicos. Aqui ocorre um fenômeno climático extremo: ventos ciclônicos hipervelozes levantam a poeira do solo rica em óxido de ferro em larga escala para a atmosfera. Seus habitantes são mestres na manipulação do calor, na alquimia e na metalurgia pesada.',
    'sulfi.html': 'Fronteiriça ao sul vulcânico, a Nação Sulfur é caracterizada por vastas regiões de pântanos térmicos, névoas ácidas e lagos de enxofre borbulhante. Sendo um lugar perigoso e visualmente desolado em tons de amarelo-ácido, seus habitantes desenvolveram trajes bioarquitetônicos isolantes e imunidades celulares severas a toxinas e venenos, tornando-se peritos em engenharia química e sobrevivência nos ambientes mais corrosivos de NOA.',
    'pota.html': 'Esta nação está estrategicamente posicionada sobre os pontos de maior fricção eletromagnética causados pela atração do gigante gasoso Nohak. Os habitantes de Pota dominam a eletricidade e a tecnologia de energia renovável, utilizando tempestades magnéticas e correntes iônicas para alimentar suas redes globais e criar dispositivos elétricos avançados.',
    'yttra.html': 'Com cidades futurísticas espelhadas e pirâmides de silicato que brilham na escuridão, a Nação Yttrium é o centro da tecnologia de ponta e da pesquisa científica pura em NOA. Seus habitantes são mestres em física quântica, computação avançada e óptica, desenvolvendo tecnologias de blindagem, lasers de alta frequência e holografia que servem como a última linha de defesa tecnológica do satélite.'
}

css_addition = '''
    /* Encyclopedia & Scroll Reveal */
    .wiki-section {
      background: rgba(10, 10, 15, 0.6);
      border: 1px solid rgba(var(--nat-rgb), 0.2);
      border-radius: 15px;
      padding: 40px;
      margin-bottom: 40px;
      backdrop-filter: blur(10px);
    }
    
    .wiki-title {
      font-family: 'Cinzel', serif;
      font-size: 2.2rem;
      color: var(--nat-color);
      margin-top: 0;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      text-shadow: 0 0 10px rgba(var(--nat-rgb), 0.5);
    }
    
    .wiki-text {
      font-size: 1.15rem;
      line-height: 1.8;
      color: #b0b5bc;
      margin: 0;
    }

    /* Scroll Reveal Classes */
    .reveal-3d {
      opacity: 0;
      transform: translateY(50px) rotateX(-10deg);
      transition: all 1s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .reveal-3d.active {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  </style>
'''

js_addition = '''
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.1 });
      
      document.querySelectorAll('.reveal-3d').forEach(el => observer.observe(el));
    });
  </script>
</body>
'''

for f in files:
    path = os.path.join(r'c:\Users\luisc\Downloads\Site3D AnimaMotion', f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Inject CSS before </style>
    if '/* Encyclopedia & Scroll Reveal */' not in content:
        content = content.replace('  </style>', css_addition)
    
    # Extract header and monster profile
    header_match = re.search(r'<div class="header-3d.*?">.*?</div>', content, re.DOTALL)
    monster_match = re.search(r'<div class="monster-profile">.*?</div>\s*</div>\s*</div>', content, re.DOTALL)
    if not monster_match:
        # Fallback regex if the div structure is slightly different
        monster_match = re.search(r'<div class="monster-profile">.*?(?=\s*</div>\s*</body>)', content, re.DOTALL)
        
    if header_match and monster_match:
        header = header_match.group(0)
        if 'reveal-3d' not in header:
            header = header.replace('class="header-3d"', 'class="header-3d reveal-3d"')
        monster = monster_match.group(0)
        
        # Remove trailing divs that belong to container closure in the match
        monster = re.sub(r'</div>\s*</div>\s*$', '</div>', monster)
        
        intro = intros.get(f, '')
        
        new_container = f'''<div class="container">
    {header}

    <!-- Intro -->
    <div class="wiki-section reveal-3d">
      <h3 class="wiki-title"><i class="fas fa-globe"></i> Visão Geral</h3>
      <p class="wiki-text">{intro}</p>
    </div>

    <!-- Geography -->
    <div class="wiki-section reveal-3d">
      <h3 class="wiki-title"><i class="fas fa-mountain"></i> Geografia e Relevo</h3>
      <p class="wiki-text">Conteúdo enciclopédico sobre a geografia será adicionado aqui.</p>
    </div>

    <!-- Cities -->
    <div class="wiki-section reveal-3d">
      <h3 class="wiki-title"><i class="fas fa-city"></i> Cidades e Arquitetura</h3>
      <p class="wiki-text">Conteúdo enciclopédico sobre as metrópoles será adicionado aqui.</p>
    </div>

    <!-- Inhabitants -->
    <div class="wiki-section reveal-3d">
      <h3 class="wiki-title"><i class="fas fa-users"></i> Habitantes e Sociedade</h3>
      <p class="wiki-text">Conteúdo enciclopédico sobre a sociedade será adicionado aqui.</p>
    </div>

    <!-- Technology -->
    <div class="wiki-section reveal-3d">
      <h3 class="wiki-title"><i class="fas fa-microchip"></i> Tecnologia e Ciência</h3>
      <p class="wiki-text">Conteúdo enciclopédico sobre os avanços tecnológicos será adicionado aqui.</p>
    </div>

    <!-- Culture -->
    <div class="wiki-section reveal-3d">
      <h3 class="wiki-title"><i class="fas fa-praying-hands"></i> Cultura e Religião</h3>
      <p class="wiki-text">Conteúdo enciclopédico sobre cultura, fé e rituais será adicionado aqui.</p>
    </div>

    <!-- Fauna -->
    <div class="wiki-section reveal-3d">
      <h3 class="wiki-title"><i class="fas fa-dragon"></i> Fauna Colossal</h3>
      {monster}
    </div>
  </div>'''

        # Replace container
        content = re.sub(r'<div class="container">.*?</div>\s*</body>', new_container + '\n</body>', content, flags=re.DOTALL)
        
        # Inject JS before </body>
        if '<script>' not in content:
            content = content.replace('</body>', js_addition)
        
        with open(path, 'w', encoding='utf-8') as file:
            file.write(content)
            print(f'Successfully updated {f}')
    else:
        print(f'Failed to parse {f}')
