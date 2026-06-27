const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const uploadToCloudinary = (buffer, folder = 'ems') =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      logger.warn('Cloudinary not configured - using placeholder URL');
      return resolve({
        url: `https://placeholder.ems.local/${folder}/${Date.now()}`,
        publicId: `local/${Date.now()}`,
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: `ems/${folder}`, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(new AppError('File upload failed', 500));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('local/')) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.error(`Cloudinary delete failed: ${err.message}`);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
