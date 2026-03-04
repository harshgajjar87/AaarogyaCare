import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { getTotalPatients, getTotalDoctors, getTotalAppointments, getDoctorsBySpecialization, getAppointmentsByDoctor } from '../api/adminAPI';
import { Users, Stethoscope, Calendar, LayoutDashboard, User, LogOut, BarChart2, Menu, X, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    doctorsBySpecialization: {},
    appointmentsByDoctor: {}
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes, specRes, apptByDocRes] = await Promise.all([
          getTotalPatients(),
          getTotalDoctors(),
          getTotalAppointments(),
          getDoctorsBySpecialization(),
          getAppointmentsByDoctor()
        ]);

        setStats({
          totalPatients: patientsRes.data.count || 0,
          totalDoctors: doctorsRes.data.count || 0,
          totalAppointments: appointmentsRes.data.count || 0,
          doctorsBySpecialization: specRes.data || {},
          appointmentsByDoctor: apptByDocRes.data || {}
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarLink = ({ to, icon, text }) => (
    <Link to={to} className="flex items-center px-4 py-2 text-health-text-p hover:bg-teal-50 hover:text-health-primary transition-colors rounded-lg">
      {icon}
      <span className="ml-3">{text}</span>
    </Link>
  );

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6 flex items-center justify-between cursor-pointer" onClick={onClick}>
      <div>
        <p className="text-xs sm:text-sm text-health-text-p">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">{value}</p>
      </div>
      <div className={`rounded-full p-2 sm:p-3 bg-${color}-100 text-${color}-600 flex-shrink-0`}>
        {icon}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-health-secondary relative">
      <aside className={`${isSidebarOpen ? "w-64" : "w-0"} md:w-64 bg-health-surface shadow-md flex flex-col transition-all duration-300 overflow-hidden absolute md:relative h-full z-10`}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-4 p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100 z-20 md:hidden"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-health-text-h">Admin Panel</h2>
          <p className="text-health-text-p mt-2">Welcome, {user?.name || 'Admin'}!</p>
        </div>

        <nav className={`${isSidebarOpen ? "flex" : "hidden md:flex"} flex-1 p-4 space-y-1 flex-col overflow-y-auto overflow-x-hidden`} style={{ maxHeight: 'calc(100vh - 240px)' }}>
          <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" />
          <SidebarLink to="/admin/analytics" icon={<BarChart3 size={20} />} text="Analytics" />
          <SidebarLink to="/admin/doctors" icon={<Stethoscope size={20} />} text="Doctors" />
          <SidebarLink to="/admin/patients" icon={<Users size={20} />} text="Patients" />
          <SidebarLink to="/admin/appointments" icon={<Calendar size={20} />} text="Appointments" />
        </nav>

        <div className={`${isSidebarOpen ? "block" : "hidden md:block"} p-6 border-t border-slate-100`}>
          <button onClick={handleLogout} className="w-full bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 transition-all duration-300">
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Admin Dashboard</h1>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <StatCard title="Total Patients" value={stats.totalPatients} icon={<Users size={20} className="sm:w-6 sm:h-6" />} color="blue" onClick={() => navigate('/admin/patients')} />
          <StatCard title="Total Doctors" value={stats.totalDoctors} icon={<Stethoscope size={20} className="sm:w-6 sm:h-6" />} color="green" onClick={() => navigate('/admin/doctors')} />
          <StatCard title="Total Appointments" value={stats.totalAppointments} icon={<Calendar size={20} className="sm:w-6 sm:h-6" />} color="purple" onClick={() => navigate('/admin/appointments')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h p-3 sm:p-4 md:p-6 flex items-center gap-2"><BarChart2 size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /> Doctors by Specialization</h2>
            <div className="p-3 sm:p-4 md:p-6 pt-0">
              {Object.keys(stats.doctorsBySpecialization).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(stats.doctorsBySpecialization).map(([specialization, count]) => (
                    <li key={specialization} className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-xs sm:text-sm md:text-base">{specialization}</span>
                      <span className="font-bold text-teal-600 text-xs sm:text-sm md:text-base">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-center py-8 text-health-text-p text-xs sm:text-sm">No data available.</p>}
            </div>
          </div>
          
          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h p-3 sm:p-4 md:p-6 flex items-center gap-2"><BarChart2 size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /> Appointments by Doctor</h2>
            <div className="p-3 sm:p-4 md:p-6 pt-0">
              {Object.keys(stats.appointmentsByDoctor).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(stats.appointmentsByDoctor).map(([doctorName, count]) => (
                    <li key={doctorName} className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-xs sm:text-sm md:text-base">{doctorName}</span>
                      <span className="font-bold text-teal-600 text-xs sm:text-sm md:text-base">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-center py-8 text-health-text-p text-xs sm:text-sm">No data available.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
