/**
 * Shared String & Math Utilities
 */
const Utils = {
  /**
   * Normalizes country input string:
   * Strips extra whitespace, trims, lowercases, removes diacritics.
   */
  normalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Returns a random integer between min and max inclusive
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Capitalizes each word in a string
   */
  capitalize(str) {
    if (!str) return '';
    return str
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  },

  /**
   * Simple screen shake trigger
   */
  shake(element, durationMs = 300) {
    if (!element) return;
    element.classList.add('shake-screen');
    setTimeout(() => {
      element.classList.remove('shake-screen');
    }, durationMs);
  }
};