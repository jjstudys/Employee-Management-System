const BaseRepository = require('./BaseRepository');
const Activity = require('../models/Activity');

class ActivityRepository extends BaseRepository {
  constructor() {
    super(Activity);
  }

  findAll(filter, options) {
    return this.find(filter, {
      ...options,
      populate: [{ path: 'user', select: 'email role' }],
    });
  }
}

module.exports = new ActivityRepository();
