/* ═══════════════════════════════════════════════════
   NEXAR WING FIGHTER — Arcade Space Shooter (VFX Edition)
   Refatorado para estrutura mais limpa e profissional
════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const CANVAS_MAX_WIDTH = 900;
  const CANVAS_HEIGHT = 520;
  const MAX_LIVES = 5;
  const DEFAULT_POWER_MODE = 'SINGLE';

  const POWER_MODES = {
    SINGLE: 'SINGLE',
    DOUBLE: 'DOUBLE',
    TRIPLE: 'TRIPLE',
    LASER: 'LASER',
    MISSILE: 'MISSILE'
  };

  const BONUS_TYPES = [
    { type: 'life', label: '❤️', color: '#FF4466', desc: '+VIDA' },
    { type: 'energy', label: '⚡', color: '#FFD700', desc: '+ENERGIA' },
    { type: 'double', label: '💥', color: '#00CFFF', desc: 'TIRO DUPLO' },
    { type: 'triple', label: '🔱', color: '#AA44FF', desc: 'TIRO TRIPLO' },
    { type: 'laser', label: '🔆', color: '#FF6600', desc: 'LASER' },
    { type: 'missile', label: '🚀', color: '#44FF88', desc: 'MÍSSIL' },
    { type: 'shield', label: '🛡️', color: '#88AAFF', desc: 'ESCUDO 5s' }
  ];

  class NexarGame {
    constructor() {
      this.section = document.getElementById('nexar-game-section');
      this.canvas = document.getElementById('game-canvas');
      this.ctrlBtn = document.getElementById('btn-nave-control');
      this.startBtn = document.getElementById('btn-start-game');
      this.overlay = document.getElementById('game-overlay');
      this.scoreEl = document.getElementById('hud-score');
      this.livesEl = document.getElementById('hud-lives');
      this.energyEl = document.getElementById('hud-energy');
      this.waveEl = document.getElementById('hud-wave');
      this.bossBar = document.getElementById('boss-bar');
      this.bossHpEl = document.getElementById('boss-hp');
      this.powerEl = document.getElementById('hud-power');
      this.msgEl = document.getElementById('game-msg');

      if (!this.section || !this.canvas || !this.startBtn) {
        return;
      }

      this.ctx = this.canvas.getContext('2d');
      this.shipImg = new Image();
      this.shipImg.src = 'nave_nexar_webp.webp';
      this.asteroidImg = new Image();
      this.asteroidImg.src = 'asteroide.webp';

      this.state = {
        running: false,
        mouseControl: false,
        mx: 0,
        my: 0,
        score: 0,
        lives: 3,
        wave: 1,
        energy: 100,
        maxEnergy: 100,
        powerMode: DEFAULT_POWER_MODE,
        powerTimer: 0,
        frameCount: 0,
        lastTime: 0,
        gameOver: false,
        paused: false,
        bossActive: false,
        bossMaxHp: 0,
        shakeTime: 0,
        shakeMag: 0
      };

      this.ship = {
        x: 0,
        y: 0,
        w: 140,
        h: 140,
        speed: 6,
        invincible: 0,
        trail: []
      };

      this.stars = [];
      this.bgNebulas = [];
      this.asteroids = [];
      this.bullets = [];
      this.bonuses = [];
      this.enemyBullets = [];
      this.particles = [];
      this.explosions = [];
      this.boss = null;
      this.autoShootTimer = 0;

      this.setupEventListeners();
      this.resize();
      this.draw();
    }

    setupEventListeners() {
      this.ctrlBtn.addEventListener('click', () => this.toggleMouseControl());
      this.startBtn.addEventListener('click', () => this.startGame());
      this.canvas.addEventListener('mousemove', event => this.updatePointer(event));
      this.canvas.addEventListener('touchmove', event => this.updateTouch(event), { passive: false });
      window.addEventListener('resize', () => this.resize());
    }

    startGame() {
      this.overlay.style.display = 'none';
      this.resetGame();
      this.section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    resetGame() {
      this.state.score = 0;
      this.state.lives = 3;
      this.state.wave = 1;
      this.state.energy = this.state.maxEnergy;
      this.state.frameCount = 0;
      this.state.autoShootTimer = 0;
      this.state.powerMode = DEFAULT_POWER_MODE;
      this.state.powerTimer = 0;
      this.state.gameOver = false;
      this.state.paused = false;
      this.state.bossActive = false;
      this.state.shakeMag = 0;
      this.state.shakeTime = 0;
      this.ship.x = this.width / 2;
      this.ship.y = this.height - 180;
      this.ship.invincible = 0;
      this.ship.trail = [];
      this.asteroids = [];
      this.bullets = [];
      this.bonuses = [];
      this.enemyBullets = [];
      this.particles = [];
      this.explosions = [];
      this.boss = null;
      this.bossBar.style.display = 'none';
      this.overlay.style.display = 'none';
      this.updateHUD();

      this.state.running = false;
      setTimeout(() => {
        this.state.running = true;
        this.state.lastTime = performance.now();
        requestAnimationFrame(ts => this.loop(ts));
      }, 0);
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = this.canvas.width = Math.min(rect.width, CANVAS_MAX_WIDTH) * 2;
      this.height = this.canvas.height = CANVAS_HEIGHT * 2;
      this.canvas.style.width = Math.min(rect.width, CANVAS_MAX_WIDTH) + 'px';
      this.canvas.style.height = CANVAS_HEIGHT + 'px';
      this.ship.x = this.width / 2;
      this.ship.y = this.height - 180;
      this.initBackground();
    }

    initBackground() {
      this.stars = Array.from({ length: 200 }, () => ({
        x: this.randomBetween(0, this.width),
        y: this.randomBetween(0, this.height),
        r: this.randomBetween(0.2, 1.8),
        a: this.randomBetween(0.2, 1),
        speed: this.randomBetween(0.5, 3.0),
        blinkSpeed: this.randomBetween(0.01, 0.05)
      }));

      this.bgNebulas = Array.from({ length: 4 }, () => ({
        x: this.randomBetween(this.width * 0.1, this.width * 0.9),
        y: this.randomBetween(this.height * 0.1, this.height * 0.9),
        r: this.randomBetween(150, 300),
        hue: this.randomInt(200, 340),
        speed: this.randomBetween(0.1, 0.3)
      }));
    }

    randomBetween(min, max) {
      return min + Math.random() * (max - min);
    }

    randomInt(min, max) {
      return Math.floor(this.randomBetween(min, max + 1));
    }

    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    distance(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    toggleMouseControl() {
      this.state.mouseControl = !this.state.mouseControl;
      this.ctrlBtn.classList.toggle('active', this.state.mouseControl);
      this.ctrlBtn.textContent = this.state.mouseControl ? '🎮 Nave Control ON' : '🎮 Nave Control';
      this.showMessage(this.state.mouseControl ? 'MOUSE CONTROL: ATIVO' : 'MOUSE CONTROL: OFF', 1200);
    }

    updatePointer(event) {
      if (!this.state.mouseControl) {
        return;
      }
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      this.state.mx = (event.clientX - rect.left) * scaleX;
      this.state.my = (event.clientY - rect.top) * scaleY;
    }

    updateTouch(event) {
      if (!this.state.mouseControl) {
        return;
      }
      event.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      this.state.mx = (event.touches[0].clientX - rect.left) * scaleX;
      this.state.my = (event.touches[0].clientY - rect.top) * scaleY;
    }

    spawnAsteroid() {
      const size = this.randomBetween(40, 130);
      const speed = this.randomBetween(3, 7 + this.state.wave * 0.8);
      const sides = this.randomInt(6, 10);
      const points = Array.from({ length: sides }, (_, index) => {
        const angle = (index / sides) * Math.PI * 2;
        return {
          x: Math.cos(angle) * size * this.randomBetween(0.7, 1.1),
          y: Math.sin(angle) * size * this.randomBetween(0.7, 1.1)
        };
      });

      this.asteroids.push({
        x: this.randomBetween(size, this.width - size),
        y: -size,
        r: size,
        speed,
        rot: 0,
        rotSpeed: this.randomBetween(-0.04, 0.04),
        hp: Math.ceil(size / 12),
        maxHp: Math.ceil(size / 12),
        vx: this.randomBetween(-0.8, 0.8),
        points,
        color: `hsl(${this.randomInt(10, 30)},${this.randomInt(40, 70)}%,${this.randomInt(25, 45)}%)`
      });
    }

    spawnBonus(x, y) {
      if (Math.random() > 0.35) {
        return;
      }
      const bonus = BONUS_TYPES[this.randomInt(0, BONUS_TYPES.length - 1)];
      this.bonuses.push({
        x,
        y,
        r: 18,
        speed: this.randomBetween(1.0, 2.0),
        pulse: 0,
        life: 1,
        ...bonus
      });
    }

    spawnEnemyBullet(x, y) {
      this.enemyBullets.push({ x, y, speed: 9 + this.state.wave * 0.6, r: 12 });
    }

    spawnBoss() {
      this.state.bossActive = true;
      this.state.bossMaxHp = 60 + this.state.wave * 25;
      this.boss = {
        x: this.width / 2,
        y: 200,
        w: 280,
        h: 180,
        hp: this.state.bossMaxHp,
        speed: 3.6 + this.state.wave * 0.4,
        dir: 1,
        shootTimer: 0
      };
      this.bossBar.style.display = 'flex';
      this.showMessage(`⚠️ BOSS WAVE ${this.state.wave}!`, 3000);
      this.doScreenShake(5, 30);
    }

    addMissileSmoke(x, y) {
      this.particles.push({
        x,
        y: y + 10,
        vx: this.randomBetween(-0.5, 0.5),
        vy: this.randomBetween(1, 2),
        r: this.randomBetween(3, 6),
        life: 1,
        fade: 0.05,
        color: '#AAAAAA'
      });
    }

    shoot() {
      const base = {
        x: this.ship.x,
        y: this.ship.y - this.ship.h / 2 + 20,
        speed: 30,
        w: 8,
        h: 40,
        dmg: 1,
        laser: false
      };

      switch (this.state.powerMode) {
        case POWER_MODES.DOUBLE:
          this.bullets.push({ ...base, x: base.x - 32, color: '#00CFFF' });
          this.bullets.push({ ...base, x: base.x + 32, color: '#00CFFF' });
          break;
        case POWER_MODES.TRIPLE:
          this.bullets.push({ ...base, x: base.x - 40, vx: -4, color: '#AA44FF' });
          this.bullets.push({ ...base, color: '#AA44FF' });
          this.bullets.push({ ...base, x: base.x + 40, vx: 4, color: '#AA44FF' });
          break;
        case POWER_MODES.LASER:
          this.bullets.push({ ...base, w: 16, h: 80, dmg: 2.5, laser: true, color: '#FF6600', speed: 40 });
          break;
        case POWER_MODES.MISSILE:
          this.bullets.push({ ...base, w: 20, h: 50, dmg: 4, color: '#44FF88', missile: true, speed: 24 });
          this.addMissileSmoke(base.x, base.y);
          break;
        default:
          this.bullets.push({ ...base, color: '#00CFFF' });
      }
    }

    applyBonus(bonus) {
      this.showMessage(bonus.desc, 1500);
      this.explode(bonus.x, bonus.y, bonus.color, 30);
      switch (bonus.type) {
        case 'life':
          this.state.lives = Math.min(this.state.lives + 1, MAX_LIVES);
          break;
        case 'energy':
          this.state.energy = Math.min(this.state.energy + 50, this.state.maxEnergy);
          break;
        case 'shield':
          this.ship.invincible = 400;
          this.showMessage('🛡️ ESCUDO ATIVADO!', 1500);
          break;
        case 'double':
        case 'triple':
        case 'laser':
        case 'missile':
          this.state.powerMode = bonus.type.toUpperCase();
          this.state.powerTimer = 800;
          break;
      }
    }

    explode(x, y, color = '#FF4400', count = 25, isBig = false) {
      const speedFactor = isBig ? 2 : 1;
      for (let i = 0; i < count; i += 1) {
        const angle = this.randomBetween(0, Math.PI * 2);
        const speed = this.randomBetween(1, 6 * speedFactor);
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: this.randomBetween(2, isBig ? 10 : 6),
          life: 1,
          fade: this.randomBetween(0.015, 0.04),
          color
        });
      }
      if (!isBig) {
        return;
      }
      this.explosions.push({
        x,
        y,
        r: 5,
        maxR: this.randomBetween(50, 100),
        life: 1,
        fade: 0.03,
        color
      });
    }

    showMessage(text, duration = 1800) {
      this.msgEl.textContent = text;
      this.msgEl.style.opacity = '1';
      clearTimeout(this.showMessage.timeout);
      this.showMessage.timeout = setTimeout(() => {
        this.msgEl.style.opacity = '0';
      }, duration);
    }

    doScreenShake(magnitude, durationFrames) {
      this.state.shakeMag = magnitude;
      this.state.shakeTime = durationFrames;
    }

    updateHUD() {
      this.scoreEl.textContent = this.state.score.toString().padStart(6, '0');
      this.livesEl.textContent = '❤️'.repeat(Math.max(0, this.state.lives));
      this.waveEl.textContent = this.state.wave;
      this.powerEl.textContent = this.state.powerMode;
      const value = Math.max(0, Math.min(this.state.energy, this.state.maxEnergy));
      this.state.energy = value;
      const percent = (value / this.state.maxEnergy) * 100;
      this.energyEl.style.width = percent + '%';
      this.energyEl.style.background = percent > 50 ? '#00CFFF' : percent > 25 ? '#FFD700' : '#FF1744';
      if (this.state.bossActive && this.boss) {
        this.bossHpEl.style.width = ((this.boss.hp / this.state.bossMaxHp) * 100) + '%';
      }
    }

    update(dt) {
      if (!this.state.running || this.state.paused || this.state.gameOver) {
        return;
      }
      this.state.frameCount += 1;
      this.updateShake();
      this.updateAutoShoot();
      this.updatePowerState();
      this.chargeEnergy();
      this.updateInvincibility();
      this.updateShip();
      this.updateTrail();
      this.spawnEntities();
      this.updateBackground();
      this.updateBullets();
      this.updateEnemyBullets();
      this.updateAsteroids();
      this.updateBonuses();
      this.updateParticles();
      this.updateExplosions();
      this.updateBoss();
      this.resolveCollisions();
      this.updateHUD();
    }

    updateShake() {
      if (this.state.shakeTime > 0) {
        this.state.shakeTime -= 1;
        return;
      }
      this.state.shakeMag = 0;
    }

    updateAutoShoot() {
      this.state.autoShootTimer += 1;
      const rate = this.state.powerMode === POWER_MODES.LASER ? 4 : this.state.powerMode === POWER_MODES.MISSILE ? 15 : 7;
      if (this.state.autoShootTimer >= rate) {
        this.shoot();
        this.state.autoShootTimer = 0;
      }
    }

    updatePowerState() {
      if (this.state.powerTimer <= 0) {
        return;
      }
      this.state.powerTimer -= 1;
      if (this.state.powerTimer <= 0) {
        this.state.powerMode = DEFAULT_POWER_MODE;
        this.showMessage('TIRO SIMPLES', 1000);
      }
    }

    chargeEnergy() {
      this.state.energy = Math.min(this.state.energy + 0.1, this.state.maxEnergy);
    }

    updateInvincibility() {
      if (this.ship.invincible > 0) {
        this.ship.invincible -= 1;
      }
    }

    updateShip() {
      if (!this.state.mouseControl) {
        return;
      }
      const tx = this.clamp(this.state.mx, this.ship.w / 2, this.width - this.ship.w / 2);
      const ty = this.clamp(this.state.my, this.ship.h / 2, this.height - this.ship.h / 2);
      this.ship.x += (tx - this.ship.x) * 0.15;
      this.ship.y += (ty - this.ship.y) * 0.15;
    }

    updateTrail() {
      if (this.state.frameCount % 2 !== 0) {
        return;
      }
      this.ship.trail.unshift({ x: this.ship.x, y: this.ship.y + this.ship.h / 2 - 10, life: 1 });
      if (this.ship.trail.length > 15) {
        this.ship.trail.pop();
      }
    }

    spawnEntities() {
      const spawnRate = Math.max(25 - this.state.wave * 2, 8);
      if (this.state.frameCount % spawnRate === 0) {
        this.spawnAsteroid();
      }
      if (this.state.frameCount % 1000 === 0 && !this.state.bossActive) {
        this.state.wave += 1;
        this.showMessage(`🌊 WAVE ${this.state.wave}`, 2000);
      }
      if (this.state.frameCount % 2000 === 0 && !this.state.bossActive) {
        this.spawnBoss();
      }
    }

    updateBackground() {
      this.stars.forEach(star => {
        star.y += star.speed;
        star.a += Math.sin(this.state.frameCount * star.blinkSpeed) * 0.05;
        star.a = this.clamp(star.a, 0.1, 1);
        if (star.y > this.height) {
          star.y = 0;
          star.x = this.randomBetween(0, this.width);
        }
      });

      this.bgNebulas.forEach(nebulas => {
        nebulas.y += nebulas.speed;
        if (nebulas.y - nebulas.r > this.height) {
          nebulas.y = -nebulas.r;
          nebulas.x = this.randomBetween(this.width * 0.1, this.width * 0.9);
        }
      });
    }

    updateBullets() {
      this.bullets = this.bullets.filter(bullet => bullet.y > -40);
      this.bullets.forEach(bullet => {
        bullet.y -= bullet.speed;
        if (bullet.vx) {
          bullet.x += bullet.vx;
        }
        if (bullet.missile) {
          this.addMissileSmoke(bullet.x, bullet.y);
        }
      });
    }

    updateEnemyBullets() {
      this.enemyBullets = this.enemyBullets.filter(bullet => bullet.y < this.height + 20);
      this.enemyBullets.forEach(bullet => {
        bullet.y += bullet.speed;
      });
    }

    updateAsteroids() {
      this.asteroids.forEach(asteroid => {
        asteroid.y += asteroid.speed;
        asteroid.x += asteroid.vx;
        asteroid.rot += asteroid.rotSpeed;
      });
      this.asteroids = this.asteroids.filter(asteroid => asteroid.y < this.height + 100);
    }

    updateBonuses() {
      this.bonuses.forEach(bonus => {
        bonus.y += bonus.speed;
        bonus.pulse += 0.1;
      });
      this.bonuses = this.bonuses.filter(bonus => bonus.y < this.height + 40);
    }

    updateParticles() {
      this.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05;
        particle.life -= particle.fade;
        particle.r *= 0.95;
      });
      this.particles = this.particles.filter(particle => particle.life > 0 && particle.r > 0.5);
    }

    updateExplosions() {
      this.explosions.forEach(explosion => {
        explosion.r += (explosion.maxR - explosion.r) * 0.1;
        explosion.life -= explosion.fade;
      });
      this.explosions = this.explosions.filter(explosion => explosion.life > 0);
    }

    updateBoss() {
      if (!this.state.bossActive || !this.boss) {
        return;
      }
      this.boss.x += this.boss.speed * this.boss.dir;
      if (this.boss.x > this.width - 90 || this.boss.x < 90) {
        this.boss.dir *= -1;
      }
      this.boss.shootTimer += 1;
      const bossShootRate = Math.max(50 - this.state.wave * 4, 15);
      if (this.boss.shootTimer >= bossShootRate) {
        this.boss.shootTimer = 0;
        this.spawnEnemyBullet(this.boss.x - 30, this.boss.y + this.boss.h / 2);
        this.spawnEnemyBullet(this.boss.x, this.boss.y + this.boss.h / 2 + 20);
        this.spawnEnemyBullet(this.boss.x + 30, this.boss.y + this.boss.h / 2);
      }
      this.boss.y = 100 + Math.sin(this.state.frameCount * 0.05) * 15;
    }

    resolveCollisions() {
      this.bullets.forEach(bullet => {
        this.asteroids.forEach(asteroid => {
          if (this.distance(bullet, asteroid) < asteroid.r + Math.max(bullet.w, bullet.h) / 2) {
            bullet.y = -999;
            asteroid.hp -= bullet.dmg;
            this.explode(bullet.x, bullet.y, '#FFAA00', 5);
            if (asteroid.hp <= 0) {
              this.state.score += Math.floor(asteroid.r * 2.5);
              this.doScreenShake(2, 5);
              this.explode(asteroid.x, asteroid.y, '#FF4400', 30, true);
              this.spawnBonus(asteroid.x, asteroid.y);
              asteroid.r = -1;
            }
          }
        });
      });
      this.asteroids = this.asteroids.filter(asteroid => asteroid.r > 0);

      if (this.state.bossActive && this.boss) {
        this.bullets.forEach(bullet => {
          if (Math.abs(bullet.x - this.boss.x) < this.boss.w / 2 && bullet.y < this.boss.y + this.boss.h / 2 && bullet.y > this.boss.y - this.boss.h / 2) {
            bullet.y = -999;
            this.boss.hp -= bullet.dmg;
            this.explode(bullet.x, bullet.y, '#FFDD00', 8);
            if (this.boss.hp <= 0) {
              this.state.score += 1000 * this.state.wave;
              this.doScreenShake(10, 45);
              this.explode(this.boss.x, this.boss.y, '#FF2200', 80, true);
              this.explode(this.boss.x - 40, this.boss.y + 20, '#FF8800', 40, true);
              this.explode(this.boss.x + 40, this.boss.y - 20, '#FFDD00', 40, true);
              this.spawnBonus(this.boss.x, this.boss.y);
              this.spawnBonus(this.boss.x + 50, this.boss.y);
              this.spawnBonus(this.boss.x - 50, this.boss.y);
              this.boss = null;
              this.state.bossActive = false;
              this.bossBar.style.display = 'none';
              this.showMessage(`🏆 BOSS DESTRUÍDO! +${1000 * this.state.wave} pts`, 3000);
            }
          }
        });
      }

      if (this.ship.invincible <= 0) {
        this.asteroids.forEach(asteroid => {
          if (this.distance(this.ship, asteroid) < asteroid.r + this.ship.w * 0.35) {
            asteroid.hp = 0;
            asteroid.r = -1;
            this.takeDamage(40);
            this.doScreenShake(6, 15);
            this.explode(asteroid.x, asteroid.y, '#FF2200', 25, true);
          }
        });
        this.asteroids = this.asteroids.filter(asteroid => asteroid.r > 0);

        this.enemyBullets.forEach(bullet => {
          if (this.distance(this.ship, bullet) < 20) {
            bullet.y = this.height + 99;
            this.takeDamage(25);
            this.doScreenShake(3, 10);
          }
        });
      }

      this.bonuses.forEach(bonus => {
        if (this.distance(this.ship, bonus) < bonus.r + this.ship.w / 2) {
          this.applyBonus(bonus);
          bonus.r = -1;
        }
      });
      this.bonuses = this.bonuses.filter(bonus => bonus.r > 0);
    }

    takeDamage(amount) {
      if (this.ship.invincible > 0) {
        return;
      }
      this.state.energy -= amount;
      this.explode(this.ship.x, this.ship.y, '#FF1744', 20, true);
      this.ship.invincible = 120;
      if (this.state.energy <= 0) {
        this.state.energy = 0;
        this.state.lives -= 1;
        if (this.state.lives <= 0) {
          this.doGameOver();
          return;
        }
        this.state.energy = this.state.maxEnergy;
        this.showMessage(`💔 VIDA PERDIDA! ${this.state.lives} restante(s)`, 2500);
      }
    }

    doGameOver() {
      this.state.gameOver = true;
      this.state.running = false;
      this.overlay.innerHTML = `
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
            font-size: 56px;
            letter-spacing: 16px;
            margin-bottom: 30px;
            line-height: 1.2;
            white-space: nowrap;
            text-shadow: 0 0 20px #FF1744, 0 0 40px rgba(255,23,68,0.5);
          ">GAME OVER</div>
          <div style="
            font-family: 'Orbitron', 'Arial', sans-serif;
            font-weight: bold;
            font-size: 22px;
            color: #FFD700;
            margin-bottom: 12px;
            letter-spacing: 5px;
          ">SCORE FINAL: <span style="color:#FFFFFF;">${this.state.score.toString().padStart(6, '0')}</span></div>
          <div style="
            font-family: 'Orbitron', 'Arial', sans-serif;
            font-weight: bold;
            font-size: 22px;
            color: #FFD700;
            margin-bottom: 45px;
            letter-spacing: 5px;
          ">WAVE ATINGIDA: <span style="color:#FFFFFF;">${this.state.wave}</span></div>
          <button id="btn-restart" style="
            font-size: 18px;
            padding: 16px 50px;
            font-family: 'Orbitron', 'Arial', sans-serif;
            font-weight: bold;
            letter-spacing: 6px;
            cursor: pointer;
            border: 2px solid #FF1744;
            background: rgba(255,23,68,0.15);
            color: #FFFFFF;
            border-radius: 8px;
            transition: background 0.2s, box-shadow 0.2s;
            box-shadow: 0 0 16px rgba(255,23,68,0.3);
          ">↺ TENTAR NOVAMENTE</button>
        </div>`;
      this.overlay.style.display = 'flex';
      const restartBtn = document.getElementById('btn-restart');
      restartBtn.addEventListener('mouseenter', () => {
        restartBtn.style.background = 'rgba(255,23,68,0.35)';
        restartBtn.style.boxShadow = '0 0 28px rgba(255,23,68,0.6)';
      });
      restartBtn.addEventListener('mouseleave', () => {
        restartBtn.style.background = 'rgba(255,23,68,0.15)';
        restartBtn.style.boxShadow = '0 0 16px rgba(255,23,68,0.3)';
      });
      restartBtn.addEventListener('click', () => {
        this.overlay.style.display = 'none';
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.resetGame();
      });
    }

    draw() {
      const shakeX = this.state.shakeMag > 0 ? this.randomBetween(-this.state.shakeMag, this.state.shakeMag) : 0;
      const shakeY = this.state.shakeMag > 0 ? this.randomBetween(-this.state.shakeMag, this.state.shakeMag) : 0;
      this.ctx.save();
      this.ctx.translate(shakeX, shakeY);
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawBackground();
      this.drawStars();
      this.drawExplosions();
      this.drawParticles();
      this.drawAsteroids();
      this.drawBonuses();
      this.drawEnemyBullets();
      this.drawBoss();
      this.drawBullets();
      this.drawShip();
      this.ctx.restore();
    }

    drawBackground() {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, '#050210');
      gradient.addColorStop(1, '#0a001a');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = 'screen';
      this.bgNebulas.forEach(nebulas => {
        const nebulaGradient = this.ctx.createRadialGradient(nebulas.x, nebulas.y, 0, nebulas.x, nebulas.y, nebulas.r);
        nebulaGradient.addColorStop(0, `hsla(${nebulas.hue}, 80%, 40%, 0.15)`);
        nebulaGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = nebulaGradient;
        this.ctx.beginPath();
        this.ctx.arc(nebulas.x, nebulas.y, nebulas.r, 0, Math.PI * 2);
        this.ctx.fill();
      });
      this.ctx.globalCompositeOperation = 'source-over';
    }

    drawStars() {
      this.stars.forEach(star => {
        this.ctx.globalAlpha = star.a;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = star.r * 2;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });
      this.ctx.globalAlpha = 1;
    }

    drawExplosions() {
      this.ctx.globalCompositeOperation = 'screen';
      this.explosions.forEach(explosion => {
        this.ctx.globalAlpha = explosion.life;
        this.ctx.strokeStyle = explosion.color;
        this.ctx.lineWidth = 4 * explosion.life;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.r, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = explosion.color;
        this.ctx.globalAlpha = explosion.life * 0.3;
        this.ctx.fill();
      });
      this.ctx.globalAlpha = 1;
      this.ctx.globalCompositeOperation = 'source-over';
    }

    drawParticles() {
      this.particles.forEach(particle => {
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });
      this.ctx.globalAlpha = 1;
    }

    drawAsteroids() {
      this.asteroids.forEach(asteroid => {
        this.ctx.save();
        this.ctx.translate(asteroid.x, asteroid.y);
        this.ctx.rotate(asteroid.rot);
        this.ctx.beginPath();
        this.ctx.moveTo(asteroid.points[0].x, asteroid.points[0].y);
        asteroid.points.slice(1).forEach(point => this.ctx.lineTo(point.x, point.y));
        this.ctx.closePath();
        this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.clip();
        if (this.asteroidImg.complete && this.asteroidImg.naturalWidth > 0) {
          this.ctx.drawImage(this.asteroidImg, -asteroid.r * 1.5, -asteroid.r * 1.5, asteroid.r * 3, asteroid.r * 3);
          this.ctx.fillStyle = asteroid.color.replace('hsl', 'hsla').replace(')', ', 0.3)');
          this.ctx.fill();
        } else {
          this.ctx.fillStyle = asteroid.color;
          this.ctx.fill();
        }
        this.ctx.restore();
      });
    }

    drawBonuses() {
      this.bonuses.forEach(bonus => {
        const pulse = 1 + Math.sin(bonus.pulse) * 0.15;
        this.ctx.save();
        this.ctx.translate(bonus.x, bonus.y);
        this.ctx.scale(pulse, pulse);
        this.ctx.shadowColor = bonus.color;
        this.ctx.shadowBlur = 24;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, bonus.r, 0, Math.PI * 2);
        this.ctx.fillStyle = bonus.color + '33';
        this.ctx.fill();
        this.ctx.strokeStyle = bonus.color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, bonus.r * 0.7, 0, Math.PI * 2);
        this.ctx.strokeStyle = bonus.color + 'AA';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        this.ctx.font = 'bold 22px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = '#000000';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(bonus.label, 0, 0);
        this.ctx.restore();
      });
    }

    drawEnemyBullets() {
      this.enemyBullets.forEach(bullet => {
        this.ctx.shadowColor = '#FF0044';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#FF00AA';
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, bullet.r * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });
    }

    drawBoss() {
      if (!this.state.bossActive || !this.boss) {
        return;
      }
      this.ctx.save();
      this.ctx.translate(this.boss.x, this.boss.y);
      this.ctx.shadowColor = '#FF1744';
      this.ctx.shadowBlur = 40 + Math.sin(this.state.frameCount * 0.1) * 20;
      this.ctx.fillStyle = '#110011';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -this.boss.h / 2);
      this.ctx.lineTo(this.boss.w / 2, this.boss.h / 2);
      this.ctx.lineTo(-this.boss.w / 2, this.boss.h / 2);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.strokeStyle = '#FF1744';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
      this.ctx.fillStyle = '#FFDD00';
      this.ctx.shadowColor = '#FFDD00';
      this.ctx.beginPath();
      this.ctx.arc(0, 10, 18, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(0, 10, 8 + Math.sin(this.state.frameCount * 0.2) * 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      this.ctx.restore();
    }

    drawBullets() {
      this.ctx.globalCompositeOperation = 'screen';
      this.bullets.forEach(bullet => {
        this.ctx.save();
        this.ctx.shadowColor = bullet.color;
        this.ctx.shadowBlur = bullet.laser ? 20 : 12;
        this.ctx.fillStyle = bullet.color;
        if (bullet.laser) {
          this.ctx.fillRect(bullet.x - bullet.w / 2, bullet.y - bullet.h, bullet.w, bullet.h * 2);
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.fillRect(bullet.x - bullet.w / 4, bullet.y - bullet.h, bullet.w / 2, bullet.h * 2);
        } else if (bullet.missile) {
          this.ctx.beginPath();
          this.ctx.moveTo(bullet.x, bullet.y - bullet.h);
          this.ctx.lineTo(bullet.x + bullet.w / 2, bullet.y - bullet.h / 2);
          this.ctx.lineTo(bullet.x + bullet.w / 2, bullet.y);
          this.ctx.lineTo(bullet.x - bullet.w / 2, bullet.y);
          this.ctx.lineTo(bullet.x - bullet.w / 2, bullet.y - bullet.h / 2);
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          this.ctx.beginPath();
          this.ctx.roundRect(bullet.x - bullet.w / 2, bullet.y, bullet.w, bullet.h, bullet.w / 2);
          this.ctx.fill();
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.beginPath();
          this.ctx.roundRect(bullet.x - bullet.w / 4, bullet.y + 2, bullet.w / 2, bullet.h - 4, bullet.w / 4);
          this.ctx.fill();
        }
        this.ctx.restore();
      });
      this.ctx.globalCompositeOperation = 'source-over';
    }

    drawShip() {
      this.ship.trail.forEach((trail, index) => {
        trail.life -= 0.1;
        if (trail.life <= 0) {
          return;
        }
        const alpha = trail.life * 0.6;
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#FF1744';
        this.ctx.beginPath();
        this.ctx.arc(trail.x, trail.y + index * 2, 12 * trail.life, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFDD00';
        this.ctx.beginPath();
        this.ctx.arc(trail.x, trail.y + index * 2, 6 * trail.life, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
      });

      const blinkVisible = this.ship.invincible <= 0 || Math.floor(this.state.frameCount / 4) % 2 === 0;
      if (!blinkVisible) {
        return;
      }

      this.ctx.save();
      this.ctx.shadowColor = this.ship.invincible > 0 ? '#00CFFF' : '#FF1744';
      this.ctx.shadowBlur = this.ship.invincible > 0 ? 30 : 15;
      if (this.shipImg.complete && this.shipImg.naturalWidth > 0) {
        this.ctx.drawImage(this.shipImg, this.ship.x - this.ship.w / 2, this.ship.y - this.ship.h / 2, this.ship.w, this.ship.h);
      } else {
        this.ctx.fillStyle = '#FF1744';
        this.ctx.beginPath();
        this.ctx.moveTo(this.ship.x, this.ship.y - this.ship.h / 2);
        this.ctx.lineTo(this.ship.x - this.ship.w / 2, this.ship.y + this.ship.h / 2);
        this.ctx.lineTo(this.ship.x, this.ship.y + this.ship.h / 4);
        this.ctx.lineTo(this.ship.x + this.ship.w / 2, this.ship.y + this.ship.h / 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#00CFFF';
        this.ctx.beginPath();
        this.ctx.ellipse(this.ship.x, this.ship.y - this.ship.h / 6, 6, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();

      if (this.ship.invincible > 60) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = 0.5 + Math.sin(this.state.frameCount * 0.2) * 0.2;
        const shieldGrad = this.ctx.createRadialGradient(this.ship.x, this.ship.y, 20, this.ship.x, this.ship.y, 50);
        shieldGrad.addColorStop(0, 'rgba(136, 170, 255, 0.1)');
        shieldGrad.addColorStop(0.8, 'rgba(136, 170, 255, 0.4)');
        shieldGrad.addColorStop(1, 'rgba(136, 170, 255, 0.8)');
        this.ctx.fillStyle = shieldGrad;
        this.ctx.beginPath();
        this.ctx.arc(this.ship.x, this.ship.y, 50, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc(this.ship.x, this.ship.y, 50, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.restore();
      }
    }

    loop(timestamp) {
      if (!this.state.running) {
        return;
      }
      const dt = Math.min((timestamp - this.state.lastTime) / 16.6, 3);
      this.state.lastTime = timestamp;
      this.update(dt);
      this.draw();
      requestAnimationFrame(ts => this.loop(ts));
    }
  }

  new NexarGame();
})();