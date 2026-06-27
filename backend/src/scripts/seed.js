require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const { ROLES } = require('../utils/constants');

const seed = async () => {
  await connectDB();

  console.log('Seeding database...');

  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Department.deleteMany({}),
    Designation.deleteMany({}),
    Shift.deleteMany({}),
  ]);

  const admin = await User.create({
    email: 'admin@ems.com',
    password: 'Admin@123456',
    role: ROLES.ADMIN,
    isEmailVerified: true,
  });

  const hrUser = await User.create({
    email: 'hr@ems.com',
    password: 'Hr@123456',
    role: ROLES.HR,
    isEmailVerified: true,
  });

  const managerUser = await User.create({
    email: 'manager@ems.com',
    password: 'Manager@123456',
    role: ROLES.MANAGER,
    isEmailVerified: true,
  });

  const employeeUser = await User.create({
    email: 'employee@ems.com',
    password: 'Employee@123456',
    role: ROLES.EMPLOYEE,
    isEmailVerified: true,
  });

  const engineering = await Department.create({
    name: 'Engineering',
    code: 'ENG',
    description: 'Software Engineering Department',
  });

  const hr = await Department.create({
    name: 'Human Resources',
    code: 'HR',
    description: 'HR Department',
  });

  const seniorDev = await Designation.create({
    title: 'Senior Developer',
    code: 'SDEV',
    department: engineering._id,
    level: 3,
    minSalary: 80000,
    maxSalary: 120000,
  });

  const hrManager = await Designation.create({
    title: 'HR Manager',
    code: 'HRM',
    department: hr._id,
    level: 4,
    minSalary: 70000,
    maxSalary: 100000,
  });

  const morningShift = await Shift.create({
    name: 'Morning Shift',
    code: 'MORN',
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
    gracePeriodMinutes: 15,
  });

  const manager = await Employee.create({
    user: managerUser._id,
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Manager',
    email: 'manager@ems.com',
    department: engineering._id,
    designation: seniorDev._id,
    joiningDate: new Date('2022-01-15'),
    status: 'active',
    salary: { basic: 95000, currency: 'USD' },
    shift: morningShift._id,
    lifecycleHistory: [{ status: 'active', changedBy: admin._id, notes: 'Seed data' }],
  });

  await Employee.create({
    user: hrUser._id,
    employeeId: 'EMP002',
    firstName: 'Sarah',
    lastName: 'HR',
    email: 'hr@ems.com',
    department: hr._id,
    designation: hrManager._id,
    joiningDate: new Date('2021-06-01'),
    status: 'active',
    salary: { basic: 85000, currency: 'USD' },
    shift: morningShift._id,
    lifecycleHistory: [{ status: 'active', changedBy: admin._id, notes: 'Seed data' }],
  });

  await Employee.create({
    user: employeeUser._id,
    employeeId: 'EMP003',
    firstName: 'Jane',
    lastName: 'Developer',
    email: 'employee@ems.com',
    department: engineering._id,
    designation: seniorDev._id,
    manager: manager._id,
    joiningDate: new Date('2023-03-01'),
    status: 'active',
    salary: { basic: 75000, currency: 'USD' },
    shift: morningShift._id,
    lifecycleHistory: [{ status: 'active', changedBy: admin._id, notes: 'Seed data' }],
  });

  await Department.updateOne({ _id: engineering._id }, { head: manager._id });

  console.log('\n✅ Seed completed!\n');
  console.log('Default accounts:');
  console.log('  Admin:    admin@ems.com / Admin@123456');
  console.log('  HR:       hr@ems.com / Hr@123456');
  console.log('  Manager:  manager@ems.com / Manager@123456');
  console.log('  Employee: employee@ems.com / Employee@123456\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
