import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { payrollAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value, currency = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value || 0);
  } catch {
    return `${currency} ${Number(value || 0).toLocaleString()}`;
  }
};

export default function Payroll() {
  const { isHR } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await payrollAPI.getAll({ limit: 20 });
      setRecords(data.data);
    } catch {
      toast.error('Failed to load payroll');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleGenerate = async () => {
    const now = new Date();
    try {
      const { data } = await payrollAPI.generateBulk({ month: now.getMonth() + 1, year: now.getFullYear() });
      toast.success(`Generated ${data.data.generated} payroll records`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleProcess = async (id) => {
    try {
      await payrollAPI.process(id);
      toast.success('Payroll processed');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handlePay = async (id) => {
    try {
      await payrollAPI.markPaid(id);
      toast.success('Marked as paid');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Payroll</h1>
        {isHR() && (
          <button className="btn btn-primary" onClick={handleGenerate}>Generate Monthly Payroll</button>
        )}
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Employee</th><th>Period</th><th>Basic</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {records.map((p) => (
                  <tr key={p._id}>
                    <td>{p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : '-'}</td>
                    <td>{p.month}/{p.year}</td>
                    <td>{formatCurrency(p.basicSalary, p.currency)}</td>
                    <td>{formatCurrency(p.netSalary, p.currency)}</td>
                    <td><span className={`badge badge-${p.status === 'paid' ? 'success' : p.status === 'processed' ? 'info' : 'warning'}`}>{p.status}</span></td>
                    <td>
                      {isHR() && p.status === 'draft' && (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', marginRight: 4 }} onClick={() => handleProcess(p._id)}>Process</button>
                      )}
                      {isHR() && p.status === 'processed' && (
                        <button className="btn btn-primary" style={{ padding: '4px 8px' }} onClick={() => handlePay(p._id)}>Mark Paid</button>
                      )}
                    </td>
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
