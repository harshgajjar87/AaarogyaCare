import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PatientNavbar from '../components/PaitentNavbar';
import NotificationBell from '../components/NotificationBell';
import DoctorSearchFilter from '../components/DoctorSearchFilter';
import DoctorCard from '../components/DoctorCard';
import { getAllDoctors } from '../api/doctorAPI';
import { FaCalendarCheck, FaComments, FaUserMd, FaClipboardList, FaHeartbeat, FaUserInjured } from 'react-icons/fa';
import { getMyAppointments } from '../api/appointmentAPI';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hasNew, setHasNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalDoctors: 0,
    totalChats: 0
  });
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
    loadAppointments();
  }, [user, navigate]);

  // Removed duplicate fetchNotifications to rely on NotificationContext

  const loadDoctors = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await getAllDoctors(filters);
      setDoctors(response.doctors);
      setStats(prev => ({ ...prev, totalDoctors: response.total || 0 }));
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

  const loadAppointments = async () => {
    try {
      const appointmentsData = await getMyAppointments();
      setAppointments(appointmentsData);

      // Calculate stats
      const upcoming = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.date);
        const today = new Date();
        return aptDate >= today;
      }).length;

      setStats(prev => ({
        ...prev,
        totalAppointments: appointmentsData.length,
        upcomingAppointments: upcoming
      }));
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const handleFilterChange = (filters) => {
    loadDoctors(filters);
  };

  // ✅ Early return while loading
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600 mt-2">Welcome, {user.name} 👋</p>
        </div>

        <nav className="mt-6">
          <Link to="/patient/dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors">
            <FaHeartbeat className="mr-3" />
            Dashboard
          </Link>
          <Link to="/patient/appointments" className="flex items-center px-6 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors">
            <FaCalendarCheck className="mr-3" />
            My Appointments
          </Link>
          <Link to="/patient/chat" className="flex items-center px-6 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors">
            <FaComments className="mr-3" />
            Messages
          </Link>
          <Link to="/profile" className="flex items-center px-6 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors">
            <FaUserInjured className="mr-3" />
            My Profile
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
            <NotificationBell />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</p>
                </div>
                <FaCalendarCheck className="text-3xl text-teal-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.upcomingAppointments}</p>
                </div>
                <FaClipboardList className="text-3xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Available Doctors</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalDoctors}</p>
                </div>
                <FaUserMd className="text-3xl text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Chats</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalChats}</p>
                </div>
                <FaComments className="text-3xl text-green-500" />
              </div>
            </div>
          </div>

          {/* Search and Doctors Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Find a Doctor</h2>
            <DoctorSearchFilter onFilterChange={handleFilterChange} loading={loading} />

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                  {doctors.length > 0 ? (
                    doctors.map(doctor => (
                      <div key={doctor._id}>
                        <DoctorCard doctor={doctor} />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500">No doctors found matching your criteria.</p>
                    </div>
                  )}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav aria-label="Doctor pagination">
                      <ul className="flex list-style-none">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                          <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''} mx-1`}>
                            <button
                              className={`page-link relative block py-1.5 px-3 rounded-md border-0 ${
                                page === pagination.currentPage
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
                              } outline-none transition-all duration-300`}
                              onClick={() => handleFilterChange({ page })}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
