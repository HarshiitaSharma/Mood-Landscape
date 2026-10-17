const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const clamp = (v,a=0,b=1) => Math.min(b,Math.max(a,v)), lerp = (a,b,t) => a+(b-a)*t;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function rng(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* WORDS, CHIPS and NEG come from words.js */

const tgt = {m:.7,e:.4,t:.8}, cur = {...tgt};
let layers, stars, clouds, drops, flies, trees, W = 0, H = 0, seed = 0, paused = false, clock = 0, last = 0;

function setup(s){
  seed = s ?? Math.floor(Math.random()*1e9);
  const r = rng(seed);
  layers = [0,1,2,3].map(() => ({p:[r()*6.28,r()*6.28,r()*6.28], f:[2+r()*2,5+r()*3,11+r()*5]}));
  stars = Array.from({length:110}, () => ({x:r(),y:r()*.55,s:.4+r()*1.4,p:r()*6.28}));
  clouds = Array.from({length:12}, () => ({x:r()*1.3,y:.05+r()*.3,s:.6+r(),v:.4+r()*.8}));
  drops = Array.from({length:220}, () => ({x:r(),y:r(),l:8+r()*10}));
  flies = Array.from({length:40}, () => ({x:r(),y:r(),s:.5+r(),p:r()*6.28}));
  trees = Array.from({length:28}, () => ({x:r(),h:.05+r()*.06}));
  writeHash();
}
const BASE = [.56,.64,.74,.86], AMP = [.13,.10,.08,.05];
function ridge(l, xn){
  const g = layers[l];
  const v = Math.sin(xn*g.f[0]+g.p[0])*.5 + Math.sin(xn*g.f[1]+g.p[1])*.3 + Math.sin(xn*g.f[2]+g.p[2])*.2;
  return (BASE[l] + AMP[l]*v) * H;
}
function layer(l, fill){
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0,H);
  for(let x=0;x<=W+6;x+=6) ctx.lineTo(x, ridge(l, x/W));
  ctx.lineTo(W,H); ctx.fill();
}
function glow(x,y,r,color){
  const g = ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,color); g.addColorStop(1,'transparent');
  ctx.fillStyle = g; ctx.fillRect(x-r,y-r,r*2,r*2);
}

/* Pastel palette: colors are interpolated by mood, then blended toward night */
const TOP_D = [[0,215,18,52],[.5,200,42,68],[1,198,60,80]];
const BOT_D = [[0,208,18,64],[.4,180,36,74],[.7,45,80,85],[1,12,85,84]];
const NIGHT_TOP = [18,30,58], NIGHT_BOT = [36,62,84];
const TEAL = [[143,176,181],[115,155,160],[88,128,135],[58,96,104]];
function hsl2rgb(h,s,l){ s/=100; l/=100; const k = n => (n + h/30) % 12, a = s*Math.min(l,1-l), f = n => l - a*Math.max(-1, Math.min(k(n)-3, 9-k(n), 1)); return [f(0)*255, f(8)*255, f(4)*255]; }
function stops(arr, m){
  let i = 0; while(i < arr.length-2 && m > arr[i+1][0]) i++;
  const a = arr[i], b = arr[i+1], u = clamp((m-a[0])/(b[0]-a[0]));
  return hsl2rgb(lerp(a[1],b[1],u), lerp(a[2],b[2],u), lerp(a[3],b[3],u));
}
const mix = (a,b,u) => a.map((v,i) => lerp(v,b[i],u));
const rgb = (c,al) => al === undefined ? `rgb(${c.map(Math.round)})` : `rgba(${c.map(Math.round)},${al})`;
const skyColors = (m,t) => [mix(NIGHT_TOP, stops(TOP_D,m), t), mix(NIGHT_BOT, stops(BOT_D,m), t)];

