import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { employeeAPI, departmentAPI, designationAPI, shiftAPI } from '../services/api';

const statusBadge = (status) => {
  const map = {
    active: 'badge-success',
    onboarding: 'badge-info',
    on_leave: 'badge-warning',
    terminated: 'badge-danger',
    resigned: 'badge-danger',
  };
  return map[status] || 'badge-info';
};

export default function Employees() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    employeeId: '',
    firstName: '',
    lastName: '',
    department: '',
    designation: '',
    joiningDate: '',
    role: 'employee',
    status: 'onboarding',
    employmentType: 'full_time',
    shift: '',
    salary: { basic: '', currency: 'USD' },
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await employeeAPI.getAll({ page, limit: 10, search });
      setEmployees(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [deptRes, desigRes, shiftRes] = await Promise.all([
        departmentAPI.getAll({ limit: 100 }),
        designationAPI.getAll({ limit: 100 }),
        shiftAPI.getAll({ limit: 100 }),
      ]);
      setDepartments(deptRes.data.data);
      setDesignations(desigRes.data.data);
      setShifts(shiftRes.data.data);
    } catch {
      toast.error('Failed to load form options');
    }
  };

  useEffect(() => { fetchEmployees(); }, [page, search]);
  useEffect(() => { fetchOptions(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      email: '',
      password: '',
      employeeId: '',
      firstName: '',
      lastName: '',
      department: departments[0]?._id || '',
      designation: designations[0]?._id || '',
      joiningDate: '',
      role: 'employee',
      status: 'onboarding',
      employmentType: 'full_time',
      shift: shifts[0]?._id || '',
      salary: { basic: '', currency: 'USD' },
    });
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (employee) => {
    setEditing(employee);
    setForm({
      email: employee.email || '',
      password: '',
      employeeId: employee.employeeId || '',
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      department: employee.department?._id || employee.department || '',
      designation: employee.designation?._id || employee.designation || '',
      joiningDate: employee.joiningDate?.slice(0, 10) || '',
      role: employee.user?.role || 'employee',
      status: employee.status || 'active',
      employmentType: employee.employmentType || 'full_time',
      shift: employee.shift?._id || employee.shift || '',
      salary: {
        basic: employee.salary?.basic || '',
        currency: employee.salary?.currency || 'USD',
      },
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: form.email,
        employeeId: form.employeeId,
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department,
        designation: form.designation,
        joiningDate: form.joiningDate,
        status: form.status.toLowerCase(),
        employmentType: form.employmentType.toLowerCase(),
        salary: { basic: Number(form.salary.basic || 0), currency: form.salary.currency },
        shift: form.shift,
        role: form.role.toLowerCase(),
      };

      if (!editing) {
        payload.password = form.password;
        await employeeAPI.create(payload);
        toast.success('Employee created');
      } else {
        await employeeAPI.update(editing._id, payload);
        toast.success('Employee updated');
      }

      setShowForm(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Terminate ${employee.firstName} ${employee.lastName}?`)) return;
    try {
      await employeeAPI.delete(employee._id);
      toast.success('Employee terminated');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate employee');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
        <h1>Employee Management</h1>
        {isAdmin() && (
          <button className="btn btn-primary" onClick={startCreate}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Close Form' : 'Add Employee'}
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>{editing ? 'Edit Employee' : 'New Employee'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={Boolean(editing)}
              />
            </div>
            {!editing && (
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Joining Date</label>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <select
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                required
              >
                <option value="">Select designation</option>
                {designations.map((d) => (
                  <option key={d._id} value={d._id}>{d.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Shift</label>
              <select
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
              >
                <option value="">Select shift</option>
                {shifts.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
              >
                <option value="onboarding">Onboarding</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
                <option value="resigned">Resigned</option>
              </select>
            </div>
            <div className="form-group">
              <label>Employment Type</label>
              <select
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                required
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div className="form-group">
              <label>Basic Salary</label>
              <input
                type="number"
                value={form.salary.basic}
                onChange={(e) => setForm({ ...form, salary: { ...form.salary, basic: e.target.value } })}
                required
              />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <input
                type="text"
                value={form.salary.currency}
                onChange={(e) => setForm({ ...form, salary: { ...form.salary, currency: e.target.value } })}
                required
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary" style={{ minWidth: 140 }}>
                {editing ? 'Save Changes' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Joined</th>
                  {isAdmin() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.employeeId}</td>
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department?.name || 'N/A'}</td>
                    <td>{employee.designation?.title || 'N/A'}</td>
                    <td><span className={`badge ${statusBadge(employee.status)}`}>{employee.status}</span></td>
                    <td>{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</td>
                    {isAdmin() && (
                      <td>
                        <button className="icon-btn" title="Edit" onClick={() => startEdit(employee)}>
                          <Edit2 size={15} />
                        </button>
                        <button className="icon-btn danger" title="Terminate" onClick={() => handleDelete(employee)}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-secondary" disabled={!pagination.hasPrev} onClick={() => setPage(page - 1)}>Prev</button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button className="btn btn-secondary" disabled={!pagination.hasNext} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
