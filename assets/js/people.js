export function initPeople() {
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
}