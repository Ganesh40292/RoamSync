export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined' || item === 'null') {
        localStorage.removeItem(key);
        return null;
      }
      return JSON.parse(item);
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },

  set: (key, value) => {
    try {
      if (value === undefined || value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.error('Error writing localStorage key', key, e);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing localStorage key', key, e);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
  },
};

export default storage;
