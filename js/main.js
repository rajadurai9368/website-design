/* ============================================================
   AURORA ARCHITECTURE — main.js
   Vanilla JS. Handles: sticky nav, mobile menu, scroll reveal,
   animated counters, testimonial rotator, project filters,
   scroll-to-top, lazy-loading fallback, form validation, year.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const qs = (s, c = document) => c.querySelector(s);
  const qsa = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header ---------- */
  const header = qs(".site-header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const hamburger = qs(".hamburger");
  const nav = qs(".nav");
  const backdrop = qs(".nav-backdrop");
  const closeNav = () => {
    if (!nav) return;
    nav.classList.remove("open");
    hamburger && hamburger.classList.remove("open");
    backdrop && backdrop.classList.remove("show");
    document.body.classList.remove("nav-locked");
    hamburger && hamburger.setAttribute("aria-expanded", "false");
  };
  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      backdrop && backdrop.classList.toggle("show", open);
      document.body.classList.toggle("nav-locked", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });
    backdrop && backdrop.addEventListener("click", closeNav);
    qsa(".nav-link, .nav-cta", nav).forEach((l) => l.addEventListener("click", closeNav));
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = qsa(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = qsa("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = target * eased;
      el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach((el) => (el.textContent = el.dataset.count));
    } else {
      const cio = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => cio.observe(el));
    }
  }

  /* ---------- Testimonials rotator ---------- */
  const testiTrack = qs(".testi-track");
  if (testiTrack) {
    const slides = qsa(".testi", testiTrack);
    const dotsWrap = qs(".testi-dots");
    let idx = 0, timer = null;
    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Testimonial " + (i + 1));
      b.addEventListener("click", () => { show(i); restart(); });
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });
    const show = (i) => {
      slides.forEach((s, n) => s.classList.toggle("active", n === i));
      dots.forEach((d, n) => d.classList.toggle("active", n === i));
      idx = i;
    };
    const next = () => show((idx + 1) % slides.length);
    const restart = () => { if (timer) clearInterval(timer); timer = setInterval(next, 6000); };
    show(0); restart();
    testiTrack.addEventListener("mouseenter", () => timer && clearInterval(timer));
    testiTrack.addEventListener("mouseleave", restart);
  }

  /* ---------- Project filters ---------- */
  const filterBtns = qsa(".filter-btn");
  const projectCards = qsa(".project-card");
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.filter;
        projectCards.forEach((card) => {
          const match = f === "all" || card.dataset.category === f;
          card.classList.toggle("hide", !match);
        });
      });
    });
  }

  /* ---------- Scroll to top ---------- */
  const toTop = qs(".to-top");
  if (toTop) {
    window.addEventListener("scroll", () => {
      toTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  /* ---------- Lazy-load fallback (native loading="lazy" preferred) ---------- */
  if (!("loading" in HTMLImageElement.prototype) && "IntersectionObserver" in window) {
    const lazyIo = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          obs.unobserve(img);
        }
      });
    });
    qsa("img[data-src]").forEach((img) => lazyIo.observe(img));
  }

  /* ---------- Contact form validation ---------- */
  const form = qs("#contact-form");
  if (form) {
    const setError = (field, on) => field.closest(".form-field").classList.toggle("invalid", on);
    const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      const name = qs("#name", form);
      const email = qs("#email", form);
      const message = qs("#message", form);
      [name, email, message].forEach((f) => setError(f, false));
      if (!name.value.trim()) { setError(name, true); ok = false; }
      if (!validEmail(email.value.trim())) { setError(email, true); ok = false; }
      if (message.value.trim().length < 10) { setError(message, true); ok = false; }
      if (!ok) return;
      const success = qs(".form-success", form);
      success && success.classList.add("show");
      form.reset();
      if (success) success.scrollIntoView ? null : null; // avoid scrollIntoView per guidance
      setTimeout(() => success && success.classList.remove("show"), 6000);
    });
    // clear error on input
    qsa("input, textarea", form).forEach((f) =>
      f.addEventListener("input", () => f.closest(".form-field").classList.remove("invalid"))
    );
  }

  /* ---------- Dynamic year ---------- */
  qsa("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Hero slideshow ---------- */
  const slideshow = qs("#hero-slideshow");
  if (slideshow) {
    const slides = qsa(".hero-slide", slideshow);
    if (slides.length > 1) {
      let current = 0;
      const INTERVAL = 5500;
      setInterval(() => {
        slides[current].classList.remove("active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("active");
      }, INTERVAL);
    }
  }

  /* ---------- Ensure videos autoplay (muted inline) ---------- */
  qsa("video[autoplay]").forEach((v) => {
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  });
})();
