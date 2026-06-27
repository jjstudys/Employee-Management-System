import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb', '#16a34a', '#ca8a04', '#dc2626', '#8b5cf6'];

export default function Dashboard() {
  const { isManager } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isManager()) {
          const { data } = await dashboardAPI.getAnalytics();
          setAnalytics(data.data);
        } else {
          const { data } = await dashboardAPI.getEmployeeDashboard();
          setEmployeeData(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isManager]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (!isManager() && employeeData) {
    return (
      <div>
        <div className="page-header">
          <h1>My Dashboard</h1>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Annual Leave Balance</div>
            <div className="value">{employeeData.employee.leaveBalance?.annual ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="label">Sick Leave Balance</div>
            <div className="value">{employeeData.employee.leaveBalance?.sick ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="label">Pending Leaves</div>
            <div className="value">{employeeData.pendingLeaves}</div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Attendance This Month</h3>
          {employeeData.attendanceStats?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={employeeData.attendanceStats.map((s) => ({ name: s.status, count: s.count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No attendance data yet</p>
          )}
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Analytics</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Employees</div>
          <div className="value">{overview.totalEmployees || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Active Employees</div>
          <div className="value">{overview.activeEmployees || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Departments</div>
          <div className="value">{overview.departmentCount || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pending Leaves</div>
          <div className="value">{overview.pendingLeaves || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Today's Attendance</div>
          <div className="value">{overview.todayAttendance || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Employees by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics?.employeesByStatus || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(analytics?.employeesByStatus || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Leave by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.leaveByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {analytics?.monthlyPayroll?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Monthly Payroll Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.monthlyPayroll.map((p) => ({ month: `M${p.month}`, total: p.totalNet }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
