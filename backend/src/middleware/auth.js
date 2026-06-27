const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const authenticate = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  const decoded = jwt.verify(token, config.jwt.accessSecret);

  const user = await User.findById(decoded.id).select('+passwordChangedAt');
  if (!user || !user.isActive) {
    return next(new AppError('User no longer exists or is inactive', 401));
  }

  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
    return next(new AppError('Password recently changed. Please login again', 401));
  }

  req.user = user;
  next();
});

const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.id);
      if (user?.isActive) req.user = user;
    } catch {
      // ignore invalid token for optional auth
    }
  }

  next();
});

module.exports = { authenticate, optionalAuth };
