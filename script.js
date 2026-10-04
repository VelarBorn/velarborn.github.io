(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const JOKES = [
    ["🪜", "Why did the peasant bring a ladder to the siege? He heard the walls had high expectations."],
    ["🛡️", "What do you call a knight who's afraid to fight? Sir Render."],
    ["🔭", "Scouts report the enemy is dangerously close. Scouts also report they're standing right behind us."],
    ["🏗️", "How many peasants does it take to build a keep? Two, and one to say they're doing it wrong."],
    ["🌫️", "Why did the army lose the map? Someone left it in the fog."],
    ["🏹", "Our archers never miss. They just introduce the arrow to the ground first."],
    ["🐉", "Why did the dragon fail the interview? Too many unresolved flames."],
    ["👑", "A wise king once said: never fight on an empty stomach. He was then promptly out-farmed."],
    ["⚔️", "Why are swords bad at secrets? They always get the point across."],
    ["🏰", "What's a castle's favorite genre of music? Wall of sound."]
  ];

  const toast = $("#toast");
  let toastTimer;
  let jokeIndex = Math.floor(Math.random() * JOKES.length);

  const say = (emoji, text, ms = 8000) => {
    if (!toast) return;
    $(".em", toast).textContent = emoji;
    $(".txt", toast).textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), ms);
  };

  const joke = () => {
    jokeIndex = (jokeIndex + 1) % JOKES.length;
    say(...JOKES[jokeIndex]);
  };

  if (toast) {
    $("button", toast).addEventListener("click", () => {
      clearTimeout(toastTimer);
      toast.classList.remove("show");
    });
    if (!sessionStorage.getItem("jester-seen")) {
      setTimeout(() => {
        joke();
        try {
          sessionStorage.setItem("jester-seen", "1");
        } catch (e) {}
      }, 12000);
    }
  }

  $$("[data-joke]").forEach((el) => el.addEventListener("click", joke));

  const brand = $(".brand");
  let brandClicks = 0;
  if (brand) {
    brand.addEventListener("click", () => {
      brandClicks += 1;
      if (brandClicks === 5) {
        brandClicks = 0;
        say("👑", "You found the royal secret: there is no secret. Long live the king!");
      }
    });
  }

  const nav = $(".nav");
  const bar = $(".progress");
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle("scrolled", y > 10);
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = $(".menu-btn");
  const menu = $("#menu");
  if (menuBtn && menu) {
    const close = () => {
      menu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    };
    menuBtn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
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
    { threshold: 0.15 }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.setProperty("--d", `${(i % 4) * 0.08}s`);
    io.observe(el);
  });

  const links = $$("#menu a[href^='#'], #menu a[href*='index.html#']");
  const sections = links
    .map((a) => $(a.getAttribute("href").replace(/^.*#/, "#")))
    .filter(Boolean);
  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href").endsWith(`#${en.target.id}`))
          );
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  const rot = $("#rotator");
  if (rot) {
    const words = ["Gather", "Build", "Scout", "Conquer"];
    let w = 0;
    const tick = () => {
      rot.innerHTML = `<b>${words[w]}.</b>`;
      w = (w + 1) % words.length;
    };
    tick();
    if (!reduce) setInterval(tick, 1800);
  }

  const embers = $("#embers");
  if (embers && !reduce) {
    const ctx = embers.getContext("2d");
    let W = 0;
    let H = 0;
    let parts = [];
    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = embers.clientWidth;
      H = embers.clientHeight;
      embers.width = W * dpr;
      embers.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: Math.round(Math.min(70, W / 16)) }, () => spawn(true));
    };
    const spawn = (anywhere) => ({
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 10,
      r: Math.random() * 2 + 0.6,
      vy: Math.random() * 0.6 + 0.25,
      vx: (Math.random() - 0.5) * 0.3,
      p: Math.random() * Math.PI * 2
    });
    let visible = true;
    new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(embers);
    const loop = () => {
      requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p, i) => {
        p.y -= p.vy;
        p.p += 0.02;
        p.x += p.vx + Math.sin(p.p) * 0.25;
        if (p.y < -10) parts[i] = spawn(false);
        const a = Math.max(0, Math.min(1, p.y / H)) * 0.8;
        ctx.beginPath();
        ctx.fillStyle = `rgba(243, 190, 100, ${a})`;
        ctx.shadowColor = "rgba(226, 105, 47, 0.9)";
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    fit();
    addEventListener("resize", fit);
    loop();
  }

  const stage = $("#stage");
  if (stage) {
    const canvas = $("canvas", stage);
    const ctx = canvas.getContext("2d");
    const spots = $$(".spot", stage);
    const counter = $("#counter");
    const hint = $(".hint", stage);
    let W = 0;
    let H = 0;
    let pointer = null;
    let visible = false;
    let t = 0;
    let found = 0;

    const paint = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#0b0a09";
      ctx.fillRect(0, 0, W, H);
    };

    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = stage.clientWidth;
      H = stage.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    };

    const reveal = (x, y, radius) => {
      const g = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
      g.addColorStop(0, "rgba(0, 0, 0, 1)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      spots.forEach((s) => {
        if (s.classList.contains("found")) return;
        const dx = s.offsetLeft - x;
        const dy = s.offsetTop - y;
        if (Math.hypot(dx, dy) < radius * 0.7) {
          s.classList.add("found");
          found += 1;
          counter.textContent = `${found} / ${spots.length} discovered`;
          if (hint) hint.style.opacity = 0;
          if (found === spots.length) {
            say("🗺️", "Map fully scouted! The enemy is, as always, right behind you.");
          }
        }
      });
    };

    const move = (e) => {
      const r = stage.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerdown", move);
    stage.addEventListener("pointerleave", () => (pointer = null));

    new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(stage);

    const loop = () => {
      requestAnimationFrame(loop);
      if (!visible) return;
      t += 0.012;
      ctx.fillStyle = "rgba(11, 10, 9, 0.025)";
      ctx.fillRect(0, 0, W, H);
      if (pointer) {
        reveal(pointer.x, pointer.y, Math.max(70, Math.min(W, H) * 0.2));
      } else if (!reduce) {
        reveal(
          W * (0.5 + 0.38 * Math.sin(t * 0.9)),
          H * (0.5 + 0.34 * Math.sin(t * 1.3 + 1)),
          Math.max(60, Math.min(W, H) * 0.16)
        );
      }
    };

    fit();
    addEventListener("resize", fit);
    loop();
  }
})();
