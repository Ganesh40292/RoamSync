export const helpers = {
  getInitials: (name) => {
    if (!name) return 'TS';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  },

  getRandomColor: () => {
    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  },
};

export default helpers;
