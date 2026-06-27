import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { reportAPI } from '../services/api';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function Reports() {
  const handleExport = async (type, format = 'excel') => {
    try {
      let response;
      const filename = `${type}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

      switch (type) {
        case 'employees':
          response = await reportAPI.exportEmployees(format);
          break;
        case 'attendance':
          response = await reportAPI.exportAttendance({ format });
          break;
        case 'leaves':
          response = await reportAPI.exportLeaves({ format });
          break;
        default:
          return;
      }

      downloadBlob(response.data, filename);
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const reports = [
    { type: 'employees', label: 'Employee Report', description: 'All employee records' },
    { type: 'attendance', label: 'Attendance Report', description: 'Attendance records' },
    { type: 'leaves', label: 'Leave Report', description: 'Leave requests and status' },
  ];

  return (
    <div>
      <div className="page-header"><h1>Export Reports</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {reports.map(({ type, label, description }) => (
          <div className="card" key={type}>
            <h3>{label}</h3>
            <p style={{ color: 'var(--text-muted)', margin: '8px 0 16px', fontSize: '0.875rem' }}>{description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => handleExport(type, 'excel')}>
                <Download size={16} /> Excel
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport(type, 'pdf')}>
                <Download size={16} /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
