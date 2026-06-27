const BaseRepository = require('./BaseRepository');
const Designation = require('../models/Designation');

class DesignationRepository extends BaseRepository {
  constructor() {
    super(Designation);
  }
}

module.exports = new DesignationRepository();
