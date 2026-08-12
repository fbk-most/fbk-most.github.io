export function initNavDrawer() {
  const toggle   = document.querySelector('.nav-toggle');
  const drawer   = document.querySelector('.nav-drawer');
  const overlay  = document.querySelector('.nav-overlay');
  const closeBtn = document.querySelector('.nav-drawer__close');

  if (!toggle || !drawer || !overlay || !closeBtn) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  drawer.querySelectorAll('a[href*="#"]').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  /* Swipe to close */
  let touchStartX = 0;
  let touchCurrentX = 0;
  let isSwiping = false;
  const SWIPE_THRESHOLD = 60;

  drawer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchCurrentX = touchStartX;
    isSwiping = true;
    drawer.style.transition = 'none';
  }, { passive: true });

  drawer.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    touchCurrentX = e.touches[0].clientX;
    const delta = touchCurrentX - touchStartX;
    if (delta > 0) {
      drawer.style.transform = `translateX(${delta}px)`;
      const progress = Math.min(delta / drawer.offsetWidth, 1);
      overlay.style.opacity = 1 - progress;
    }
  }, { passive: true });

  drawer.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;
    drawer.style.transition = '';
    overlay.style.opacity = '';
    const delta = touchCurrentX - touchStartX;
    if (delta > SWIPE_THRESHOLD) {
      drawer.style.transform = `translateX(100%)`;
      setTimeout(() => {
        drawer.style.transform = '';
        closeDrawer();
      }, 280);
    } else {
      drawer.style.transform = '';
    }
  });

  drawer.addEventListener('touchcancel', () => {
    isSwiping = false;
    drawer.style.transition = '';
    drawer.style.transform = '';
    overlay.style.opacity = '';
  });
}
