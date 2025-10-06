import { useEffect, useState, useContext } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { approveAppointment, rejectAppointment } from '../api/appointmentAPI';

import { AuthContext } from '../context/AuthContext';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchAppointments = async () => {
    try {
      const appointments = await axios.get('/appointments/all');
      setAppointments(appointments.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to fetch appointments');
    }
  };

  const handleStatus = async (id, action) => {
    try {
      if (action === 'approve') {
        await approveAppointment(id);
        toast.success('Appointment approved');
      } else if (action === 'reject') {
        await rejectAppointment(id);
        toast.success('Appointment rejected');
      }
      fetchAppointments(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.msg || `Failed to ${action}`);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (!user) return null;

  return (
    <>
      <div className='container mt-5'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h2>Doctor Dashboard</h2>
          <a href="/chats" className="btn btn-info">Chat with Patients</a>
        </div>
        <hr />
        {appointments.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-times"></i>
            <h4>No appointment requests</h4>
            <p>All caught up! No pending appointments at the moment.</p>
          </div>
        ) : (
          <div className='table-responsive enhanced-table'>
            <table className='table table-bordered enhanced-table'>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app._id} className="table-row-hover">
                    <td>{app.patientId?.name}</td>
                    <td>{app.patientId?.email}</td>
                    <td>{app.patientId?.profile?.phone || 'N/A'}</td>
                    <td>{app.doctorId?.name || 'Not Assigned'}</td>
                    <td>{new Date(app.date).toLocaleDateString()}</td>
                    <td>{app.time}</td>
                    <td>{app.reason}</td>
                    <td>
                      <span
                        className={`badge ${
                          app.status === 'pending'
                            ? 'bg-warning'
                            : app.status === 'approved'
                            ? 'bg-success'
                            : app.status === 'rejected'
                            ? 'bg-danger'
                            : 'bg-secondary'
                        } status-badge ${app.status}`}
                      >
                        {app.status === 'cancelled-by-patient' ? 'Cancelled by Patient' : app.status}
                      </span>
                    </td>
                    <td>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatus(app._id, 'approve')}
                            className='btn btn-sm btn-success me-2'
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatus(app._id, 'reject')}
                            className='btn btn-sm btn-danger'
                          >
                            Reject
                          </button>
                        </>
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

export default DoctorDashboard;
