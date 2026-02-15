import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import DoctorSearchFilter from '../components/DoctorSearchFilter';
import DoctorCard from '../components/DoctorCard';
import axios from '../utils/axios';
import { getAllDoctors } from '../api/doctorAPI';
import { getMyAppointments } from '../api/appointmentAPI';
import { LayoutDashboard, CalendarCheck, MessageSquare, User, LogOut, Briefcase, Users, FileText, Brain, Book, Bell, Menu, X, Activity, CreditCard, Pill, Stethoscope, Phone } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import AITriageChat from '../components/AITriageChat';
import AIVoiceCall from '../components/AIVoiceCall';
import { getProfileImageUrl } from '../utils/imageUtils';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalDoctors: 0,
    totalReports: 0,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [showAIChat, setShowAIChat] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/profile/me');
        if (data.profileImage) {
          setProfileImage(getProfileImageUrl(data.profileImage));
        }
      } catch (error){
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();
    loadDoctors();
    loadAppointments();
    loadReports();
  }, [user, navigate]);

  const loadDoctors = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await getAllDoctors(filters);
      setDoctors(response.doctors);
      setStats(prev => ({ ...prev, totalDoctors: response.total || 0 }));
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total,
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = appointmentsData.filter(apt => new Date(apt.date) >= today).length;

      setStats(prev => ({
        ...prev,
        totalAppointments: appointmentsData.length,
        upcomingAppointments: upcoming,
      }));
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const loadReports = async () => {
    try {
      const res = await axios.get('/reports/patient');
      setStats(prev => ({
        ...prev,
        totalReports: res.data.length,
      }));
    } catch (err) {
      console.error('Error loading reports count:', err);
    }
  };

  const handleFilterChange = (filters) => {
    loadDoctors(filters);
  };

  if (!user) return null;

  const SidebarLink = ({ to, icon, text }) => (
    <Link to={to} className="flex items-center px-6 py-3 text-health-text-p hover:bg-teal-50 hover:text-health-primary transition-colors rounded-lg">
      {icon}
      <span className="ml-3">{text}</span>
    </Link>
  );

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-health-text-p">{title}</p>
        <p className="text-2xl font-bold text-health-text-h">{value}</p>
      </div>
      <div className={`rounded-full p-3 bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-health-secondary relative">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-0"} md:w-64 bg-health-surface shadow-md flex flex-col transition-all duration-300 overflow-hidden absolute md:relative h-full z-10`}>
        {/* <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-4 p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100 z-20 md:hidden"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button> */}
        <div className="p-6 border-b border-slate-100 text-center relative">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden absolute top-4 right-4 p-1 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100 z-20"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-2xl font-bold text-health-text-h mb-4">Dashboard</h2>
          <img
            src={profileImage || '/images/default-avtar.jpg'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-teal-100"
          />
          <p className="text-health-text-p mt-4 font-semibold">Welcome, {user.name} 👋</p>
        </div>

        <nav className={`${isSidebarOpen ? "flex" : "hidden md:flex"} flex-1 p-4 space-y-2 flex-col`}>
          <SidebarLink to="/patient/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" />
          <SidebarLink to="/patient/appointments" icon={<Book size={20} />} text="Book Appointment" />
          <SidebarLink to="/patient/my-appointments" icon={<CalendarCheck size={20} />} text="My Appointments" />
          <SidebarLink to="/patient/payments" icon={<CreditCard size={20} />} text="Payment History" />
          <SidebarLink to="/patient/prescriptions" icon={<Pill size={20} />} text="My Prescriptions" />
          <SidebarLink to="/patient/reports" icon={<FileText size={20} />} text="Medical Reports" />
          <SidebarLink to="/chats" icon={<MessageSquare size={20} />} text="Messages" />
          <SidebarLink to="/notifications" icon={<Bell size={20} />} text="Notifications" />
          <SidebarLink to="/profile" icon={<User size={20} />} text="My Profile" />
        </nav>

        <div className={`${isSidebarOpen ? "block" : "hidden md:block"} p-6 border-t border-slate-100`}>
          <button
            onClick={handleLogout}
            className="w-full bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
<main className="flex-1 overflow-auto p-4 lg:p-6 transition-all duration-300">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-3xl font-bold text-health-text-h">Patient Dashboard</h1>
          </div>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Appointments" value={stats.totalAppointments} icon={<Briefcase size={24} />} color="teal" />
            <StatCard title="Upcoming" value={stats.upcomingAppointments} icon={<CalendarCheck size={24} />} color="blue" />
            <StatCard title="Available Doctors" value={stats.totalDoctors} icon={<Users size={24} />} color="purple" />
            <StatCard title="Medical Reports" value={stats.totalReports} icon={<FileText size={24} />} color="green" />
        </div>

        {/* Search and Doctors Section */}
        <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-health-text-h mb-4">Find a Doctor</h2>
          <DoctorSearchFilter onFilterChange={handleFilterChange} loading={loading} />

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mt-6">
                {doctors.length > 0 ? (
                  doctors.map(doctor => (
                    <div key={doctor._id}>
                      <DoctorCard doctor={doctor} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-health-text-p">
                    <p>No doctors found matching your criteria.</p>
                  </div>
                )}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <nav aria-label="Doctor pagination">
                        <ul className="flex list-none">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                          <li key={page} className="mx-1">
                            <button
                              className={`py-2 px-4 rounded-full border ${
                                page === pagination.currentPage
                                  ? 'bg-teal-600 text-white border-teal-600'
                                  : 'bg-white text-gray-700 border-slate-300 hover:bg-slate-100'
                              } transition-all`}
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
        <Link
          to="/health-risk"
          className="fixed bottom-6 left-6 z-40 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 font-semibold transition-transform duration-200 hover:scale-105"
        >
          <Brain size={20} />
          <span>Predict your health</span>
        </Link>
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 font-semibold transition-transform duration-200 hover:scale-105"
        >
          <Stethoscope size={20} />
          <span>Chat with AI Doctor</span>
        </button>
        <button
          onClick={() => setShowVoiceCall(true)}
          className="fixed bottom-20 right-6 z-40 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 font-semibold transition-transform duration-200 hover:scale-105"
        >
          <Phone size={20} />
          <span>Voice Call with AI Doctor</span>
        </button>
        <ChatBot />
        <AITriageChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
        <AIVoiceCall isOpen={showVoiceCall} onClose={() => setShowVoiceCall(false)} />
      </main>
    </div>
  );
};

export default PatientDashboard;
