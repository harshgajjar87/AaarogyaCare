import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../utils/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { LayoutDashboard, Calendar, Users, Stethoscope, LogOut, TrendingUp, DollarSign, Menu, X, BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get('/analytics/admin');
        setAnalytics(data);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const monthlyAppointmentsData = {
    labels: Object.keys(analytics.monthlyAppointments),
    datasets: [{
      label: 'Appointments',
      data: Object.values(analytics.monthlyAppointments),
      backgroundColor: 'rgba(20, 184, 166, 0.5)',
      borderColor: 'rgba(20, 184, 166, 1)',
      borderWidth: 2
    }]
  };

  const monthlyRevenueData = {
    labels: Object.keys(analytics.monthlyRevenue),
    datasets: [{
      label: 'Revenue (₹)',
      data: Object.values(analytics.monthlyRevenue),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  const specializationData = {
    labels: Object.keys(analytics.specializationCounts),
    datasets: [{
      data: Object.values(analytics.specializationCounts),
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const statusData = {
    labels: Object.keys(analytics.statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      data: Object.values(analytics.statusCounts),
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const topDoctorsData = {
    labels: Object.keys(analytics.topDoctors),
    datasets: [{
      label: 'Appointments',
      data: Object.values(analytics.topDoctors),
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2
    }]
  };

  const userGrowthData = {
    labels: Object.keys(analytics.userGrowth),
    datasets: [
      {
        label: 'Doctors',
        data: Object.values(analytics.userGrowth).map(d => d.doctors),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      },
      {
        label: 'Patients',
        data: Object.values(analytics.userGrowth).map(d => d.patients),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="flex min-h-screen bg-health-secondary relative">
      <aside className={`${isSidebarOpen ? "w-64" : "w-0"} md:w-64 bg-health-surface shadow-md flex flex-col transition-all duration-300 overflow-hidden absolute md:relative h-full z-10`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute top-4 right-4 p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100 z-20 md:hidden">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-health-text-h">Admin Panel</h2>
          <p className="text-health-text-p mt-2">Welcome, {user?.name || 'Admin'}!</p>
        </div>

        <nav className={`${isSidebarOpen ? "flex" : "hidden md:flex"} flex-1 p-4 space-y-1 flex-col`}>
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

      <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Analytics Dashboard</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-health-text-p">Total Appointments</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-health-text-h">{analytics.totalAppointments}</p>
              </div>
              <div className="rounded-full p-2 sm:p-3 bg-teal-100 text-teal-600 flex-shrink-0">
                <Calendar size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-health-text-p">Total Revenue</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-health-text-h">₹{analytics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-full p-2 sm:p-3 bg-blue-100 text-blue-600 flex-shrink-0">
                <DollarSign size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-health-text-p">Total Doctors</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-health-text-h">{analytics.totalDoctors}</p>
              </div>
              <div className="rounded-full p-2 sm:p-3 bg-green-100 text-green-600 flex-shrink-0">
                <Stethoscope size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-health-text-p">Total Patients</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-health-text-h">{analytics.totalPatients}</p>
              </div>
              <div className="rounded-full p-2 sm:p-3 bg-purple-100 text-purple-600 flex-shrink-0">
                <Users size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="sm:w-5 sm:h-5" /> Monthly Appointments
            </h2>
            <div className="h-48 sm:h-64">
              <Bar data={monthlyAppointmentsData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4 flex items-center gap-2">
              <DollarSign size={16} className="sm:w-5 sm:h-5" /> Monthly Revenue
            </h2>
            <div className="h-48 sm:h-64">
              <Line data={monthlyRevenueData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4">User Growth</h2>
            <div className="h-48 sm:h-64">
              <Line data={userGrowthData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4">Top Doctors by Appointments</h2>
            <div className="h-48 sm:h-64">
              <Bar data={topDoctorsData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4">Doctors by Specialization</h2>
            <div className="flex justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64">
                <Pie data={specializationData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>
          </div>

          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4">Appointment Status Distribution</h2>
            <div className="flex justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64">
                <Doughnut data={statusData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
