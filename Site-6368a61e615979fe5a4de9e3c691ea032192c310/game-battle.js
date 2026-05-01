(function(){
'use strict';
const COLORS=['#FFB300','#1E88E5','#00E5FF','#00C853','#AA00FF','#FF6D00','#FF1744'];
const NAMES=['VYRA','ELON','KRYON','SYLAR','ZYNTH','AURON','NEXAR'];
const W=900,H=420,GRAV=0.045,TW=28,TH=16;
let terrain,tanks,bullet,particles,confetti,turn,wind,power,angle,firing,gameOver,animId,pDrag,joySt;

const gc=()=>document.getElementById('gb-canvas');
const gx=()=>gc().getContext('2d');

/* ── AUDIO ── */
let actx=null;
function initAudio(){if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();}
function sndShoot(){
  try{initAudio();
    const o=actx.createOscillator(),g=actx.createGain();
    o.type='square';o.frequency.setValueAtTime(800,actx.currentTime);
    o.frequency.exponentialRampToValueAtTime(200,actx.currentTime+.12);
    g.gain.setValueAtTime(.18,actx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.15);
    o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+.15);
  }catch(e){}
}
function sndHit(){
  try{initAudio();
    const o=actx.createOscillator(),g=actx.createGain();
    o.type='sine';o.frequency.setValueAtTime(300,actx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80,actx.currentTime+.2);
    g.gain.setValueAtTime(.22,actx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.25);
    o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+.25);
    // noise layer
    const buf=actx.createBuffer(1,actx.sampleRate*.2,actx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*.5;
    const src=actx.createBufferSource(),g2=actx.createGain();
    src.buffer=buf;g2.gain.setValueAtTime(.1,actx.currentTime);
    g2.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.2);
    src.connect(g2);g2.connect(actx.destination);src.start();
  }catch(e){}
}
function sndExplosion(){
  try{initAudio();
    const buf=actx.createBuffer(1,actx.sampleRate*.6,actx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/(actx.sampleRate*.6));
    const src=actx.createBufferSource(),g=actx.createGain();
    const flt=actx.createBiquadFilter();flt.type='lowpass';flt.frequency.value=400;
    src.buffer=buf;g.gain.setValueAtTime(.35,actx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.6);
    src.connect(flt);flt.connect(g);g.connect(actx.destination);src.start();
    // sub boom
    const o=actx.createOscillator(),g2=actx.createGain();
    o.type='sine';o.frequency.setValueAtTime(120,actx.currentTime);
    o.frequency.exponentialRampToValueAtTime(30,actx.currentTime+.5);
    g2.gain.setValueAtTime(.3,actx.currentTime);g2.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.5);
    o.connect(g2);g2.connect(actx.destination);o.start();o.stop(actx.currentTime+.5);
  }catch(e){}
}
function sndVictory(){
  try{initAudio();
    const notes=[523,659,784,1047];
    notes.forEach((f,i)=>{
      const o=actx.createOscillator(),g=actx.createGain();
      o.type='triangle';o.frequency.value=f;
      g.gain.setValueAtTime(0,actx.currentTime+i*.15);
      g.gain.linearRampToValueAtTime(.2,actx.currentTime+i*.15+.05);
      g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+i*.15+.3);
      o.connect(g);g.connect(actx.destination);
      o.start(actx.currentTime+i*.15);o.stop(actx.currentTime+i*.15+.3);
    });
  }catch(e){}
}

/* ── TERRAIN ── */
function tY(x){x=Math.max(0,Math.min(W-1,Math.round(x)));return terrain[x]??H;}
function genTerrain(){
  terrain=new Float32Array(W);let y=H*.55;
  for(let x=0;x<W;x++){y+=(Math.random()-.5)*5;y=Math.max(H*.28,Math.min(H*.8,y));terrain[x]=y;}
  for(let p=0;p<8;p++)for(let x=1;x<W-1;x++)terrain[x]=(terrain[x-1]*.25+terrain[x]*.5+terrain[x+1]*.25);
}

