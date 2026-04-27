/* ═══════════════════════════════════════════════════
   NEXAR WING FIGHTER — Arcade Space Shooter (VFX Edition)
   © Hex Agency — AnimaMotion Studio
   FIXED: Fonts, HUD bonus thickness, Game Over restart flow
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── DOM references ──────────────────────────────
  const section = document.getElementById('nexar-game-section');
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const ctrlBtn = document.getElementById('btn-nave-control');
  const startBtn = document.getElementById('btn-start-game');
  const overlay = document.getElementById('game-overlay');
  const scoreEl = document.getElementById('hud-score');
  const livesEl = document.getElementById('hud-lives');
  const energyEl = document.getElementById('hud-energy');
  const waveEl = document.getElementById('hud-wave');
  const bossBar = document.getElementById('boss-bar');
  const bossHpEl = document.getElementById('boss-hp');
  const powerEl = document.getElementById('hud-power');
  const msgEl = document.getElementById('game-msg');

  // ── Assets ───────────────────────────────────────
  const shipImg = new Image();
  shipImg.src = 'nave_nexar_webp.webp';

  const asteroidImg = new Image();
  asteroidImg.src = 'asteroide.webp';

  // ── State ────────────────────────────────────────
  let W, H, running = false, mouseControl = false;
  let mx = 0, my = 0;
  let score = 0, lives = 3, wave = 1;
  let energy = 100, maxEnergy = 100;
  let powerMode = 'SINGLE';
  let powerTimer = 0;
  let frameCount = 0;
  let lastTime = 0;
  let gameOver = false;
  let paused = false;
  let bossActive = false;
  let bossMaxHp = 0;

  let particles = [];
  let stars = [];
  let bgNebulas = [];
  let asteroids = [];
  let bullets = [];
  let bonuses = [];
  let enemyBullets = [];
  let explosions = [];
  let boss = null;
  let autoShootTimer = 0;

  let shakeTime = 0;
  let shakeMag = 0;

  // ── Ship ─────────────────────────────────────────
  const ship = {
    x: 0, y: 0, w: 140, h: 140,
    speed: 6, invincible: 0,
    trail: []
  };

  // ── Resize ───────────────────────────────────────
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = Math.min(rect.width, 900) * 2;
    H = canvas.height = 520 * 2;
    canvas.style.width = Math.min(rect.width, 900) + 'px';
    canvas.style.height = '520px';
    ship.x = W / 2;
    ship.y = H - 180;
    initBackground();
  }

  function initBackground() {
    stars = Array.from({ length: 200 }, () => ({
      x: rnd(0, W), y: rnd(0, H),
      r: rnd(0.2, 1.8), a: rnd(0.2, 1),
      speed: rnd(0.5, 3.0),
      blinkSpeed: rnd(0.01, 0.05)
    }));

    bgNebulas = Array.from({ length: 4 }, () => ({
      x: rnd(W * 0.1, W * 0.9), y: rnd(H * 0.1, H * 0.9),
      r: rnd(150, 300),
      hue: rndInt(200, 340),
      speed: rnd(0.1, 0.3)
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

  function doScreenShake(magnitude, durationFrames) {
    shakeMag = magnitude;
    shakeTime = durationFrames;
  }

  // ── Spawn asteroid ───────────────────────────────
  function spawnAsteroid() {
    const sz = rnd(40, 130);
    const speed = rnd(3, 7 + wave * 0.8);
    const points = [];
    const sides = rndInt(6, 10);
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const jitter = rnd(0.7, 1.1);
      points.push({
        x: Math.cos(angle) * sz * jitter,
        y: Math.sin(angle) * sz * jitter
      });
    }
    asteroids.push({
      x: rnd(sz, W - sz), y: -sz,
      r: sz, speed, rot: 0,
      rotSpeed: rnd(-0.04, 0.04),
      hp: Math.ceil(sz / 12),
      maxHp: Math.ceil(sz / 12),
      vx: rnd(-0.8, 0.8),
      points: points,
      color: `hsl(${rndInt(10, 30)},${rndInt(40, 70)}%,${rndInt(25, 45)}%)`
    });
  }

  // ── Bonus types ──────────────────────────────────
  const BONUS_TYPES = [
    { type: 'life', label: '❤️', color: '#FF4466', desc: '+VIDA' },
    { type: 'energy', label: '⚡', color: '#FFD700', desc: '+ENERGIA' },
    { type: 'double', label: '💥', color: '#00CFFF', desc: 'TIRO DUPLO' },
    { type: 'triple', label: '🔱', color: '#AA44FF', desc: 'TIRO TRIPLO' },
    { type: 'laser', label: '🔆', color: '#FF6600', desc: 'LASER' },
    { type: 'missile', label: '🚀', color: '#44FF88', desc: 'MÍSSIL' },
    { type: 'shield', label: '🛡️', color: '#88AAFF', desc: 'ESCUDO 5s' },
  ];

  function spawnBonus(x, y) {
    if (Math.random() > 0.35) return;
    const t = BONUS_TYPES[rndInt(0, BONUS_TYPES.length - 1)];
    bonuses.push({
      x, y, r: 18,
      speed: rnd(1.0, 2.0),
      ...t,
      pulse: 0, life: 1
    });
  }

  // ── Shoot ────────────────────────────────────────
  function shoot() {
    const bx = ship.x, by = ship.y - ship.h / 2 + 20;
    const base = { x: bx, y: by, speed: 30, w: 8, h: 40, dmg: 1, laser: false };
    if (powerMode === 'SINGLE') {
      bullets.push({ ...base, color: '#00CFFF' });
    } else if (powerMode === 'DOUBLE') {
      bullets.push({ ...base, x: bx - 32, color: '#00CFFF' });
      bullets.push({ ...base, x: bx + 32, color: '#00CFFF' });
    } else if (powerMode === 'TRIPLE') {
      bullets.push({ ...base, x: bx - 40, vx: -4, color: '#AA44FF' });
      bullets.push({ ...base, color: '#AA44FF' });
      bullets.push({ ...base, x: bx + 40, vx: 4, color: '#AA44FF' });
    } else if (powerMode === 'LASER') {
      bullets.push({ ...base, w: 16, h: 80, dmg: 2.5, laser: true, color: '#FF6600', speed: 40 });
    } else if (powerMode === 'MISSILE') {
      bullets.push({ ...base, w: 20, h: 50, dmg: 4, color: '#44FF88', missile: true, speed: 24 });
      addMissileSmoke(bx, by);
    }
  }

  function addMissileSmoke(x, y) {
    particles.push({
      x: x, y: y + 10,
      vx: rnd(-0.5, 0.5), vy: rnd(1, 2),
      r: rnd(3, 6), life: 1, fade: 0.05,
      color: '#AAAAAA'
    });
  }

  // ── Enemy bullet ─────────────────────────────────
  function spawnEnemyBullet(x, y) {
    enemyBullets.push({ x, y, speed: 9 + wave * 0.6, r: 12 });
  }

  // ── Boss ─────────────────────────────────────────
  function spawnBoss() {
    bossActive = true;
    bossMaxHp = 60 + wave * 25;
    boss = {
      x: W / 2, y: 200, w: 280, h: 180,
      hp: bossMaxHp, speed: 3.6 + wave * 0.4,
      dir: 1, shootTimer: 0,
      phase: 0
    };
    bossBar.style.display = 'flex';
    showMsg(`⚠️ BOSS WAVE ${wave}!`, 3000);
    doScreenShake(5, 30);
  }

  // ── VFX: Explosions & Particles ──────────────────
  function explode(x, y, color = '#FF4400', count = 25, isBig = false) {
    const speedMult = isBig ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(1, 6 * speedMult);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: rnd(2, isBig ? 10 : 6),
        life: 1,
        fade: rnd(0.015, 0.04),
        color
      });
    }
    if (isBig) {
      explosions.push({
        x, y, r: 5, maxR: rnd(50, 100),
        life: 1, fade: 0.03, color: color
      });
    }
  }

  // ── HUD update ───────────────────────────────────
  function updateHUD() {
    scoreEl.textContent = score.toString().padStart(6, '0');
    livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
    waveEl.textContent = wave;
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
    explode(b.x, b.y, b.color, 30);
    if (b.type === 'life') { lives = Math.min(lives + 1, 5); }
    if (b.type === 'energy') { energy = Math.min(energy + 50, maxEnergy); }
    if (b.type === 'shield') { ship.invincible = 400; showMsg('🛡️ ESCUDO ATIVADO!', 1500); }
    if (['double', 'triple', 'laser', 'missile'].includes(b.type)) {
      powerMode = b.type.toUpperCase();
      powerTimer = 800;
    }
  }

  // ── Main update ──────────────────────────────────
  function update(dt) {
    if (!running || paused || gameOver) return;
    frameCount++;

    if (shakeTime > 0) {
      shakeTime--;
    } else {
      shakeMag = 0;
    }

    autoShootTimer++;
    const shootRate = powerMode === 'LASER' ? 4 : powerMode === 'MISSILE' ? 15 : 7;
    if (autoShootTimer >= shootRate) { shoot(); autoShootTimer = 0; }

    if (powerTimer > 0) {
      powerTimer--;
      if (powerTimer <= 0) { powerMode = 'SINGLE'; showMsg('TIRO SIMPLES', 1000); }
    }

    energy = Math.min(energy + 0.1, maxEnergy);
    if (ship.invincible > 0) ship.invincible--;

    if (mouseControl) {
      const tx = clamp(mx, ship.w / 2, W - ship.w / 2);
      const ty = clamp(my, ship.h / 2, H - ship.h / 2);
      ship.x += (tx - ship.x) * 0.15;
      ship.y += (ty - ship.y) * 0.15;
    }

    if (frameCount % 2 === 0) {
      ship.trail.unshift({ x: ship.x, y: ship.y + ship.h / 2 - 10, life: 1 });
      if (ship.trail.length > 15) ship.trail.pop();
    }

    const spawnRate = Math.max(25 - wave * 2, 8);
    if (frameCount % spawnRate === 0) spawnAsteroid();

    if (frameCount % 1000 === 0 && !bossActive) {
      wave++;
      showMsg(`🌊 WAVE ${wave}`, 2000);
    }
    if (frameCount % 2000 === 0 && !bossActive) spawnBoss();

    stars.forEach(s => {
      s.y += s.speed;
      s.a += Math.sin(frameCount * s.blinkSpeed) * 0.05;
      s.a = clamp(s.a, 0.1, 1);
      if (s.y > H) { s.y = 0; s.x = rnd(0, W); }
    });

    bgNebulas.forEach(n => {
      n.y += n.speed;
      if (n.y - n.r > H) {
        n.y = -n.r;
        n.x = rnd(W * 0.1, W * 0.9);
      }
    });

    bullets = bullets.filter(b => b.y > -40);
    bullets.forEach(b => {
      b.y -= b.speed;
      if (b.vx) b.x += b.vx;
      if (b.missile) addMissileSmoke(b.x, b.y);
    });

    enemyBullets = enemyBullets.filter(b => b.y < H + 20);
    enemyBullets.forEach(b => { b.y += b.speed; });

    asteroids.forEach(a => {
      a.y += a.speed;
      a.x += a.vx;
      a.rot += a.rotSpeed;
    });
    asteroids = asteroids.filter(a => a.y < H + 100);

    bonuses.forEach(b => { b.y += b.speed; b.pulse += 0.1; });
    bonuses = bonuses.filter(b => b.y < H + 40);

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.05;
      p.life -= p.fade;
      p.r *= 0.95;
    });
    particles = particles.filter(p => p.life > 0 && p.r > 0.5);

    explosions.forEach(ex => {
      ex.r += (ex.maxR - ex.r) * 0.1;
      ex.life -= ex.fade;
    });
    explosions = explosions.filter(ex => ex.life > 0);

    if (bossActive && boss) {
      boss.x += boss.speed * boss.dir;
      if (boss.x > W - 90 || boss.x < 90) boss.dir *= -1;
      boss.shootTimer++;
      const bossShootRate = Math.max(50 - wave * 4, 15);
      if (boss.shootTimer >= bossShootRate) {
        boss.shootTimer = 0;
        spawnEnemyBullet(boss.x - 30, boss.y + boss.h / 2);
        spawnEnemyBullet(boss.x, boss.y + boss.h / 2 + 20);
        spawnEnemyBullet(boss.x + 30, boss.y + boss.h / 2);
      }
      boss.y = 100 + Math.sin(frameCount * 0.05) * 15;
    }

    bullets.forEach(bl => {
      asteroids.forEach(a => {
        if (dist(bl, a) < a.r + Math.max(bl.w, bl.h) / 2) {
          bl.y = -999;
          a.hp -= bl.dmg;
          explode(bl.x, bl.y, '#FFAA00', 5);
          if (a.hp <= 0) {
            score += Math.floor(a.r * 2.5);
            doScreenShake(2, 5);
            explode(a.x, a.y, '#FF4400', 30, true);
            spawnBonus(a.x, a.y);
            a.r = -1;
          }
        }
      });
    });
    asteroids = asteroids.filter(a => a.r > 0);

    if (bossActive && boss) {
      bullets.forEach(bl => {
        if (Math.abs(bl.x - boss.x) < boss.w / 2 && bl.y < boss.y + boss.h / 2 && bl.y > boss.y - boss.h / 2) {
          bl.y = -999;
          boss.hp -= bl.dmg;
          explode(bl.x, bl.y, '#FFDD00', 8);
          if (boss.hp <= 0) {
            score += 1000 * wave;
            doScreenShake(10, 45);
            explode(boss.x, boss.y, '#FF2200', 80, true);
            explode(boss.x - 40, boss.y + 20, '#FF8800', 40, true);
            explode(boss.x + 40, boss.y - 20, '#FFDD00', 40, true);
            spawnBonus(boss.x, boss.y);
            spawnBonus(boss.x + 50, boss.y);
            spawnBonus(boss.x - 50, boss.y);
            boss = null;
            bossActive = false;
            bossBar.style.display = 'none';
            showMsg(`🏆 BOSS DESTRUÍDO! +${1000 * wave} pts`, 3000);
          }
        }
      });
    }

    if (ship.invincible <= 0) {
      asteroids.forEach(a => {
        if (dist(ship, a) < a.r + ship.w / 2 * 0.7) {
          a.hp = 0; a.r = -1;
          takeDamage(40);
          doScreenShake(6, 15);
          explode(a.x, a.y, '#FF2200', 25, true);
        }
      });
      asteroids = asteroids.filter(a => a.r > 0);

      enemyBullets.forEach(b => {
        if (dist(ship, b) < 20) {
          b.y = H + 99;
          takeDamage(25);
          doScreenShake(3, 10);
        }
      });
    }

    bonuses.forEach(b => {
      if (dist(ship, b) < b.r + ship.w / 2) {
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
    explode(ship.x, ship.y, '#FF1744', 20, true);
    ship.invincible = 120;
    if (energy <= 0) {
      energy = 0;
      lives--;
      if (lives <= 0) {
        doGameOver();
      } else {
        energy = maxEnergy;
        showMsg(`💔 VIDA PERDIDA! ${lives} restante(s)`, 2500);
      }
    }
  }

  // ── FIX #3: Game Over flow — clean reset, no overlay bugs ────────────────
  function doGameOver() {
    gameOver = true;
    running = false;

    // Rebuild overlay content (not modifying start button, keeping structure clean)
    overlay.innerHTML = `
      <div style="
        background: rgba(10,0,20,0.95);
        padding: 50px 60px;
        border-radius: 16px;
        border: 2px solid #FF1744;
        text-align: center;
        box-shadow: 0 0 60px rgba(255,23,68,0.5);
        max-width: 480px;
        width: 90%;
      ">
        <div style="
          font-family: 'Orbitron', 'Arial Black', Arial, sans-serif;
          font-weight: 900;
          color: #FF1744;
          font-size: 48px;
          letter-spacing: 8px;
          margin-bottom: 24px;
          text-shadow: 0 0 20px #FF1744, 0 0 40px rgba(255,23,68,0.5);
        ">GAME OVER</div>
        <div style="
          font-family: 'Arial', sans-serif;
          font-weight: bold;
          font-size: 20px;
          color: #FFD700;
          margin-bottom: 8px;
          letter-spacing: 3px;
        ">SCORE FINAL: <span style="color:#FFFFFF;">${score.toString().padStart(6, '0')}</span></div>
        <div style="
          font-family: 'Arial', sans-serif;
          font-weight: bold;
          font-size: 20px;
          color: #FFD700;
          margin-bottom: 40px;
          letter-spacing: 3px;
        ">WAVE ATINGIDA: <span style="color:#FFFFFF;">${wave}</span></div>
        <button id="btn-restart" style="
          font-size: 17px;
          padding: 14px 44px;
          font-family: 'Arial', sans-serif;
          font-weight: bold;
          letter-spacing: 3px;
          cursor: pointer;
          border: 2px solid #FF1744;
          background: rgba(255,23,68,0.15);
          color: #FFFFFF;
          border-radius: 8px;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 16px rgba(255,23,68,0.3);
        ">↺ TENTAR NOVAMENTE</button>
      </div>`;

    overlay.style.display = 'flex';

    // Hover effect on restart button
    const restartBtn = document.getElementById('btn-restart');
    restartBtn.addEventListener('mouseenter', () => {
      restartBtn.style.background = 'rgba(255,23,68,0.35)';
      restartBtn.style.boxShadow = '0 0 28px rgba(255,23,68,0.6)';
    });
    restartBtn.addEventListener('mouseleave', () => {
      restartBtn.style.background = 'rgba(255,23,68,0.15)';
      restartBtn.style.boxShadow = '0 0 16px rgba(255,23,68,0.3)';
    });

    // ── FIX: Clean reset, then start loop directly (no overlay flash) ──
    restartBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
      ctx.clearRect(0, 0, W, H);
      initGame(); // resets all state and starts loop immediately
    });
  }

  // ── Draw ─────────────────────────────────────────
  function draw() {
    let sx = 0, sy = 0;
    if (shakeMag > 0) {
      sx = rnd(-shakeMag, shakeMag);
      sy = rnd(-shakeMag, shakeMag);
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.clearRect(0, 0, W, H);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#050210');
    bgGrad.addColorStop(1, '#0a001a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'screen';
    bgNebulas.forEach(n => {
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      grd.addColorStop(0, `hsla(${n.hue}, 80%, 40%, 0.15)`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';

    stars.forEach(s => {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = s.r * 2;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = 'screen';
    explosions.forEach(ex => {
      ctx.globalAlpha = ex.life;
      ctx.strokeStyle = ex.color;
      ctx.lineWidth = 4 * ex.life;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = ex.color;
      ctx.globalAlpha = ex.life * 0.3;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;

    asteroids.forEach(a => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);
      ctx.beginPath();
      ctx.moveTo(a.points[0].x, a.points[0].y);
      for (let i = 1; i < a.points.length; i++) {
        ctx.lineTo(a.points[i].x, a.points[i].y);
      }
      ctx.closePath();
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.clip();
      if (asteroidImg.complete && asteroidImg.naturalWidth > 0) {
        ctx.drawImage(asteroidImg, -a.r * 1.5, -a.r * 1.5, a.r * 3, a.r * 3);
        ctx.fillStyle = a.color.replace('hsl', 'hsla').replace(')', ', 0.3)');
        ctx.fill();
      } else {
        ctx.fillStyle = a.color;
        ctx.fill();
      }
      ctx.restore();
    });

    // ── FIX #2: Bonuses — thicker stroke (lineWidth 3), bold readable text ──
    bonuses.forEach(b => {
      const pulse = 1 + Math.sin(b.pulse) * 0.15;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(pulse, pulse);

      // Outer glow ring — lineWidth bumped to 3
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color + '33';
      ctx.fill();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 3; // FIX: was 2 or unset
      ctx.stroke();

      // Second inner ring for depth
      ctx.beginPath();
      ctx.arc(0, 0, b.r * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = b.color + 'AA';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;

      // ── FIX #1 (bonus label): bold font stack, no letter cramping ──
      ctx.font = 'bold 22px Arial, sans-serif'; // FIX: explicit bold + safe font stack
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Drop shadow for contrast
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(b.label, 0, 0);

      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.restore();
    });

    enemyBullets.forEach(b => {
      ctx.shadowColor = '#FF0044';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#FF00AA';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    if (bossActive && boss) {
      ctx.save();
      ctx.translate(boss.x, boss.y);
      ctx.shadowColor = '#FF1744';
      ctx.shadowBlur = 40 + Math.sin(frameCount * 0.1) * 20;
      ctx.fillStyle = '#110011';
      ctx.beginPath();
      ctx.moveTo(0, -boss.h / 2);
      ctx.lineTo(boss.w / 2, boss.h / 2);
      ctx.lineTo(-boss.w / 2, boss.h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FF1744';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#FFDD00';
      ctx.shadowColor = '#FFDD00';
      ctx.beginPath();
      ctx.arc(0, 10, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 10, 8 + Math.sin(frameCount * 0.2) * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    ctx.globalCompositeOperation = 'screen';
    bullets.forEach(b => {
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = b.laser ? 20 : 12;
      ctx.fillStyle = b.color;
      if (b.laser) {
        ctx.fillRect(b.x - b.w / 2, b.y - b.h, b.w, b.h * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(b.x - b.w / 4, b.y - b.h, b.w / 2, b.h * 2);
      } else if (b.missile) {
        ctx.beginPath();
        ctx.moveTo(b.x, b.y - b.h);
        ctx.lineTo(b.x + b.w / 2, b.y - b.h / 2);
        ctx.lineTo(b.x + b.w / 2, b.y);
        ctx.lineTo(b.x - b.w / 2, b.y);
        ctx.lineTo(b.x - b.w / 2, b.y - b.h / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(b.x - b.w / 2, b.y, b.w, b.h, b.w / 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(b.x - b.w / 4, b.y + 2, b.w / 2, b.h - 4, b.w / 4);
        ctx.fill();
      }
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-over';

    ship.trail.forEach((t, i) => {
      t.life -= 0.1;
      if (t.life > 0) {
        const a = t.life * 0.6;
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = a;
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(t.x, t.y + i * 2, 12 * t.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFDD00';
        ctx.beginPath();
        ctx.arc(t.x, t.y + i * 2, 6 * t.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    });

    const blinkOk = ship.invincible <= 0 || Math.floor(frameCount / 4) % 2 === 0;
    if (blinkOk) {
      ctx.save();
      ctx.shadowColor = ship.invincible > 0 ? '#00CFFF' : '#FF1744';
      ctx.shadowBlur = ship.invincible > 0 ? 30 : 15;
      if (shipImg.complete && shipImg.naturalWidth > 0) {
        ctx.drawImage(shipImg, ship.x - ship.w / 2, ship.y - ship.h / 2, ship.w, ship.h);
      } else {
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y - ship.h / 2);
        ctx.lineTo(ship.x - ship.w / 2, ship.y + ship.h / 2);
        ctx.lineTo(ship.x, ship.y + ship.h / 4);
        ctx.lineTo(ship.x + ship.w / 2, ship.y + ship.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#00CFFF';
        ctx.beginPath();
        ctx.ellipse(ship.x, ship.y - ship.h / 6, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (ship.invincible > 0 && ship.invincible > 60) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.5 + Math.sin(frameCount * 0.2) * 0.2;
      const shieldGrd = ctx.createRadialGradient(ship.x, ship.y, 20, ship.x, ship.y, 50);
      shieldGrd.addColorStop(0, 'rgba(136, 170, 255, 0.1)');
      shieldGrd.addColorStop(0.8, 'rgba(136, 170, 255, 0.4)');
      shieldGrd.addColorStop(1, 'rgba(136, 170, 255, 0.8)');
      ctx.fillStyle = shieldGrd;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    ctx.restore(); // screen shake

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

  // ── Init game — full clean reset ─────────────────
  function initGame() {
    score = 0; lives = 3; wave = 1; energy = 100;
    frameCount = 0; autoShootTimer = 0;
    powerMode = 'SINGLE'; powerTimer = 0;
    asteroids = []; bullets = []; bonuses = [];
    enemyBullets = []; particles = []; explosions = [];
    boss = null; bossActive = false;
    shakeMag = 0; shakeTime = 0;
    gameOver = false; paused = false;
    ship.x = W / 2; ship.y = H - 180;
    ship.invincible = 0; ship.trail = [];
    bossBar.style.display = 'none';
    overlay.style.display = 'none';

    updateHUD();

    // ── FIX #3: Always restart the loop cleanly
    // If running was true (lingering from a previous session), stop it first
    running = false;
    // Use setTimeout to let the previous rAF chain fully stop before restarting
    setTimeout(() => {
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }, 0);
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
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  canvas.addEventListener('mousemove', e => {
    if (!mouseControl) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    mx = (e.clientX - rect.left) * scaleX;
    my = (e.clientY - rect.top) * scaleY;
  });

  canvas.addEventListener('touchmove', e => {
    if (!mouseControl) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    mx = (e.touches[0].clientX - rect.left) * scaleX;
    my = (e.touches[0].clientY - rect.top) * scaleY;
  }, { passive: false });

  window.addEventListener('resize', resize);

  resize();
  draw();
})();