/* ============================================
   LXVECORE — Main JavaScript
   Stars, Scroll Animations, Smooth Scroll
   ============================================ */

(function () {
  'use strict';

  // ===========================
  // 1. Star Field Generator
  // ===========================
  function generateStars(elementId, count, maxSize) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const shadows = [];
    const screenW = 2000;
    const screenH = 4000;

    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * screenW);
      const y = Math.floor(Math.random() * screenH);
      const size = Math.random() * maxSize;
      const opacity = 0.2 + Math.random() * 0.6;
      shadows.push(`${x}px ${y}px 0 ${size}px rgba(226, 232, 240, ${opacity})`);
    }

    el.style.boxShadow = shadows.join(', ');
    el.style.width = '1px';
    el.style.height = '1px';
  }

  generateStars('stars-small', 300, 0.5);
  generateStars('stars-medium', 100, 1);
  generateStars('stars-large', 30, 1.5);

  // ===========================
  // 2. Scroll-triggered Fade-in
  // ===========================
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.fade-in').forEach((el) => {
    fadeObserver.observe(el);
  });

  // ===========================
  // 3. Smooth scroll for CTA
  // ===========================
  const heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('audio');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ===========================
  // 4. Parallax on scroll (subtle)
  // ===========================
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const starsSmall = document.getElementById('stars-small');
        const starsMedium = document.getElementById('stars-medium');
        const starsLarge = document.getElementById('stars-large');

        if (starsSmall) starsSmall.style.transform = `translateY(${scrollY * 0.05}px)`;
        if (starsMedium) starsMedium.style.transform = `translateY(${scrollY * 0.1}px)`;
        if (starsLarge) starsLarge.style.transform = `translateY(${scrollY * 0.15}px)`;

        ticking = false;
      });
      ticking = true;
    }
  }

  if (window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===========================
  // 5. Audio Context & Interaction
  // ===========================
  
  // -- Ambient Sound --
  const ambientAudio = new Audio('assets/sounds/siteweblxvecoremusic.mp3');
  ambientAudio.volume = 0.15;
  ambientAudio.loop = true;

  const playAmbient = () => {
    if (ambientAudio.paused) {
      ambientAudio.play().catch(e => {
        console.log('Autoplay prevented, waiting for interaction...', e);
      });
    }
  };

  playAmbient();

  // -- Pluck Hover Sound --
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx;
  let pluckBuffer = null;

  const initAudioCtx = () => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
      fetch('assets/sounds/pluck hover sound.mp3')
        .then(res => res.arrayBuffer())
        .then(data => audioCtx.decodeAudioData(data))
        .then(buffer => {
          pluckBuffer = buffer;
        })
        .catch(err => console.error('Error loading hover sound:', err));
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const startAudioOnInteraction = () => {
    playAmbient();
    initAudioCtx();
  };

  const introOverlay = document.getElementById('intro-overlay');
  const mainContent = document.getElementById('main-content');

  if (introOverlay) {
    introOverlay.addEventListener('click', () => {
      introOverlay.classList.add('hidden');
      if (mainContent) mainContent.classList.remove('hidden');
      document.body.classList.remove('intro-active');
      startAudioOnInteraction();
    });
  } else {
    ['click', 'scroll', 'touchstart', 'mousemove'].forEach(evt => {
      document.body.addEventListener(evt, startAudioOnInteraction, { once: true });
    });
  }

  function playPluck() {
    if (!audioCtx || !pluckBuffer) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const source = audioCtx.createBufferSource();
    source.buffer = pluckBuffer;
    source.playbackRate.value = 0.9 + Math.random() * 0.2;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;

    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start(0);
  }

  const hoverElements = document.querySelectorAll('a, button, .hero__cta, .link-card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', playPluck);
  });

})();
