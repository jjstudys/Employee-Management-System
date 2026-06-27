const activityRepository = require('../repositories/activityRepository');

const trackActivity = async (userId, action, entity, entityId, description, metadata = {}) => {
  return activityRepository.create({
    user: userId,
    action,
    entity,
    entityId,
    description,
    metadata,
  });
};

module.exports = { trackActivity };
