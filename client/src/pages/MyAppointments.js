import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getAppointmentsByPatientId, cancelAppointment } from '../api/appointmentAPI';
import { createOrAccessChat } from '../api/chatAPI';
import { Calendar, Stethoscope, MessageSquare, X, Loader2, Info, ArrowLeft } from 'lucide-react';

const MyAppointments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [chatLoading, setChatLoading] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsData = await getAppointmentsByPatientId(user._id);
      setAppointments(appointmentsData);
    } catch (err) {
      toast.error('Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(id);
        toast.success('Appointment cancelled');
        fetchAppointments();
      } catch (err) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleChatWithDoctor = async (appointmentId) => {
    setChatLoading(appointmentId);
    try {
      const chat = await createOrAccessChat(appointmentId);
      if (!chat || !chat._id) throw new Error('Invalid chat response');
      navigate(`/chats/${chat._id}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || 'Failed to start chat with doctor');
    } finally {
      setChatLoading(null);
    }
  };

  const isAppointmentTimePassed = (date, time) => {
    const appointmentDate = new Date(`${date.slice(0, 10)}T${time}`);
    return new Date() >= appointmentDate;
  };
  
  const getStatusClass = (status) => {
    const statusClasses = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center p-8">Please log in to view your appointments.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">My Appointments</h1>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-health-text-h">Your Appointment History</h2>
        </div>
        <div className="overflow-x-auto">
          {appointments.length > 0 ? (
            <table className="w-full text-sm text-left text-health-text-p">
              <thead className="text-xs text-health-text-p uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Doctor</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-health-text-h flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(app.date).toLocaleDateString()} at {app.time}</span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Stethoscope size={16} />
                      <span>{app.doctorId?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {app.status === 'approved' && (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleChatWithDoctor(app._id)} disabled={chatLoading === app._id} className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-2 text-xs">
                            {chatLoading === app._id ? <Loader2 className="animate-spin" size={14} /> : <MessageSquare size={14} />}
                            <span>Chat</span>
                          </button>
                          {!isAppointmentTimePassed(app.date, app.time) && (
                            <button onClick={() => handleCancel(app._id)} className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all font-medium flex items-center gap-2 text-xs">
                              <X size={14} />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-health-text-p">
              <Info size={40} className="mx-auto mb-4 text-slate-400" />
              <h5 className="font-semibold">No Appointments Found</h5>
              <p>You haven't booked any appointments yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
