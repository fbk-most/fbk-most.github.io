/* COOKIES */
function mostMaybeCookieAlert() {
  const cookieAlert = document.querySelector(".most-cookie");
  const acceptButton = document.querySelector(".most-cookie__accept");

  if (!cookieAlert || !acceptButton) return; // exit if elements missing

  function setCookie(name, value, days) {
    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    const cookie = [
      `${encodedName}=${encodedValue}`,
      `expires=${date.toUTCString()}`,
      "path=/",
      "SameSite=Lax",
    ].join("; ");

    document.cookie = cookie;
  }

  function getCookie(name) {
    const encodedName = encodeURIComponent(name);
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split("=");
      if (cookieName === encodedName) {
        return decodeURIComponent(cookieValue);
      }
    }

    return null;
  }

  const cookieName = "mostCookiesAccepted";

  // Show banner if cookie not set
  if (!getCookie(cookieName)) {
    cookieAlert.classList.add("show");
  }

  // Handle accept button
  acceptButton.addEventListener("click", function () {
    setCookie(cookieName, "true", 365);
    cookieAlert.classList.remove("show");
  });
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", mostMaybeCookieAlert);

/* PEOPLE */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".person-card");
  const offset = 100; // Spacing from the top of the viewport

  // Ensure cards are focusable for accessibility
  cards.forEach(card => {
    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }
  });

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const isExpanded = card.classList.contains("expanded");

      // Collapse all cards first
      cards.forEach(c => c.classList.remove("expanded"));

      if (!isExpanded) {
        // Expand clicked card
        card.classList.add("expanded");

        // Wait for the CSS transition and layout reflow to complete
        // Adjust the time (e.g., 300ms) to be slightly longer than your CSS transition duration
        setTimeout(() => {
          // FIX: Use card.offsetTop (position relative to document) for a stable reference.
          const cardTop = card.offsetTop;
          
          // Calculate the target scroll position:
          // The absolute position of the card's top (cardTop) minus the desired top offset (offset).
          const targetTop = cardTop - offset;
          
          window.scrollTo({
            top: targetTop,
            behavior: "smooth"
          });

          // Set focus on the card for accessibility
          card.focus();
          
        }, 300); // Wait for CSS transition (ADJUST THIS TIME if needed!)
      }
    });
  });
});

/* NEWS */
document.addEventListener("DOMContentLoaded", function() {
  // Select all toggle buttons
  const toggles = document.querySelectorAll(".past-news-toggle");

  toggles.forEach(function(toggle) {
    // Assume the past-news-list is the next sibling
    const list = toggle.nextElementSibling.querySelector(".past-news-list");

    if (!list) return; // Skip if no list found

    // Initial state
    list.style.display = "none";

    toggle.addEventListener("click", function() {
      if (list.style.display === "none" || list.style.display === "") {
        list.style.display = "block";
        toggle.textContent = toggle.textContent.replace("▼", "▲");
      } else {
        list.style.display = "none";
        toggle.textContent = toggle.textContent.replace("▲", "▼");
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", function() {
  let slideIndex = 0;
  const slides = document.querySelectorAll(".mySlides");
  const dots = document.querySelectorAll(".dot");

  function showSlide(n) {
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    slides.forEach(s => s.style.display = "none");
    dots.forEach(d => d.classList.remove("active"));

    slides[slideIndex].style.display = "block";
    dots[slideIndex].classList.add("active");
  }

  function nextSlide() { showSlide(++slideIndex); }
  function prevSlide() { showSlide(--slideIndex); }

  document.querySelector(".next-slide").addEventListener("click", nextSlide);
  document.querySelector(".prev-slide").addEventListener("click", prevSlide);
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => { slideIndex = i; showSlide(slideIndex); });
  });

  // Auto-rotate every 5 seconds
  setInterval(() => { nextSlide(); }, 5000);

  // Initialize
  showSlide(slideIndex);

});

/* ANIMATION FOR TEXT */
document.addEventListener("DOMContentLoaded", () => {

  /* ===== SECTIONS ANIMATION ===== */
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


  /* ===== PERSON CARDS ANIMATION ===== */
  const grids = document.querySelectorAll(".people-grid");

  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");

        const cards = entry.target.querySelectorAll(".person-card");
        cards.forEach(card => card.classList.add("reveal"));

        gridObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  grids.forEach(grid => gridObserver.observe(grid));

});

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('.most-section');
    const hexPath = "M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z";

    sections.forEach(section => {
        const style = window.getComputedStyle(section);
        const bgColor = style.backgroundColor;

        let hexFillColor = "#2d64bb"; // default blue
        if(bgColor.includes("45, 100, 187") || section.classList.contains('most-section--banner')) {
            hexFillColor = "#ffffff"; // white hex on blue background
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

        // Random position with minimal overlap
        const { x, y } = getRandomPosition(maxWidth, maxHeight, scale, placedHexes, minDistance);

        polygon.style.transform = `translate(${x}px, ${y}px) scale(0)`; // start small
        polygon.style.fill = color;

        // Opacity logic
        const finalOpacity = color === "#ffffff"
            ? (Math.random() * 0.10 + 0.05)
            : (Math.random() * 0.20 + 0.05);
        polygon.style.opacity = finalOpacity;

        // Random delay & duration
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 1.5;

        // Animate scale only
        polygon.animate(
            [
                { transform: `translate(${x}px, ${y}px) scale(0)` },
                { transform: `translate(${x}px, ${y}px) scale(${scale})` }
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
});
