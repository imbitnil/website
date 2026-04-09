/* ═══════════════════════════════════════════════════════
   Interactions — CV-Themed Visual Polish & Interactive Delight
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Bail on reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── 1. Glitch Text Setup ───
  // Wrap the gradient "see" span with glitch markup
  (function initGlitch() {
    const gradientSpan = document.querySelector('#hero h1 .gradient');
    if (!gradientSpan) return;

    const text = gradientSpan.textContent.trim();
    gradientSpan.classList.add('glitch-text');
    gradientSpan.setAttribute('data-text', text);

    // Trigger intro glitch after a brief delay
    if (!prefersReducedMotion) {
      setTimeout(() => gradientSpan.classList.add('glitch-intro'), 800);
    }
  })();

  // ─── 2. Scan-Line Section Reveals ───
  (function initScanLines() {
    if (prefersReducedMotion) return;

    // Add scan-line element to each content section (not hero)
    const sections = document.querySelectorAll('section:not(#hero)');
    sections.forEach(section => {
      const scanLine = document.createElement('div');
      scanLine.className = 'scan-line';
      section.appendChild(scanLine);
    });

    // Observe sections
    const scanObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('scan-active')) {
          entry.target.classList.add('scan-active');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    sections.forEach(section => scanObserver.observe(section));
  })();

  // ─── 3. Custom Crosshair Cursor ───
  (function initCursor() {
    // Only on devices with a fine pointer (mouse)
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (prefersReducedMotion) return;

    // Build cursor DOM
    const cursor = document.createElement('div');
    cursor.className = 'cv-cursor';
    cursor.innerHTML = `
      <div class="cursor-ring"></div>
      <div class="cursor-h"></div>
      <div class="cursor-v"></div>
      <div class="cursor-dot"></div>
      <div class="cursor-corner tl"></div>
      <div class="cursor-corner tr"></div>
      <div class="cursor-corner bl"></div>
      <div class="cursor-corner br"></div>
      <div class="cursor-coords"></div>
    `;
    document.body.appendChild(cursor);
    document.documentElement.classList.add('custom-cursor-active');

    let mouseX = -100, mouseY = -100;
    let cursorX = -100, cursorY = -100;
    const coordsEl = cursor.querySelector('.cursor-coords');

    // Interactive elements that trigger hover state
    const hoverSelectors = '.btn, .project-card, .featured-project, .blog-card, .contact-card, .pub-card, a, button';
    let isHovering = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Track hover state
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelectors)) {
        isHovering = true;
        cursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelectors)) {
        isHovering = false;
        cursor.classList.remove('hovering');
      }
    });

    // Hide cursor when mouse leaves window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
    });

    // Animation loop with lerp
    function updateCursor() {
      const ease = 0.15;
      cursorX += (mouseX - cursorX) * ease;
      cursorY += (mouseY - cursorY) * ease;

      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

      // Update coordinate readout
      coordsEl.textContent = `(${Math.round(mouseX)}, ${Math.round(mouseY)})`;

      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);
  })();

  // ─── 4. Detection Label Injection ───
  // Add confidence labels to project cards
  (function initDetectLabels() {
    const labels = [
      { selector: '.featured-project', text: 'perception_pipeline 0.98' },
    ];

    // Project cards get auto-labeled from their h3 text
    document.querySelectorAll('.project-card').forEach((card, i) => {
      const h3 = card.querySelector('h3');
      if (!h3) return;
      const name = h3.textContent.toLowerCase().replace(/\s+/g, '_');
      const confidence = (0.91 + Math.random() * 0.08).toFixed(2);
      const label = document.createElement('span');
      label.className = 'detect-label';
      label.textContent = `${name} ${confidence}`;
      card.appendChild(label);
    });

    // Featured project
    labels.forEach(({ selector, text }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const label = document.createElement('span');
      label.className = 'detect-label';
      label.textContent = text;
      el.appendChild(label);
    });
  })();


  /* ═══════════════════════════════════════════════════════
     Phase 2: Interactive Delight
     ═══════════════════════════════════════════════════════ */

  // ─── 6. 3D Card Tilt ───
  (function initCardTilt() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.project-card, .blog-card, .pub-card');

    cards.forEach(card => {
      card.classList.add('tilt-card');

      // Add glare overlay
      const glare = document.createElement('div');
      glare.className = 'tilt-glare';
      card.appendChild(glare);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;   // 0 to 1
        const y = (e.clientY - rect.top) / rect.height;    // 0 to 1
        const centerX = x - 0.5;  // -0.5 to 0.5
        const centerY = y - 0.5;

        const rotateX = centerY * -8;   // tilt up to 8 degrees
        const rotateY = centerX * 8;

        card.classList.remove('tilt-reset');
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

        // Move glare to follow mouse position
        glare.style.setProperty('--glare-x', `${x * 100}%`);
        glare.style.setProperty('--glare-y', `${y * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.classList.add('tilt-reset');
        card.style.transform = '';
      });
    });
  })();

  // ─── 7. Magnetic Buttons ───
  (function initMagneticButtons() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (prefersReducedMotion) return;

    const magnetics = document.querySelectorAll('.btn, .contact-card');
    const PULL_DISTANCE = 80;
    const PULL_STRENGTH = 10;

    magnetics.forEach(el => {
      el.classList.add('magnetic');

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PULL_DISTANCE) {
          const pull = (1 - dist / PULL_DISTANCE) * PULL_STRENGTH;
          el.classList.add('mag-active');
          el.style.transform = `translate(${dx * pull / PULL_DISTANCE}px, ${dy * pull / PULL_DISTANCE}px)`;
        }
      });

      el.addEventListener('mouseleave', () => {
        el.classList.remove('mag-active');
        el.style.transform = '';
      });
    });
  })();

  // ─── 8. Text Split / Reveal Animations ───
  (function initTextSplit() {
    if (prefersReducedMotion) return;

    // Select headings to animate (section h2s and hero h1)
    const headings = document.querySelectorAll('#projects h2, #publications h2, #blog h2, #about h2, #contact h2');

    headings.forEach(heading => {
      const text = heading.textContent;
      heading.innerHTML = '';
      heading.classList.add('split-heading');

      const words = text.split(' ');
      let charIndex = 0;

      words.forEach((word, wi) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';

        word.split('').forEach(char => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = char;
          charSpan.style.transitionDelay = `${charIndex * 0.025}s`;
          wordSpan.appendChild(charSpan);
          charIndex++;
        });

        heading.appendChild(wordSpan);

        // Add space between words (not after last)
        if (wi < words.length - 1) {
          const space = document.createElement('span');
          space.className = 'word-space';
          heading.appendChild(space);
        }
      });
    });

    // Observe split headings and trigger animation
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-text');
          textObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.split-heading').forEach(h => textObserver.observe(h));
  })();

  // ─── 9 + 10 + 11. Unified Scroll Handler (RAF-throttled) ───
  (function initScrollEffects() {
    if (prefersReducedMotion) return;

    // --- Progress Bar Setup ---
    const progressSections = [
      { id: 'hero', label: 'Home' },
      { id: 'projects', label: 'Projects' },
      { id: 'publications', label: 'Papers' },
      { id: 'about', label: 'About' },
      { id: 'blog', label: 'Blog' },
      { id: 'contact', label: 'Contact' },
    ];

    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.innerHTML = `
      <div class="scroll-progress-track">
        <div class="scroll-progress-fill"></div>
        <div class="scroll-progress-dots">
          ${progressSections.map(s => `<div class="scroll-dot" data-section="${s.id}" data-label="${s.label}"></div>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(progress);

    const fill = progress.querySelector('.scroll-progress-fill');
    const dots = progress.querySelectorAll('.scroll-dot');

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const target = document.getElementById(dot.dataset.section);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // --- Timeline Setup ---
    const timeline = document.querySelector('.timeline');
    const timelineItems = timeline ? timeline.querySelectorAll('.timeline-item') : [];

    // --- Parallax Setup ---
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const parallaxEls = hasHover ? document.querySelectorAll('[data-parallax]') : [];
    const viewH = window.innerHeight;

    // --- Single scroll handler ---
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - viewH;

        // 9. Progress bar fill
        fill.style.height = Math.min(1, scrollY / maxScroll) * 100 + '%';

        // 9. Active section dot
        let activeIndex = 0;
        for (let i = 0; i < progressSections.length; i++) {
          const el = document.getElementById(progressSections[i].id);
          if (el && scrollY >= el.offsetTop - viewH * 0.4) activeIndex = i;
        }
        dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));

        // 10. Timeline
        if (timeline) {
          const rect = timeline.getBoundingClientRect();
          const startThreshold = viewH * 0.7;
          const p = Math.max(0, Math.min(1,
            (startThreshold - rect.top) / (rect.height + startThreshold - viewH * 0.3)
          ));
          timeline.style.setProperty('--timeline-progress', p);

          timelineItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            item.classList.toggle('timeline-active', itemRect.top + itemRect.height / 2 < viewH * 0.7);
          });
        }

        // 11. Parallax (hero only)
        if (scrollY < viewH * 1.2) {
          parallaxEls.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 1;
            el.style.transform = `translate3d(0, ${scrollY * (1 - speed)}px, 0)`;
          });
        }

        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial state
  })();

  // ─── 12. CV Pipeline Divider Reveals ───
  (function initPipelineDividers() {
    const dividers = document.querySelectorAll('.pipeline-divider');
    if (!dividers.length) return;

    const dividerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          dividerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    dividers.forEach(d => dividerObserver.observe(d));
  })();

  // ─── 14. Blog Film Strip Setup ───
  // Add rotation and frame numbers to blog cards
  (function initFilmStrip() {
    // Use MutationObserver since blog cards are rendered dynamically
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    function applyFilmStrip() {
      const cards = blogGrid.querySelectorAll('.blog-card');
      cards.forEach((card, i) => {
        // Alternate slight rotations: -1.5, 0.8, -0.5, 1.2, etc.
        const rotations = [-1.5, 0.8, -0.5, 1.2, -1.0, 0.6];
        const rot = rotations[i % rotations.length];
        card.style.setProperty('--card-rot', `${rot}deg`);
        card.setAttribute('data-frame', `F${String(i + 1).padStart(3, '0')}`);
      });
    }

    // Run once immediately
    applyFilmStrip();

    // Watch for dynamic card rendering (blog filter changes)
    const observer = new MutationObserver(applyFilmStrip);
    observer.observe(blogGrid, { childList: true });
  })();


  /* ═══════════════════════════════════════════════════════
     Phase 4: Premium Features
     ═══════════════════════════════════════════════════════ */

  // ─── 16. Interactive Tech Stack Orbital ───
  (function initTechOrbital() {
    const canvas = document.getElementById('tech-orbital-canvas');
    if (!canvas) return;
    if (!window.matchMedia('(min-width: 769px)').matches) return;

    const ctx = canvas.getContext('2d');
    let W, H, cx, cy;
    let mouseX = null, mouseY = null;
    let animId;

    const techItems = [
      // Ring 0 (inner): Core
      { label: 'PyTorch', ring: 0, angle: 0, color: '#ee4c2c' },
      { label: 'Python', ring: 0, angle: Math.PI * 0.667, color: '#3776ab' },
      { label: 'C++', ring: 0, angle: Math.PI * 1.333, color: '#00599c' },
      // Ring 1: Frameworks
      { label: 'OpenCV', ring: 1, angle: 0, color: '#5c3ee8' },
      { label: 'TensorRT', ring: 1, angle: Math.PI * 0.5, color: '#76b900' },
      { label: 'CUDA', ring: 1, angle: Math.PI, color: '#76b900' },
      { label: 'ONNX', ring: 1, angle: Math.PI * 1.5, color: '#005CED' },
      // Ring 2: Tools
      { label: 'Detectron2', ring: 2, angle: 0, color: '#4285f4' },
      { label: 'W&B', ring: 2, angle: Math.PI * 0.4, color: '#ffbe00' },
      { label: 'Open3D', ring: 2, angle: Math.PI * 0.8, color: '#2196f3' },
      { label: 'Docker', ring: 2, angle: Math.PI * 1.2, color: '#2496ed' },
      { label: 'ROS2', ring: 2, angle: Math.PI * 1.6, color: '#22314e' },
    ];

    const ringRadii = [0, 0, 0];
    const ringSpeeds = [0.0004, -0.0003, 0.0002];

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      const maxR = Math.min(W, H) / 2 - 30;
      ringRadii[0] = maxR * 0.3;
      ringRadii[1] = maxR * 0.6;
      ringRadii[2] = maxR * 0.9;
    }

    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
      mouseX = null;
      mouseY = null;
    });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw ring orbits
      for (let i = 0; i < ringRadii.length; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadii[i], 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(129, 140, 248, 0.6)';
      ctx.fill();

      let hasHover = false;

      techItems.forEach(item => {
        item.angle += ringSpeeds[item.ring];
        const r = ringRadii[item.ring];
        const x = cx + Math.cos(item.angle) * r;
        const y = cy + Math.sin(item.angle) * r;

        let hovered = false;
        if (mouseX !== null) {
          const dx = mouseX - x;
          const dy = mouseY - y;
          if (Math.sqrt(dx * dx + dy * dy) < 24) {
            hovered = true;
            hasHover = true;
          }
        }

        const nodeR = hovered ? 18 : 12;
        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = hovered ? item.color : item.color + '33';
        ctx.fill();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = hovered ? 2 : 1;
        ctx.stroke();

        ctx.font = `${hovered ? '600 13px' : '500 11px'} 'Inter', sans-serif`;
        ctx.fillStyle = hovered ? '#fafafa' : '#a1a1aa';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, x, y + nodeR + 14);
      });

      canvas.style.cursor = hasHover ? 'pointer' : 'default';
      animId = requestAnimationFrame(draw);
    }

    // Only animate when visible
    const orbObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animId = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(animId);
      }
    }, { threshold: 0.1 });
    orbObserver.observe(canvas);
  })();

  // ─── 17. Contact Particle Gravity ───
  (function initContactParticles() {
    const canvas = document.getElementById('contact-particles-canvas');
    if (!canvas) return;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let W, H;
    let particles = [];
    let animId;
    const PARTICLE_COUNT = 60;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle() {
      return {
        x: Math.random() * W,
        y: H + Math.random() * 20,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.3 + Math.random() * 0.5),
        r: 1.5 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.4,
        life: 0,
        maxLife: 200 + Math.random() * 300,
      };
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = createParticle();
        p.y = Math.random() * H;
        p.life = Math.random() * p.maxLife;
        particles.push(p);
      }
    }

    function getAttractors() {
      const section = document.getElementById('contact');
      if (!section) return [];
      const cards = section.querySelectorAll('.contact-card');
      const sectionRect = section.getBoundingClientRect();
      const attractors = [];
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        attractors.push({
          x: rect.left - sectionRect.left + rect.width / 2,
          y: rect.top - sectionRect.top + rect.height / 2,
        });
      });
      return attractors;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const attractors = getAttractors();

      particles.forEach((p, i) => {
        p.life++;
        if (p.life > p.maxLife || p.y < -10) {
          particles[i] = createParticle();
          return;
        }

        // Gravity toward attractors
        attractors.forEach(a => {
          const dx = a.x - p.x;
          const dy = a.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 5) {
            const force = 0.015 / (dist * 0.02);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        });

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        const fadeIn = Math.min(1, p.life / 30);
        const fadeOut = Math.max(0, 1 - (p.life - p.maxLife + 60) / 60);
        const alpha = p.alpha * fadeIn * fadeOut;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
        ctx.fill();
      });

      // Connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.08 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    window.addEventListener('resize', resize);

    const partObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animId = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(animId);
      }
    }, { threshold: 0.1 });
    partObserver.observe(canvas);
  })();

})();
