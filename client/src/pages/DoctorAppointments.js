import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getDoctorAppointments, exportDoctorAppointments } from '../api/appointmentAPI';
import { createOrAccessChat } from '../api/chatAPI';
import { Search, Download, MessageSquare, ArrowLeft } from 'lucide-react';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    try {
      const data = await getDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithPatient = async (appointmentId) => {
    try {
      const chat = await createOrAccessChat(appointmentId);
      if (!chat?._id) throw new Error('Invalid chat response');
      window.location.href = `/chats/${chat._id}`;
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to start chat');
    }
  };

  const filteredAppointments = appointments.filter(a => 
    (filterStatus === 'all' || a.status === filterStatus) &&
    (searchTerm === '' || 
      a.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a._id?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const StatCard = ({ title, value, color }) => (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 border-${color}-500 p-6`}>
      <h5 className="text-slate-500 text-sm">{title}</h5>
      <p className="text-slate-900 text-3xl font-bold">{value}</p>
    </div>
  );
  
  const getStatusClass = (status) => ({
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'cancelled-by-patient': 'bg-blue-100 text-blue-800'
  }[status] || 'bg-gray-100 text-gray-800');

  if (loading) return <div className="text-center p-8">Loading appointments...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">Appointments</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total" value={appointments.length} color="teal" />
        <StatCard title="Approved" value={appointments.filter(a => a.status === 'approved').length} color="green" />
        <StatCard title="Rejected" value={appointments.filter(a => a.status === 'rejected').length} color="red" />
        <StatCard title="Pending" value={appointments.filter(a => a.status === 'pending').length} color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full"
              placeholder="Search by patient name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full md:w-auto border border-slate-300 rounded-full px-4 py-2">
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
              <option value="cancelled-by-patient">Cancelled</option>
            </select>
            <button onClick={exportDoctorAppointments} className="bg-teal-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Date & Time</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(a => (
                <tr key={a._id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{a.patientId?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{new Date(a.date).toLocaleDateString()} at {a.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusClass(a.status)}`}>
                      {a.status.replace('-by-patient', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {a.status === 'approved' && (
                      <button onClick={() => handleChatWithPatient(a._id)} className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                        <MessageSquare size={14} /> Chat
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && <p className="text-center py-8">No appointments found.</p>}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
