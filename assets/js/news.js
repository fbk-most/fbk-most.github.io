export function initNews() {
  const toggles = Array.from(document.querySelectorAll('.past-news-toggle'));
  toggles.forEach(toggle => {
    const container = toggle.nextElementSibling;
    if (!container) return;
    const list = container.querySelector('.past-news-list');
    if (!list) return;

    // initial collapse
    list.style.display = 'none';

    toggle.addEventListener('click', () => {
      const isHidden = list.style.display === 'none' || list.style.display === '';
      list.style.display = isHidden ? 'block' : 'none';
      toggle.textContent = isHidden ? toggle.textContent.replace('▼','▲') : toggle.textContent.replace('▲','▼');
    });
  });
}

export function initSlider() {
  const slides = Array.from(document.querySelectorAll('.mySlides'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  if (!slides.length || !dots.length) return;

  let slideIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 10000;

  function showSlide(n) {
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    slides.forEach(s => s.style.display = 'none');
    dots.forEach(d => d.classList.remove('active'));

    slides[slideIndex].style.display = 'block';
    dots[slideIndex].classList.add('active');
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, AUTO_DELAY);
  }

  function nextSlide() {
    slideIndex++;
    showSlide(slideIndex);
    startAuto(); // ⬅ reset timer
  }

  function prevSlide() {
    slideIndex--;
    showSlide(slideIndex);
    startAuto(); // ⬅ reset timer
  }

  const nextBtn = document.querySelector('.next-slide');
  const prevBtn = document.querySelector('.prev-slide');

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      slideIndex = i;
      showSlide(slideIndex);
      startAuto(); // ⬅ reset timer
    })
  );

  // Start slider
  showSlide(slideIndex);
  startAuto();
}
