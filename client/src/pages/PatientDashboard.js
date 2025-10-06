import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PatientNavbar from '../components/PaitentNavbar';
import NotificationBell from '../components/NotificationBell';
import DoctorSearchFilter from '../components/DoctorSearchFilter';
import DoctorCard from '../components/DoctorCard';
import { getAllDoctors } from '../api/doctorAPI';


const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hasNew, setHasNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    loadDoctors();
  }, [user, navigate]);

  // Removed duplicate fetchNotifications to rely on NotificationContext

  const loadDoctors = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await getAllDoctors(filters);
      setDoctors(response.doctors);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total
      });
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    loadDoctors(filters);
  };

  // ✅ Early return while loading
  if (!user) return null;

  return (
    <>
      <div className='container mt-5'>
        <div className='welcome-section d-flex justify-content-between align-items-center mb-4'>
          <h2 className='welcome-title'>Welcome, {user.name} 👋</h2>
        </div>



        <DoctorSearchFilter onFilterChange={handleFilterChange} loading={loading} />

        {error && (
          <div className='alert alert-danger'>
            {error}
          </div>
        )}

        {loading ? (
          <div className='text-center'>
            <div className='spinner-border' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className='row'>
              {doctors.length > 0 ? (
                doctors.map(doctor => (
                  <div key={doctor._id} className='col-md-4 col-lg-3 mb-4'>
                    <DoctorCard doctor={doctor} />
                  </div>
                ))
              ) : (
                <div className='col-12 text-center'>
                  <p className='text-muted'>No doctors found matching your criteria.</p>
                </div>
              )}
            </div>

            {pagination.totalPages > 1 && (
              <nav aria-label='Doctor pagination'>
                <ul className='pagination justify-content-center'>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                      <button 
                        className='page-link' 
                        onClick={() => handleFilterChange({ page })}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PatientDashboard;
