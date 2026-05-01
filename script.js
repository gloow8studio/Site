/* ── FUNDO ANIMADO COM ESTRELAS, NEBULOSAS E METEOROS NO CANVAS ── */
/* 
  Esta função é auto-executável (IIFE - Immediately Invoked Function Expression).
  Ela inicia e gerencia o ambiente visual do espaço no plano de fundo usando HTML5 Canvas, isolando o escopo das variáveis.
*/
(function(){
  const canvas = document.getElementById('canvas'); // Obtém a referência do elemento de tela ("canvas") no HTML.
  const ctx    = canvas.getContext('2d');           // Cria e armazena o contexto 2D que expõe a API para realizar desenhos de formas, cores e linhas.
  let W, H, stars=[], meteors=[], dustClouds=[];    // Variáveis que vão armazenar a largura/altura da tela e os vetores de objetos de animação.

  // Função disparada imediatamente na inicialização e sempre que a janela do navegador mudar de tamanho.
  function resize(){
    W = canvas.width  = window.innerWidth;  // Ajusta a resolução de renderização da largura para a nova dimensão real.
    H = canvas.height = window.innerHeight; // Ajusta a resolução de renderização da altura para a nova dimensão real.
    initScene(); // Após redimensionar, obriga recálculo para reposicionar uniformemente todas as estrelas.
  }

  // Função matemática auxiliar para facilitar e gerar números fluídos pseudo-aleatórios em um limite configurável de A (min) até B (max).
  function rand(a,b){ return a + Math.random()*(b-a); }

  // Função construtora do cenário: Define as coordenadas, velocidades, tamanhos e cores dos objetos na tela do espaço.
  function initScene(){
    // Gera uma matriz com 700 estruturas simulando "estrelas". Cada ponto possui posições, tamanhos e cintilações aleatórias na tela atual.
    stars = Array.from({length:700}, ()=>({
      x: rand(0,W),               // Posição de origem horizontal.
      y: rand(0,H),               // Posição de origem vertical.
      r: rand(.3,1.8),            // Tamanho de raio que define a escala da estrela, algumas muito pequenas, outras bem visíveis.
      a: rand(.3,1),              // Intensidade de brilho base de inicialização.
      twinkle: rand(0.005,0.02),  // O ritmo individual de variação luminosa (piscar).
      phase: rand(0,Math.PI*2)    // Deslocamento trigonométrico da onda temporal da piscada na tela para que não pisquem todas harmonicamente juntas.
    }));

    // Configura 5 nuvens fixas simulando nebulosas (gases cósmicos coloridos) como textura visual sutil sobre o fundo preto.
    dustClouds = [
      {x:W*.12, y:H*.25, rx:W*.28, ry:H*.22, a:0.06, c:'#FF6B35'}, // Coloração Fogo Laranja Avermelhado
      {x:W*.55, y:H*.15, rx:W*.32, ry:H*.18, a:0.05, c:'#6C3DC8'}, // Coloração Galáxia Roxa/Lilás
      {x:W*.8,  y:H*.6,  rx:W*.22, ry:H*.20, a:0.04, c:'#1A6BB5'}, // Coloração Azul Profundo
      {x:W*.3,  y:H*.7,  rx:W*.25, ry:H*.16, a:0.04, c:'#C2185B'}, // Coloração Magenta Escuro
      {x:W*.65, y:H*.45, rx:W*.18, ry:H*.14, a:0.03, c:'#00897B'}, // Coloração Verde Esmeralda Aquática
    ];

    meteors = []; // Inicia vazio o reservatório de meteoros.
  }

  // Insere interativamente no vetor de objetos visuais um novo fragmento que cruza os céus (meteoro).
  function spawnMeteor(){
    meteors.push({
      x: rand(W*.1, W*.9),             // Inicia aleatoriamente partindo da porção superior não escondida da tela horizontalmente.
      y: rand(-20, H*.3),              // Nasce acima ou pouco abaixo das margens superiores do teto do monitor.
      len: rand(80,200),               // Distância e volume de corpo do feixe de rastro luz deixado no caminho.
      speed: rand(6,14),               // O medidor de energia de velocidade que determina quantos pixels percorre por cada refresh rate de tela.
      angle: rand(25,55)*Math.PI/180,  // Restringe a angulação rotacional em declive para dar sensação realista de objeto em queda (em radianos).
      alpha: 1,                        // Nasce brilhando na intensidade máxima.
      fade: rand(.012,.025)            // Velocidade que esmaece, evaporando a transparência em vazio gradualmente.
    });
  }

  let t=0; // Variável temporal que aumenta sequencialmente mantendo um relógio geral usado nos cálculos matemáticos trigonométricos.
  
  // O coração motriz da engine visual. A Função "draw" desenha sobreposições, limpando e atualizando a matriz repetidamente o mais rápido que a máquina permitir, criando 60 frames estáveis por segundo.
  function draw(){
    ctx.clearRect(0,0,W,H); // Apaga as renderizações estáticas da janela inteira eliminando repetições passadas

    // 1. Renderiza a imersão de ambiente escuro (Deep Space background Gradient).
    // Cria um campo de gradiente radial com epicentro diretamente na posição do centro monitor e escala máxima calculada pelas margens.
    const bg = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.8);
    bg.addColorStop(0,  '#06050f'); // Tons ligeiramente escurecidos misturados com azul meia noite que representam luz central espalhada.
    bg.addColorStop(.5, '#030208'); // Transita pro negro
    bg.addColorStop(1,  '#000000'); // Limite absoluto dos pixels preenchendo as telas grandes totalmente com a cor preta profunda do infinito espacial.
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,W,H); // Confirma a submissão para desenhar aquele modelo preenchido de cor até os rodapés finais do canvas.

    // 2. Interage criando as formas gigantes de formato oval de gradiente simulando "Nebulosas" sobrepondo-se aos outros objetos.
    dustClouds.forEach(d=>{
      // Desenha círculos com centro customizado que gradualmente reduzem em opacidade no alcance radial esticado por transições.
      const g = ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,Math.max(d.rx,d.ry));
      g.addColorStop(0, hexAlpha(d.c, d.a));
      g.addColorStop(.5, hexAlpha(d.c, d.a*.4));
      g.addColorStop(1, 'transparent'); // Dissolvência com zero impacto nas bordas
      ctx.save(); // Salva a grade de matriz cartesiana original inalterada
      ctx.scale(d.rx/Math.max(d.rx,d.ry), d.ry/Math.max(d.rx,d.ry)); // Deforma a perspectiva achatando proporcionalmente a área desenhada a partir da relação geométrica RX e RY.
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(d.x*Math.max(d.rx,d.ry)/d.rx, d.y*Math.max(d.rx,d.ry)/d.ry, Math.max(d.rx,d.ry), 0, Math.PI*2);
      ctx.fill(); // Conclui e aplica o preenchimento de cor à nuvem gerada.
      ctx.restore(); // Desfaz a matriz deformada de volta ao padrão inicial e previne problemas geométricos nas operações seguintes de desenho do loop atual.
    });

    // 3. Modifica dados numéricos para recalcular luz em todo corpo da grade de matriz do espaço (as Estrelas brancas).
    t += .016; 
    stars.forEach(s=>{
      // Efetua calculo em cima de uma onda periódica Sine combinando o ritmo customizado da variação e deslocamento harmônico aleatório para determinar opacidade
      const a = s.a * (.6 + .4*Math.sin(t*s.twinkle*60 + s.phase)); 
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); 
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });

    // Possibilidade microscópica probabilística aleatória de sorteio rodando o framework numérico (Chance em 1,8%) de ocorrer uma invocação visual de elemento de fragmentação veloz (Meteoritos caindo)
    if(Math.random()<.018) spawnMeteor();

    // 4. Trabalha computando o esmaecimento do canal alfa, reajustando os eixos cardeais de locomoção e finaliza o desenhar com gradientes imitando a cauda iluminada arrastada do corpo estelar 
    meteors.forEach((m,i)=>{
      // Realoca vetores e refaz eixo X e Y traseiro para montar a linha paralela com base angular do meteoro
      const x2 = m.x - Math.cos(m.angle)*m.len;
      const y2 = m.y - Math.sin(m.angle)*m.len;
      
      const g = ctx.createLinearGradient(m.x,m.y,x2,y2);
      g.addColorStop(0,   `rgba(255,255,255,${m.alpha})`);
      g.addColorStop(.4,  `rgba(180,200,255,${m.alpha*.5})`); // Graduação do esfriamento da cor no fim do rastreio
      g.addColorStop(1,   'transparent');
      
      ctx.beginPath();
      ctx.moveTo(m.x, m.y); // Foca o compasso principal de origem
      ctx.lineTo(x2,  y2);  // Faz caminho de cauda para fora do caminho principal
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Projeta uma direção de translocação e empurra o objeto com somatória sobreposição horizontal (Eixo-x) vertical (Eixo-y) 
      m.x += Math.cos(m.angle)*m.speed;
      m.y += Math.sin(m.angle)*m.speed;
      
      // Realiza o apagamento lento e natural por decremento
      m.alpha -= m.fade;
    });
    
    // Processamento de exclusão: Descarta elementos invisíveis destruindo objetos da lista de itens com a finalidade única de evitar que as variáveis engasguem e provoquem sobrecargas e acúmulos na performance na GPU e uso extremo da CPU em navegação longa prolongada do usuário (Garbage Collection via filter).
    meteors = meteors.filter(m=>m.alpha>0 && m.x<W+200 && m.y<H+200);

    // Registra esse código complexo à rotina agendada da API visual do web-browser, exigindo de forma compulsória ser ativado outra vez o mais imediato logo após o recálculo do hardware do dispositivo, de forma que execute a tarefa infinitamente e exiba as mudanças suavemente repetitivas por atualização contínua no ritmo em Hz do seu monitor 
    requestAnimationFrame(draw);
  }

  // Decodifica representações Hexadecimal tradicionais do sistema (Ex: "#FFB300") dividindo substrings da cadeia numérica combinada e gerando formatação moderna programável com injeção paralela do valor Alpha para obter um controle da variação de luminosidade ("rgba()").
  function hexAlpha(hex, a){
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // Prende ao escutador visualizador global que informa as propriedades geométricas estruturais. Toda vez que o Viewport for transformado por interação humana, ativamos o alinhamento
  window.addEventListener('resize', resize);
  resize(); // Realiza injeção preliminar da ordem das matrizes do código acima
  draw();   // Destrava formalmente a trava das chamadas e permite desenhar visualmente a dinâmica do sistema na tela do usuário final.
})();

