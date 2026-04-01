import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllAdminAppointments, updateAppointmentStatus, deleteAppointment, exportAppointments } from '../api/adminAppointmentAPI';
import { Trash2, Download, Search, ArrowLeft } from 'lucide-react';

const AdminAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      console.log('Fetching appointments...');
      const response = await getAllAdminAppointments();
      console.log('Response received:', response);
      const appointmentsData = response?.data || response || [];
      console.log('Appointments data:', appointmentsData);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.msg || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      toast.success('Appointment status updated successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(appointmentId);
        toast.success('Appointment deleted successfully');
        fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment');
      }
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportAppointments();
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
      (appointment.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment._id?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusClass = (status) => {
    const statusClasses = {
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled-by-patient': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'paid': 'bg-purple-100 text-purple-800',
      'completed': 'bg-teal-100 text-teal-800',
      'visited': 'bg-indigo-100 text-indigo-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };
  
  const StatCard = ({ title, value, color }) => (
    <div className={`bg-health-surface rounded-xl shadow-sm border-l-4 border-${color}-500 p-3 sm:p-4 md:p-6`}>
      <h5 className="text-health-text-p text-xs sm:text-sm">{title}</h5>
      <p className="text-health-text-h text-lg sm:text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Manage Appointments</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard title="Total Appointments" value={appointments.length} color="teal" />
        <StatCard title="Pending" value={appointments.filter(a => a?.status === 'pending').length} color="yellow" />
        <StatCard title="Rejected" value={appointments.filter(a => a?.status === 'rejected' || a?.status === 'cancelled-by-patient').length} color="red" />
        <StatCard title="Completed" value={appointments.filter(a => a?.status === 'completed').length} color="teal" />
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between gap-3 sm:gap-4 mb-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-500"
              placeholder="Search by patient, doctor, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 sm:gap-4">
            <select
              className="flex-1 md:flex-none md:w-auto border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-500 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled-by-patient">Cancelled by Patient</option>
              <option value="cancelled">Cancelled</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="visited">Visited</option>
            </select>
            <button
              className="bg-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              onClick={handleExport}
            >
              <Download size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px] sm:text-xs md:text-sm text-left text-health-text-p">
            <thead className="text-[9px] sm:text-xs text-health-text-p uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Patient</th>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Doctor</th>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Date & Time</th>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Status</th>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? filteredAppointments.map((appointment) => (
                <tr key={appointment._id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 font-medium text-health-text-h">{appointment.patientId?.name || 'N/A'}</td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{appointment.doctorId?.name || 'N/A'}</td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold leading-tight rounded-full text-[9px] sm:text-xs ${getStatusClass(appointment.status)}`}>
                      {appointment.status.replace('-by-patient', '')}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-center">
                    <select
                      className="border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-500 px-1.5 sm:px-2 py-0.5 sm:py-1 mr-1 sm:mr-2 text-[9px] sm:text-xs"
                      value={appointment.status}
                      onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled-by-patient">Cancelled by Patient</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="paid">Paid</option>
                      <option value="completed">Completed</option>
                      <option value="visited">Visited</option>
                    </select>
                    <button
                      className="p-1 sm:p-2 text-red-500 hover:bg-red-100 rounded-full"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      title="Delete Appointment"
                    >
                      <Trash2 size={12} className="sm:w-4 sm:h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 sm:py-12 text-health-text-p text-xs sm:text-sm">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;
