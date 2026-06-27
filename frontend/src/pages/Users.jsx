import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { isHR } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', role: 'employee' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll({ limit: 50 });
      setUsers(data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ email: '', password: '', role: 'employee' });
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ email: user.email, password: '', role: user.role });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await userAPI.update(editing._id, { role: form.role });
        toast.success('User updated');
      } else {
        await userAPI.create(form);
        toast.success('User created');
      }
      setShowForm(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeactivate = async (user) => {
    if (!window.confirm(`Deactivate ${user.email}?`)) return;
    try {
      await userAPI.delete(user._id);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>User Management</h1>
        {isHR() && (
          <button className="btn btn-primary" onClick={openCreate}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Close' : 'Add User'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
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
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Update User' : 'Create User'}
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
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Created</th>
                  {isHR() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                    <td>{user.isActive ? 'Yes' : 'No'}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    {isHR() && (
                      <td>
                        <button className="icon-btn" title="Edit" onClick={() => openEdit(user)}>
                          <Edit2 size={15} />
                        </button>
                        <button className="icon-btn danger" title="Deactivate" onClick={() => handleDeactivate(user)}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
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
