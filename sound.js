// Optional ambient sound: rain gets louder as mood drops, wind follows energy.
// Built from filtered noise with WebAudio, so there are no audio files to load.
(() => {
  const anchor = document.getElementById('pause');
  if (!anchor) return;
  const btn = document.createElement('button');
  btn.textContent = 'Sound: off';
  btn.setAttribute('aria-pressed', 'false');
  anchor.after(btn);

  let ctx, rain, wind, master, timer;
  const val = (id) => Number(document.getElementById(id).value) / 100;

  function noise(c) {
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.start();
    return src;
  }
  function chain(c, type, freq) {
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = c.createGain(); g.gain.value = 0;
    noise(c).connect(f); f.connect(g); g.connect(master);
    return g;
  }
  function start() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (!master) {
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      rain = chain(ctx, 'highpass', 1800);
      wind = chain(ctx, 'lowpass', 500);
    }
    ctx.resume();
    master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.4);
    timer = setInterval(update, 250); update();
  }
  function update() {
    const m = val('m'), e = val('e'), t = ctx.currentTime;
    rain.gain.setTargetAtTime(m < 0.4 ? (0.4 - m) / 0.4 * 0.35 : 0, t, 0.3);
    wind.gain.setTargetAtTime(0.04 + e * 0.3, t, 0.3);
  }
  function stop() {
    clearInterval(timer);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
  }
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on);
    btn.textContent = on ? 'Sound: on' : 'Sound: off';
    on ? start() : stop();
  });
})();
