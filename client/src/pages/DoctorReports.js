import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { FileText, Download, Info } from 'lucide-react';

const DoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/reports/all');
        setReports(res.data);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="text-center p-8">Loading reports...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-health-text-h">Uploaded Medical Reports</h1>
      
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          {reports.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-center">Report</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{r.patientId?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{r.doctorId?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{r.reason || 'N/A'}</td>
                    <td className="px-6 py-4">{r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      {r.file ? (
                        <a href={`http://localhost:5000/uploads/${r.file}`} target="_blank" rel="noopener noreferrer" className="bg-teal-600 text-white px-3 py-1 rounded-full inline-flex items-center gap-1 text-xs">
                          <Download size={14} /> View Report
                        </a>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <Info size={48} className="mx-auto mb-4" />
              <h5 className="font-semibold text-lg">No Reports Found</h5>
              <p>Uploaded reports will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReports;
