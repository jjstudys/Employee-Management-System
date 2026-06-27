import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { performanceAPI } from '../services/api';

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performanceAPI.getAll({ limit: 20 })
      .then(({ data }) => setReviews(data.data))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header"><h1>Performance Reviews</h1></div>
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Employee</th><th>Reviewer</th><th>Period</th><th>Rating</th><th>Status</th></tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id}>
                    <td>{r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '-'}</td>
                    <td>{r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : '-'}</td>
                    <td>{new Date(r.reviewPeriod?.startDate).toLocaleDateString()} - {new Date(r.reviewPeriod?.endDate).toLocaleDateString()}</td>
                    <td>{r.overallRating ? `${r.overallRating}/5` : '-'}</td>
                    <td><span className="badge badge-info">{r.status}</span></td>
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
