import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LogIn, LogOut } from 'lucide-react';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetch = async () => {
    try {
      const { data } = await attendanceAPI.getAll({ limit: 20, sortBy: 'date', order: 'desc' });
      setRecords(data.data);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkIn({});
      toast.success('Checked in successfully');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkOut({});
      toast.success('Checked out successfully');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>{isEmployee ? 'My Attendance' : 'Attendance'}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={handleCheckIn} disabled={actionLoading}>
            <LogIn size={16} /> Check In
          </button>
          <button className="btn btn-secondary" onClick={handleCheckOut} disabled={actionLoading}>
            <LogOut size={16} /> Check Out
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {!isEmployee && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    {!isEmployee && <td>{r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '-'}</td>}
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'}</td>
                    <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'}</td>
                    <td>{r.workHours?.toFixed(1) || '0'}</td>
                    <td><span className={`badge badge-${r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'}`}>{r.status}</span></td>
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
