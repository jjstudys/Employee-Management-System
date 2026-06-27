const userRepository = require('../repositories/userRepository');
const employeeRepository = require('../repositories/employeeRepository');
const departmentRepository = require('../repositories/departmentRepository');
const designationRepository = require('../repositories/designationRepository');
const shiftRepository = require('../repositories/shiftRepository');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const {
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require('../utils/tokenStore');
const config = require('../config');
const AppError = require('../utils/AppError');
const { trackActivity } = require('./activityService');
const { sendEmail, emailTemplates } = require('../utils/email');

class AuthService {
  async register(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email already registered', 409);

    const user = await userRepository.create(data);
    await trackActivity(user._id, 'REGISTER', 'User', user._id, 'User registered');

    // Auto-create a minimal Employee profile for users registering as employees.
    if (data.role === 'employee') {
      try {
        // find or create a default department
        const depts = await departmentRepository.find({}, { limit: 1 });
        let dept = depts && depts[0];
        if (!dept) {
          dept = await departmentRepository.create({ name: 'General', code: 'GEN', description: 'Default department' });
        }

        // find or create a default designation in that department
        const desigs = await designationRepository.find({ department: dept._id }, { limit: 1 });
        let desig = desigs && desigs[0];
        if (!desig) {
          desig = await designationRepository.create({ title: 'Employee', code: 'EMP', department: dept._id });
        }

        // find or create a default shift
        const shifts = await shiftRepository.find({}, { limit: 1 });
        let shift = shifts && shifts[0];
        if (!shift) {
          shift = await shiftRepository.create({ name: 'Default Shift', code: 'DEF', startTime: '09:00', endTime: '17:00', breakMinutes: 60, gracePeriodMinutes: 15 });
        }

        const emailPrefix = (user.email || '').split('@')[0] || 'Employee';
        const empData = {
          user: user._id,
          employeeId: data.employeeId || `EMP${Date.now()}`,
          firstName: emailPrefix,
          lastName: 'User',
          email: user.email,
          department: dept._id,
          designation: desig._id,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          status: 'active',
          shift: shift._id,
          salary: { basic: 0, currency: 'USD' },
          lifecycleHistory: [{ status: 'active', changedBy: user._id, notes: 'Auto-created on registration' }],
        };

        await employeeRepository.create(empData);
      } catch (err) {
        // if employee auto-create fails, continue registration but log the issue
        // don't block user registration for backend data issues
        // eslint-disable-next-line no-console
        console.error('Failed to auto-create employee profile:', err.message || err);
      }
    }

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(email, password, ip) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (!user.isActive) throw new AppError('Account is deactivated', 403);

    user.lastLogin = new Date();
    await user.save();

    const employee = await employeeRepository.findByUserId(user._id);
    const tokens = await this.generateTokens(user);

    await trackActivity(user._id, 'LOGIN', 'User', user._id, 'User logged in', { ip });

    return { user, employee, ...tokens };
  }

  async refresh(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const isValid = await validateRefreshToken(decoded.id, refreshToken);
    if (!isValid) throw new AppError('Invalid refresh token', 401);

    const user = await userRepository.findById(decoded.id);
    if (!user || !user.isActive) throw new AppError('User not found', 401);

    await revokeRefreshToken(decoded.id, refreshToken);
    return this.generateTokens(user);
  }

  async logout(userId, refreshToken) {
    if (refreshToken) await revokeRefreshToken(userId, refreshToken);
    await trackActivity(userId, 'LOGOUT', 'User', userId, 'User logged out');
  }

  async changePassword(userId, currentPassword, newPassword) {
    const userDoc = await userRepository.findById(userId);
    const user = await userRepository.findByEmail(userDoc.email);
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    user.refreshTokenVersion += 1;
    await user.save();
    await revokeAllUserTokens(userId);
    await trackActivity(userId, 'CHANGE_PASSWORD', 'User', userId, 'Password changed');
  }

  async generateTokens(user) {
    const payload = { id: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await storeRefreshToken(user._id.toString(), refreshToken, config.jwt.refreshExpiresIn);
    return { accessToken, refreshToken };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    const employee = await employeeRepository.findByUserId(userId);
    return { user, employee };
  }
}

module.exports = new AuthService();
