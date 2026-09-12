/**
 * LocalStorage Safe Abstraction Layer
 */
const StorageManager = {
  PREFIX: 'passport_rush_',

  defaults: {
    theme: 'dark',
    sound: true,
    timerSeconds: 20,
    difficulty: 'normal',
    highScore: 0
  },

  get(key) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item !== null ? JSON.parse(item) : this.defaults[key];
    } catch (e) {
      console.warn('Storage read disabled or failed:', e);
      return this.defaults[key];
    }
  },

  set(key, val) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  }
};