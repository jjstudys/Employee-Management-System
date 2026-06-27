import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { documentAPI } from '../services/api';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentAPI.getAll({ limit: 20 })
      .then(({ data }) => setDocuments(data.data))
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header"><h1>Documents</h1></div>
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : documents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No documents uploaded yet</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Title</th><th>Employee</th><th>Category</th><th>Verified</th><th>Uploaded</th></tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d._id}>
                    <td><a href={d.file?.url} target="_blank" rel="noreferrer">{d.title}</a></td>
                    <td>{d.employee ? `${d.employee.firstName} ${d.employee.lastName}` : '-'}</td>
                    <td>{d.category}</td>
                    <td><span className={`badge ${d.isVerified ? 'badge-success' : 'badge-warning'}`}>{d.isVerified ? 'Yes' : 'No'}</span></td>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
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
