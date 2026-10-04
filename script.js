(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const JOKES = [
    ["🪓", "Why don't Vikings send emails? They'd rather raid the inbox."],
    ["📶", "Bluetooth is named after a Viking king. So technically, they invented wireless."],
    ["🛡️", "Why was the shield so calm? It always had your back."],
    ["👁️", "Odin walks into a tavern. The barkeep asks what he'll have. \"Just the one,\" he says."],
    ["🧮", "Why do Vikings make poor accountants? They keep raiding the budget."],
    ["🐝", "Why are hives bad at keeping secrets? The whole swarm hears everything."],
    ["⛵", "Why did the longship get a promotion? It always knew how to handle a rough sea of tasks."],
    ["🔨", "Thor never loses his hammer. He just plays hide and seek really, really well."]
  ];

  const toast = $("#toast");
  let timer;
  let last = Math.floor(Math.random() * JOKES.length);

  const joke = () => {
    if (!toast) return;
    last = (last + 1) % JOKES.length;
    $(".em", toast).textContent = JOKES[last][0];
    $(".txt", toast).textContent = JOKES[last][1];
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 8000);
  };

  if (toast) {
    $("button", toast).addEventListener("click", () => {
      clearTimeout(timer);
      toast.classList.remove("show");
    });
  }
  $$("[data-joke]").forEach((el) => el.addEventListener("click", joke));

  const nav = $(".nav");
  const onScroll = () => nav && nav.classList.toggle("solid", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const btn = $(".menu-btn");
  const menu = $("#menu");
  if (btn && menu) {
    const close = () => {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    };
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", close));
    addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.setProperty("--d", `${(i % 4) * 0.07}s`);
    io.observe(el);
  });

  $$(".panel").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  const embers = $("#embers");
  if (embers && !reduce) {
    const ctx = embers.getContext("2d");
    let W = 0;
    let H = 0;
    let parts = [];
    let visible = true;

    const spawn = (anywhere) => ({
      x: Math.random() * W,
      y: anywhere ? H * (0.45 + Math.random() * 0.55) : H + 10,
      r: Math.random() * 1.8 + 0.5,
      vy: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.25,
      p: Math.random() * Math.PI * 2
    });

    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = embers.clientWidth;
      H = embers.clientHeight;
      embers.width = W * dpr;
      embers.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: Math.round(Math.min(46, W / 22)) }, () => spawn(true));
    };

    new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(embers);

    const loop = () => {
      requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p, i) => {
        p.y -= p.vy;
        p.p += 0.02;
        p.x += p.vx + Math.sin(p.p) * 0.22;
        if (p.y < H * 0.25) parts[i] = spawn(false);
        const a = Math.min(1, (p.y - H * 0.25) / (H * 0.4)) * 0.75;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 190, 100, ${Math.max(0, a)})`;
        ctx.shadowColor = "rgba(240, 130, 50, 0.9)";
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    fit();
    addEventListener("resize", fit);
    loop();
  }
})();
