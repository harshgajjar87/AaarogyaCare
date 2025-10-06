import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
// PatientNavbar removed - already handled in Layout component
import { getAppointmentsByPatientId, cancelAppointment } from '../api/appointmentAPI';
import { createOrAccessChat } from '../api/chatAPI';

const MyAppointments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [chatLoading, setChatLoading] = useState(null);

  const fetchAppointments = async () => {
    try {
      console.log("Fetching from:", `/appointments/patient/${user._id}`);
      const appointments = await getAppointmentsByPatientId(user._id);
      setAppointments(appointments);
    } catch (err) {
      console.log(err);
      toast.error('Error fetching appointments');
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleChatWithDoctor = async (appointmentId) => {
    setChatLoading(appointmentId);
    try {
      console.log('Creating/accessing chat for appointment:', appointmentId);
      // Create or access the chat for this appointment
      const chat = await createOrAccessChat(appointmentId);
      console.log('Chat created/accessed:', chat);

      if (!chat || !chat._id) {
        throw new Error('Invalid chat response - missing chat ID');
      }

      // Redirect to the specific chat using React Router
      console.log('Navigating to chat:', `/chats/${chat._id}`);
      navigate(`/chats/${chat._id}`);
    } catch (err) {
      console.error('Error accessing chat:', err);
      toast.error(err.response?.data?.msg || err.message || 'Failed to start chat with doctor');
    } finally {
      setChatLoading(null);
    }
  };

  const isAppointmentTimePassed = (date, time) => {
    const appointmentDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    return new Date() >= appointmentDate;
  };

  useEffect(() => {
    if (user?._id) {
      fetchAppointments();
    }
  }, [user]);

  if (!user) {
    return <div className='container mt-4'>Please log in to view appointments.</div>;
  }

  return (
    <>
      <div className='container mt-4'>
        <div className='welcome-section mb-4'>
          <h3 className='welcome-title'>My Appointments</h3>
        </div>

        <div className='card shadow-sm enhanced-card mb-4'>
          <div className='card-header enhanced-header'>
            <h5 className='mb-0'>Your Appointment History</h5>
          </div>
          <div className='card-body'>
            <div className='table-responsive'>
              <table className='table table-hover enhanced-table'>
                <thead className='table-dark'>
                  <tr>
                    <th><i className="fas fa-calendar me-2"></i>Date</th>
                    <th><i className="fas fa-user-md me-2"></i>Doctor</th>
                    <th><i className="fas fa-info-circle me-2"></i>Status</th>
                    <th><i className="fas fa-cogs me-2"></i>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app._id} className='table-row-hover'>
                      <td className='fw-semibold'>{new Date(app.date).toLocaleDateString()}</td>
                      <td>{app.doctorId?.name || 'N/A'}</td>
                      <td>
                        <span className={`badge ${app.status === 'approved' ? 'bg-success' : app.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {app.status === 'approved' && (
                          <div className='btn-group' role='group'>
                            <button
                              className='btn btn-info btn-sm me-2 enhanced-btn'
                              onClick={() => handleChatWithDoctor(app._id)}
                              disabled={chatLoading === app._id}
                            >
                              {chatLoading === app._id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-comments me-1"></i>
                                  Chat
                                </>
                              )}
                            </button>
                            {!isAppointmentTimePassed(app.date, app.time) && (
                              <button
                                className='btn btn-danger btn-sm enhanced-btn'
                                onClick={() => handleCancel(app._id)}
                              >
                                <i className="fas fa-times me-1"></i>
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {appointments.length === 0 && (
              <div className='text-center py-5'>
                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <h5 className='text-muted'>No Appointments Found</h5>
                <p className='text-muted'>You haven't booked any appointments yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAppointments;
