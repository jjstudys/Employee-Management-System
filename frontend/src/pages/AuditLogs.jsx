import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { auditAPI } from '../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditAPI.getLogs({ limit: 50 })
      .then(({ data }) => setLogs(data.data))
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header"><h1>Audit Logs</h1></div>
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>User</th><th>Action</th><th>Resource</th><th>IP</th><th>Timestamp</th></tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id}>
                    <td>{l.user?.email || 'System'}</td>
                    <td><span className="badge badge-info">{l.action}</span></td>
                    <td>{l.resource}</td>
                    <td>{l.ipAddress || '-'}</td>
                    <td>{new Date(l.createdAt).toLocaleString()}</td>
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
