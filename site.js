// Every page: the EN / 粵 switch (shared with the home page through localStorage) and the twinkling stars.
(function () {
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  var lang = saved || (/^zh/i.test(navigator.language || "") ? "zh-HK" : "en");
  var buttons = document.querySelectorAll(".lang button");
  function setLang(l) {
    document.documentElement.lang = l;
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.set === l)); });
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.dataset.set);
      try { localStorage.setItem("lang", b.dataset.set); } catch (e) {}
    });
  });
  setLang(lang);

  // the night sky: stars drift slowly (bigger = nearer = faster) and twinkle, and now and then one shoots across,
  // so they read as sky, not as dust on the screen
  var c = document.getElementById("stars");
  if (!c) return;
  var x = c.getContext("2d"), still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stars = [], shooting = null, nextShot = 2500, w, h, last = 0;
  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    for (var i = 0, n = Math.round(w * h / 8000); i < n; i++) {
      var r = Math.random() * 1.4 + .3;
      stars.push({ x: Math.random() * w, y: Math.random() * h, r: r, p: Math.random() * 6.28, s: Math.random() * 1.2 + .4,
                   vx: -(3 + r * 9), vy: 1 + r * 2.5 });  // px per second
    }
    if (still) draw(0);
  }
  function draw(t) {
    var dt = Math.min((t - last) / 1000, .05); last = t;
    x.clearRect(0, 0, w, h);
    x.fillStyle = "#FFE8B0";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (!still) {
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.x < -4) s.x += w + 8;
        if (s.y > h + 4) s.y -= h + 8;
      }
      x.globalAlpha = .15 + .75 * (0.5 + 0.5 * Math.sin(s.p + t / 1000 * s.s));
      x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
    }
    if (!still) {
      nextShot -= dt * 1000;
      if (!shooting && nextShot <= 0) {
        shooting = { x: w * (.3 + Math.random() * .7), y: h * Math.random() * .4, life: 0 };
        nextShot = 4000 + Math.random() * 5000;
      }
      if (shooting) {
        shooting.life += dt;
        var k = shooting.life / .9, len = 120;
        var hx = shooting.x - 520 * shooting.life, hy = shooting.y + 260 * shooting.life;
        var g = x.createLinearGradient(hx, hy, hx + len, hy - len / 2);
        g.addColorStop(0, "rgba(255,232,176,.95)"); g.addColorStop(1, "rgba(255,232,176,0)");
        x.globalAlpha = Math.max(0, 1 - k);
        x.strokeStyle = g; x.lineWidth = 1.6; x.lineCap = "round";
        x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx + len, hy - len / 2); x.stroke();
        if (k >= 1) shooting = null;
      }
      requestAnimationFrame(draw);
    }
  }
  window.addEventListener("resize", size);
  size();
  if (!still) requestAnimationFrame(function (t) { last = t; draw(t); });
})();
