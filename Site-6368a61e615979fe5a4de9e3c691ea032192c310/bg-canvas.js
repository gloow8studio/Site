/* ── STARFIELD + NEBULA + METEORS on canvas ── */
(function () {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], meteors = [], dustClouds = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initScene();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function initScene() {
    stars = Array.from({ length: 700 }, () => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(.3, 1.8),
      a: rand(.3, 1),
      twinkle: rand(0.005, 0.02),
      phase: rand(0, Math.PI * 2)
    }));

    dustClouds = [
      { x: W * .12, y: H * .25, rx: W * .28, ry: H * .22, a: 0.06, c: '#FF6B35' },
      { x: W * .55, y: H * .15, rx: W * .32, ry: H * .18, a: 0.05, c: '#6C3DC8' },
      { x: W * .8, y: H * .6, rx: W * .22, ry: H * .20, a: 0.04, c: '#1A6BB5' },
      { x: W * .3, y: H * .7, rx: W * .25, ry: H * .16, a: 0.04, c: '#C2185B' },
      { x: W * .65, y: H * .45, rx: W * .18, ry: H * .14, a: 0.03, c: '#00897B' },
    ];

    meteors = [];
  }

  function spawnMeteor() {
    meteors.push({
      x: rand(W * .1, W * .9),
      y: rand(-20, H * .3),
      len: rand(80, 200),
      speed: rand(6, 14),
      angle: rand(25, 55) * Math.PI / 180,
      alpha: 1,
      fade: rand(.012, .025)
    });
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // bg gradient – deep space
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * .8);
    bg.addColorStop(0, '#06050f');
    bg.addColorStop(.5, '#030208');
    bg.addColorStop(1, '#000000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // nebula dust clouds
    dustClouds.forEach(d => {
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, Math.max(d.rx, d.ry));
      g.addColorStop(0, hexAlpha(d.c, d.a));
      g.addColorStop(.5, hexAlpha(d.c, d.a * .4));
      g.addColorStop(1, 'transparent');
      ctx.save();
      ctx.scale(d.rx / Math.max(d.rx, d.ry), d.ry / Math.max(d.rx, d.ry));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(d.x * Math.max(d.rx, d.ry) / d.rx, d.y * Math.max(d.rx, d.ry) / d.ry, Math.max(d.rx, d.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // stars
    t += .016;
    stars.forEach(s => {
      const a = s.a * (.6 + .4 * Math.sin(t * s.twinkle * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });

    // meteor spawn
    if (Math.random() < .018) spawnMeteor();

    // meteors
    meteors.forEach((m, i) => {
      const x2 = m.x - Math.cos(m.angle) * m.len;
      const y2 = m.y - Math.sin(m.angle) * m.len;
      const g = ctx.createLinearGradient(m.x, m.y, x2, y2);
      g.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
      g.addColorStop(.4, `rgba(180,200,255,${m.alpha * .5})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= m.fade;
    });
    meteors = meteors.filter(m => m.alpha > 0 && m.x < W + 200 && m.y < H + 200);

    requestAnimationFrame(draw);
  }

  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