/* ── TANKS ── */
function initTanks(){
  tanks=[];
  for(let i=0;i<7;i++){
    const tx=(W/8)*(i+1),ty=tY(tx)-TH/2;
    tanks.push({x:tx,y:ty,vy:0,hp:100,maxHp:100,color:COLORS[i],name:NAMES[i],alive:true,angle:i<3?60:-120});
  }
}

/* ── WIND ── */
function newWind(){
  // 50% chance: vento zero; 40%: vento fraco (±0.5–1.5); 10%: vento moderado (±1.5–3)
  const r=Math.random();
  if(r<0.50){
    wind=0;
  } else if(r<0.90){
    wind=(Math.random()*1.0+0.5)*(Math.random()<0.5?1:-1);
  } else {
    wind=(Math.random()*1.5+1.5)*(Math.random()<0.5?1:-1);
  }
  const lbl=document.getElementById('gb-wind-lbl');
  if(lbl)lbl.textContent='VENTO '+(wind>0.3?'->':wind<-0.3?'<-':'.')+'  '+Math.abs(wind).toFixed(1);
  flagAnim();
}
function flagAnim(){
  const fc=document.getElementById('gb-flag');if(!fc)return;
  const fx=fc.getContext('2d'),t=Date.now()*.003;
  fx.clearRect(0,0,60,44);
  fx.strokeStyle='rgba(255,255,255,.7)';fx.lineWidth=2;
  fx.beginPath();fx.moveTo(10,40);fx.lineTo(10,8);fx.stroke();
  const dir=wind>=0?1:-1,spd=Math.min(Math.abs(wind)/8,1);
  fx.beginPath();fx.moveTo(10,8);
  fx.quadraticCurveTo(10+dir*20+Math.sin(t)*5*spd,18+Math.cos(t)*4*spd,10+dir*40+Math.sin(t+1)*7*spd,12+Math.cos(t)*5*spd);
  fx.quadraticCurveTo(10+dir*18+Math.sin(t+.5)*4*spd,26+Math.cos(t+.5)*3*spd,10,22);
  fx.closePath();fx.fillStyle=spd<0.05?'rgba(255,255,255,.4)':'rgba(0,229,255,.9)';fx.fill();
}
setInterval(flagAnim,50);

