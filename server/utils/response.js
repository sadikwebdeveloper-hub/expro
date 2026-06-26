export const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (res, message = 'Error', statusCode = 400, data = null) => {
  return res.status(statusCode).json({ success: false, message, data });
};

export const stripPassword = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const stripPasswords = (users = []) => users.map(stripPassword);
