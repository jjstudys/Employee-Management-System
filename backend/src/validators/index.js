const Joi = require('joi');
const { ROLES, LEAVE_TYPES, EMPLOYEE_STATUSES } = require('../utils/constants');

const pagination = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string(),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().allow(''),
});

const register = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(...Object.values(ROLES)),
  employeeId: Joi.string().when('role', { is: 'employee', then: Joi.string().required(), otherwise: Joi.string().optional() }),
  joiningDate: Joi.date().iso().when('role', { is: 'employee', then: Joi.date().required(), otherwise: Joi.date().optional() }),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

const createEmployee = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  employeeId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string(),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  department: Joi.string().required(),
  designation: Joi.string().required(),
  manager: Joi.string(),
  joiningDate: Joi.date().required(),
  employmentType: Joi.string().valid('full_time', 'part_time', 'contract', 'intern'),
  salary: Joi.object({ basic: Joi.number(), currency: Joi.string() }),
  shift: Joi.string(),
  role: Joi.string().valid(...Object.values(ROLES)),
});

const updateEmployee = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  phone: Joi.string(),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  department: Joi.string(),
  designation: Joi.string(),
  manager: Joi.string().allow(null),
  status: Joi.string().valid(...EMPLOYEE_STATUSES),
  employmentType: Joi.string().valid('full_time', 'part_time', 'contract', 'intern'),
  salary: Joi.object({ basic: Joi.number(), currency: Joi.string() }),
  shift: Joi.string(),
  emergencyContact: Joi.object({
    name: Joi.string(),
    relationship: Joi.string(),
    phone: Joi.string(),
  }),
});

const department = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  description: Joi.string(),
  head: Joi.string(),
  parentDepartment: Joi.string(),
});

const designation = Joi.object({
  title: Joi.string().required(),
  code: Joi.string().required(),
  department: Joi.string().required(),
  level: Joi.number().integer().min(1),
  description: Joi.string(),
  minSalary: Joi.number(),
  maxSalary: Joi.number(),
});

const shift = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  breakMinutes: Joi.number().integer(),
  gracePeriodMinutes: Joi.number().integer(),
  workingDays: Joi.array().items(Joi.number().integer().min(0).max(6)),
});

const checkIn = Joi.object({
  lat: Joi.number(),
  lng: Joi.number(),
});

const checkOut = Joi.object({
  lat: Joi.number(),
  lng: Joi.number(),
});

const leaveRequest = Joi.object({
  leaveType: Joi.string().valid(...LEAVE_TYPES).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  reason: Joi.string().required().min(10),
});

const leaveApproval = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  comments: Joi.string(),
});

const payroll = Joi.object({
  employee: Joi.string().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).required(),
  basicSalary: Joi.number().required(),
  currency: Joi.string().default('INR'),
  allowances: Joi.object({
    housing: Joi.number(),
    transport: Joi.number(),
    medical: Joi.number(),
    other: Joi.number(),
  }),
  deductions: Joi.object({
    tax: Joi.number(),
    insurance: Joi.number(),
    providentFund: Joi.number(),
    other: Joi.number(),
  }),
  overtime: Joi.number(),
  bonus: Joi.number(),
  workingDays: Joi.number(),
  presentDays: Joi.number(),
  notes: Joi.string(),
});

const performanceReview = Joi.object({
  employee: Joi.string().required(),
  reviewPeriod: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }).required(),
  ratings: Joi.object({
    quality: Joi.number().min(1).max(5),
    productivity: Joi.number().min(1).max(5),
    communication: Joi.number().min(1).max(5),
    teamwork: Joi.number().min(1).max(5),
    initiative: Joi.number().min(1).max(5),
  }),
  strengths: Joi.string(),
  areasForImprovement: Joi.string(),
  goals: Joi.array().items(
    Joi.object({
      description: Joi.string(),
      deadline: Joi.date(),
    })
  ),
});

const document = Joi.object({
  title: Joi.string().required(),
  category: Joi.string().valid('identity', 'contract', 'certificate', 'resume', 'other'),
  expiryDate: Joi.date(),
  notes: Joi.string(),
});

const announcement = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  targetAudience: Joi.string().valid('all', 'department', 'role'),
  targetDepartments: Joi.array().items(Joi.string()),
  targetRoles: Joi.array().items(Joi.string()),
  expiryDate: Joi.date(),
});

module.exports = {
  pagination,
  register,
  login,
  refreshToken,
  changePassword,
  createEmployee,
  updateEmployee,
  department,
  designation,
  shift,
  checkIn,
  checkOut,
  leaveRequest,
  leaveApproval,
  payroll,
  performanceReview,
  document,
  announcement,
};
