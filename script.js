/* ===== EDIT HERE ===== */
const CONFIG = {
  name: "Toek Keovoleak",   // or add ?name=Someone to the URL
  message: [
    "This birthday, may your face be full of bright smiles and your heart full of peace. 🌸",
    "May every day of your life shine as bright as the candle on this cake, and may all your dreams come true. ✨",
    "You are someone truly special who gives life meaning. May you have good health, good luck, and love all through your life. 💖",
    "Happy Birthday, Toek Keovoleak! 🎂"
  ],
  photoBase: "https://pub-33366a170f57436292f2db8cf9762c41.r2.dev/",  // R2 bucket "bubu" (public URL)
  photos: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"]  // file names in the bucket; missing ones are hidden
};
/* ===================== */

const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const who = new URLSearchParams(location.search).get("name") || CONFIG.name;
$("who").textContent = "For " + who;
$("who2").textContent = who;

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
  const el = $("msg"), box = el.parentElement, text = CONFIG.message.join("\n\n");
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

/* ---------- counters ---------- */
function countUp() {
  document.querySelectorAll("#stats b").forEach(b => {
    const to = +b.dataset.to, t0 = performance.now(), dur = reduce ? 1 : 1800;
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

/* ---------- gallery ---------- */
let loaded = false;
function loadPhotos() {
  if (loaded) return;
  loaded = true;
  const grid = $("photos"), wrap = $("galleryWrap");
  CONFIG.photos.forEach((name, n) => {
    const img = new Image();
    img.alt = "Memory " + (n + 1);
    img.loading = "lazy";
    img.onerror = () => img.remove();
    img.onload = () => {
      wrap.hidden = false;
      setTimeout(() => img.classList.add("in"), 120 * n);
    };
    img.onclick = () => openLightbox(img.src);
    img.src = CONFIG.photoBase + name;
    grid.appendChild(img);
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
