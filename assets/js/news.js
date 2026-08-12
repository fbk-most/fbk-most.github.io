export function initNews() {
  const toggles = Array.from(document.querySelectorAll('.past-news-toggle'));
  toggles.forEach(toggle => {
    const list = toggle.nextElementSibling;
    if (!list || !list.classList.contains('past-news-list')) return;

    toggle.addEventListener('click', () => {
      list.classList.toggle('hidden');
      const isHidden = list.classList.contains('hidden');
      toggle.textContent = isHidden ? 'Past news ▼' : 'Past news ▲';
    });
  });
}