/* ── DRAW ── */
function drawBG(g){
  g.clearRect(0,0,W,H);
  const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#02001a');bg.addColorStop(1,'#01000a');
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(0,229,255,.04)';g.lineWidth=1;
  for(let x=0;x<W;x+=50){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}
  for(let y=0;y<H;y+=50){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
}
function drawTerrain(g){
  g.beginPath();g.moveTo(0,H);
  for(let x=0;x<W;x++)g.lineTo(x,terrain[x]);
  g.lineTo(W,H);g.closePath();
  const gr=g.createLinearGradient(0,H*.3,0,H);gr.addColorStop(0,'#14321e');gr.addColorStop(1,'#030a05');
  g.fillStyle=gr;g.fill();
  g.beginPath();for(let x=0;x<W;x++)x?g.lineTo(x,terrain[x]):g.moveTo(x,terrain[x]);
  g.strokeStyle='rgba(0,229,255,.3)';g.lineWidth=1.5;g.stroke();
}
function drawTanks(g){
  tanks.forEach((t,i)=>{
    if(!t.alive)return;
    const active=i===turn&&!gameOver&&!firing;
    const x=t.x,y=t.y;
    if(active){g.shadowColor=t.color;g.shadowBlur=18;}
    g.fillStyle=t.color;g.beginPath();g.roundRect(x-TW/2,y-TH,TW,TH,3);g.fill();
    g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x-TW/2-2,y-6,TW+4,6);
    g.fillStyle=t.color;
    for(let w=-TW/2+2;w<TW/2-2;w+=5){g.beginPath();g.arc(x+w,y-1,3.5,0,Math.PI*2);g.fill();}
    // barrel — use current angle for active tank, stored angle for others
    const a=(active?angle:t.angle)*(Math.PI/180);
    g.strokeStyle=active?'#fff':t.color;g.lineWidth=active?4:3;g.shadowBlur=active?10:0;g.shadowColor=t.color;
    g.beginPath();g.moveTo(x,y-TH);g.lineTo(x+Math.cos(-a)*20,y-TH+Math.sin(-a)*20);g.stroke();
    g.shadowBlur=0;
    // HP bar
    const bw=36;g.fillStyle='rgba(0,0,0,.7)';g.fillRect(x-bw/2,y-TH-16,bw,5);
    g.fillStyle=t.hp>50?'#00C853':t.hp>25?'#FFB300':'#FF1744';
    g.fillRect(x-bw/2,y-TH-16,bw*(t.hp/t.maxHp),5);
    g.fillStyle=active?'#fff':t.color;g.font='bold 7px Orbitron,monospace';g.textAlign='center';
    g.fillText(t.name,x,y-TH-20);
  });
}
function drawAimLine(g){
  if(firing||gameOver)return;
  const t=tanks[turn];if(!t||!t.alive)return;
  const a=angle*(Math.PI/180);
  let px=t.x,py=t.y-TH,vx=Math.cos(-a)*(power*.18),vy=Math.sin(-a)*(power*.18);
  g.setLineDash([3,5]);g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=1;
  g.beginPath();g.moveTo(px,py);
  for(let s=0;s<60;s++){
    vx+=wind*.018;vy+=GRAV;px+=vx;py+=vy;
    // wrap X
    if(px<0)px=W;if(px>W)px=0;
    if(py>=tY(px)||py>H)break;
    g.lineTo(px,py);
  }
  g.stroke();g.setLineDash([]);
}
function drawBullet(g){
  if(!bullet)return;
  (bullet.trail||[]).forEach((pt,i,a)=>{
    const al=i/a.length;g.beginPath();g.arc(pt.x,pt.y,2*al,0,Math.PI*2);
    g.fillStyle=`rgba(255,255,200,${al*.5})`;g.fill();
  });
  g.beginPath();g.arc(bullet.x,bullet.y,4,0,Math.PI*2);
  g.fillStyle='#fff';g.shadowColor=COLORS[bullet.owner];g.shadowBlur=16;g.fill();g.shadowBlur=0;
}
function drawParticles(g){
  particles.forEach(p=>{
    const a=p.life/p.maxLife;g.globalAlpha=Math.max(0,a);
    g.beginPath();g.arc(p.x,p.y,p.r*a,0,Math.PI*2);g.fillStyle=p.color;g.fill();
  });
  g.globalAlpha=1;
}
function drawConfetti(g){
  confetti.forEach(c=>{
    const a=c.life/c.maxLife;g.globalAlpha=Math.max(0,a);
    g.save();g.translate(c.x,c.y);g.rotate(c.rot);
    g.fillStyle=c.color;g.fillRect(-c.w/2,-c.h/2,c.w,c.h);
    g.restore();
  });
  g.globalAlpha=1;
}

/* ── PHYSICS ── */
function updatePhysics(){
  tanks.forEach(t=>{
    if(!t.alive)return;
    const ground=tY(t.x)-TH/2;
    if(t.y<ground-1){t.vy=(t.vy||0)+GRAV;t.y+=t.vy;if(t.y>=ground){t.y=ground;t.vy=0;}}
    else{t.y=ground;t.vy=0;}
    if(t.y>H+30){t.alive=false;t.hp=0;msg('[X] '+t.name+' CAIU DO MAPA!');}
  });
}
function updateBullet(){
  if(!bullet)return;
  bullet.trail=bullet.trail||[];
  bullet.trail.push({x:bullet.x,y:bullet.y});
  if(bullet.trail.length>22)bullet.trail.shift();
  bullet.vx+=wind*.018;bullet.vy+=GRAV;bullet.x+=bullet.vx;bullet.y+=bullet.vy;
  // WRAP X — bala volta pelo outro lado
  if(bullet.x<0)bullet.x=W;
  if(bullet.x>W)bullet.x=0;
  // dies only on terrain or falls below canvas
  if(bullet.y>H+50){bullet=null;endTurn();return;}
  if(bullet.y>=tY(bullet.x)){
    explode(bullet.x,bullet.y,COLORS[bullet.owner],50);
    bullet=null;checkWin();if(!gameOver)setTimeout(endTurn,900);
  }
}
function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life-=p.decay;
    if(p.life<=0)particles.splice(i,1);
  }
}
function updateConfetti(){
  for(let i=confetti.length-1;i>=0;i--){
    const c=confetti[i];c.x+=c.vx;c.y+=c.vy;c.vy+=.15;c.rot+=c.rotV;c.life-=.004;
    if(c.life<=0)confetti.splice(i,1);
  }
}

