export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Password should be at least 8 characters
  return password.length >= 8;
};

export const validatePhone = (phone) => {
  // Basic phone validation - customize based on your requirements
  const phoneRegex = /^\+?[0-9\s]{8,}$/;
  return phoneRegex.test(phone);
};