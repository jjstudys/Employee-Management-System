import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { announcementAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Announcements() {
  const { isHR } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium' });

  const fetch = async () => {
    try {
      const { data } = await announcementAPI.getActive();
      setAnnouncements(data.data);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await announcementAPI.create(form);
      toast.success('Announcement published');
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Announcements</h1>
        {isHR() && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={4} />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Publish</button>
          </form>
        </div>
      )}

      {loading ? <div className="loading">Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map((a) => (
            <div className="card" key={a._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3>{a.title}</h3>
                <span className={`badge badge-${a.priority === 'urgent' ? 'danger' : a.priority === 'high' ? 'warning' : 'info'}`}>{a.priority}</span>
              </div>
              <p style={{ margin: '12px 0', color: 'var(--text-muted)' }}>{a.content}</p>
              <small style={{ color: 'var(--text-muted)' }}>{new Date(a.publishDate).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
