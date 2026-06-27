const mongoose = require('mongoose');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, populate = []) {
    let query = this.model.findById(id);
    populate.forEach((p) => { query = query.populate(p); });
    return query;
  }

  async findOne(filter, populate = []) {
    let query = this.model.findOne(filter);
    populate.forEach((p) => { query = query.populate(p); });
    return query;
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = { createdAt: -1 }, populate = [] } = options;
    let query = this.model.find(filter).skip(skip).limit(limit).sort(sort);
    populate.forEach((p) => { query = query.populate(p); });
    return query;
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async updateById(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;
