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

document.addEventListener("DOMContentLoaded", function() {
  const grids = document.querySelectorAll('.people-grid');

  grids.forEach(grid => {
    const cards = grid.querySelectorAll('.person-card');

    cards.forEach(card => {
      const main = card.querySelector('.person-card__main');

      main.addEventListener('click', () => {
        // Collapse all other cards in this grid
        cards.forEach(c => {
          if (c !== card) {
            c.classList.remove('expanded');
          }
        });

        // Toggle the clicked card
        card.classList.toggle('expanded');

        // Optional: scroll into view if expanded (mobile-friendly)
        if (card.classList.contains('expanded')) {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
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
