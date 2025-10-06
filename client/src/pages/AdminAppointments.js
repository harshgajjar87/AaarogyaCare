import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllAdminAppointments, updateAppointmentStatus, deleteAppointment, exportAppointments } from '../api/adminAppointmentAPI';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await getAllAdminAppointments();
      const appointmentsData = response?.data || response || [];
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      if (response.success) {
        toast.success('Appointment status updated successfully');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const response = await deleteAppointment(appointmentId);
        if (response.success) {
          toast.success('Appointment deleted successfully');
          fetchAppointments();
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment');
      }
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportAppointments();
      // Create a download link for the Excel file
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'appointments_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Appointments exported successfully');
    } catch (error) {
      console.error('Error exporting appointments:', error);
      toast.error('Failed to export appointments');
    }
  };

  const filteredAppointments = (appointments || []).filter(appointment => {
    if (!appointment) return false;
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      appointment.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment._id?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'approved': 'success',
      'rejected': 'danger',
      'pending': 'warning',
      'cancelled-by-patient': 'info'

    };
    return colors[status] || 'secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPatientName = (appointment) => {
    return appointment.patientId?.name || 'Unknown Patient';
  };

  const getDoctorName = (appointment) => {
    return appointment.doctorId?.name || 'Unknown Doctor';
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center loading-state">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4 admin-appointments">
      <div className="row">
        <div className="col-12">
          <div className="card admin-card">
            <div className="card-header bg-primary text-white admin-header">
              <h4 className="mb-0">Manage Appointments</h4>
            </div>
            <div className="card-body admin-body">
              {/* Filters and Search */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by patient, doctor, or appointment ID..."
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

              {/* Statistics */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white dashboard-card">
                    <div className="card-body">
                      <h5>Total Appointments</h5>
                      <h3>{(appointments || []).length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white dashboard-card">
                    <div className="card-body">
                      <h5>Approved</h5>
                      <h3>{(appointments || []).filter(a => a?.status === 'approved').length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-danger text-white dashboard-card">
                    <div className="card-body">
                      <h5>Rejected</h5>
                      <h3>{(appointments || []).filter(a => a?.status === 'rejected').length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-white dashboard-card">
                    <div className="card-body">
                      <h5>Pending</h5>
                      <h3>{(appointments || []).filter(a => a?.status === 'pending').length}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <button
                    className="btn btn-success"
                    onClick={handleExport}
                  >
                    Export to Excel
                  </button>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="table-responsive enhanced-table">
                <table className="table table-hover enhanced-table">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          <div className="empty-state">
                            <i className="fas fa-calendar-times"></i>
                            <h4>No appointments found</h4>
                            <p>Try adjusting your search or filter criteria.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <tr key={appointment._id} className="table-row-hover">
                          <td>{appointment._id.substring(0, 8)}</td>
                          <td>
                            <Link to={`/profile/${appointment.patientId?._id}`} className="text-decoration-none">
                              {getPatientName(appointment)}
                            </Link>
                          </td>
                          <td>
                            <Link to={`/doctor/${appointment.doctorId?._id}`} className="text-decoration-none">
                              {getDoctorName(appointment)}
                            </Link>
                          </td>
                          <td>{formatDate(appointment.date)} at {appointment.time}</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(appointment.status)} status-badge ${appointment.status}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td>{appointment.reason || 'N/A'}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <select
                                className="form-select form-select-sm"
                                value={appointment.status}
                                onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                                style={{ width: 'auto' }}
                              >
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled-by-patient">Cancelled by Patient</option>
                              </select>
                              <button
                                className="btn btn-sm btn-danger ms-1"
                                onClick={() => handleDeleteAppointment(appointment._id)}
                                title="Delete Appointment"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;
