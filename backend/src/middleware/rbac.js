const { hasPermission, ROLES } = require('../utils/constants');
const AppError = require('../utils/AppError');

const authorize = (...permissions) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role === ROLES.ADMIN) return next();

  const allowed = permissions.some((p) => hasPermission(req.user.role, p));
  if (!allowed) {
    return next(new AppError('Insufficient permissions', 403));
  }

  next();
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('Insufficient permissions', 403));
  }

  next();
};

module.exports = { authorize, authorizeRoles };
