import { initCookies } from './cookies.js';
import { initNews, initSlider } from './news.js';
import { initTextAnimations, initHexagons } from './animations.js';
//import { initPeople } from './people.js';

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initCookies();
  initTextAnimations();
  initNews();
  initSlider();
  initHexagons();
  // initPeople();
});