/* ── EXPLOSION ── */
function explode(x,y,color,radius){
  let killed=false;
  tanks.forEach(t=>{
    if(!t.alive)return;
    const d=Math.hypot(t.x-x,t.y-y);
    if(d<radius){
      sndHit();
      const dmg=Math.round((1-d/radius)*50+8);
      t.hp=Math.max(0,t.hp-dmg);
      if(t.hp===0){t.alive=false;killed=true;sndExplosion();msg('[BOOM] '+t.name+' DESTRUIDO!');}
    }
  });
  if(!killed)sndHit();
  for(let tx=Math.max(0,(x-radius)|0);tx<Math.min(W,(x+radius+1)|0);tx++){
    const d=Math.abs(tx-x),dig=Math.sqrt(Math.max(0,radius*radius-d*d))*.95;
    terrain[tx]=Math.min(H-2,terrain[tx]+dig);
  }
  for(let i=0;i<38;i++){
    const a=Math.random()*Math.PI*2,sp=2+Math.random()*7;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-3,r:3+Math.random()*7,color,life:1,maxLife:1,decay:.022+Math.random()*.04});
  }
}

/* ── TURNS ── */
function endTurn(){
  if(gameOver)return;firing=false;
  if(tanks[turn])tanks[turn].angle=angle;
  let tries=0;do{turn=(turn+1)%7;tries++;}while(!tanks[turn].alive&&tries<7);
  newWind();angle=tanks[turn].angle;updateTurnUI();
}
function checkWin(){
  const alive=tanks.filter(t=>t.alive);
  if(alive.length<=1){
    gameOver=true;
    if(alive.length===1){
      spawnVictory(alive[0]);
      msg('[WIN] '+alive[0].name+' VENCEU A BATALHA!');
    } else {
      msg('[BOOM] EMPATE!');
    }
    document.getElementById('gb-restart').style.display='inline-block';
  }
}
function spawnVictory(winner){
  sndVictory();
  // confetti burst
  for(let i=0;i<120;i++){
    const a=Math.random()*Math.PI*2,sp=3+Math.random()*8;
    confetti.push({
      x:W/2,y:H/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-5,
      w:6+Math.random()*8,h:4+Math.random()*6,
      color:COLORS[Math.floor(Math.random()*7)],
      rot:Math.random()*Math.PI*2,rotV:(Math.random()-.5)*.3,
      life:1,maxLife:1
    });
  }
  // Show trophy overlay
  let ov=document.getElementById('gb-victory-ov');
  if(!ov){ov=document.createElement('div');ov.id='gb-victory-ov';document.getElementById('game-section').appendChild(ov);}
  ov.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:50;background:rgba(0,0,0,.75);animation:gbFadeIn .5s ease forwards;';
  ov.innerHTML=`
    <div style="font-size:72px;animation:gbBounce 1s ease infinite alternate;margin-bottom:16px;">&#127942;</div>
    <div style="font-family:Orbitron,monospace;font-size:28px;font-weight:900;color:${winner.color};text-shadow:0 0 30px ${winner.color};letter-spacing:.3em;">${winner.name}</div>
    <div style="font-family:Rajdhani,sans-serif;font-size:16px;color:rgba(255,255,255,.6);margin-top:8px;letter-spacing:.25em;">VENCEU A BATALHA</div>
  `;
  if(!document.getElementById('gb-anim-style')){
    const st=document.createElement('style');st.id='gb-anim-style';
    st.textContent='@keyframes gbFadeIn{from{opacity:0}to{opacity:1}}@keyframes gbBounce{from{transform:scale(1) rotate(-5deg)}to{transform:scale(1.15) rotate(5deg)}}';
    document.head.appendChild(st);
  }
}
function updateTurnUI(){
  const t=tanks[turn];
  const lbl=document.getElementById('gb-turn');
  if(lbl){lbl.style.color=t.color;lbl.textContent='VEZ DE: '+t.name;}
  const av=document.getElementById('gb-angle-val');if(av)av.textContent=Math.round(angle)+'deg';
  msg('[CTRL] '+t.name+' -- Use < > para mirar e FIRE para atirar');
}
function msg(m){const el=document.getElementById('gb-msg');if(el)el.textContent=m;}

