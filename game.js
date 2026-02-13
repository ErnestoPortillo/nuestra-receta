(() => {
  // ----------------------------
  // DATA
  // ----------------------------
  const INGREDIENTS = [
    {
      id: "flores",
      name: "Flores",
      desc: "Qué puedo decir 🌷",
      tag: "Ternura",
      img: "assets/images/ingredientes/flores.png",
    },
    {
      id: "chocolate",
      name: "Postres",
      desc: "Y que te gusten casi los mismos que a mí 🍫",
      tag: "😋",
      img: "assets/images/ingredientes/chocolate.png",
    },
    {
      id: "musica",
      name: "Taylor Swift",
      desc: "Aunque Kanye Siempre será mejor🙂‍↕️🎶",
      tag: "Música",
      img: "assets/images/ingredientes/musica.png",
    },
    {
      id: "maquillaje",
      name: "Maquillaje",
      desc: "y lo rico que saben tus bálsamos jejeje 💄",
      tag: "Make-Up",
      img: "assets/images/ingredientes/maquillaje.png",
    },
    {
      id: "kitty",
      name: "Hello Kitty",
      desc: "Ya no puedo ver cualquier cosa de hello kitty sin pensar en tí amor 🐱",
      tag: "Cute",
      img: "assets/images/ingredientes/kitty.png",
    },
    {
      id: "kuromi",
      name: "Diseño",
      desc: "Me encanta tu lado artístico y que seas TAN BUENA y que genuinamente me encante tu estiloo 🎨🖌️",
      tag: "Artistic",
      img: "assets/images/ingredientes/kuromi.png",
    },
  ];

  // Your 3 memories (paths with spaces are OK; we’ll encode when setting src)
  const MEMORIES = [
    {
      id: "m1",
      img: "assets/memories/foto1.jpeg",
      caption: "i will always melt into a kiss",
      date: "09/01/2026",
    },
    {
      id: "m2",
      img: "assets/memories/foto2.jpg",
      caption: "hasta las salidas mas simples son las más bonitas",
      date: "14/01/2026",
    },
    {
      id: "m3",
      img: "assets/memories/foto3.jpg",
      caption: "el sunset mas hermoso en un dia tan especial",
      date: "17/01/2026",
    },
  ];

  // ----------------------------
  // DOM
  // ----------------------------
  const introScreen = document.getElementById("introScreen");
  const btnStart = document.getElementById("btnStart");

  const app = document.getElementById("app");

  const ring = document.getElementById("ring");
  const bowlWrap = document.getElementById("bowlWrap");
  const bowlContents = document.getElementById("bowlContents");
  const fxLayer = document.getElementById("fxLayer");
  const steam = document.getElementById("steam");

  const hudSubtitle = document.getElementById("hudSubtitle");
  const progressLabel = document.getElementById("progressLabel");
  const progressCount = document.getElementById("progressCount");
  const progressFill = document.getElementById("progressFill");
  const progressBar = document.getElementById("progressBar");

  const noteTitle = document.getElementById("noteTitle");
  const noteText = document.getElementById("noteText");
  const noteHint = document.getElementById("noteHint");

  const toast = document.getElementById("toast");
  const btnReset = document.getElementById("btnReset");

  const overlayBaking = document.getElementById("overlayBaking");
  const timerText = document.getElementById("timerText");
  const bakeFill = document.getElementById("bakeFill");

  const overlayFinal = document.getElementById("overlayFinal");
  const finalChips = document.getElementById("finalChips");
  const stickerLayer = document.getElementById("stickerLayer");
  const dessertWrap = document.getElementById("dessertWrap");
  const btnKiss = document.getElementById("btnKiss");
  const btnPlayAgain = document.getElementById("btnPlayAgain");

  const confettiCanvas = document.getElementById("confetti");
  const confettiCtx = confettiCanvas.getContext("2d");

  // ----------------------------
  // STATE
  // ----------------------------
  const state = {
    phase: "intro", // intro | ingredients | baking | memories | final
    pickedIngredients: new Set(),
    pickedMemories: new Set(),
    toastTimer: null,
    bakingRAF: null,
    confettiRAF: null,
    confettiOn: false,
    confettiPieces: [],
  };

  // ----------------------------
  // Tiny audio (no assets)
  // ----------------------------
  let audioCtx = null;
  function beep({ freq = 740, dur = 0.06, type = "triangle", gain = 0.05 } = {}) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(g);
      g.connect(audioCtx.destination);

      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      // ignore
    }
  }

  function sparkleChord() {
    beep({ freq: 740, dur: 0.07 });
    setTimeout(() => beep({ freq: 980, dur: 0.08 }), 70);
    setTimeout(() => beep({ freq: 1240, dur: 0.09 }), 150);
  }

  // ----------------------------
  // Helpers
  // ----------------------------
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => Math.random() * (b - a) + a;

  function setToast(text) {
    clearTimeout(state.toastTimer);
    toast.textContent = text;
    toast.classList.add("toast--show");
    state.toastTimer = setTimeout(() => toast.classList.remove("toast--show"), 1400);
  }

  function setProgress(current, total, label) {
    progressLabel.textContent = label;
    progressCount.textContent = `${current}/${total}`;
    progressFill.style.width = `${(current / total) * 100}%`;
    progressBar.setAttribute("aria-valuemax", String(total));
    progressBar.setAttribute("aria-valuenow", String(current));
  }

  // Hearts burst
  function spawnHeartBurst(x, y) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const h = document.createElement("div");
      const size = rand(10, 18);
      const angle = rand(-Math.PI, 0);
      const dist = rand(30, 76);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const rot = rand(-24, 24);

      h.style.position = "absolute";
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.width = `${size}px`;
      h.style.height = `${size}px`;
      h.style.borderRadius = "6px";
      h.style.background = `linear-gradient(135deg, rgba(255,102,178,.95), rgba(255,154,213,.85))`;
      h.style.boxShadow = "0 16px 22px rgba(255,102,178,.18)";
      h.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
      h.style.clipPath = "polygon(50% 18%, 61% 4%, 77% 4%, 90% 18%, 90% 36%, 50% 86%, 10% 36%, 10% 18%, 23% 4%, 39% 4%)";
      h.style.opacity = "0.95";
      h.style.pointerEvents = "none";
      h.style.transition = "transform 700ms cubic-bezier(.2,.9,.2,1), opacity 700ms ease";

      fxLayer.appendChild(h);

      requestAnimationFrame(() => {
        h.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rot + rand(-40, 40)}deg) scale(${rand(0.9, 1.25)})`;
        h.style.opacity = "0";
      });

      setTimeout(() => h.remove(), 760);
    }
  }

  // Drop sprite into bowl (cute curve)
  function dropSprite(imgSrc, fromEl) {
    const rFrom = fromEl.getBoundingClientRect();
    const rBowl = bowlWrap.getBoundingClientRect();

    const startX = rFrom.left + rFrom.width / 2 - rBowl.left;
    const startY = rFrom.top + rFrom.height / 2 - rBowl.top;

    const endX = rand(rBowl.width * 0.36, rBowl.width * 0.64);
    const endY = rand(rBowl.height * 0.42, rBowl.height * 0.58);

    const sprite = document.createElement("div");
    sprite.className = "sprite";
    sprite.style.left = `${startX}px`;
    sprite.style.top = `${startY}px`;
    sprite.innerHTML = `<img src="${imgSrc}" alt="" draggable="false" />`;
    bowlContents.appendChild(sprite);

    const t0 = performance.now();
    const duration = 650;
    const cx = lerp(startX, endX, 0.5) + rand(-60, 60);
    const cy = lerp(startY, endY, 0.35) + rand(-120, -50);

    function bezier(t, p0, p1, p2) {
      const u = 1 - t;
      return u * u * p0 + 2 * u * t * p1 + t * t * p2;
    }

    function step(now) {
      const t = clamp((now - t0) / duration, 0, 1);
      const x = bezier(t, startX, cx, endX);
      const y = bezier(t, startY, cy, endY);

      sprite.style.left = `${x}px`;
      sprite.style.top = `${y}px`;
      sprite.style.transform = `translate(-50%, -50%) scale(${lerp(0.85, 1.0, t)}) rotate(${lerp(-10, 0, t)}deg)`;

      if (t < 1) requestAnimationFrame(step);
      else {
        sprite.animate(
          [
            { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" },
            { transform: "translate(-50%, -50%) scale(1.06) rotate(1deg)" },
            { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" },
          ],
          { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)" }
        );
      }
    }
    requestAnimationFrame(step);
  }

  // ----------------------------
  // Build UI around bowl
  // ----------------------------
  const ING_POS = [
    { x: 50, y: 12 },
    { x: 82, y: 24 },
    { x: 88, y: 56 },
    { x: 66, y: 82 },
    { x: 34, y: 82 },
    { x: 12, y: 50 },
  ];

  const MEM_POS = [
    { x: 24, y: 28 },
    { x: 82, y: 36 },
    { x: 22, y: 78 },
  ];

  function clearRing() {
    ring.innerHTML = "";
  }

  function buildIngredientCards() {
    clearRing();

    INGREDIENTS.forEach((ing, idx) => {
      const p = ING_POS[idx] || { x: rand(18, 84), y: rand(18, 82) };

      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.dataset.id = ing.id;
      card.style.left = `${p.x}%`;
      card.style.top = `${p.y}%`;

      card.innerHTML = `
        <div class="card__imgWrap">
          <img class="card__img" src="${ing.img}" alt="${ing.name}" draggable="false" />
        </div>
        <div class="card__meta">
          <div class="card__name">${ing.name}</div>
          <div class="card__desc">${ing.desc}</div>
          <div class="card__tag">${ing.tag}</div>
        </div>
      `;

      card.addEventListener("click", () => onPickIngredient(ing, card));
      ring.appendChild(card);
    });
  }

  function buildMemoryPolaroids() {
    clearRing();

    MEMORIES.forEach((m, idx) => {
      const p = MEM_POS[idx] || { x: rand(20, 84), y: rand(22, 80) };

      const wrap = document.createElement("div");
      wrap.style.position = "absolute";
      wrap.style.left = `${p.x}%`;
      wrap.style.top = `${p.y}%`;
      wrap.style.transform = "translate(-50%, -50%)";
      wrap.style.pointerEvents = "auto";

      const card = document.createElement("button");
      card.type = "button";
      card.className = "polaroid";
      card.style.position = "relative";
      card.style.transform = `rotate(${rand(-10, 10)}deg)`;
      card.setAttribute("aria-label", `Recuerdo: ${m.caption}`);

      const safeSrc = encodeURI(m.img);

      card.innerHTML = `
        <div class="polaroid__tape" aria-hidden="true"></div>
        <img class="polaroid__photo" src="${safeSrc}" alt="Foto recuerdo" draggable="false" />
        <div class="polaroid__cap">${escapeHtml(m.caption)}</div>
        <div class="polaroid__date">${escapeHtml(m.date)}</div>
      `;

      card.addEventListener("click", () => onPickMemory(m, card));

      wrap.appendChild(card);
      ring.appendChild(wrap);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ----------------------------
  // Phase: ingredients
  // ----------------------------
  function onPickIngredient(ing, cardEl) {
    if (state.phase !== "ingredients") return;
    if (state.pickedIngredients.has(ing.id)) return;

    state.pickedIngredients.add(ing.id);
    cardEl.classList.add("card--picked");
    cardEl.querySelector(".card__tag").textContent = "Agregado 💗";

    const c = state.pickedIngredients.size;
    setProgress(c, INGREDIENTS.length, "Ingredientes");

    if (c === 1) steam.style.opacity = "1";

    const bowlRect = bowlWrap.getBoundingClientRect();
    spawnHeartBurst(bowlRect.width * 0.5, bowlRect.height * 0.48);
    dropSprite(ing.img, cardEl);

    beep({ freq: 740 + c * 30, dur: 0.06 });

    setToast(`Agregaste “${ing.name}”.`);

    noteText.textContent =
      c < INGREDIENTS.length
        ? `Vas ${c}/${INGREDIENTS.length}. Sigue… esto se está poniendo precioso 💞`
        : `¡Listo! Ahora… a hornear ✨`;

    if (c === INGREDIENTS.length) {
      setTimeout(startBaking, 650);
    }
  }

  // ----------------------------
  // Baking
  // ----------------------------
  function startBaking() {
    if (state.phase !== "ingredients") return;
    state.phase = "baking";

    overlayBaking.classList.remove("overlay--hidden");
    hudSubtitle.textContent = "Horneando… ✨";
    noteTitle.textContent = "✨";
    noteText.textContent = "Un poquito de magia y ya…";
    noteHint.textContent = " ";

    bowlWrap.animate(
      [
        { transform: "translateY(12px) rotate(0deg)" },
        { transform: "translateY(10px) rotate(-1.2deg)" },
        { transform: "translateY(12px) rotate(1.2deg)" },
        { transform: "translateY(10px) rotate(-.7deg)" },
        { transform: "translateY(12px) rotate(0deg)" },
      ],
      { duration: 720, easing: "ease-in-out" }
    );

    sparkleChord();

    const t0 = performance.now();
    const duration = 2400;

    function step(now) {
      const t = clamp((now - t0) / duration, 0, 1);
      const pct = Math.round(t * 100);

      bakeFill.style.width = `${pct}%`;
      timerText.textContent = `Horneando amor… ${pct}%`;

      if (t < 1) {
        state.bakingRAF = requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          overlayBaking.classList.add("overlay--hidden");
          startMemories();
        }, 420);
      }
    }

    state.bakingRAF = requestAnimationFrame(step);
  }

  // ----------------------------
  // Phase: memories
  // ----------------------------
  function startMemories() {
    state.phase = "memories";

    hudSubtitle.textContent = "Fase 2 – Donde todo se volvió nosotros 💗";
    noteTitle.textContent = "Recuerdos:";
    noteText.textContent = "Ahora agreguemos 3 momentos donde todo esto se convirtió en nosotros ✨";
    noteHint.textContent = "Haz click en las polaroids 💗";

    steam.style.opacity = "0";
    bowlContents.innerHTML = "";

    state.pickedMemories.clear();

    setProgress(0, MEMORIES.length, "Recuerdos");
    buildMemoryPolaroids();
    setToast("Ok… ahora vienen los recuerdos 💗");
  }

  function onPickMemory(mem, polaroidBtn) {
    if (state.phase !== "memories") return;
    if (state.pickedMemories.has(mem.id)) return;

    state.pickedMemories.add(mem.id);

    // animate polaroid flying to center
    const rFrom = polaroidBtn.getBoundingClientRect();
    const rBowl = bowlWrap.getBoundingClientRect();

    const clone = polaroidBtn.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = `${rFrom.left}px`;
    clone.style.top = `${rFrom.top}px`;
    clone.style.width = `${rFrom.width}px`;
    clone.style.height = `${rFrom.height}px`;
    clone.style.margin = "0";
    clone.style.zIndex = "2000";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);

    // hide original wrapper
    const wrapper = polaroidBtn.parentElement;
    if (wrapper) wrapper.style.visibility = "hidden";

    const targetX = rBowl.left + rBowl.width * 0.5 - rFrom.width * 0.5;
    const targetY = rBowl.top + rBowl.height * 0.45 - rFrom.height * 0.5;

    clone.animate(
      [
        { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
        { transform: `translate(${targetX - rFrom.left}px, ${targetY - rFrom.top}px) rotate(${rand(-16, 16)}deg) scale(0.9)`, opacity: 0.95 },
        { transform: `translate(${targetX - rFrom.left}px, ${targetY - rFrom.top}px) rotate(${rand(-16, 16)}deg) scale(0.82)`, opacity: 0 },
      ],
      { duration: 720, easing: "cubic-bezier(.2,.9,.2,1)" }
    );

    // FX
    const bowlRect = bowlWrap.getBoundingClientRect();
    spawnHeartBurst(bowlRect.width * 0.52, bowlRect.height * 0.46);
    beep({ freq: 980, dur: 0.06 });

    const c = state.pickedMemories.size;
    setProgress(c, MEMORIES.length, "Recuerdos");
    setToast("Pegando un recuerdo… 🥹");

    setTimeout(() => clone.remove(), 760);

    if (c === MEMORIES.length) {
      noteText.textContent = "Y así… sin darnos cuenta, hicimos algo precioso 🥹";
      setTimeout(showFinal, 900);
    }
  }

  // ----------------------------
  // Final
  // ----------------------------
  function showFinal() {
    state.phase = "final";

    // chips = ingredients selected
    finalChips.innerHTML = "";
    INGREDIENTS.forEach((ing) => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.textContent = ing.name;
      finalChips.appendChild(chip);
    });

    // place stickers (chaotic scrapbook) on dessert
    stickerLayer.innerHTML = "";
    placeStickers();

    overlayFinal.classList.remove("overlay--hidden");

    startConfetti(false);
    setToast("Final listo 💗");
  }

  function placeStickers() {
  const rect = dessertWrap.getBoundingClientRect();
  stickerLayer.innerHTML = "";

  const spots = [
    { x: 0.18, y: 0.18 },
    { x: 0.72, y: 0.22 },
    { x: 0.30, y: 0.70 },
  ];

  MEMORIES.forEach((m, i) => {
    const s = document.createElement("div");
    s.className = "sticker";

    const safeSrc = encodeURI(m.img);

    s.innerHTML = `
      <img class="sticker__photo" src="${safeSrc}" alt="" draggable="false" />
      <div class="sticker__cap">${m.caption}</div>
      <div class="sticker__date">${m.date}</div>
    `;

    const base = spots[i] || { x: Math.random()*0.6+0.2, y: Math.random()*0.6+0.2 };

    const stickerW = 210;
    const stickerH = 220;

    const maxX = rect.width - stickerW - 18;
    const maxY = rect.height - stickerH - 18;

    const x = Math.max(18, Math.min(base.x * rect.width, maxX));
    const y = Math.max(18, Math.min(base.y * rect.height, maxY));

    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.transform = `rotate(${Math.random()*28-14}deg)`;

    s.style.animationDelay = `${i * 120}ms`;

    stickerLayer.appendChild(s);
  });
}



  // ----------------------------
  // Confetti (full screen, smooth)
  // ----------------------------
  function resizeConfetti() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = Math.floor(window.innerWidth * dpr);
    confettiCanvas.height = Math.floor(window.innerHeight * dpr);
    confettiCanvas.style.width = `${window.innerWidth}px`;
    confettiCanvas.style.height = `${window.innerHeight}px`;
    confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeConfettiPiece() {
    const shapes = ["rect", "dot", "heart"];
    const palette = [
      "rgba(255,102,178,.95)",
      "rgba(255,154,213,.90)",
      "rgba(167,139,250,.88)",
      "rgba(45,212,191,.82)",
      "rgba(255,180,162,.88)",
    ];
    const w = window.innerWidth;
    return {
      x: rand(0, w),
      y: rand(-40, -10),
      vx: rand(-1.6, 1.6),
      vy: rand(0.6, 2.6),
      r: rand(0, Math.PI * 2),
      vr: rand(-0.10, 0.10),
      size: rand(6, 12),
      color: palette[Math.floor(Math.random() * palette.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  }

  function drawConfetti(p) {
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.r);
    confettiCtx.fillStyle = p.color;

    if (p.shape === "rect") {
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
    } else if (p.shape === "dot") {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
      confettiCtx.fill();
    } else {
      // heart
      const s = p.size * 0.7;
      confettiCtx.beginPath();
      confettiCtx.moveTo(0, s * 0.2);
      confettiCtx.bezierCurveTo(s * 0.5, -s * 0.3, s * 0.9, s * 0.2, 0, s);
      confettiCtx.bezierCurveTo(-s * 0.9, s * 0.2, -s * 0.5, -s * 0.3, 0, s * 0.2);
      confettiCtx.fill();
    }

    confettiCtx.restore();
  }

  function startConfetti(big) {
    resizeConfetti();
    confettiCanvas.classList.add("confetti--on");

    const add = big ? 200 : 120;
    for (let i = 0; i < add; i++) state.confettiPieces.push(makeConfettiPiece());

    if (!state.confettiOn) {
      state.confettiOn = true;
      stepConfetti();
    }
  }

  function stopConfetti() {
    state.confettiOn = false;
    confettiCanvas.classList.remove("confetti--on");
    state.confettiPieces.length = 0;
    if (state.confettiRAF) cancelAnimationFrame(state.confettiRAF);
    state.confettiRAF = null;
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function stepConfetti() {
    if (!state.confettiOn) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    confettiCtx.clearRect(0, 0, w, h);

    for (let i = state.confettiPieces.length - 1; i >= 0; i--) {
      const p = state.confettiPieces[i];
      p.vy += 0.10; // gravity
      p.vx *= 0.995;
      p.vy *= 0.995;

      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;

      drawConfetti(p);

      if (p.y > h + 60) state.confettiPieces.splice(i, 1);
    }

    // keep alive gently
    if (state.confettiPieces.length < 90) {
      for (let k = 0; k < 3; k++) state.confettiPieces.push(makeConfettiPiece());
    }

    state.confettiRAF = requestAnimationFrame(stepConfetti);
  }

  // ----------------------------
  // Reset
  // ----------------------------
  function resetAll() {
    if (state.bakingRAF) cancelAnimationFrame(state.bakingRAF);
    state.bakingRAF = null;

    stopConfetti();

    overlayBaking.classList.add("overlay--hidden");
    overlayFinal.classList.add("overlay--hidden");

    bakeFill.style.width = "0%";
    timerText.textContent = "Horneando amor… 0%";

    state.phase = "ingredients";
    state.pickedIngredients.clear();
    state.pickedMemories.clear();

    steam.style.opacity = "0";
    bowlContents.innerHTML = "";
    stickerLayer.innerHTML = "";

    hudSubtitle.textContent = "Fase 1 – Lo que te hace ser tú 💞";
    noteTitle.textContent = "Receta:";
    noteText.textContent = "Primero, agreguemos todo lo que te hace ser tú 💗";
    noteHint.textContent = "Pasa el mouse por los ingredientes ✨";

    setProgress(0, INGREDIENTS.length, "Ingredientes");
    buildIngredientCards();
    setToast("Ok, empezamos de nuevo ✨");
    beep({ freq: 620, dur: 0.06 });
  }

  // ----------------------------
  // Init / Start
  // ----------------------------
  function startGame() {
    // show app
    introScreen.style.display = "none";
    app.setAttribute("aria-hidden", "false");

    state.phase = "ingredients";
    setProgress(0, INGREDIENTS.length, "Ingredientes");
    buildIngredientCards();

    // bowl parallax (cute)
    bowlWrap.addEventListener("mousemove", (e) => {
      if (state.phase !== "ingredients" && state.phase !== "memories") return;
      const r = bowlWrap.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      bowlWrap.style.transform = `translateY(12px) rotate(${dx * 2}deg)`;
      bowlWrap.style.filter = `drop-shadow(${dx * 8}px 24px 26px rgba(22,10,40,.18))`;
    });
    bowlWrap.addEventListener("mouseleave", () => {
      bowlWrap.style.transform = "translateY(12px)";
      bowlWrap.style.filter = "";
    });

    setToast("Haz click en ingredientes alrededor del bowl 💗");
  }

  // Buttons
  btnStart.addEventListener("click", () => {
    // unlock audio in some browsers
    beep({ freq: 740, dur: 0.04, gain: 0.02 });
    startGame();
  });

  btnReset.addEventListener("click", resetAll);
  btnPlayAgain.addEventListener("click", resetAll);

  btnKiss.addEventListener("click", () => {
    sparkleChord();
    startConfetti(true);
    setToast("Muak ✨💗");
  });

  // Resize listeners
  window.addEventListener("resize", () => {
    resizeConfetti();
    if (state.phase === "final") {
      // re-place stickers so they keep nice bounds
      stickerLayer.innerHTML = "";
      placeStickers();
    }
  });

  // Make sure confetti canvas is correctly sized even before final
  resizeConfetti();
})();
