// ===== js/main.js =====
// ==========================================================================
//  MAIN.JS — Nikah Arch Reveal + site utilities
// ==========================================================================
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initGate();
  // initPreloader();  — preloader commented out; gate is the entry point
  // initArchReveal(); — arch commented out; hero starts in revealed state
  initMusicToggle();
  initSideNav();
  initHeroParallax();
});

/* ---- Preloader ---- */
function initPreloader() {
  const el = document.getElementById('preloader');
  if (!el) return;

  // Hide after page load, with a small grace period
  window.addEventListener('load', () => {
    setTimeout(() => el.classList.add('is-hidden'), 500);
  });

  // Hard fallback — never block the page for more than 3.2 s
  setTimeout(() => el.classList.add('is-hidden'), 3200);
}

/* ---- Arch reveal ---- */
function initArchReveal() {
  const cta      = document.getElementById('archCta');
  const frame    = document.getElementById('archFrame');
  const stage    = document.getElementById('heroStage');
  const hero     = document.querySelector('.hero');
  const scrollCue = document.getElementById('scrollCue');
  if (!cta || !frame || !stage) return;

  const openArch = () => {
    // Animate arch doors open
    frame.classList.add('is-open');
    // Reveal names / date / venue
    stage.classList.add('is-revealed');
    // Fade out the solid cover to reveal background photo
    if (hero) hero.classList.add('is-open');
    // Show scroll cue after reveal completes
    setTimeout(() => {
      if (scrollCue) scrollCue.classList.add('is-visible');
    }, 1600);

    // Ring particle burst
    spawnRingParticles();

    // Start music and show toggle
    const music    = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggle');
    if (music && musicBtn) {
      musicBtn.removeAttribute('hidden');
      music.volume = 0.55;
      music.play()
        .then(() => musicBtn.classList.add('is-playing'))
        .catch(() => {
          // Autoplay blocked — button visible so user can start manually
        });
    }
  };

  cta.addEventListener('click', openArch);
  cta.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openArch();
    }
  });
}

/* ---- Ring particle burst ---- */
function spawnRingParticles() {
  const holder = document.getElementById('ringParticles');
  if (!holder || holder.dataset.played) return;
  holder.dataset.played = 'true';

  const RING_SVG = (size, stroke) =>
    `<svg viewBox="0 0 40 40" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="20" cy="20" r="15" fill="none" stroke="${stroke}" stroke-width="2.4"/>` +
    `</svg>`;

  for (let i = 0; i < 16; i++) {
    const p    = document.createElement('span');
    p.className = 'ring-particle';

    const size   = 14 + Math.random() * 22;
    const stroke = Math.random() > 0.5 ? '#e2c793' : '#cfaa6b';
    p.innerHTML  = RING_SVG(size, stroke);

    const startX  = 50 + (Math.random() * 60 - 30);
    const drift   = (Math.random() * 220 - 110).toFixed(0);
    const rise    = -(260 + Math.random() * 220).toFixed(0);
    const rotate  = (Math.random() * 360 - 180).toFixed(0);
    const delay   = (Math.random() * 0.35).toFixed(2);
    const dur     = (1.1 + Math.random() * 0.9).toFixed(2);

    p.style.left = `${startX}%`;
    p.style.setProperty('--drift',  `${drift}px`);
    p.style.setProperty('--rise',   `${rise}px`);
    p.style.setProperty('--rotate', `${rotate}deg`);
    p.style.animationDuration  = `${dur}s`;
    p.style.animationDelay     = `${delay}s`;

    holder.appendChild(p);
  }
}

/* ---- Music toggle ---- */
function initMusicToggle() {
  const btn   = document.getElementById('musicToggle');
  const music = document.getElementById('bgMusic');
  if (!btn || !music) return;

  btn.addEventListener('click', () => {
    if (music.paused) {
      music.play()
        .then(() => btn.classList.add('is-playing'))
        .catch(() => {});
      btn.setAttribute('aria-label', 'Pause background music');
    } else {
      music.pause();
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play background music');
    }
  });
}

