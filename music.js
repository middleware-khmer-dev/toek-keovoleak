/* Sweet music-box music, synthesised in the browser (no audio files) */
(function () {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { window.Music = { start() {}, birthday() {} }; return; }

  let ctx, master, amb, ambWet, wet, holdUntil = 0, started = false, muted = false, next = 0, bar = 0, btn;
  const VOL = .55, EIGHTH = 60 / 60 / 2;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  /* gentle looping arpeggios (Canon-style chord loop) */
  const CH = [[62, 66, 69, 74], [61, 64, 69, 73], [62, 66, 71, 74], [61, 66, 69, 73],
              [62, 67, 71, 74], [62, 66, 69, 74], [62, 67, 71, 74], [61, 64, 69, 73]];
  const PAT = [0, 1, 2, 3, 2, 1, 3, 2];
  /* soft lullaby tune over the chords: [midi, start (eighths), length (eighths)] per bar */
  const MEL = [
    [[78, 0, 4], [74, 4, 2], [78, 6, 2]], [[76, 0, 4], [73, 4, 2], [76, 6, 2]],
    [[78, 0, 4], [74, 4, 2], [71, 6, 2]], [[73, 0, 4], [69, 4, 2], [73, 6, 2]],
    [[71, 0, 4], [74, 4, 2], [79, 6, 2]], [[78, 0, 4], [74, 4, 2], [78, 6, 2]],
    [[79, 0, 4], [74, 4, 2], [71, 6, 2]], [[76, 0, 4], [73, 4, 4]]
  ];

  /* "Happy Birthday" (traditional, public domain): [midi, beats] */
  const HB = [67, .75, 67, .25, 69, 1, 67, 1, 72, 1, 71, 2,
              67, .75, 67, .25, 69, 1, 67, 1, 74, 1, 72, 2,
              67, .75, 67, .25, 79, 1, 76, 1, 72, 1, 71, 1, 69, 1,
              77, .75, 77, .25, 76, 1, 72, 1, 74, 1, 72, 2];

  function init() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = VOL;
    const comp = ctx.createDynamicsCompressor();          // tames peaks so nothing sounds harsh
    comp.threshold.value = -24; comp.ratio.value = 4; comp.attack.value = .01; comp.release.value = .3;
    master.connect(comp); comp.connect(ctx.destination);
    amb = ctx.createGain(); amb.connect(master);
    const d = ctx.createDelay(1), fb = ctx.createGain(), wg = ctx.createGain();
    d.delayTime.value = .32; fb.gain.value = .32; wg.gain.value = .42;
    wet = ctx.createGain(); ambWet = ctx.createGain(); ambWet.connect(wet);   // ambient echo send has its own level
    const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 2200;   // darker, softer echoes
    wet.connect(d); d.connect(tone); tone.connect(fb); fb.connect(d); tone.connect(wg); wg.connect(master);
  }

  function bell(out, send, m, t, dur, v) {              // music-box style tone
    const f = hz(m), g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + .008);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    [[1, 1], [2, .12]].forEach(([r, a]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = "sine"; o.frequency.value = f * r; og.gain.value = a;
      o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + .05);
    });
    g.connect(out); g.connect(send);
  }

  function pad(m, t, dur, v) {                    // warm sustained pad note
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1100;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 1);
    g.gain.setValueAtTime(v, t + dur - .9);
    g.gain.linearRampToValueAtTime(0, t + dur + .15);
    [["sine", -4], ["triangle", 4]].forEach(([type, cents]) => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = hz(m); o.detune.value = cents;
      o.connect(lp); o.start(t); o.stop(t + dur + .3);
    });
    lp.connect(g); g.connect(amb); g.connect(ambWet);
  }

  function sched() {
    while (next < ctx.currentTime + 1.2) {
      if (next < holdUntil) { next = holdUntil; continue; }   // nothing scheduled while the birthday tune plays
      const c = CH[bar % CH.length];
      const bt = 8 * EIGHTH;
      [c[0] - 12, c[1], c[2]].forEach(m => pad(m, next, bt + .25, .045));
      for (let i = 0; i < 8; i++) bell(amb, ambWet, c[PAT[i]], next + i * EIGHTH, 2, .07);
      (MEL[bar % MEL.length] || []).forEach(([m, st, ln]) => bell(amb, ambWet, m, next + st * EIGHTH, Math.max(1.6, ln * EIGHTH + 1), .13));
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

  function start(quiet) {                          // quiet: the tune plays first, loop joins later
    if (started) { if (ctx.state === "suspended" && !muted) ctx.resume(); return; }
    started = true; init(); ctx.resume();
    next = ctx.currentTime + .1; if (!quiet) sched(); setInterval(sched, 250);
    makeButton();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) ctx.suspend(); else if (!muted) ctx.resume();
    });
  }

  function birthday() {
    start(true);
    const now = ctx.currentTime, beat = .62, SHIFT = -5;   // same key (D) as the background loop
    const fade = (g, v, t, k) => { g.gain.cancelScheduledValues(now); g.gain.setTargetAtTime(v, t, k); };
    fade(amb, 0, now, .05); fade(ambWet, 0, now, .05);    // background music off completely
    let t = now + 1.2;                                    // short gap so the echo tail dies away
    for (let i = 0; i < HB.length; i += 2) { bell(master, wet, HB[i] + SHIFT, t, 1.8, .34); t += HB[i + 1] * beat; }
    holdUntil = t + 1.5;                                  // loop restarts after the tune has finished
    amb.gain.setTargetAtTime(1, holdUntil, .8); ambWet.gain.setTargetAtTime(1, holdUntil, .8);
  }

  window.Music = { start, birthday };
})();
