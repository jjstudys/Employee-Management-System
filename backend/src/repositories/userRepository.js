const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email) {
    return User.findOne({ email }).select('+password');
  }
}

module.exports = new UserRepository();
