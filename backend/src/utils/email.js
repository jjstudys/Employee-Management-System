const { getTransporter } = require('../config/mailer');
const config = require('../config');
const logger = require('./logger');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();

  if (!transporter) {
    logger.info(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return { messageId: 'mock-' + Date.now() };
  }

  const info = await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });

  logger.info(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to EMS',
    html: `<h2>Welcome, ${name}!</h2><p>Your account has been created successfully.</p>`,
  }),
  leaveRequest: (employeeName, leaveType, dates) => ({
    subject: 'New Leave Request',
    html: `<p><strong>${employeeName}</strong> has submitted a ${leaveType} leave request for ${dates}.</p>`,
  }),
  leaveApproved: (leaveType, dates) => ({
    subject: 'Leave Request Approved',
    html: `<p>Your ${leaveType} leave request for ${dates} has been approved.</p>`,
  }),
  leaveRejected: (leaveType, dates, reason) => ({
    subject: 'Leave Request Rejected',
    html: `<p>Your ${leaveType} leave request for ${dates} was rejected.${reason ? ` Reason: ${reason}` : ''}</p>`,
  }),
  passwordReset: (resetLink) => ({
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  }),
  announcement: (title, content) => ({
    subject: `Announcement: ${title}`,
    html: `<h3>${title}</h3><p>${content}</p>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