/* ── REDE NEURAL DOS CARTÕES: Motor Gerador de Conexões de Linhas Gráficas baseadas na disposição e distâncias do DOM ── */
/* 
  Esta segunda função independente automatiza as leituras vetoriais conectivas para traçar organicamente as "teias" na página.
*/
(function(){
  const cards  = document.querySelectorAll('.hex-card');
  const svg    = document.getElementById('neural');
  const panel  = document.getElementById('panel');
  if (!svg || !panel || cards.length === 0) return;
  const colors = ['#FFB300','#1E88E5','#00E5FF','#00C853','#AA00FF','#FF6D00','#FF1744']; // Repositório indexado restrito que mapeia na ordem sequencial fiel exatamente as cores aplicadas pelo arquivo CSS de modo unificado e espelhado para desenhar corretamente cada conexão sem destoamento da cor base dos logotipos SVG originais inseridos pelo design

  // Analisa iterativamente as posições no layout de todos elementos
  function buildNeural(){
    svg.innerHTML = ''; // Aborta/Esconde instâncias gráficas criadas previamentes para uma reconstrução total
    const pr = panel.getBoundingClientRect(); // Computa informações detalhadas dinâmicas relativas como espaçamento do Viewport limitador no eixo horizontal x e vertical y 
    
    // Escaneia iterativamente pelo DOM extraindo a real e objetiva posição dos nodos interligados pela engine baseando-se no espaço físico e o limite do painel com margem aplicada
    const centers = Array.from(cards).map(c=>{
      const r = c.getBoundingClientRect(); // Capta e absorve as diretrizes dos eixos de posição
      // Formula matematicamente a coordenada horizontal exatamente ao meado geométrico relativo do cartão descontando posicionamentos anômalos. Para vertical faz descer um offset +80
      return { x: r.left-pr.left+r.width/2, y: r.top-pr.top+80 }; 
    });

    // Estabelece estruturalmente uma linha mestra de fiação visual horizontal contínua de um elo central interligando as sub-arquiteturas, cruzando toda a área como se fosse a espinha dorsal biológica primária
    const spineY = centers[0].y + 30; // Instala um posicionamento na dimensão do eixo "Y" cerca de +30 posições em relação a referência primária e distribui linear
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', centers[0].x); line.setAttribute('y1', spineY); // Baseia a origem de início a coordenada de X do item "zero" inicial
    line.setAttribute('x2', centers[6].x); line.setAttribute('y2', spineY); // Lança o arranjo pro final interceptando a posição X terminal
    line.setAttribute('stroke','rgba(255,255,255,.06)'); // Colore com tom de opacidade espectral levemente prateado brilhante mas translúcido a ponto de não confundir o peso vetorial no projeto principal de foco
    line.setAttribute('stroke-width','1');               // Mantém traços orgânicos finos limpos sem ruídos
    line.setAttribute('stroke-dasharray','6 8');         // Define e configura ritmos alternados para compor grafismo de fiação estilo ciberespaço pontilhada/travejada que denota fluxos tecnológicos elétricos
    svg.appendChild(line);

    // Faz um processo minucioso (loop) extraindo de um por um os cartões registrados computados para traçar artifícios secundários unindo vertical e transversal o corpo flutuante na fiação conectiva da espinha mestra criada recém.
    centers.forEach((c,i)=>{
      // Constrói e ergue fiação visual de gotejamento de linha vertical entre a raiz do Hexágono diretamente interceptada numa união perpendicular contra as espinhas primárias do eixo "X" inferior
      const v = document.createElementNS('http://www.w3.org/2000/svg','line');
      v.setAttribute('x1',c.x); v.setAttribute('y1',c.y+2);
      v.setAttribute('x2',c.x); v.setAttribute('y2',spineY);
      v.setAttribute('stroke',colors[i]); // Invoca a paleta programada indexada herdando com exatidão sua classe correspondente de identidade visual original do CSS do tema de design da agência 
      v.setAttribute('stroke-width','1');
      v.setAttribute('opacity','.18');
      svg.appendChild(v);

      // Traça laços vetoriais em interconectividade diagonal com componentes "Gêmeos" irmãos do logaritmo (do item N liga no componente N+1 de hierarquia à direita de posições). Protegendo matematicamente de estourar do Array quando se chega no limite (i < 6)
      if(i<6){
        const next = centers[i+1];
        const d = document.createElementNS('http://www.w3.org/2000/svg','line');
        d.setAttribute('x1',c.x); d.setAttribute('y1',c.y);
        d.setAttribute('x2',next.x); d.setAttribute('y2',next.y);
        d.setAttribute('stroke',`url(#lg${i})`);     // Aponta a referencia a pintar traços na cor baseada no elemento gerado unicamente de matrizes gradientes mescladas descritas na declaração defs da árvore do DOM que configuraremos depois disso e injeta nas regras desse path com o mesmo ID
        d.setAttribute('stroke-width','1');
        d.setAttribute('stroke-dasharray','3 5');    // Efeito pontilhismo tecnológico de rastros
        d.setAttribute('opacity','.22');

        // Cria a parte dinâmica da definição e registro baseada no SVG DOM (DEFS) para registrar globalmente referências dinâmicas no cache interno do renderizador SVG misturando a transição base inicial da matriz A para gradualmente transmutar na pigmentação respectiva local presente da cartela da matriz geométrica B aterrissada em index +1 com objetivo claro de prover harmonia na passagem visual das "linhas".
        const defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg','defs'), svg.firstChild);
        const lg   = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
        lg.setAttribute('id',`lg${i}`);
        lg.setAttribute('gradientUnits','userSpaceOnUse'); // Informa para a API tratar as distâncias considerando os eixos numéricos X, Y gerais e não relativos restritos aos shapes da modelagem padrão do navegador 
        lg.setAttribute('x1',c.x); lg.setAttribute('y1',c.y); // Set point de partida para mesclar a transição gradiente linear de tons de pigmento na geometria analítica.
        lg.setAttribute('x2',next.x); lg.setAttribute('y2',next.y);
        
        // Cadastra os metadados finais injetando os pontos de parada e valores RGB de tinta para transmutar. Origem no índice iterativo atual na posição de 0% da extensão vetorial (Offset)  
        const s1 = document.createElementNS('http://www.w3.org/2000/svg','stop');
        s1.setAttribute('offset','0%'); s1.setAttribute('stop-color',colors[i]);
        
        // Destino termina aos 100% encravados na cor matriz principal de tema identificador original provindo de listagem na classe base herdada referenciado pelo Index adjunto "i+1"
        const s2 = document.createElementNS('http://www.w3.org/2000/svg','stop');
        s2.setAttribute('offset','100%'); s2.setAttribute('stop-color',colors[i+1]);
        
        lg.appendChild(s1); lg.appendChild(s2); defs.appendChild(lg); 
        svg.appendChild(d); 
      }

      // Projeta geometricamente decorações extras (Nós da Rede) modelando esferas microscópicas injetadas rigidamente na linha para transcrever "Roteadores" da teia, dando profundidade ao layout Sci-Fi 
      const dot = document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot.setAttribute('cx',c.x); dot.setAttribute('cy',spineY);
      dot.setAttribute('r','2.5'); // Define esteticamente proporções volumétricas visuais limpas ao nó para não se sobresair no gráfico principal 
      dot.setAttribute('fill',colors[i]);
      dot.setAttribute('opacity','.5');
      svg.appendChild(dot);
    });
  }

  // Provê retardo sistemático preventivo (Delay / Buffer limitador) de 100 milissegundos evitando rodar cálculos visuais durante o momento que a CPU ainda está efetuando ajustes massivos dinâmicos do layout padrão nativo da janela e instanciar posições de fontes importadas, forçando renderizar e interligar a matriz com precisão impecável após finalizar processamento bruto HTML de DOM original do painel 
  setTimeout(buildNeural, 100);
  
  // Destina escuta (Listener assíncrono passivo) focado ao engajamento constante nas deturpações contínuas de telas dos aparelhos clientes. Se a pessoa re-dimensionar uma tela horizontal arrastando no navegador, destruímos, reposicionamos vetorial e reconstruímos a fiação e arquitetura de traçagem imediatamente para consertar erros provindos do recálculo CSS.
  window.addEventListener('resize', ()=>setTimeout(buildNeural,100));
})();
