import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Bell, Briefcase, CheckCircle2, DollarSign, Sparkles, TrendingUp, Users } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb', '#16a34a', '#0ea5e9', '#f59e0b', '#8b5cf6'];
const statusColors = { active: '#16a34a', pending: '#f59e0b', inactive: '#94a3b8' };

const actionItems = [
  { label: 'Add Employee', Icon: Users, route: '/employees' },
  { label: 'Approve Leave', Icon: CheckCircle2, route: '/leaves' },
  { label: 'Run Payroll', Icon: DollarSign, route: '/payroll' },
  { label: 'New Announcement', Icon: Sparkles, route: '/announcements' },
];

const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(value);

export default function Dashboard() {
  const navigate = useNavigate();
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
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Personal Overview</p>
            <h1>My Dashboard</h1>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="card-icon secondary"><Briefcase /></div>
            <span className="kpi-label">Annual Leave</span>
            <span className="kpi-value">{employeeData.employee.leaveBalance?.annual ?? 0}</span>
          </div>
          <div className="kpi-card">
            <div className="card-icon secondary"><CheckCircle2 /></div>
            <span className="kpi-label">Sick Leave</span>
            <span className="kpi-value">{employeeData.employee.leaveBalance?.sick ?? 0}</span>
          </div>
          <div className="kpi-card">
            <div className="card-icon secondary"><Bell /></div>
            <span className="kpi-label">Pending Leaves</span>
            <span className="kpi-value">{employeeData.pendingLeaves}</span>
          </div>
        </div>

        <div className="section-grid">
          <div className="card">
            <div className="panel-header">
              <div>
                <h2>Attendance This Month</h2>
                <p className="panel-subtitle">Track your recent status</p>
              </div>
            </div>
            {employeeData.attendanceStats?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={employeeData.attendanceStats.map((s) => ({ name: s.status, count: s.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No attendance data available yet.</p>
            )}
          </div>
          <div className="card notifications-panel">
            <div className="panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p className="panel-subtitle">Actions you can take now</p>
              </div>
            </div>
            <div className="quick-actions">
              {actionItems.map(({ label, Icon, route }) => (
                <button key={label} type="button" className="action-button" onClick={() => navigate(route)}>
                  <span className="action-icon"><Icon /></span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const attendanceRate = overview.totalEmployees ? Math.round((overview.todayAttendance / overview.totalEmployees) * 100) : 0;
  const payrollTotal = analytics?.monthlyPayroll?.reduce((sum, item) => sum + (item.totalNet || 0), 0) ?? 0;
  const activityItems = analytics?.recentActivity || [];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Executive overview</p>
          <h1>Main Dashboard</h1>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="card-icon primary"><Users /></div>
          <span className="kpi-label">Total Employees</span>
          <span className="kpi-value">{overview.totalEmployees || 0}</span>
        </div>
        <div className="kpi-card">
          <div className="card-icon accent"><TrendingUp /></div>
          <span className="kpi-label">Attendance Rate</span>
          <span className="kpi-value">{attendanceRate}%</span>
        </div>
        <div className="kpi-card">
          <div className="card-icon success"><Briefcase /></div>
          <span className="kpi-label">Active Employees</span>
          <span className="kpi-value">{overview.activeEmployees || 0}</span>
        </div>
        <div className="kpi-card">
          <div className="card-icon warning"><Bell /></div>
          <span className="kpi-label">Pending Leave Requests</span>
          <span className="kpi-value">{overview.pendingLeaves || 0}</span>
        </div>
        <div className="kpi-card">
          <div className="card-icon violet"><DollarSign /></div>
          <span className="kpi-label">Payroll Summary</span>
          <span className="kpi-value">{formatCurrency(payrollTotal)}</span>
        </div>
      </div>

      <div className="section-grid">
        <div className="card">
          <div className="panel-header">
            <div>
              <h2>Attendance & Payroll Trends</h2>
              <p className="panel-subtitle">Interactive charts for performance at a glance</p>
            </div>
          </div>
          <div className="analytics-charts">
            <div className="chart-panel">
              <h3>Employees by Status</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={analytics?.employeesByStatus || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
                    {(analytics?.employeesByStatus || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-panel">
              <h3>Monthly Payroll</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.monthlyPayroll.map((p) => ({ month: `M${p.month}`, total: p.totalNet }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card notifications-panel">
          <div className="panel-header">
            <div>
              <h2>Notifications</h2>
              <p className="panel-subtitle">Recent system updates and alerts</p>
            </div>
            <span className="badge badge-info">{activityItems.length} new</span>
          </div>
          <ul className="notification-list">
            {activityItems.slice(0, 5).map((item) => (
              <li key={item._id || item.id} className="notification-item">
                <span className="notification-dot" style={{ background: statusColors[item.status?.toLowerCase()] || '#2563eb' }} />
                <div>
                  <p className="notification-title">{item.action || item.type || 'System update'}</p>
                  <p className="notification-text">{item.description || item.message || `Updated by ${item.user?.email || 'system'}`}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="section-grid">
        <div className="card recent-activity-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Activities</h2>
              <p className="panel-subtitle">Latest events from the last 10 actions</p>
            </div>
          </div>
          <ul className="activity-list">
            {activityItems.slice(0, 6).map((item) => (
              <li key={item._id || item.id} className="activity-item">
                <div className="activity-icon"><Sparkles /></div>
                <div>
                  <span className="activity-title">{item.action || item.type || 'Activity recorded'}</span>
                  <p className="activity-meta">{item.user?.email || item.user?.role || 'System'} • {new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card quick-actions-card">
          <div className="panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p className="panel-subtitle">Navigate the most common workflows</p>
            </div>
          </div>
          <div className="quick-actions">
            {actionItems.map(({ label, Icon, route }) => (
              <button key={label} type="button" className="action-button" onClick={() => navigate(route)}>
                <span className="action-icon"><Icon /></span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
