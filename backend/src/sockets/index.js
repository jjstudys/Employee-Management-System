const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { setSocketIO } = require('../services/notificationService');
const logger = require('../utils/logger');

const readCookie = (header, name) => {
  if (!header) return null;
  const pair = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
};

const initializeSocket = (io) => {
  setSocketIO(io);

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        readCookie(socket.handshake.headers?.cookie, 'accessToken');
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.id);
      if (!user?.isActive) return next(new Error('Invalid user'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const room = `user:${socket.user._id}`;
    socket.join(room);
    logger.debug(`Socket connected: ${socket.user.email}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.user.email}`);
    });
  });
};

module.exports = { initializeSocket };
