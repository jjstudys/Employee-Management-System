const nodemailer = require('nodemailer');
const config = require('./index');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { host, user, pass } = config.smtp;
  const isPlaceholder = [user, pass].some((value) =>
    typeof value === 'string' && /your[-_.]?email|your[-_.]?app[-_.]?password|example/.test(value.toLowerCase())
  );

  if (!host || !user || !pass || isPlaceholder) {
    logger.warn('SMTP not configured or using placeholder credentials - emails will be logged only');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

module.exports = { getTransporter };
