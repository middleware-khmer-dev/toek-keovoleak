/* ===== EDIT HERE ===== */
const CONFIG = {
  birthday: "2003-10-30",   // date of birth (YYYY-MM-DD)
  name: "Toek Keovoleak",   // or add ?name=Someone to the URL
  message: [
    "Happy Birthday, my love! 🎂 Thank you for being the best part of my life. Every day with you feels like a gift.",
    "You are studying to heal others, and I am so proud of you. The world will be lucky to have a doctor with a heart as kind as yours. 🩺💖",
    "On the days when studying gets heavy, remember that I believe in you. Rest well, eat well, and take care of yourself too.",
    "May this new year bring you good health, good grades, and every dream you work so hard for. I'll be right beside you for all of it. ♥",
    "Happy Birthday, Toek Keovoleak! I love you. 🎂"
  ],
  photoBase: "https://pub-33366a170f57436292f2db8cf9762c41.r2.dev/bubu/bubu/",  // R2 bucket "bubu", folder bubu/bubu/ (public URL)
  photos: [
    "photo_2026-10-30_13-47-00.jpg", "photo_2026-10-30_13-47-19.jpg", "photo_2026-10-30_13-47-26.jpg", "photo_2026-10-30_13-47-29.jpg", "photo_2026-10-30_13-47-42.jpg", "photo_2026-10-30_13-47-46.jpg", "photo_2026-10-30_13-47-51.jpg", "photo_2026-10-30_13-47-55.jpg", "photo_2026-10-30_13-48-01.jpg", "photo_2026-10-30_13-48-05.jpg", "photo_2026-10-30_13-48-09.jpg", "photo_2026-10-30_13-48-13.jpg", "photo_2026-10-30_13-48-17.jpg", "photo_2026-10-30_13-48-21.jpg", "photo_2026-10-30_13-48-24.jpg", "photo_2026-10-30_13-48-28.jpg", "photo_2026-10-30_13-48-32.jpg"
  ]  // file names in the folder; missing ones are hidden
};
/* ===================== */

const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const who = new URLSearchParams(location.search).get("name") || CONFIG.name;
$("who").textContent = "For " + who;
$("who2").textContent = who;
$("who3").textContent = who;

/* ---------- screens ---------- */
const order = ["s1", "s2", "s3"];
function show(id) {
  order.forEach(s => $(s).classList.toggle("active", s === id));
  $("bar").style.width = ((order.indexOf(id) + 1) / order.length * 100) + "%";
  scrollTo(0, 0);
}
$("open").onclick = () => { show("s2"); burst(innerWidth / 2, innerHeight / 2, 80); };
$("blow").onclick = () => {
  $("cake").classList.add("out");
  $("blow").disabled = true;
  setTimeout(() => { show("s3"); celebrate(); }, 1200);
};
$("again").onclick = () => {
  $("cake").classList.remove("out");
  $("blow").disabled = false;
  show("s2");
};

function celebrate() {
  rain();
  typeMessage();
  countUp();
  loadPhotos();
}

/* ---------- typewriter ---------- */
let typing = 0;
function typeMessage() {
  const el = $("msg"), box = el.parentElement, text = CONFIG.message.join("\n\n").replace("{age}", ord(age.years));
  const id = ++typing;
  el.style.whiteSpace = "pre-wrap";
  box.classList.remove("done");
  if (reduce) { el.textContent = text; box.classList.add("done"); return; }
  el.textContent = "";
  let i = 0;
  (function step() {
    if (id !== typing) return;
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(step, 28);
    else box.classList.add("done");
  })();
}

