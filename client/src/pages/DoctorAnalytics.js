import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../utils/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { LayoutDashboard, Calendar, Users, MessageSquare, Star, User, LogOut, TrendingUp, DollarSign, Clock, Menu, X, BarChart3, Info } from 'lucide-react';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const DoctorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get('/analytics/doctor');
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

  const statusData = {
    labels: Object.keys(analytics.statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      data: Object.values(analytics.statusCounts),
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const peakHoursData = {
    labels: Object.keys(analytics.peakHours).sort((a, b) => a - b).map(h => `${h}:00`),
    datasets: [{
      label: 'Appointments',
      data: Object.keys(analytics.peakHours).sort((a, b) => a - b).map(h => analytics.peakHours[h]),
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2
    }]
  };

  return (
    <div className="flex min-h-screen bg-health-secondary relative">
      <aside className={`${isSidebarOpen ? "w-64" : "w-0"} md:w-64 bg-health-surface shadow-md flex flex-col transition-all duration-300 overflow-hidden absolute md:relative h-full z-10`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute top-4 right-4 p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100 z-20 md:hidden">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-health-text-h">Doctor Panel</h2>
          <p className="text-health-text-p mt-2">Welcome, Dr. {user.name}!</p>
        </div>

        <nav className={`${isSidebarOpen ? "flex" : "hidden md:flex"} flex-1 p-4 space-y-1 flex-col`}>
          <SidebarLink to="/doctor/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" />
          <SidebarLink to="/doctor/appointments" icon={<Calendar size={20} />} text="Appointments" />
          <SidebarLink to="/doctor/analytics" icon={<BarChart3 size={20} />} text="Analytics" />
          <SidebarLink to="/doctor/patients" icon={<Users size={20} />} text="Patients" />
          <SidebarLink to="/chats" icon={<MessageSquare size={20} />} text="Messages" />
          <SidebarLink to="/doctor/reviews" icon={<Star size={20} />} text="Reviews" />
          <SidebarLink to="/profile" icon={<User size={20} />} text="Profile" />
        </nav>

        <div className={`${isSidebarOpen ? "block" : "hidden md:block"} p-6 border-t border-slate-100`}>
          <button onClick={handleLogout} className="w-full bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 lg:p-6">
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Analytics Dashboard</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-health-text-p">Total Appointments</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">{analytics.totalAppointments}</p>
              </div>
              <div className="rounded-full p-2 sm:p-3 bg-teal-100 text-teal-600 flex-shrink-0">
                <Calendar size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-health-text-p">Your Earnings</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">₹{(analytics.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">after platform fee</p>
              </div>
              <div className="rounded-full p-2 sm:p-3 bg-blue-100 text-blue-600 flex-shrink-0">
                <DollarSign size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-health-text-p">Total Patients</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">{analytics.totalPatients}</p>
              </div>
              <div className="rounded-full p-2 sm:p-3 bg-green-100 text-green-600 flex-shrink-0">
                <Users size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-health-text-p">Avg Rating</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">{analytics.avgRating} ⭐</p>
                <p className="text-[10px] sm:text-xs text-health-text-p">{analytics.totalReviews} reviews</p>
              </div>
              <div className="rounded-full p-2 sm:p-3 bg-yellow-100 text-yellow-600 flex-shrink-0">
                <Star size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown Panel */}
        {analytics.totalGrossRevenue > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
            <h2 className="text-sm sm:text-base font-semibold text-blue-800 flex items-center gap-2 mb-3">
              <Info size={16} /> Earnings Breakdown (All Paid Appointments)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-[10px] sm:text-xs text-slate-500">Listed Fee Total</p>
                <p className="text-base sm:text-lg font-bold text-slate-800">₹{(analytics.totalGrossRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-red-100">
                <p className="text-[10px] sm:text-xs text-slate-500">Commission Deducted ({analytics.commissionRate}%)</p>
                <p className="text-base sm:text-lg font-bold text-red-500">−₹{(analytics.totalCommissionDeducted || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-[10px] sm:text-xs text-slate-500">Your Actual Payout</p>
                <p className="text-base sm:text-lg font-bold text-green-600">₹{(analytics.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-100">
                <p className="text-[10px] sm:text-xs text-slate-500">Service Fees (from patients)</p>
                <p className="text-base sm:text-lg font-bold text-slate-600">₹{(analytics.platformServiceFeeCollected || 0).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-blue-600 mt-3">
              Platform deducts {analytics.commissionRate}% commission from your fee. Patients pay your fee + ₹20 platform service fee separately.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <TrendingUp size={16} className="sm:w-5 sm:h-5" /> Monthly Appointments
            </h2>
            <Bar data={monthlyAppointmentsData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <DollarSign size={16} className="sm:w-5 sm:h-5" /> Monthly Revenue
            </h2>
            <Line data={monthlyRevenueData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4">Appointment Status Distribution</h2>
            <div className="flex justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64">
                <Doughnut data={statusData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>
          </div>

          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <Clock size={16} className="sm:w-5 sm:h-5" /> Peak Hours
            </h2>
            <Bar data={peakHoursData} options={{ responsive: true, maintainAspectRatio: true, indexAxis: 'y' }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorAnalytics;
