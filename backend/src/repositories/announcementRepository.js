const BaseRepository = require('./BaseRepository');
const Announcement = require('../models/Announcement');

class AnnouncementRepository extends BaseRepository {
  constructor() {
    super(Announcement);
  }

  findActive() {
    return Announcement.find({
      isActive: true,
      publishDate: { $lte: new Date() },
      $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
    }).populate('publishedBy', 'email').sort({ publishDate: -1 });
  }
}

module.exports = new AnnouncementRepository();
