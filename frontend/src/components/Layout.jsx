import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Users, Building2, Clock, CalendarDays,
  DollarSign, Star, FileText, Megaphone, Bell, Shield, FileSpreadsheet, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/profile', icon: User, label: 'Profile', roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/attendance', icon: Clock, label: 'Attendance', roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/leaves', icon: CalendarDays, label: 'Leaves', roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/announcements', icon: Megaphone, label: 'Announcements', roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/employees', icon: Users, label: 'Employees', roles: ['admin'] },
  { to: '/departments', icon: Building2, label: 'Departments', roles: ['admin', 'hr', 'manager'] },
  { to: '/payroll', icon: DollarSign, label: 'Payroll', roles: ['admin', 'hr'] },
  { to: '/performance', icon: Star, label: 'Performance', roles: ['admin', 'hr', 'manager'] },
  { to: '/documents', icon: FileText, label: 'Documents', roles: ['admin', 'hr', 'manager'] },
  { to: '/audit', icon: Shield, label: 'Audit Logs', roles: ['admin', 'hr'] },
  { to: '/reports', icon: FileSpreadsheet, label: 'Reports', roles: ['admin', 'hr'] },
];

export default function Layout() {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="app-layout">
      <aside style={sidebarStyle}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>Employee Management System</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: 4 }}>
            Workforce Management
          </p>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {filteredNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...navLinkStyle,
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>
            {employee ? `${employee.firstName} ${employee.lastName}` : user?.email}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
            {user?.role}
          </div>
          <button onClick={handleLogout} style={logoutBtnStyle}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

const sidebarStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  width: 'var(--sidebar-width)',
  background: '#0f172a',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 100,
};

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  borderRadius: '6px',
  marginBottom: '2px',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s',
  textDecoration: 'none',
};

const logoutBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '12px',
  padding: '8px 12px',
  width: '100%',
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  borderRadius: '6px',
  color: 'rgba(255,255,255,0.8)',
  fontSize: '0.875rem',
};
