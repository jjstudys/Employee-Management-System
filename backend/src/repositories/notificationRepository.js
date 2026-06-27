const BaseRepository = require('./BaseRepository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  markAsRead(id, userId) {
    return Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  markAllAsRead(userId) {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  getUnreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }
}

module.exports = new NotificationRepository();
