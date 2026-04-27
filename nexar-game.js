
/* ═══════════════════════════════════════════════════
   NEXAR WING FIGHTER — Arcade Space Shooter
   © Hex Agency — AnimaMotion Studio
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── DOM references ──────────────────────────────
  const section  = document.getElementById('nexar-game-section');
  const canvas   = document.getElementById('game-canvas');
  const ctx      = canvas.getContext('2d');
  const ctrlBtn  = document.getElementById('btn-nave-control');
  const startBtn = document.getElementById('btn-start-game');
  const overlay  = document.getElementById('game-overlay');
  const scoreEl  = document.getElementById('hud-score');
  const livesEl  = document.getElementById('hud-lives');
  const energyEl = document.getElementById('hud-energy');
  const waveEl   = document.getElementById('hud-wave');
  const bossBar  = document.getElementById('boss-bar');
  const bossHpEl = document.getElementById('boss-hp');
  const powerEl  = document.getElementById('hud-power');
  const msgEl    = document.getElementById('game-msg');

  // ── State ────────────────────────────────────────
  let W, H, running = false, mouseControl = false;
  let mx = 0, my = 0; // mouse pos relative to canvas
  let score = 0, lives = 3, wave = 1;
  let energy = 100, maxEnergy = 100;
  let powerMode = 'SINGLE'; // SINGLE | DOUBLE | TRIPLE | LASER | MISSILE
  let powerTimer = 0;
  let frameCount = 0;
  let lastTime = 0;
  let gameOver = false;
  let paused = false;
  let bossActive = false;
  let bossMaxHp = 0;
  let particles = [];
  let stars = [];
  let asteroids = [];
  let bullets = [];
  let bonuses = [];
  let enemyBullets = [];
  let boss = null;
  let autoShootTimer = 0;
  let shipImg = new Image();
  shipImg.src = 'nave_nexar_webp.webp';

  // ── Ship ─────────────────────────────────────────
  const ship = {
    x: 0, y: 0, w: 70, h: 70,
    speed: 6, invincible: 0,
    trail: []
  };

  // ── Resize ───────────────────────────────────────
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.min(rect.width, 900);
    H = canvas.height = 520;
    ship.x = W / 2;
    ship.y = H - 100;
    initStars();
  }

  function initStars() {
    stars = Array.from({ length: 180 }, () => ({
      x: rnd(0, W), y: rnd(0, H),
      r: rnd(0.3, 1.6), a: rnd(0.3, 1),
      speed: rnd(0.4, 2.2)
    }));
  }

  // ── Utilities ────────────────────────────────────
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function rndInt(a, b) { return Math.floor(rnd(a, b + 1)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function showMsg(txt, duration = 1800) {
    msgEl.textContent = txt;
    msgEl.style.opacity = '1';
    clearTimeout(showMsg._t);
    showMsg._t = setTimeout(() => { msgEl.style.opacity = '0'; }, duration);
  }

  // ── Spawn asteroid ───────────────────────────────
  function spawnAsteroid() {
    const sz = rnd(18, 58);
    const speed = rnd(1.2, 2.8 + wave * 0.3);
    asteroids.push({
      x: rnd(sz, W - sz), y: -sz,
      r: sz, speed, rot: 0,
      rotSpeed: rnd(-0.03, 0.03),
      hp: Math.ceil(sz / 14),
      maxHp: Math.ceil(sz / 14),
      vx: rnd(-0.6, 0.6),
      color: `hsl(${rndInt(10,30)},${rndInt(40,70)}%,${rndInt(25,45)}%)`
    });
  }

  // ── Bonus types ──────────────────────────────────
  const BONUS_TYPES = [
    { type: 'life',    label: '❤️',  color: '#FF4466', desc: '+VIDA' },
    { type: 'energy',  label: '⚡',  color: '#FFD700', desc: '+ENERGIA' },
    { type: 'double',  label: '💥',  color: '#00CFFF', desc: 'TIRO DUPLO' },
    { type: 'triple',  label: '🔱',  color: '#AA44FF', desc: 'TIRO TRIPLO' },
    { type: 'laser',   label: '🔆',  color: '#FF6600', desc: 'LASER' },
    { type: 'missile', label: '🚀',  color: '#44FF88', desc: 'MÍSSIL' },
    { type: 'shield',  label: '🛡️',  color: '#88AAFF', desc: 'ESCUDO 5s' },
  ];

  function spawnBonus(x, y) {
    if (Math.random() > 0.3) return;
    const t = BONUS_TYPES[rndInt(0, BONUS_TYPES.length - 1)];
    bonuses.push({
      x, y, r: 18,
      speed: rnd(0.8, 1.6),
      ...t,
      pulse: 0, life: 1
    });
  }

  // ── Shoot ────────────────────────────────────────
  function shoot() {
    const bx = ship.x, by = ship.y - ship.h / 2;
    const base = { x: bx, y: by, speed: 13, w: 4, h: 18, dmg: 1, laser: false };
    if (powerMode === 'SINGLE') {
      bullets.push({ ...base });
    } else if (powerMode === 'DOUBLE') {
      bullets.push({ ...base, x: bx - 14 });
      bullets.push({ ...base, x: bx + 14 });
    } else if (powerMode === 'TRIPLE') {
      bullets.push({ ...base, x: bx - 18, vx: -1.5 });
      bullets.push({ ...base });
      bullets.push({ ...base, x: bx + 18, vx: 1.5 });
    } else if (powerMode === 'LASER') {
      bullets.push({ ...base, w: 6, h: 30, dmg: 2, laser: true, color: '#FF6600' });
    } else if (powerMode === 'MISSILE') {
      bullets.push({ ...base, w: 8, h: 20, dmg: 3, color: '#44FF88', missile: true });
    }
  }

  // ── Enemy bullet ─────────────────────────────────
  function spawnEnemyBullet(x, y) {
    enemyBullets.push({ x, y, speed: 3.5 + wave * 0.2, r: 5 });
  }

  // ── Boss ─────────────────────────────────────────
  function spawnBoss() {
    bossActive = true;
    bossMaxHp = 40 + wave * 20;
    boss = {
      x: W / 2, y: 80, w: 120, h: 80,
      hp: bossMaxHp, speed: 1.4 + wave * 0.15,
      dir: 1, shootTimer: 0,
      phase: 0
    };
    bossBar.style.display = 'flex';
    showMsg(`⚠️ BOSS WAVE ${wave}!`, 2500);
  }

  // ── Particle ─────────────────────────────────────
  function explode(x, y, color = '#FF4400', count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(1, 5);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: rnd(2, 6), life: 1,
        fade: rnd(0.02, 0.05),
        color
      });
    }
  }

  // ── HUD update ───────────────────────────────────
  function updateHUD() {
    scoreEl.textContent = score.toString().padStart(6, '0');
    livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
    waveEl.textContent  = wave;
    powerEl.textContent = powerMode;
    energy = clamp(energy, 0, maxEnergy);
    const pct = (energy / maxEnergy) * 100;
    energyEl.style.width = pct + '%';
    energyEl.style.background = pct > 50 ? '#00CFFF' : pct > 25 ? '#FFD700' : '#FF1744';
    if (bossActive && boss) {
      bossHpEl.style.width = ((boss.hp / bossMaxHp) * 100) + '%';
    }
  }

  // ── Apply bonus ──────────────────────────────────
  function applyBonus(b) {
    showMsg(b.desc, 1500);
    explode(b.x, b.y, b.color, 24);
    if (b.type === 'life')    { lives = Math.min(lives + 1, 5); }
    if (b.type === 'energy')  { energy = Math.min(energy + 40, maxEnergy); }
    if (b.type === 'shield')  { ship.invincible = 300; showMsg('🛡️ ESCUDO ATIVADO!', 1500); }
    if (['double','triple','laser','missile'].includes(b.type)) {
      powerMode = b.type.toUpperCase();
      powerTimer = 600;
    }
  }

  // ── Main update ──────────────────────────────────
  function update(dt) {
    if (!running || paused || gameOver) return;
    frameCount++;

    // ── Auto-shoot
    autoShootTimer++;
    const shootRate = powerMode === 'LASER' ? 4 : powerMode === 'MISSILE' ? 18 : 8;
    if (autoShootTimer >= shootRate) { shoot(); autoShootTimer = 0; }

    // ── Power timer
    if (powerTimer > 0) {
      powerTimer--;
      if (powerTimer <= 0) { powerMode = 'SINGLE'; showMsg('Tiro simples', 1000); }
    }

    // ── Energy regen
    energy = Math.min(energy + 0.08, maxEnergy);

    // ── Ship invincibility
    if (ship.invincible > 0) ship.invincible--;

    // ── Mouse → ship
    if (mouseControl) {
      const rect = canvas.getBoundingClientRect();
      const tx = clamp(mx, ship.w / 2, W - ship.w / 2);
      const ty = clamp(my, ship.h / 2, H - ship.h / 2);
      ship.x += (tx - ship.x) * 0.12;
      ship.y += (ty - ship.y) * 0.12;
    }

    // ── Ship trail
    ship.trail.unshift({ x: ship.x, y: ship.y });
    if (ship.trail.length > 12) ship.trail.pop();

    // ── Asteroid spawn
    const spawnRate = Math.max(28 - wave * 2, 10);
    if (frameCount % spawnRate === 0) spawnAsteroid();

    // ── Wave progression
    if (frameCount % 900 === 0 && !bossActive) {
      wave++;
      showMsg(`🌊 WAVE ${wave}`, 1800);
    }
    if (frameCount % 1800 === 0 && !bossActive) spawnBoss();

    // ── Stars scroll
    stars.forEach(s => {
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = rnd(0, W); }
    });

    // ── Bullets move
    bullets = bullets.filter(b => b.y > -40);
    bullets.forEach(b => {
      b.y -= b.speed;
      if (b.vx) b.x += b.vx;
    });

    // ── Enemy bullets move
    enemyBullets = enemyBullets.filter(b => b.y < H + 20);
    enemyBullets.forEach(b => { b.y += b.speed; });

    // ── Asteroids move + rotate
    asteroids.forEach(a => {
      a.y += a.speed;
      a.x += a.vx;
      a.rot += a.rotSpeed;
    });
    asteroids = asteroids.filter(a => a.y < H + 80);

    // ── Bonuses move
    bonuses.forEach(b => { b.y += b.speed; b.pulse += 0.08; });
    bonuses = bonuses.filter(b => b.y < H + 40);

    // ── Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.08;
      p.life -= p.fade;
      p.r *= 0.96;
    });
    particles = particles.filter(p => p.life > 0 && p.r > 0.3);

    // ── Boss logic
    if (bossActive && boss) {
      boss.x += boss.speed * boss.dir;
      if (boss.x > W - 80 || boss.x < 80) boss.dir *= -1;
      boss.shootTimer++;
      const bossShootRate = Math.max(60 - wave * 5, 20);
      if (boss.shootTimer >= bossShootRate) {
        boss.shootTimer = 0;
        spawnEnemyBullet(boss.x - 20, boss.y + boss.h);
        spawnEnemyBullet(boss.x, boss.y + boss.h);
        spawnEnemyBullet(boss.x + 20, boss.y + boss.h);
      }
    }

    // ── Collisions: bullets → asteroids
    bullets.forEach(bl => {
      asteroids.forEach(a => {
        if (dist(bl, a) < a.r + 6) {
          bl.y = -999;
          a.hp -= bl.dmg;
          explode(bl.x, bl.y, '#FF8800', 6);
          if (a.hp <= 0) {
            score += Math.floor(a.r * 2);
            explode(a.x, a.y, '#FF4400', 20);
            spawnBonus(a.x, a.y);
            a.r = -1;
          }
        }
      });
    });
    asteroids = asteroids.filter(a => a.r > 0);

    // ── Collisions: bullets → boss
    if (bossActive && boss) {
      bullets.forEach(bl => {
        if (Math.abs(bl.x - boss.x) < boss.w / 2 && bl.y < boss.y + boss.h && bl.y > boss.y - 10) {
          bl.y = -999;
          boss.hp -= bl.dmg;
          explode(bl.x, bl.y, '#FFAA00', 8);
          if (boss.hp <= 0) {
            score += 500 * wave;
            explode(boss.x, boss.y, '#FF4400', 50);
            spawnBonus(boss.x, boss.y);
            spawnBonus(boss.x + 40, boss.y);
            boss = null;
            bossActive = false;
            bossBar.style.display = 'none';
            showMsg(`🏆 BOSS DESTRUÍDO! +${500 * wave} pts`, 2500);
          }
        }
      });
    }

    // ── Collisions: ship → asteroids
    if (ship.invincible <= 0) {
      asteroids.forEach(a => {
        if (dist(ship, a) < a.r + 20) {
          a.hp = 0; a.r = -1;
          takeDamage(35);
          explode(a.x, a.y, '#FF4400', 16);
        }
      });
      asteroids = asteroids.filter(a => a.r > 0);

      // ── Ship → enemy bullets
      enemyBullets.forEach(b => {
        if (dist(ship, b) < 22) {
          b.y = H + 99;
          takeDamage(20);
        }
      });
    }

    // ── Ship → bonuses
    bonuses.forEach(b => {
      if (dist(ship, b) < b.r + 22) {
        applyBonus(b);
        b.r = -1;
      }
    });
    bonuses = bonuses.filter(b => b.r > 0);

    updateHUD();
  }

  function takeDamage(dmg) {
    if (ship.invincible > 0) return;
    energy -= dmg;
    explode(ship.x, ship.y, '#FF1744', 12);
    ship.invincible = 90;
    if (energy <= 0) {
      energy = 0;
      lives--;
      if (lives <= 0) {
        doGameOver();
      } else {
        energy = maxEnergy;
        showMsg(`💔 VIDA PERDIDA! ${lives} restante(s)`, 2000);
      }
    }
  }

  function doGameOver() {
    gameOver = true;
    running  = false;
    overlay.innerHTML = `
      <div class="go-inner">
        <div class="go-title">GAME OVER</div>
        <div class="go-score">SCORE: ${score.toString().padStart(6,'0')}</div>
        <div class="go-wave">WAVE: ${wave}</div>
        <button id="btn-restart" class="game-btn primary">↺ JOGAR NOVAMENTE</button>
      </div>`;
    overlay.style.display = 'flex';
    document.getElementById('btn-restart').addEventListener('click', initGame);
  }

  // ── Draw ─────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Particles
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Asteroids
    asteroids.forEach(a => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);
      // draw jagged rock
      ctx.beginPath();
      const sides = 7;
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const jitter = rnd(0.75, 1.15);
        const rx = Math.cos(angle) * a.r * jitter;
        const ry = Math.sin(angle) * a.r * jitter;
        i === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fillStyle = a.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // hp bar
      if (a.maxHp > 1) {
        const bw = a.r * 1.8;
        ctx.fillStyle = '#333';
        ctx.fillRect(-bw/2, -a.r - 8, bw, 4);
        ctx.fillStyle = '#FF4400';
        ctx.fillRect(-bw/2, -a.r - 8, bw * (a.hp/a.maxHp), 4);
      }
      ctx.restore();
    });

    // Bonuses
    bonuses.forEach(b => {
      const pulse = 1 + Math.sin(b.pulse) * 0.15;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(pulse, pulse);
      // glow ring
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color + '44';
      ctx.fill();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // label
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, 0, 0);
      ctx.restore();
    });

    // Enemy bullets
    enemyBullets.forEach(b => {
      ctx.shadowColor = '#FF00AA';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#FF00AA';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Boss
    if (bossActive && boss) {
      ctx.save();
      ctx.translate(boss.x, boss.y);
      // body
      ctx.shadowColor = '#FF0044';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#880022';
      ctx.beginPath();
      ctx.moveTo(0, -boss.h / 2);
      ctx.lineTo(boss.w / 2, boss.h / 2);
      ctx.lineTo(-boss.w / 2, boss.h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FF1744';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // eye
      ctx.fillStyle = '#FFDD00';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Player bullets
    bullets.forEach(b => {
      ctx.save();
      if (b.laser) {
        ctx.shadowColor = b.color || '#FF6600';
        ctx.shadowBlur = 14;
        ctx.fillStyle = b.color || '#FF6600';
      } else if (b.missile) {
        ctx.shadowColor = b.color || '#44FF88';
        ctx.shadowBlur = 10;
        ctx.fillStyle = b.color || '#44FF88';
      } else {
        ctx.shadowColor = '#00CFFF';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#00CFFF';
      }
      ctx.fillRect(b.x - b.w/2, b.y, b.w, b.h);
      ctx.restore();
    });

    // Ship trail
    ship.trail.forEach((t, i) => {
      const a = (1 - i / ship.trail.length) * 0.25;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#FF1744';
      ctx.beginPath();
      ctx.arc(t.x, t.y + 20, 10 - i * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Ship
    const blinkOk = ship.invincible <= 0 || Math.floor(frameCount / 6) % 2 === 0;
    if (blinkOk) {
      ctx.save();
      ctx.shadowColor = '#FF1744';
      ctx.shadowBlur = ship.invincible > 0 ? 30 : 14;
      if (shipImg.complete && shipImg.naturalWidth > 0) {
        ctx.drawImage(shipImg, ship.x - ship.w/2, ship.y - ship.h/2, ship.w, ship.h);
      } else {
        // fallback drawn ship
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y - ship.h/2);
        ctx.lineTo(ship.x - ship.w/2, ship.y + ship.h/2);
        ctx.lineTo(ship.x, ship.y + ship.h/4);
        ctx.lineTo(ship.x + ship.w/2, ship.y + ship.h/2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Shield visual
    if (ship.invincible > 60) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#88AAFF';
      ctx.shadowColor = '#88AAFF';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (gameOver || paused) return;
  }

  // ── Game loop ────────────────────────────────────
  function loop(ts) {
    if (!running) return;
    const dt = Math.min((ts - lastTime) / 16.6, 3);
    lastTime = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // ── Init game ────────────────────────────────────
  function initGame() {
    score = 0; lives = 3; wave = 1; energy = 100;
    frameCount = 0; autoShootTimer = 0;
    powerMode = 'SINGLE'; powerTimer = 0;
    asteroids = []; bullets = []; bonuses = [];
    enemyBullets = []; particles = []; boss = null;
    bossActive = false;
    gameOver = false; paused = false;
    ship.x = W / 2; ship.y = H - 100;
    ship.invincible = 0; ship.trail = [];
    bossBar.style.display = 'none';
    overlay.style.display = 'none';
    running = true;
    lastTime = performance.now();
    updateHUD();
    requestAnimationFrame(loop);
  }

  // ── Controls ─────────────────────────────────────
  ctrlBtn.addEventListener('click', () => {
    mouseControl = !mouseControl;
    ctrlBtn.classList.toggle('active', mouseControl);
    ctrlBtn.textContent = mouseControl ? '🎮 Nave Control ON' : '🎮 Nave Control';
    showMsg(mouseControl ? 'MOUSE CONTROL: ATIVO' : 'MOUSE CONTROL: OFF', 1200);
  });

  startBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    initGame();
  });

  canvas.addEventListener('mousemove', e => {
    if (!mouseControl) return;
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  });

  canvas.addEventListener('touchmove', e => {
    if (!mouseControl) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mx = e.touches[0].clientX - rect.left;
    my = e.touches[0].clientY - rect.top;
  }, { passive: false });

  window.addEventListener('resize', resize);
  resize();
})();
