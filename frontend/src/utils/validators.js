export const validators = {
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  isValidPassword: (password) => {
    return password && password.length >= 6;
  },

  isValidPhone: (phone) => {
    const re = /^\+?[0-9]{10,14}$/;
    return re.test(String(phone));
  },
};

export default validators;
