// utils.js
export const rootStyles = getComputedStyle(document.documentElement);

export const fbkBlue = rootStyles.getPropertyValue('--fbk-blue').trim() || '#2d64bb';
export const fbkGray = rootStyles.getPropertyValue('--fbk-gray').trim() || '#909090';

/** Safe querySelectorAll helper 
export function $$(selector, ctx = document) {
  return Array.from(ctx.querySelectorAll(selector));
}*/