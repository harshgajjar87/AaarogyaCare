import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getDoctorAppointments, exportDoctorAppointments } from '../api/appointmentAPI'; // Ensure export function is imported
import { createOrAccessChat } from '../api/chatAPI';

const DoctorAppointments = () => {
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const appointments = await getDoctorAppointments();
      setAppointments(appointments);
      
      // Calculate appointment statistics
      setTotalAppointments(appointments.length);
      setApprovedCount(appointments.filter(a => a.status === 'approved').length);
      setRejectedCount(appointments.filter(a => a.status === 'rejected').length);
      setPendingCount(appointments.filter(a => a.status === 'pending').length);
    } catch (err) {
      toast.error('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithPatient = async (appointmentId) => {
    try {
      console.log('Creating/accessing chat for appointment:', appointmentId);
      const chat = await createOrAccessChat(appointmentId);
      console.log('Chat created/accessed:', chat);

      if (!chat || !chat._id) {
        throw new Error('Invalid chat response - missing chat ID');
      }

      // Redirect to the specific chat using React Router
      console.log('Navigating to chat:', `/chats/${chat._id}`);
      window.location.href = `/chats/${chat._id}`;
    } catch (err) {
      console.error('Error accessing chat:', err);
      toast.error(err.response?.data?.msg || err.message || 'Failed to start chat with patient');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      a.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientId?.profile?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Appointments</h2>
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by patient name, email, or appointment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
            <option value="cancelled-by-patient">Cancelled by Patient</option>
          </select>
        </div>
        <div className="col-md-3">
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setFilterStatus('all');
              setSearchTerm('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5>Total Appointments</h5>
              <h3>{totalAppointments}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5>Approved</h5>
              <h3>{approvedCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5>Rejected</h5>
              <h3>{rejectedCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5>Pending</h5>
              <h3>{pendingCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <button 
            className="btn btn-primary"
            onClick={exportDoctorAppointments} // Call the export function
          >
            Export to Excel
          </button>
        </div>
      </div>
      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-times"></i>
          <h4>No appointments found</h4>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="table-responsive enhanced-table">
          <table className="table table-bordered enhanced-table">
            <thead className="table-dark">
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Chat</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(a => (
                <tr key={a._id} className="table-row-hover">
                  <td>{a.patientId?.name || 'N/A'}</td>
                  <td>{a.patientId?.email || 'N/A'}</td>
                  <td>{a.patientId?.profile?.phone || 'N/A'}</td>
                  <td>{a.doctorId?.name || 'Not Assigned'}</td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.time}</td>
                  <td>{a.reason || 'N/A'}</td>
                  <td>
                    <span className={`badge ${
                      a.status === 'approved' ? 'bg-success' :
                      a.status === 'rejected' ? 'bg-danger' :
                      a.status === 'pending' ? 'bg-warning' :
                      'bg-secondary'
                    } status-badge ${a.status}`}>
                      {a.status === 'cancelled-by-patient' ? 'Cancelled by Patient' : a.status}
                    </span>
                  </td>
                  <td>
                    {a.status === 'approved' && (
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleChatWithPatient(a._id)}
                      >
                        Chat with Patient
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
