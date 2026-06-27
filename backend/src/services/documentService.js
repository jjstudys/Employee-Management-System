const documentRepository = require('../repositories/documentRepository');
const employeeRepository = require('../repositories/employeeRepository');
const { paginate, buildSort, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const { trackActivity } = require('./activityService');
const { uploadToCloudinary, deleteFromCloudinary } = require('./uploadService');

class DocumentService {
  async getAll(query, user) {
    const { page, limit, skip } = paginate(query);
    const filter = {};

    if (query.employee) filter.employee = query.employee;
    if (query.category) filter.category = query.category;

    if (user.role === ROLES.EMPLOYEE) {
      const emp = await employeeRepository.findByUserId(user._id);
      if (emp) filter.employee = emp._id;
    }

    const [data, total] = await Promise.all([
      documentRepository.findAll(filter, { skip, limit, sort: buildSort(query.sortBy || 'createdAt', query.order) }),
      documentRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const doc = await documentRepository.findById(id, [
      { path: 'employee', select: 'firstName lastName employeeId' },
    ]);
    if (!doc) throw new AppError('Document not found', 404);
    return doc;
  }

  async upload(employeeId, file, data, uploadedBy) {
    const employee = await employeeRepository.findByIdPopulated(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);

    const { url, publicId } = await uploadToCloudinary(file.buffer, 'documents');

    const doc = await documentRepository.create({
      employee: employeeId,
      title: data.title,
      category: data.category || 'other',
      expiryDate: data.expiryDate,
      notes: data.notes,
      file: {
        url,
        publicId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      uploadedBy,
    });

    await trackActivity(uploadedBy, 'UPLOAD_DOCUMENT', 'Document', doc._id, `Uploaded ${data.title}`);
    return doc;
  }

  async verify(id, verifiedBy) {
    const doc = await this.getById(id);
    doc.isVerified = true;
    doc.verifiedBy = verifiedBy;
    await doc.save();
    await trackActivity(verifiedBy, 'VERIFY_DOCUMENT', 'Document', id, 'Document verified');
    return doc;
  }

  async delete(id, deletedBy) {
    const doc = await this.getById(id);
    await deleteFromCloudinary(doc.file?.publicId);
    await documentRepository.deleteById(id);
    await trackActivity(deletedBy, 'DELETE_DOCUMENT', 'Document', id, 'Document deleted');
  }
}

module.exports = new DocumentService();
