const notificationRepository = require('../repositories/notificationRepository');

let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const createNotification = async (recipientId, { title, message, type = 'info', link, metadata }) => {
  const notification = await notificationRepository.create({
    recipient: recipientId,
    title,
    message,
    type,
    link,
    metadata,
  });

  if (ioInstance) {
    ioInstance.to(`user:${recipientId}`).emit('notification', notification);
  }

  return notification;
};

const getNotifications = async (userId, query) => {
  const { paginate, buildSort, paginatedResponse } = require('../utils/pagination');
  const { page, limit, skip } = paginate(query);
  const filter = { recipient: userId };
  if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';

  const [data, total, unreadCount] = await Promise.all([
    notificationRepository.find(filter, { skip, limit, sort: buildSort(query.sortBy, query.order) }),
    notificationRepository.count(filter),
    notificationRepository.getUnreadCount(userId),
  ]);

  return { ...paginatedResponse(data, total, page, limit), unreadCount };
};

module.exports = {
  setSocketIO,
  createNotification,
  getNotifications,
};
