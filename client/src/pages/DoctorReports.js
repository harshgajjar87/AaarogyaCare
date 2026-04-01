import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { FileText, Download, Info } from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUtils';

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
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Uploaded Medical Reports</h1>
      
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          {reports.length > 0 ? (
            <table className="w-full text-xs sm:text-sm text-left text-slate-600">
              <thead className="text-[10px] sm:text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Patient</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Doctor</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Reason</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Date</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Report</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-slate-900 text-[10px] sm:text-xs md:text-sm">{r.patientId?.name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm">{r.doctorId?.name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm">{r.reason || 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm">{r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                      {r.file ? (
                        <a href={getFullImageUrl(`/uploads/${r.file}`)} target="_blank" rel="noopener noreferrer" className="bg-teal-600 text-white px-2 sm:px-3 py-1 rounded-full inline-flex items-center gap-1 text-[10px] sm:text-xs">
                          <Download size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">View Report</span><span className="sm:hidden">View</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px] sm:text-xs">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 sm:py-12 md:py-16 text-slate-500 px-3">
              <Info size={40} className="sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4" />
              <h5 className="font-semibold text-base sm:text-lg">No Reports Found</h5>
              <p className="text-sm sm:text-base">Uploaded reports will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReports;
