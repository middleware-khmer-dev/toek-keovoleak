/* Sweet music-box music, synthesised in the browser (no audio files) */
(function () {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { window.Music = { start() {}, birthday() {} }; return; }

  let ctx, master, amb, wet, started = false, muted = false, next = 0, bar = 0, btn;
  const VOL = .55, EIGHTH = 60 / 66 / 2;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  /* gentle looping arpeggios (Canon-style chord loop) */
  const CH = [[62, 66, 69, 74], [61, 64, 69, 73], [62, 66, 71, 74], [61, 66, 69, 73],
              [62, 67, 71, 74], [62, 66, 69, 74], [62, 67, 71, 74], [61, 64, 69, 73]];
  const PAT = [0, 1, 2, 3, 2, 1, 3, 2];

  /* "Happy Birthday" (traditional, public domain): [midi, beats] */
  const HB = [67, .75, 67, .25, 69, 1, 67, 1, 72, 1, 71, 2,
              67, .75, 67, .25, 69, 1, 67, 1, 74, 1, 72, 2,
              67, .75, 67, .25, 79, 1, 76, 1, 72, 1, 71, 1, 69, 1,
              77, .75, 77, .25, 76, 1, 72, 1, 74, 1, 72, 2];

  function init() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = VOL; master.connect(ctx.destination);
    amb = ctx.createGain(); amb.connect(master);
    const d = ctx.createDelay(1), fb = ctx.createGain(), wg = ctx.createGain();
    d.delayTime.value = .32; fb.gain.value = .38; wg.gain.value = .35;
    wet = ctx.createGain(); wet.connect(d); d.connect(fb); fb.connect(d); d.connect(wg); wg.connect(master);
  }

  function bell(out, m, t, dur, v) {              // music-box style tone
    const f = hz(m), g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + .008);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    [[1, 1], [2, .28], [3.01, .12], [4.2, .05]].forEach(([r, a]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = "sine"; o.frequency.value = f * r; og.gain.value = a;
      o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + .05);
    });
    g.connect(out); g.connect(wet);
  }

  function sched() {
    while (next < ctx.currentTime + 1.2) {
      const c = CH[bar % CH.length];
      for (let i = 0; i < 8; i++) bell(amb, c[PAT[i]], next + i * EIGHTH, 2.2, .15);
      bell(amb, c[0] - 12, next, 3.2, .2);
      next += 8 * EIGHTH; bar++;
    }
  }

  function makeButton() {
    btn = document.createElement("button");
    btn.className = "music-btn"; btn.type = "button";
    btn.onclick = toggle; paint(); document.body.appendChild(btn);
  }
  function paint() { btn.textContent = muted ? "🔇" : "🎵"; btn.setAttribute("aria-label", muted ? "Turn music on" : "Turn music off"); btn.setAttribute("aria-pressed", String(!muted)); }
  function toggle() {
    muted = !muted; paint();
    master.gain.setTargetAtTime(muted ? 0 : VOL, ctx.currentTime, .1);
  }

  function start() {
    if (started) { if (ctx.state === "suspended" && !muted) ctx.resume(); return; }
    started = true; init(); ctx.resume();
    next = ctx.currentTime + .1; sched(); setInterval(sched, 250);
    makeButton();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) ctx.suspend(); else if (!muted) ctx.resume();
    });
  }

  function birthday() {
    start();
    const now = ctx.currentTime, beat = .62, SHIFT = -5;   // same key (D) as the background loop
    amb.gain.cancelScheduledValues(now);                  // silence the loop so the tune plays alone
    amb.gain.setTargetAtTime(0, now, .12);
    let t = now + .5;
    for (let i = 0; i < HB.length; i += 2) { bell(master, HB[i] + SHIFT, t, 1.8, .34); t += HB[i + 1] * beat; }
    amb.gain.setTargetAtTime(1, t + 1.5, 1.2);            // loop fades back in softly afterwards
  }

  window.Music = { start, birthday };
})();
