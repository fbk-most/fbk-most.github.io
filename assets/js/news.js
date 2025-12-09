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

  function showSlide(n) {
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    slides.forEach(s => s.style.display = 'none');
    dots.forEach(d => d.classList.remove('active'));

    slides[slideIndex].style.display = 'block';
    dots[slideIndex].classList.add('active');
  }

  function nextSlide() { showSlide(++slideIndex); }
  function prevSlide() { showSlide(--slideIndex); }

  const nextBtn = document.querySelector('.next-slide');
  const prevBtn = document.querySelector('.prev-slide');
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  dots.forEach((dot, i) => dot.addEventListener('click', () => { slideIndex = i; showSlide(slideIndex); }));

  // Auto rotate (pause if user focuses slider area)
  autoTimer = setInterval(nextSlide, 5000);

  // Start
  showSlide(slideIndex);
}