/* ── JOYSTICK ── */
window.gbAngleStart=function(dir){
  if(gameOver||firing)return;
  gbAngleStep(dir);joySt=setInterval(()=>gbAngleStep(dir),75);
};
window.gbAngleStop=function(){clearInterval(joySt);joySt=null;};
function gbAngleStep(dir){
  if(gameOver||firing)return;
  // Full 360: -180 to 180
  angle=angle+dir*4;
  if(angle>180)angle-=360;
  if(angle<-180)angle+=360;
  const av=document.getElementById('gb-angle-val');if(av)av.textContent=Math.round(angle)+'deg';
}

/* ── POWER SLIDER ── */
function initPowerSlider(){
  const track=document.getElementById('gb-power-track');
  const fill=document.getElementById('gb-power-fill');
  const val=document.getElementById('gb-power-val');
  if(!track)return;
  function setPow(clientX){
    const r=track.getBoundingClientRect();
    power=Math.round(Math.max(5,Math.min(100,((clientX-r.left)/r.width)*100)));
    if(fill)fill.style.width=power+'%';if(val)val.textContent=power+'%';
  }
  track.addEventListener('mousedown',e=>{pDrag=true;setPow(e.clientX);});
  window.addEventListener('mousemove',e=>{if(pDrag)setPow(e.clientX);});
  window.addEventListener('mouseup',()=>pDrag=false);
  track.addEventListener('touchstart',e=>{e.preventDefault();setPow(e.touches[0].clientX);},{passive:false});
  track.addEventListener('touchmove',e=>{e.preventDefault();setPow(e.touches[0].clientX);},{passive:false});
}

/* ── FIRE ── */
window.gbFire=function(){
  if(gameOver||firing||bullet)return;
  const t=tanks[turn];if(!t||!t.alive)return;
  initAudio();sndShoot();
  firing=true;
  // Max effective speed capped — lunar physics
  const a=angle*(Math.PI/180);
  const spd=power*.18; // reduced multiplier
  bullet={x:t.x+Math.cos(-a)*24,y:t.y-TH+Math.sin(-a)*24,vx:Math.cos(-a)*spd,vy:Math.sin(-a)*spd,owner:turn,trail:[]};
  msg('[BOOM] '+t.name+' DISPAROU! Forca: '+power+'% | Angulo: '+Math.round(angle)+'deg');
};

/* ── LOOP ── */
function loop(){
  const g=gx();
  drawBG(g);updatePhysics();updateBullet();updateParticles();updateConfetti();
  drawTerrain(g);drawAimLine(g);drawTanks(g);drawBullet(g);drawParticles(g);drawConfetti(g);
  animId=requestAnimationFrame(loop);
}

/* ── RESIZE ── */
function resizeCanvas(){
  const c=gc(),maxW=Math.min(900,window.innerWidth-24);
  c.style.width=maxW+'px';c.style.height=(maxW*(H/W))+'px';
}

/* ── INIT ── */
window.initGame=function(){
  if(animId)cancelAnimationFrame(animId);
  // Remove victory overlay if exists
  const ov=document.getElementById('gb-victory-ov');if(ov)ov.remove();
  gameOver=false;bullet=null;particles=[];confetti=[];firing=false;power=50;turn=0;wind=0;pDrag=false;joySt=null;
  document.getElementById('gb-restart').style.display='none';
  genTerrain();initTanks();newWind();
  angle=tanks[0].angle;
  const pf=document.getElementById('gb-power-fill'),pv=document.getElementById('gb-power-val');
  if(pf)pf.style.width='50%';if(pv)pv.textContent='50%';
  updateTurnUI();resizeCanvas();loop();
};
window.addEventListener('resize',resizeCanvas);
initPowerSlider();
initGame();
})();
