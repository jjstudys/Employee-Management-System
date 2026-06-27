import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { socket } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 50 });
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
      toast(notification.title);
    });
    return () => socket.off('notification');
  }, [socket]);

  const markAllRead = async () => {
    await notificationAPI.markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Notifications {unreadCount > 0 && <span className="badge badge-danger">{unreadCount}</span>}</h1>
        {unreadCount > 0 && <button className="btn btn-secondary" onClick={markAllRead}>Mark All Read</button>}
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : notifications.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', opacity: n.isRead ? 0.6 : 1 }}>
              <strong>{n.title}</strong>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0' }}>{n.message}</p>
              <small style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
