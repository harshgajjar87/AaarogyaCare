import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import AdminNavbar from '../components/AdminNavbar';
import { getTotalPatients, getTotalDoctors, getTotalAppointments, getDoctorsBySpecialization, getAppointmentsByDoctor } from '../api/adminAPI';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    doctorsBySpecialization: {},
    appointmentsByDoctor: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total patients
        const patientsResponse = await getTotalPatients();
        setStats(prev => ({ ...prev, totalPatients: patientsResponse.data.count || 0 }));

        // Fetch total doctors
        const doctorsResponse = await getTotalDoctors();
        setStats(prev => ({ ...prev, totalDoctors: doctorsResponse.data.count || 0 }));

        // Fetch total appointments
        const appointmentsResponse = await getTotalAppointments();
        setStats(prev => ({ ...prev, totalAppointments: appointmentsResponse.data.count || 0 }));

        // Fetch doctors by specialization
        const doctorsBySpecResponse = await getDoctorsBySpecialization();
        setStats(prev => ({ ...prev, doctorsBySpecialization: doctorsBySpecResponse.data || {} }));

        // Fetch appointments by doctor
        const appointmentsByDoctorResponse = await getAppointmentsByDoctor();
        setStats(prev => ({ ...prev, appointmentsByDoctor: appointmentsByDoctorResponse.data || {} }));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className='container mt-5 admin-dashboard'>
        <h2>Admin Dashboard</h2>

        {loading ? (
          <div className='text-center loading-state'>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading dashboard data...</span>
            </div>
          </div>
        ) : (
          <div className='row'>
            {/* Total Patients Card */}
            <div className='col-md-4 mb-4'>
              <div
                className='card bg-primary text-white dashboard-card'
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/admin-patients')}
              >
                <div className='card-body'>
                  <h5 className='card-title'>Total Patients</h5>
                  <h2 className='card-text'>{stats.totalPatients}</h2>
                </div>
              </div>
            </div>

            {/* Total Doctors Card */}
            <div className='col-md-4 mb-4'>
              <div
                className='card bg-success text-white dashboard-card'
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/admin-doctors')}
              >
                <div className='card-body'>
                  <h5 className='card-title'>Total Doctors</h5>
                  <h2 className='card-text'>{stats.totalDoctors}</h2>
                </div>
              </div>
            </div>

            {/* Total Appointments Card */}
            <div className='col-md-4 mb-4'>
              <div
                className='card bg-info text-white dashboard-card'
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/admin-appointments')}
              >
                <div className='card-body'>
                  <h5 className='card-title'>Total Appointments</h5>
                  <h2 className='card-text'>{stats.totalAppointments}</h2>
                </div>
              </div>
            </div>

            {/* Doctors by Specialization */}
            <div className='col-md-6 mb-4'>
              <div className='card stats-card'>
                <div className='card-header bg-secondary text-white stats-header'>
                  <h5 className='card-title mb-0'>Doctors by Specialization</h5>
                </div>
                <div className='card-body stats-body'>
                  {Object.keys(stats.doctorsBySpecialization).length > 0 ? (
                    <ul className='list-group list-group-flush stats-list'>
                      {Object.entries(stats.doctorsBySpecialization).map(([specialization, count]) => (
                        <li key={specialization} className='list-group-item d-flex justify-content-between align-items-center stats-item'>
                          {specialization}
                          <span className='badge bg-primary rounded-pill stats-badge'>{count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-chart-bar"></i>
                      <h4>No data available</h4>
                      <p>Data will appear here once doctors are registered.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appointments by Doctor */}
            <div className='col-md-6 mb-4'>
              <div className='card stats-card'>
                <div className='card-header bg-secondary text-white stats-header'>
                  <h5 className='card-title mb-0'>Appointments by Doctor</h5>
                </div>
                <div className='card-body stats-body'>
                  {Object.keys(stats.appointmentsByDoctor).length > 0 ? (
                    <ul className='list-group list-group-flush stats-list'>
                      {Object.entries(stats.appointmentsByDoctor).map(([doctorName, count]) => (
                        <li key={doctorName} className='list-group-item d-flex justify-content-between align-items-center stats-item'>
                          {doctorName}
                          <span className='badge bg-info rounded-pill stats-badge'>{count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-calendar-check"></i>
                      <h4>No data available</h4>
                      <p>Data will appear here once appointments are booked.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