function frame(ts){
  const dt = ts - last; last = ts;
  if(!paused && !reduced) clock += Math.min(dt,100);
  const T = clock;
  for(const k in cur) cur[k] += (tgt[k]-cur[k]) * .06;
  const {m,e,t} = cur;
  const [topC, botC] = skyColors(m,t);
  const sky = ctx.createLinearGradient(0,0,0,H*.75);
  sky.addColorStop(0, rgb(topC)); sky.addColorStop(1, rgb(botC));
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);

  /* stars + shooting star */
  const sa = clamp((.5-t)/.4) * clamp(m*1.6);
  if(sa > .02){
    for(const s of stars){
      ctx.globalAlpha = sa * (.5+.5*Math.sin(T*.002*s.s+s.p)); ctx.fillStyle = '#fff';
      ctx.fillRect(s.x*W, s.y*H, s.s, s.s);
    }
    const n = Math.floor(T/6500), ph = (T%6500)/700;
    if(ph < 1 && n > 0){
      const r = rng(n*7919+seed), x0 = (.2+r()*.6)*W, y0 = (.04+r()*.25)*H;
      ctx.globalAlpha = sa*(1-ph); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(x0+ph*W*.12, y0+ph*H*.07); ctx.lineTo(x0+ph*W*.12-W*.05, y0+ph*H*.07-H*.03); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  /* sun and moon */
  const R = Math.min(W,H)*.07, veil = .4 + .6*clamp(m/.3);
  if(t > .05){
    const sx = W*.72, sy = H*(.5-.28*t);
    glow(sx,sy,R*5,`hsla(${lerp(30,48,m)} 100% 70% / ${.55*t*veil})`);
    ctx.fillStyle = `hsla(45 100% 88% / ${t*veil})`; ctx.beginPath(); ctx.arc(sx,sy,R,0,7); ctx.fill();
  }
  if(t < .7){
    const mx = W*.25, my = H*.2, a = clamp(1-t/.7)*clamp(m*1.5+.2);
    glow(mx,my,R*4,`hsla(220 60% 85% / ${.35*a})`);
    ctx.fillStyle = `hsla(220 40% 94% / ${a})`; ctx.beginPath(); ctx.arc(mx,my,R*.8,0,7); ctx.fill();
  }

  /* clouds */
  const nc = Math.round(3 + (1-m)*9);
  ctx.fillStyle = rgb(mix([120,135,155],[255,250,247],clamp(m*.7+.3)).map(v => v*(.4+.6*t)), .5+.35*(1-m));
  for(let i=0;i<nc;i++){
    const c = clouds[i], x = (((c.x + T*.000012*c.v*(.3+e*2.2)) % 1.4) - .2) * W, y = c.y*H, s = c.s*W*.05;
    ctx.beginPath();
    [[0,0,1],[1.1,.2,.8],[-1.1,.25,.75],[.4,-.45,.8],[-.5,-.3,.65]].forEach(([dx,dy,k]) => { ctx.moveTo(x+dx*s+s*k,y+dy*s); ctx.arc(x+dx*s,y+dy*s,s*k,0,7); });
    ctx.fill();
  }

  /* birds on bright days */
  if(t > .55 && m > .6){
    const n = 3 + Math.round(e*5), a = clamp((t-.55)/.2)*clamp((m-.6)/.2);
    ctx.strokeStyle = `rgba(40,70,80,${.6*a})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for(let i=0;i<n;i++){
      const b = flies[i], x = (((b.x + T*.00002*(.5+e*2)*b.s) % 1.2) - .1)*W, y = (.14+b.y*.22)*H + Math.sin(T*.001*b.s+b.p)*H*.01;
      const w = Math.sin(T*.012*b.s+b.p)*4;
      ctx.beginPath(); ctx.moveTo(x-8,y-w); ctx.quadraticCurveTo(x-3,y-3,x,y); ctx.quadraticCurveTo(x+3,y-3,x+8,y-w); ctx.stroke();
    }
  }

  /* mountains */
  const col = l => rgb(mix(botC, TEAL[l].map(v => v*(.3+.7*t)), .4+.17*l));
  layer(0,col(0)); layer(1,col(1));
  const mist = ctx.createLinearGradient(0,H*.55,0,H*.85);
  mist.addColorStop(0,'transparent'); mist.addColorStop(1, rgb(botC,.35));
  ctx.fillStyle = mist; ctx.fillRect(0,H*.55,W,H*.3);
  layer(2,col(2)); layer(3,col(3));
  ctx.fillStyle = col(3);
  for(const tr of trees){
    const x = tr.x*W, y = ridge(3,tr.x), h = tr.h*H, w = h*.38;
    ctx.beginPath(); ctx.moveTo(x-w,y+2); ctx.lineTo(x,y-h); ctx.lineTo(x+w,y+2); ctx.fill();
  }

  /* fireflies */
  if(t < .55 && m > .35){
    const n = Math.round(8 + e*32), a = clamp((.55-t)/.3);
    for(let i=0;i<n;i++){
      const f = flies[i], x = (f.x + .03*Math.sin(T*.0004*f.s+f.p))*W, y = (.66 + f.y*.3 + .02*Math.cos(T*.0005*f.s+f.p))*H;
      glow(x,y,10,`hsla(70 100% 65% / ${a*(.35+.35*Math.sin(T*.003*f.s+f.p))})`);
    }
  }
  /* rain */
  if(m < .35){
    const k = (.35-m)/.35, n = Math.round(k*220);
    ctx.strokeStyle = `rgba(200,212,255,${.18+.25*k})`; ctx.lineWidth = 1; ctx.beginPath();
    for(let i=0;i<n;i++){
      const d = drops[i], y = ((d.y + T*.0006*(.6+e)) % 1)*H, x = d.x*W + y*.15;
      ctx.moveTo(x,y); ctx.lineTo(x+d.l*.15,y+d.l);
    }
    ctx.stroke();
  }
  /* lightning */
  if(m < .18 && e > .55 && !reduced){
    const f = Math.pow(Math.max(0,Math.sin(T*.0009)),60) * Math.pow(Math.max(0,Math.sin(T*.0023)),3);
    if(f > .01){ ctx.fillStyle = `rgba(255,255,255,${f*.6})`; ctx.fillRect(0,0,W,H); }
  }
  requestAnimationFrame(frame);
}

function resize(){
  const dpr = devicePixelRatio || 1, r = cv.getBoundingClientRect();
  W = r.width; H = r.height; cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
}

/* Controls */
function syncSliders(){ $('m').value = tgt.m*100; $('e').value = tgt.e*100; $('t').value = tgt.t*100; }
function describe(){
  const m = tgt.m, e = tgt.e, t = tgt.t;
  const sky = m<.25?'a storm':m<.5?'an overcast sky':m<.8?'a soft sky':'a bright sky';
  const pace = e<.3?'very still':e<.65?'gently moving':'restless';
  const hour = t<.25?'night':t<.55?'dusk or dawn':'daytime';
  return sky + ', ' + pace + ', ' + hour + '.';
}
function fromText(){
  const words = $('feel').value.toLowerCase(), hits = [];
  for(const k in WORDS){
    const i = words.indexOf(k); if(i < 0) continue;
    const neg = NEG.test(words.slice(0,i));
    const [m,e,t] = WORDS[k];
    hits.push({k:(neg?'not ':'')+k, v: neg ? [clamp(1.05-m,.15,.85), e, t] : [m,e,t]});
  }
  if(!hits.length){ $('cap').textContent = words.trim() ? 'No known feeling words yet. Try "calm", "anxious", "happy" or "tired". ' + describe() : describe(); return; }
  ['m','e','t'].forEach((k,i) => tgt[k] = hits.reduce((s,h)=>s+h.v[i],0)/hits.length);
  syncSliders(); writeHash();
  $('cap').textContent = 'Reading: ' + hits.map(h=>h.k).join(', ') + '. ' + describe();
}
$('feel').addEventListener('input', fromText);
['m','e','t'].forEach(k => $(k).addEventListener('input', () => { tgt[k] = $(k).value/100; $('cap').textContent = describe(); writeHash(); }));
CHIPS.forEach(c => { const b = document.createElement('button'); b.textContent = c; b.onclick = () => { $('feel').value = c; fromText(); }; $('chips').append(b); });
$('shape').onclick = () => setup();
$('save').onclick = () => cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'mood-landscape.png'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); });
$('pause').onclick = () => { paused = !paused; $('pause').textContent = paused ? 'Play' : 'Pause'; $('pause').setAttribute('aria-pressed', paused); };
addEventListener('resize', resize);

/* Shareable state in the URL hash */
function writeHash(){
  try { history.replaceState(null,'',`#m=${Math.round(tgt.m*100)}&e=${Math.round(tgt.e*100)}&t=${Math.round(tgt.t*100)}&s=${seed}`); } catch {}
}
$('share').onclick = async () => {
  writeHash();
  try { await navigator.clipboard.writeText(location.href); $('cap').textContent = 'Link copied. It reopens this exact landscape.'; }
  catch { $('cap').textContent = 'Copy the address bar to share this landscape.'; }
};

/* Mood journal (kept in this browser only) */
const JKEY = 'mood-landscape-journal';
const jload = () => { try { return JSON.parse(localStorage.getItem(JKEY)) || []; } catch { return []; } };
function renderJournal(){
  const j = jload(), box = $('journal'); box.innerHTML = '';
  if(!j.length){ box.innerHTML = '<span class="hint">Save a moment to remember how a day looked. Click a swatch to revisit it.</span>'; return; }
  j.forEach((x,i) => {
    const [a,b] = skyColors(x.m,x.t), s = document.createElement('button');
    s.className = 'sw'; s.style.background = `linear-gradient(${rgb(a)},${rgb(b)})`;
    s.title = `${x.date}${x.text ? ' · ' + x.text : ''} (double-click to remove)`;
    s.setAttribute('aria-label', 'Revisit ' + s.title);
    s.onclick = () => { Object.assign(tgt,{m:x.m,e:x.e,t:x.t}); setup(x.seed); $('feel').value = x.text || ''; syncSliders(); $('cap').textContent = describe(); };
    s.ondblclick = () => { j.splice(i,1); try { localStorage.setItem(JKEY, JSON.stringify(j)); } catch {} renderJournal(); };
    box.append(s);
  });
}
$('keep').onclick = () => {
  const j = jload();
  j.unshift({m:tgt.m,e:tgt.e,t:tgt.t,seed,text:$('feel').value.trim(),date:new Date().toLocaleDateString()});
  try { localStorage.setItem(JKEY, JSON.stringify(j.slice(0,16))); } catch {}
  renderJournal(); $('cap').textContent = 'Moment saved to your journal.';
};

/* Init: restore from hash if present */
const hp = new URLSearchParams(location.hash.slice(1));
['m','e','t'].forEach(k => { const v = parseFloat(hp.get(k)); if(!Number.isNaN(v)) tgt[k] = cur[k] = clamp(v/100); });
setup(hp.get('s') ? Number(hp.get('s')) : undefined); resize(); syncSliders(); renderJournal();
$('cap').textContent = describe(); requestAnimationFrame(frame);
