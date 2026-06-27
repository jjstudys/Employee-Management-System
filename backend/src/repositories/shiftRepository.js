const BaseRepository = require('./BaseRepository');
const Shift = require('../models/Shift');

class ShiftRepository extends BaseRepository {
  constructor() {
    super(Shift);
  }
}

module.exports = new ShiftRepository();