/* ---- Side nav dots — highlight active section ---- */
function initSideNav() {
  const dots    = document.querySelectorAll('.side-nav__dot');
  const targets = Array.from(dots).map(d => {
    const href = d.getAttribute('href');
    return href ? document.querySelector(href) : null;
  });

  if (!dots.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = targets.indexOf(entry.target);
        dots.forEach((d, i) => {
          if (i === idx) {
            d.setAttribute('aria-current', 'true');
          } else {
            d.removeAttribute('aria-current');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  targets.forEach(t => { if (t) observer.observe(t); });
}

/* ---- Hero parallax (GSAP ScrollTrigger if available, else rAF fallback) ---- */
function initHeroParallax() {
  const photo = document.querySelector('.hero__bg-photo');
  if (!photo) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY     = window.pageYOffset;
        const heroEl      = document.getElementById('hero');
        const heroHeight  = heroEl ? heroEl.offsetHeight : 0;

        if (scrollY < heroHeight) {
          photo.style.transform = `translateY(${scrollY * 0.25}px) scale(1.05)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ---- Nav scroll effect ---- */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.pageYOffset > 80);
  });
})();

/* ---- Smooth scroll for all internal anchors ---- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ---- Opening gate (tap-to-enter) ---- */
function initGate() {
  const gate     = document.getElementById('gate');
  const enterBtn = document.getElementById('gate-enter');
  if (!gate || !enterBtn) return;

  let opened = false;

  function openGate() {
    if (opened) return;
    opened = true;

    // Stage 1: gate content fades/blurs away
    gate.classList.add('gate-closing');

    // Stage 2: unlock scrolling + reveal content underneath
    document.body.classList.remove('gate-active');
    document.body.classList.add('page-loaded');

    // Stage 3: fully remove gate from flow after transition completes
    window.setTimeout(() => {
      gate.classList.add('gate-hidden');
      gate.setAttribute('aria-hidden', 'true');
    }, 1100);

    // Auto-start music (arch is disabled; gate is now the entry trigger)
    const music    = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggle');
    if (music && musicBtn) {
      music.volume = 0.55;
      music.play()
        .then(() => musicBtn.classList.add('is-playing'))
        .catch(() => {
          // Autoplay blocked — user can tap the music button manually
        });
    }
  }

  enterBtn.addEventListener('click', openGate);
  enterBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGate();
    }
  });
}


// ===== js/animations.js =====
// ==========================================================================
//  ANIMATIONS.JS — Scroll reveal (AOS-like) + section utilities
// ==========================================================================
(function () {
  'use strict';

  /* ---- Scroll reveal ---- */
  function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
          setTimeout(() => el.classList.add('aos-animate'), delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  /* ---- Gallery lazy load ---- */
  function initGalleryLazy() {
    const lazyImgs = document.querySelectorAll('img[data-src]');
    if (!lazyImgs.length) return;

    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    });

    lazyImgs.forEach(img => imgObserver.observe(img));
  }

  /* ---- RSVP form ---- */
  function initRSVP() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    const nameInput  = document.getElementById('rsvp-name');
    const phoneInput = document.getElementById('rsvp-phone');
    const submitBtn  = form.querySelector('.rsvp-submit');
    const overlay    = document.getElementById('rsvp-modal-overlay');
    const closeBtn   = document.getElementById('rsvp-modal-close');

    function setInvalid(el, errorEl, invalid) {
      if (!el) return;
      el.classList.toggle('is-invalid', invalid);
      if (errorEl) errorEl.classList.toggle('is-visible', invalid);
    }

    function clearFieldError(input, errorEl) {
      input.addEventListener('input', () => setInvalid(input, errorEl, false));
    }

    const nameError  = form.querySelector('[data-error-for="rsvp-name"]');
    const phoneError = form.querySelector('[data-error-for="rsvp-phone"]');
    const attendError = form.querySelector('[data-error-for="rsvp-attend"]');

    clearFieldError(nameInput, nameError);
    clearFieldError(phoneInput, phoneError);

    form.querySelectorAll('input[name="attending"]').forEach((radio) => {
      radio.addEventListener('change', () => setInvalid(null, attendError, false));
    });

    function openModal() {
      overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-visible')) closeModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;

      if (!nameInput.value.trim()) {
        setInvalid(nameInput, nameError, true);
        valid = false;
      }

      if (!phoneInput.value.trim()) {
        setInvalid(phoneInput, phoneError, true);
        valid = false;
      }

      const attendingChecked = form.querySelector('input[name="attending"]:checked');
      if (!attendingChecked) {
        setInvalid(null, attendError, true);
        valid = false;
      }

      if (!valid) return;

      // ── Google Sheets via Apps Script ────────────────────────────────────
      const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxWWMKGjA2ByXKS0nVifUT1PoUXdPF3Vk131lxZSsmTIU3dg7LeIpgiyE4FDkz5zm_w/exec";
      // ─────────────────────────────────────────────────────────────────────

      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending&hellip;</span>';

      const payload = {
        guestName:  nameInput.value.trim(),
        phone:      phoneInput.value.trim(),
        guestCount: form.querySelector('#rsvp-guests').value,
        attending:  attendingChecked.value,
        message:    (form.querySelector('#rsvp-message') || {}).value || ""
      };

      // Build query string manually for GET fallback
      const qs = Object.keys(payload)
        .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(payload[k]))
        .join("&");

      // Primary: POST with text/plain (Apps Script reads e.postData.contents)
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        mode: "no-cors"
      })
        .then(() => {
          submitBtn.innerHTML = original;
          submitBtn.disabled = false;
          form.reset();
          openModal();
        })
        .catch(() => {
          // Fallback: GET with query params (some browsers block cross-origin POST from file://)
          fetch(APPS_SCRIPT_URL + "?" + qs, { mode: "no-cors" })
            .then(() => {
              submitBtn.innerHTML = original;
              submitBtn.disabled = false;
              form.reset();
              openModal();
            })
            .catch(() => {
              submitBtn.innerHTML = '<span>Try Again</span>';
              submitBtn.disabled = false;
              alert("Something went wrong. Please check your connection and try again.");
            });
        });
    });
  }

  /* ---- Init all ---- */
  function init() {
    initAOS();
    initGalleryLazy();
    initRSVP();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// ===== js/countdown.js =====
// ===== COUNTDOWN TIMER =====
(function() {
  'use strict';

  const WEDDING_DATE = new Date('2026-09-12T17:00:00');

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-minutes').textContent = '00';
      document.getElementById('cd-seconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdownValue('cd-days', pad(days));
    setCountdownValue('cd-hours', pad(hours));
    setCountdownValue('cd-minutes', pad(minutes));
    setCountdownValue('cd-seconds', pad(seconds));
  }

  function setCountdownValue(id, newVal) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== newVal) {
      el.classList.add('flip');
      setTimeout(() => el.classList.remove('flip'), 300);
      el.textContent = newVal;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();