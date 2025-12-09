import { fbkBlue } from './utils.js';

export function initTextAnimations() {
  const sections = document.querySelectorAll(".most-section");

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(section => sectionObserver.observe(section));
}

export function initHexagons() {
  const sections = document.querySelectorAll('.most-section');
    const hexPath = "M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z";

    sections.forEach(section => {
        const style = window.getComputedStyle(section);
        const bgColor = style.backgroundColor;

        let hexFillColor = "white"; // default blue
        if(bgColor.includes("255, 255, 255")) {
            hexFillColor = fbkBlue; // white hex on blue background
        }

        if (section.classList.contains('most-section--banner')) {
            createBannerHexes(section, hexFillColor);
        } else {
            createCluster(section, 'top-left', hexFillColor);
            createCluster(section, 'bottom-right', hexFillColor);
        }
    });

    // ------------------ Normal section clusters ------------------
    function createCluster(container, positionClass, color) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('hex-cluster', positionClass);

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");

        const placedHexes = []; // track positions to reduce overlap
        for (let i = 0; i < 12; i++) {
            createHex(svg, color, 200, 200, 0.3, 1.5, placedHexes, 60);
        }

        wrapper.appendChild(svg);
        container.appendChild(wrapper);
    }

    // ------------------ Banner full coverage ------------------
    function createBannerHexes(container, color) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('hex-cluster', 'banner');
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.pointerEvents = 'none';
        wrapper.style.zIndex = '1';

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");

        const placedHexes = [];
        const hexCount = 60;
        for (let i = 0; i < hexCount; i++) {
            createHex(svg, color, container.offsetWidth, container.offsetHeight, 0.5, 4.0, placedHexes, 300);
        }

        wrapper.appendChild(svg);
        container.appendChild(wrapper);
    }

    // ------------------ Hexagon creation ------------------
    function createHex(svg, color, maxWidth, maxHeight, minScale, maxScale, placedHexes, minDistance) {
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "path");
      polygon.setAttribute("d", hexPath);
      polygon.classList.add('hex');

      // Random scale
      const scale = minScale + Math.random() * (maxScale - minScale);

      // Random rotation 0–90°
      const rotation = Math.random() * 90;

      // Random position
      const { x, y } = getRandomPosition(maxWidth, maxHeight, scale, placedHexes, minDistance);

      polygon.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(0)`;
      polygon.style.fill = color;

      // Opacity logic
      const finalOpacity = (Math.random() * 0.20 + 0.05);
      polygon.style.opacity = finalOpacity;

      // Random delay & duration
      const delay = Math.random() * 0.5;
      const duration = 2 + Math.random() * 1.5;

      polygon.animate(
          [
              { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(0)` },
              { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})` }
          ],
          {
              duration: duration * 1000,
              delay: delay * 1000,
              fill: "forwards",
              easing: "ease-out"
          }
      );

      svg.appendChild(polygon);
  }


    // ------------------ Helper: minimal overlap ------------------
    function getRandomPosition(maxWidth, maxHeight, scale, placedHexes, minDistance) {
        let x, y, tries = 0;

        do {
            x = Math.random() * maxWidth;
            y = Math.random() * maxHeight;
            tries++;
            if (tries > 10) break; // avoid infinite loops
        } while (placedHexes.some(pos => Math.hypot(pos.x - x, pos.y - y) < minDistance));

        placedHexes.push({ x, y });
        return { x, y };
    }
}
