const announcementRepository = require('../repositories/announcementRepository');
const userRepository = require('../repositories/userRepository');
const employeeRepository = require('../repositories/employeeRepository');
const { paginate, buildSort, buildSearchFilter, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { trackActivity } = require('./activityService');
const { createNotification } = require('./notificationService');
const { sendEmail, emailTemplates } = require('../utils/email');

class AnnouncementService {
  async getAll(query) {
    const { page, limit, skip } = paginate(query);
    const filter = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    Object.assign(filter, buildSearchFilter(query.search, ['title', 'content']));

    const [data, total] = await Promise.all([
      announcementRepository.find(filter, {
        skip, limit,
        sort: buildSort(query.sortBy || 'publishDate', query.order),
        populate: [{ path: 'publishedBy', select: 'email role' }],
      }),
      announcementRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getActive(user) {
    const announcements = await announcementRepository.findActive();
    const employee = user ? await employeeRepository.findByUserId(user._id) : null;

    return announcements.filter((a) => {
      if (a.targetAudience === 'all') return true;
      if (a.targetAudience === 'role' && a.targetRoles.includes(user?.role)) return true;
      if (a.targetAudience === 'department' && employee) {
        return a.targetDepartments.some(
          (d) => d.toString() === (employee.department._id || employee.department).toString()
        );
      }
      return false;
    });
  }

  async create(data, publishedBy) {
    const announcement = await announcementRepository.create({ ...data, publishedBy });

    const users = await userRepository.find({ isActive: true }, { limit: 500 });
    for (const u of users) {
      await createNotification(u._id, {
        title: `Announcement: ${data.title}`,
        message: data.content.substring(0, 100),
        type: 'announcement',
        link: `/announcements/${announcement._id}`,
      });
      await sendEmail({ to: u.email, ...emailTemplates.announcement(data.title, data.content) });
    }

    await trackActivity(publishedBy, 'CREATE_ANNOUNCEMENT', 'Announcement', announcement._id, data.title);
    return announcement;
  }

  async update(id, data, userId) {
    await announcementRepository.findById(id);
    const updated = await announcementRepository.updateById(id, data);
    await trackActivity(userId, 'UPDATE_ANNOUNCEMENT', 'Announcement', id, 'Updated announcement');
    return updated;
  }

  async delete(id, userId) {
    await announcementRepository.updateById(id, { isActive: false });
    await trackActivity(userId, 'DELETE_ANNOUNCEMENT', 'Announcement', id, 'Deactivated announcement');
  }
}

module.exports = new AnnouncementService();