/* ---------- age & counters ---------- */
function ageNow() {
  const [y, m, d] = CONFIG.birthday.split("-").map(Number), now = new Date();
  let years = now.getFullYear() - y, months = years * 12 + now.getMonth() + 1 - m;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) years--;
  if (now.getDate() < d) months--;
  const days = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(y, m - 1, d)) / 864e5);
  return { years, months, days };
}
const ord = n => n + (["th", "st", "nd", "rd"][(n % 100 >> 3 ^ 1 && n % 10 < 4) ? n % 10 : 0]);
const age = ageNow();
$("ageLine").textContent = "Celebrating " + ord(age.years) + " birthday";
function countUp() {
  document.querySelectorAll("#stats b").forEach(b => {
    const to = age[b.dataset.k], t0 = performance.now(), dur = reduce ? 1 : 1800;
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

/* ---------- gallery ---------- */
let loaded = false;
/* Arrange n photos evenly along a heart outline */
function heartLayout(box, imgs) {
  const n = imgs.length, N = 2000, pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N * 2 * Math.PI;
    pts.push([16 * Math.pow(Math.sin(t), 3),
      -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
  }
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  /* walk the outline placing a tile every `step` units (straight-line), starting at the top dip */
  const walk = step => {
    const out = [0];
    for (let i = 1, cur = 0; i < N; i++) if (dist(pts[i], pts[cur]) >= step) { out.push(i); cur = i; }
    return out;
  };
  const fits = step => { const w = walk(step); return w.length >= n && dist(pts[w[n - 1]], pts[0]) >= step; };
  let lo = 1, hi = 20;
  for (let it = 0; it < 30; it++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; }
  const idx = walk(lo).slice(0, n), d = lo * .92;      // tile diameter (heart units)
  const ys = pts.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const W = 32 + d, H = y1 - y0 + d;
  box.style.aspectRatio = W / H;
  imgs.forEach((img, k) => {
    const [x, y] = pts[idx[k]];
    img.style.width = d / W * 100 + "%";
    img.style.left = (x + 16 + d / 2) / W * 100 + "%";
    img.style.top = (y - y0 + d / 2) / H * 100 + "%";
  });
}
function loadPhotos() {
  if (loaded) return;
  loaded = true;
  const box = $("photos"), wrap = $("galleryWrap"), ok = [];
  let pending = CONFIG.photos.length;
  const done = () => {
    if (--pending) return;
    if (!ok.length) return;
    wrap.hidden = false;
    ok.sort((p, q) => p.dataset.n - q.dataset.n);
    ok.forEach(i => box.appendChild(i));
    heartLayout(box, ok);
    ok.forEach((img, n) => setTimeout(() => img.classList.add("in"), reduce ? 0 : 140 * n));
  };
  CONFIG.photos.forEach((name, n) => {
    const img = new Image();
    img.alt = "Memory " + (n + 1);
    img.onload = () => { img.dataset.n = n; ok.push(img); done(); };
    img.onerror = done;
    img.onclick = () => openLightbox(img.src);
    img.src = CONFIG.photoBase + name;
  });
}
const lb = $("lb");
function openLightbox(src) { lb.querySelector("img").src = src; lb.hidden = false; }
lb.onclick = e => { if (e.target === lb || e.target.id === "lbx") lb.hidden = true; };
addEventListener("keydown", e => { if (e.key === "Escape") lb.hidden = true; });

/* ---------- 3D tilt ---------- */
if (!reduce && matchMedia("(hover:hover)").matches) {
  document.querySelectorAll(".tilt").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    el.addEventListener("pointerleave", () => el.style.transform = "");
  });
}

/* ---------- starfield ---------- */
const sc = $("stars"), sx = sc.getContext("2d");
let stars = [];
function fitStars() {
  sc.width = innerWidth; sc.height = innerHeight;
  stars = Array.from({ length: Math.min(140, innerWidth / 8) }, () => ({
    x: Math.random() * sc.width, y: Math.random() * sc.height,
    r: Math.random() * 1.4 + .3, p: Math.random() * 6.28, s: Math.random() * .02 + .005
  }));
}
fitStars(); addEventListener("resize", fitStars);

/* ---------- confetti ---------- */
const cv = $("fx"), c = cv.getContext("2d");
let P = [];
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
fit(); addEventListener("resize", fit);
const colors = ["#ff5c9d", "#ffd66b", "#5ce1ff", "#8a5cff", "#ffffff", "#7be495"];
function burst(x, y, n) {
  if (reduce) return;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, v = 4 + Math.random() * 9;
    P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, s: 6 + Math.random() * 7, col: colors[i % colors.length], r: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 170 });
  }
}
function rain() {
  if (reduce) return;
  burst(innerWidth / 2, innerHeight * .35, 120);
  let k = 0;
  const t = setInterval(() => {
    for (let i = 0; i < 6; i++) P.push({ x: Math.random() * innerWidth, y: -12, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, s: 6 + Math.random() * 6, col: colors[(Math.random() * colors.length) | 0], r: Math.random() * 6, vr: (Math.random() - .5) * .25, life: 320 });
    if (++k > 45) clearInterval(t);
  }, 100);
}
addEventListener("pointerdown", e => { if (e.target.closest("button,.lightbox,img")) return; burst(e.clientX, e.clientY, 30); });

(function loop() {
  sx.clearRect(0, 0, sc.width, sc.height);
  for (const s of stars) {
    s.p += s.s;
    sx.globalAlpha = .25 + .75 * Math.abs(Math.sin(s.p));
    sx.fillStyle = "#fff";
    sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 6.28); sx.fill();
  }
  c.clearRect(0, 0, cv.width, cv.height);
  P = P.filter(p => p.life-- > 0);
  for (const p of P) {
    p.x += p.vx; p.y += p.vy; p.vy += .13; p.vx *= .995; p.r += p.vr;
    c.save(); c.globalAlpha = Math.min(1, p.life / 40);
    c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col;
    c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
  }
  requestAnimationFrame(loop);
})();
