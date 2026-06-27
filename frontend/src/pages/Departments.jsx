import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { departmentAPI, designationAPI, shiftAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Departments() {
  const { isHR } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDesignationForm, setShowDesignationForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [editingShift, setEditingShift] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [designationForm, setDesignationForm] = useState({ title: '', code: '', department: '', level: 1, minSalary: '', maxSalary: '', description: '' });
  const [shiftForm, setShiftForm] = useState({ name: '', code: '', startTime: '09:00', endTime: '18:00', breakMinutes: 60, gracePeriodMinutes: 15 });

  const fetch = async () => {
    try {
      const [departmentRes, designationRes, shiftRes] = await Promise.all([
        departmentAPI.getAll({ limit: 100 }),
        designationAPI.getAll({ limit: 100 }),
        shiftAPI.getAll({ limit: 100 }),
      ]);
      setDepartments(departmentRes.data.data);
      setDesignations(designationRes.data.data);
      setShifts(shiftRes.data.data);
    } catch {
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await departmentAPI.update(editingDepartment._id, form);
        toast.success('Department updated');
      } else {
        await departmentAPI.create(form);
        toast.success('Department created');
      }
      setShowForm(false);
      setEditingDepartment(null);
      setForm({ name: '', code: '', description: '' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDepartmentEdit = (department) => {
    setEditingDepartment(department);
    setForm({ name: department.name, code: department.code, description: department.description || '', head: department.head?._id || '' });
    setShowForm(true);
  };

  const handleDepartmentDelete = async (department) => {
    if (!window.confirm(`Delete department ${department.name}?`)) return;
    try {
      await departmentAPI.delete(department._id);
      toast.success('Department deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDesignationSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...designationForm,
      level: Number(designationForm.level || 1),
      minSalary: Number(designationForm.minSalary || 0),
      maxSalary: Number(designationForm.maxSalary || 0),
    };
    try {
      if (editingDesignation) {
        await designationAPI.update(editingDesignation._id, payload);
        toast.success('Designation updated');
      } else {
        await designationAPI.create(payload);
        toast.success('Designation created');
      }
      setShowDesignationForm(false);
      setEditingDesignation(null);
      setDesignationForm({ title: '', code: '', department: '', level: 1, minSalary: '', maxSalary: '', description: '' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDesignationEdit = (designation) => {
    setEditingDesignation(designation);
    setDesignationForm({
      title: designation.title,
      code: designation.code,
      department: designation.department?._id || designation.department || '',
      level: designation.level || 1,
      minSalary: designation.minSalary || '',
      maxSalary: designation.maxSalary || '',
      description: designation.description || '',
    });
    setShowDesignationForm(true);
  };

  const handleDesignationDelete = async (designation) => {
    if (!window.confirm(`Delete designation ${designation.title}?`)) return;
    try {
      await designationAPI.delete(designation._id);
      toast.success('Designation deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...shiftForm,
      breakMinutes: Number(shiftForm.breakMinutes || 0),
      gracePeriodMinutes: Number(shiftForm.gracePeriodMinutes || 0),
    };
    try {
      if (editingShift) {
        await shiftAPI.update(editingShift._id, payload);
        toast.success('Shift updated');
      } else {
        await shiftAPI.create(payload);
        toast.success('Shift created');
      }
      setShowShiftForm(false);
      setEditingShift(null);
      setShiftForm({ name: '', code: '', startTime: '09:00', endTime: '18:00', breakMinutes: 60, gracePeriodMinutes: 15 });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleShiftEdit = (shift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      code: shift.code,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakMinutes: shift.breakMinutes || 0,
      gracePeriodMinutes: shift.gracePeriodMinutes || 0,
    });
    setShowShiftForm(true);
  };

  const handleShiftDelete = async (shift) => {
    if (!window.confirm(`Delete shift ${shift.name}?`)) return;
    try {
      await shiftAPI.delete(shift._id);
      toast.success('Shift deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Organization Setup</h1>
        {isHR() && (
          <div className="row-actions">
            <button className="btn btn-primary" onClick={() => { setEditingDepartment(null); setForm({ name: '', code: '', description: '' }); setShowForm(!showForm); }}>
              {showForm ? <X size={16} /> : <Plus size={16} />} Department
            </button>
            <button className="btn btn-secondary" onClick={() => { setEditingDesignation(null); setDesignationForm({ title: '', code: '', department: departments[0]?._id || '', level: 1, minSalary: '', maxSalary: '', description: '' }); setShowDesignationForm(!showDesignationForm); }}>
              {showDesignationForm ? <X size={16} /> : <Plus size={16} />} Designation
            </button>
            <button className="btn btn-secondary" onClick={() => { setEditingShift(null); setShiftForm({ name: '', code: '', startTime: '09:00', endTime: '18:00', breakMinutes: 60, gracePeriodMinutes: 15 }); setShowShiftForm(!showShiftForm); }}>
              {showShiftForm ? <X size={16} /> : <Plus size={16} />} Shift
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleCreate} className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">{editingDepartment ? 'Save Department' : 'Create Department'}</button>
          </form>
        </div>
      )}

      {showDesignationForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleDesignationSubmit} className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input value={designationForm.title} onChange={(e) => setDesignationForm({ ...designationForm, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Code</label>
              <input value={designationForm.code} onChange={(e) => setDesignationForm({ ...designationForm, code: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={designationForm.department} onChange={(e) => setDesignationForm({ ...designationForm, department: e.target.value })} required>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Level</label>
              <input type="number" min="1" value={designationForm.level} onChange={(e) => setDesignationForm({ ...designationForm, level: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Min Salary</label>
              <input type="number" value={designationForm.minSalary} onChange={(e) => setDesignationForm({ ...designationForm, minSalary: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Max Salary</label>
              <input type="number" value={designationForm.maxSalary} onChange={(e) => setDesignationForm({ ...designationForm, maxSalary: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">{editingDesignation ? 'Save Designation' : 'Create Designation'}</button>
          </form>
        </div>
      )}

      {showShiftForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleShiftSubmit} className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input value={shiftForm.name} onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Code</label>
              <input value={shiftForm.code} onChange={(e) => setShiftForm({ ...shiftForm, code: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Break Minutes</label>
              <input type="number" value={shiftForm.breakMinutes} onChange={(e) => setShiftForm({ ...shiftForm, breakMinutes: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Grace Minutes</label>
              <input type="number" value={shiftForm.gracePeriodMinutes} onChange={(e) => setShiftForm({ ...shiftForm, gracePeriodMinutes: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">{editingShift ? 'Save Shift' : 'Create Shift'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Departments</h3>
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Code</th><th>Name</th><th>Description</th><th>Head</th><th>Status</th>{isHR() && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d._id}>
                    <td>{d.code}</td>
                    <td>{d.name}</td>
                    <td>{d.description || '-'}</td>
                    <td>{d.head ? `${d.head.firstName} ${d.head.lastName}` : '-'}</td>
                    <td><span className={`badge ${d.isActive ? 'badge-success' : 'badge-danger'}`}>{d.isActive ? 'Active' : 'Inactive'}</span></td>
                    {isHR() && (
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn" title="Edit" onClick={() => handleDepartmentEdit(d)}><Edit2 size={15} /></button>
                          <button className="icon-btn danger" title="Delete" onClick={() => handleDepartmentDelete(d)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Designations</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Code</th><th>Title</th><th>Department</th><th>Level</th><th>Salary Range</th>{isHR() && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {designations.map((d) => (
                <tr key={d._id}>
                  <td>{d.code}</td>
                  <td>{d.title}</td>
                  <td>{d.department?.name || '-'}</td>
                  <td>{d.level || '-'}</td>
                  <td>{d.minSalary || 0} - {d.maxSalary || 0}</td>
                  {isHR() && (
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Edit" onClick={() => handleDesignationEdit(d)}><Edit2 size={15} /></button>
                        <button className="icon-btn danger" title="Delete" onClick={() => handleDesignationDelete(d)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Shifts</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Code</th><th>Name</th><th>Hours</th><th>Break</th><th>Grace</th><th>Status</th>{isHR() && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s._id}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.startTime} - {s.endTime}</td>
                  <td>{s.breakMinutes} min</td>
                  <td>{s.gracePeriodMinutes} min</td>
                  <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  {isHR() && (
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Edit" onClick={() => handleShiftEdit(s)}><Edit2 size={15} /></button>
                        <button className="icon-btn danger" title="Delete" onClick={() => handleShiftDelete(s)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
