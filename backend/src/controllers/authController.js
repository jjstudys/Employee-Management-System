const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const config = require('../config');

const parseMaxAge = (expiry) => {
  const match = /^(\d+)([smhd])$/.exec(expiry || '');
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const [, num, unit] = match;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(num) * multipliers[unit];
};

const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: parseMaxAge(config.jwt.accessExpiresIn),
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: parseMaxAge(config.jwt.refreshExpiresIn),
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  setAuthCookies(res, result);
  res.status(201).json({ success: true, data: result });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password, req.ip);
  setAuthCookies(res, result);
  res.json({ success: true, data: result });
});

const refresh = catchAsync(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken || req.cookies?.refreshToken);
  setAuthCookies(res, tokens);
  res.json({ success: true, data: tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user._id, req.body.refreshToken || req.cookies?.refreshToken);
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  res.json({ success: true, message: 'Password changed successfully' });
});

const getProfile = catchAsync(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);
  res.json({ success: true, data: profile });
});

module.exports = { register, login, refresh, logout, changePassword, getProfile };
