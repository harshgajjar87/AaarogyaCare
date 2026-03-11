import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Download, Info, ArrowLeft } from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUtils';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/reports/patient');
        setReports(res.data);
      } catch (err) {
        toast.error(err.response?.data?.msg || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Your Medical Reports</h1>
      </div>
      
      <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          {reports.length > 0 ? (
            <table className="w-full text-xs sm:text-sm text-left text-health-text-p">
              <thead className="text-[10px] sm:text-xs text-health-text-p uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Title</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Doctor</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Reason</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Report Date</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Uploaded At</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Download</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-health-text-h text-[10px] sm:text-xs md:text-sm">{report.title || 'Untitled'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm">{report.doctorId?.name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm">{report.reason || 'Not provided'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm">{report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm">{new Date(report.uploadedAt).toLocaleDateString()}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                      {report.file ? (
                        <a
                          href={getFullImageUrl(`/uploads/${report.file}`)}
                          className="bg-teal-600 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full hover:bg-teal-700 transition-all font-medium inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span>PDF</span>
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
            <div className="text-center py-8 sm:py-12 md:py-16 text-health-text-p px-3">
              <Info size={32} className="sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4 text-slate-400" />
              <h5 className="font-semibold text-sm sm:text-base">No Reports Found</h5>
              <p className="text-xs sm:text-sm">Your uploaded medical reports will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportList;
