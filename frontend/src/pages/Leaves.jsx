import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Check, X } from 'lucide-react';
import { leaveAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leaves() {
  const { isManager } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });

  const fetch = async () => {
    try {
      const { data } = await leaveAPI.getAll({ limit: 20 });
      setLeaves(data.data);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.create(form);
      toast.success('Leave request submitted');
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await leaveAPI.approve(id, { status, comments: '' });
      toast.success(`Leave ${status}`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Leave Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Request Leave
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Leave Type</label>
              <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Reason</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required rows={3} />
            </div>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td>{l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : '-'}</td>
                    <td>{l.leaveType}</td>
                    <td>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                    <td>{l.totalDays}</td>
                    <td><span className={`badge badge-${l.status === 'approved' ? 'success' : l.status === 'pending' ? 'warning' : 'danger'}`}>{l.status}</span></td>
                    <td>
                      {isManager() && l.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-primary" style={{ padding: '4px 8px' }} onClick={() => handleApprove(l._id, 'approved')}><Check size={14} /></button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleApprove(l._id, 'rejected')}><X size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
