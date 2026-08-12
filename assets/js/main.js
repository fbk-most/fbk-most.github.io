import { initCookies } from './cookies.js';
import { initNews } from './news.js';
import { initNavDrawer } from './nav-drawer.js';

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initCookies();
  initNavDrawer();
  initNews();
});