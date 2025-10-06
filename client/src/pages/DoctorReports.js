import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
// DoctorNavbar removed - already handled in Layout component

const DoctorReports = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/reports/all'); // ✅ Make sure your backend route exists
      setReports(res.data);
    } catch (err) {
      toast.error('Failed to load reports');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      <div className="container mt-5">
        <h2>Uploaded Medical Reports</h2>

        {reports.length === 0 ? (
          <p className="text-muted mt-4">No reports uploaded yet.</p>
        ) : (
          <table className="table table-bordered table-hover mt-4">
            <thead className="table-dark">
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Doctor Name</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Report File</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>{r.patientId?.name || 'N/A'}</td>
                  <td>{r.patientId?.email || 'N/A'}</td>
                  <td>{r.doctorId?.name || 'N/A'}</td>
                  <td>{r.reason || 'N/A'}</td>
                  <td>
                    {r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    {r.file ? (
                      <a
                        href={`http://localhost:5000/uploads/${r.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Report
                      </a>
                    ) : (
                      <span className="text-muted">No file</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default DoctorReports;
