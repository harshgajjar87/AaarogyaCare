import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
// PatientNavbar removed - already handled in Layout component

const ReportList = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/reports/patient');
      setReports(res.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to fetch reports');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      <div className='container mt-5'>
        <h2>Your Medical Reports</h2>
        <hr />
        {reports.length === 0 ? (
          <p className='text-muted'>No reports found.</p>
        ) : (
          <div className='table-responsive'>
            <table className='table table-bordered table-striped'>
              <thead className='table-dark'>
                <tr>
                  <th>Title</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Report Date</th>
                  <th>Uploaded At</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report._id}>
                    <td>{report.title || 'Untitled'}</td>
                    <td>{report.doctorId?.name || 'N/A'}</td>
                    <td>{report.reason || 'Not provided'}</td>
                    <td>{report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}</td>
                    <td>{new Date(report.uploadedAt).toLocaleDateString()}</td>
                    <td>
                      {report.file ? (
                        <a
                          href={`http://localhost:5000/uploads/${report.file}`}
                          className='btn btn-sm btn-outline-primary'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span className='text-muted'>No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ReportList;
