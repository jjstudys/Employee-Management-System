const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  // Employee lifecycle
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_EMPLOYEES: 'view_employees',
  // Department & designation
  MANAGE_DEPARTMENTS: 'manage_departments',
  VIEW_DEPARTMENTS: 'view_departments',
  // Attendance
  MANAGE_ATTENDANCE: 'manage_attendance',
  VIEW_ATTENDANCE: 'view_attendance',
  // Leave
  MANAGE_LEAVE: 'manage_leave',
  APPROVE_LEAVE: 'approve_leave',
  VIEW_LEAVE: 'view_leave',
  // Payroll
  MANAGE_PAYROLL: 'manage_payroll',
  VIEW_PAYROLL: 'view_payroll',
  // Performance
  MANAGE_PERFORMANCE: 'manage_performance',
  VIEW_PERFORMANCE: 'view_performance',
  // Documents
  MANAGE_DOCUMENTS: 'manage_documents',
  VIEW_DOCUMENTS: 'view_documents',
  // Notifications
  MANAGE_ANNOUNCEMENTS: 'manage_announcements',
  // Audit
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  // Dashboard
  VIEW_ANALYTICS: 'view_analytics',
  // Reports
  EXPORT_REPORTS: 'export_reports',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.HR]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.MANAGE_DEPARTMENTS,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MANAGE_LEAVE,
    PERMISSIONS.APPROVE_LEAVE,
    PERMISSIONS.VIEW_LEAVE,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.MANAGE_PERFORMANCE,
    PERMISSIONS.VIEW_PERFORMANCE,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.MANAGE_ANNOUNCEMENTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_REPORTS,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.APPROVE_LEAVE,
    PERMISSIONS.VIEW_LEAVE,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.MANAGE_PERFORMANCE,
    PERMISSIONS.VIEW_PERFORMANCE,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_LEAVE,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.VIEW_PERFORMANCE,
    PERMISSIONS.VIEW_DOCUMENTS,
  ],
};

const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

const EMPLOYEE_STATUSES = ['active', 'onboarding', 'on_leave', 'terminated', 'resigned'];
const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];
const LEAVE_TYPES = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid'];
const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday'];
const PAYROLL_STATUSES = ['draft', 'processed', 'paid', 'cancelled'];
const REVIEW_STATUSES = ['draft', 'submitted', 'acknowledged', 'completed'];

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  EMPLOYEE_STATUSES,
  LEAVE_STATUSES,
  LEAVE_TYPES,
  ATTENDANCE_STATUSES,
  PAYROLL_STATUSES,
  REVIEW_STATUSES,
};
