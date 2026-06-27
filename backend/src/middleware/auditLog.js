const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const auditLog = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode < 400) {
      AuditLog.create({
        user: req.user?._id,
        action,
        resource,
        resourceId: req.params.id || body?.data?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          method: req.method,
          path: req.originalUrl,
          body: sanitizeBody(req.body),
        },
      }).catch((err) => logger.error(`Audit log failed: ${err.message}`));
    }
    return originalJson(body);
  };

  next();
};

const sanitizeBody = (body) => {
  if (!body) return {};
  const sanitized = { ...body };
  ['password', 'currentPassword', 'newPassword'].forEach((key) => {
    if (sanitized[key]) sanitized[key] = '[REDACTED]';
  });
  return sanitized;
};

module.exports = auditLog;
