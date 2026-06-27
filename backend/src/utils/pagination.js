const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildSort = (sortBy = 'createdAt', order = 'desc') => {
  const sortOrder = order === 'asc' ? 1 : -1;
  return { [sortBy]: sortOrder };
};

const buildSearchFilter = (search, fields = []) => {
  if (!search || !fields.length) return {};
  const regex = new RegExp(search, 'i');
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

module.exports = {
  paginate,
  buildSort,
  buildSearchFilter,
  paginatedResponse,
};
