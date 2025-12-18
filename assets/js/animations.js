import { fbkBlue } from './utils.js';

/* =========================================================
   TEXT REVEAL ANIMATIONS
   ========================================================= */

export function initTextAnimations() {
  const sections = document.querySelectorAll('.most-section');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  sections.forEach(section => observer.observe(section));
}

/* =========================================================
   HEXAGON DECORATIONS
   ========================================================= */

export function initHexagons() {
  const sections = document.querySelectorAll('.most-section');
  const hexPath = 'M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z';

  sections.forEach(section => {
    const style = window.getComputedStyle(section);
    const bgColor = style.backgroundColor;

    let hexColor = 'white';
    if (bgColor.includes('255, 255, 255')) {
      hexColor = fbkBlue;
    }

    if (section.classList.contains('most-section--banner')) {
      createBannerHexes(section, hexColor);
    } else {
      createCornerCluster(section, 'top-left', hexColor);
      createCornerCluster(section, 'bottom-right', hexColor);
    }
  });

  /* ---------------------------------------------------------
     NORMAL SECTIONS — CORNER CLUSTERS
     --------------------------------------------------------- */

  function createCornerCluster(container, positionClass, color) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('hex-cluster', positionClass);

    const svg = createSVG();
    const placed = [];

    for (let i = 0; i < 12; i++) {
      createHex(svg, color, 200, 200, 0.3, 1.5, placed, 60);
    }

    wrapper.appendChild(svg);
    container.appendChild(wrapper);
  }

  /* ---------------------------------------------------------
     BANNER — EDGE-ONLY HEXAGONS
     --------------------------------------------------------- */

  function createBannerHexes(container, color) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('hex-cluster', 'banner');

    Object.assign(wrapper.style, {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '1'
    });

    const svg = createSVG();

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const edge = Math.min(width, height) * 0.22;

    const placed = [];
    const hexCount = 40;

    for (let i = 0; i < hexCount; i++) {
      const zone = pickEdgeZone(width, height, edge);
      createHexInZone(svg, color, zone, 0.5, 3.5, placed, 220);
    }

    wrapper.appendChild(svg);
    container.appendChild(wrapper);
  }

  /* ---------------------------------------------------------
     HEXAGON CREATION (GENERIC)
     --------------------------------------------------------- */

  function createHex(svg, color, maxW, maxH, minScale, maxScale, placed, minDist) {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    polygon.setAttribute('d', hexPath);
    polygon.classList.add('hex');

    const scale = rand(minScale, maxScale);
    const rotation = rand(0, 90);
    const { x, y } = getRandomPosition(maxW, maxH, placed, minDist);

    animateHex(polygon, x, y, scale, rotation, color);
    svg.appendChild(polygon);
  }

  function createHexInZone(svg, color, zone, minScale, maxScale, placed, minDist) {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    polygon.setAttribute('d', hexPath);
    polygon.classList.add('hex');

    const scale = rand(minScale, maxScale);
    const rotation = rand(0, 90);

    let x, y, tries = 0;
    do {
      x = zone.x + Math.random() * zone.w;
      y = zone.y + Math.random() * zone.h;
      tries++;
      if (tries > 10) break;
    } while (placed.some(p => dist(p.x, p.y, x, y) < minDist));

    placed.push({ x, y });
    animateHex(polygon, x, y, scale, rotation, color);
    svg.appendChild(polygon);
  }

  /* ---------------------------------------------------------
     HELPERS
     --------------------------------------------------------- */

  function animateHex(el, x, y, scale, rotation, color) {
    el.style.fill = color;
    el.style.opacity = rand(0.05, 0.25);
    el.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(0)`;

    el.animate(
      [
        { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(0)` },
        { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})` }
      ],
      {
        duration: rand(2000, 3500),
        delay: rand(0, 500),
        fill: 'forwards',
        easing: 'ease-out'
      }
    );
  }

  function createSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    return svg;
  }

  function pickEdgeZone(w, h, t) {
    const zones = [
      { x: 0, y: 0, w, h: t },                 // top
      { x: 0, y: h - t, w, h: t },             // bottom
      { x: 0, y: t, w: t, h: h - 2 * t },      // left
      { x: w - t, y: t, w: t, h: h - 2 * t }   // right
    ];
    return zones[Math.floor(Math.random() * zones.length)];
  }

  function getRandomPosition(maxW, maxH, placed, minDist) {
    let x, y, tries = 0;
    do {
      x = Math.random() * maxW;
      y = Math.random() * maxH;
      tries++;
      if (tries > 10) break;
    } while (placed.some(p => dist(p.x, p.y, x, y) < minDist));

    placed.push({ x, y });
    return { x, y };
  }

  function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }
}
