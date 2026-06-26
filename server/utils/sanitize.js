export const sanitizeString = (value, maxLength = 500) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>]/g, '').slice(0, maxLength);
};

export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

export const sanitizeObject = (obj, maxLength = 500) => {
  if (!obj || typeof obj !== 'object') return {};
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, maxLength);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item, maxLength) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
