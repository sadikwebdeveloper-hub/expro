export const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (res, message = 'Error', statusCode = 400, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: typeof error === 'string' ? error : error?.message || message,
    data: error && typeof error === 'object' && !error.message ? error : null,
  });
};

export const stripPassword = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const stripPasswords = (users = []) => users.map(stripPassword);
