import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p className="page-subtitle">View your employee details and account information.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <div className="card profile-card">
        <div className="profile-grid">
          <div>
            <h3>Account</h3>
            <p><strong>Email:</strong> {user?.email || '-'}</p>
            <p><strong>Role:</strong> {user?.role || '-'}</p>
            <p><strong>Status:</strong> {employee?.status || '-'}</p>
          </div>
          <div>
            <h3>Employee</h3>
            <p><strong>ID:</strong> {employee?.employeeId || '-'}</p>
            <p><strong>Name:</strong> {employee ? `${employee.firstName} ${employee.lastName}` : '-'}</p>
            <p><strong>Department:</strong> {employee?.department?.name || '-'}</p>
            <p><strong>Designation:</strong> {employee?.designation?.title || '-'}</p>
            <p><strong>Joining Date:</strong> {employee?.joiningDate ? employee.joiningDate.slice(0, 10) : '-'}</p>
          </div>
          <div>
            <h3>Work Details</h3>
            <p><strong>Shift:</strong> {employee?.shift?.name || 'Not assigned'}</p>
            <p><strong>Employment Type:</strong> {employee?.employmentType?.replace('_', ' ') || '-'}</p>
            <p><strong>Salary:</strong> {employee?.salary ? `${employee.salary.currency} ${employee.salary.basic}` : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
