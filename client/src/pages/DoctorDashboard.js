import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { getDoctorAppointments, approveAppointment, rejectAppointment } from '../api/appointmentAPI';
import { getDoctorPatients } from '../api/doctorAPI';
import axios from '../utils/axios';
import { LayoutDashboard, Calendar, Users, MessageSquare, Star, User, LogOut, Check, X, Menu, CreditCard, BarChart3 } from 'lucide-react';
import NotificationSoundTest from '../components/NotificationSoundTest';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    todaysAppointments: 0,
    totalPatients: 0,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        getDoctorAppointments(),
        getDoctorPatients()
      ]);
      
      setAppointments(appointmentsData);

      const today = new Date().toISOString().slice(0, 10);
      const pending = appointmentsData.filter(a => a.status === 'pending' && (!a.paymentInfo || a.paymentInfo.status !== 'completed')).length;
      const todays = appointmentsData.filter(a => a.date.slice(0, 10) === today).length;
      
      setStats({
        pendingAppointments: pending,
        todaysAppointments: todays,
        totalPatients: patientsData.length,
      });

    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to fetch dashboard data');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePatientVisited = async (appointmentId) => {
    try {
      await axios.put(`/prescriptions/visit/${appointmentId}`);
      toast.success('Patient marked as visited');
      navigate(`/doctor/prescription/${appointmentId}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to mark patient as visited');
    }
  };

  const handleStatus = async (id, action) => {
    try {
      if (action === 'approve') {
        await approveAppointment(id);
        toast.success('Appointment approved');
      } else if (action === 'reject') {
        await rejectAppointment(id);
        toast.success('Appointment rejected');
      }
      fetchDashboardData(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.msg || `Failed to ${action}`);
    }
  };

  if (!user) return null;

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
  
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6 flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm text-health-text-p">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">{value}</p>
      </div>
      <div className={`rounded-full p-2 sm:p-3 bg-${color}-100 text-${color}-600 flex-shrink-0`}>
        {icon}
      </div>
    </div>
  );

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
          <h2 className="text-2xl font-bold text-health-text-h">Doctor Panel</h2>
          <p className="text-health-text-p mt-2">Welcome, {user.name}!</p>
        </div>

        <nav className={`${isSidebarOpen ? "flex" : "hidden md:flex"} flex-1 p-4 space-y-1 flex-col overflow-y-auto overflow-x-hidden`} style={{ maxHeight: 'calc(100vh - 240px)' }}>
          <SidebarLink to="/doctor/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" />
          <SidebarLink to="/doctor/appointments" icon={<Calendar size={20} />} text="Appointments" />
          <SidebarLink to="/doctor/analytics" icon={<BarChart3 size={20} />} text="Analytics" />
          <SidebarLink to="/doctor/payments" icon={<CreditCard size={20} />} text="Payments" />
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

      <main className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 lg:p-6 transition-all duration-300">
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-md text-slate-500 hover:text-health-primary hover:bg-slate-100"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Dashboard</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <StatCard title="Pending Appointments" value={stats.pendingAppointments} icon={<Calendar size={20} className="sm:w-6 sm:h-6" />} color="yellow" />
          <StatCard title="Today's Appointments" value={stats.todaysAppointments} icon={<Calendar size={20} className="sm:w-6 sm:h-6" />} color="blue" />
          <StatCard title="Total Patients" value={stats.totalPatients} icon={<Users size={20} className="sm:w-6 sm:h-6" />} color="green" />
        </div>

        {/* Recent Appointments — last 4 days */}
        {(() => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 4);
          cutoff.setHours(0, 0, 0, 0);
          const recent = appointments
            .filter(a => new Date(a.date) >= cutoff)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

          const statusBadge = (status) => {
            const map = {
              approved:  'bg-green-100 text-green-700',
              pending:   'bg-yellow-100 text-yellow-700',
              completed: 'bg-blue-100 text-blue-700',
              rejected:  'bg-red-100 text-red-700',
              cancelled: 'bg-slate-100 text-slate-500',
              'cancelled-by-patient': 'bg-slate-100 text-slate-500',
              visited:   'bg-purple-100 text-purple-700',
            };
            return map[status] || 'bg-slate-100 text-slate-500';
          };

          return (
            <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 mb-6 sm:mb-8">
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-slate-100">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h">Recent Appointments</h2>
                <span className="text-xs text-slate-400">Last 4 days</span>
              </div>
              <div className="overflow-x-auto">
                {recent.length > 0 ? (
                  <table className="w-full text-xs sm:text-sm text-left text-health-text-p">
                    <thead className="text-[10px] sm:text-xs text-health-text-p uppercase bg-slate-50">
                      <tr>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Patient</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Date & Time</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Reason</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Status</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(app => (
                        <tr key={app._id} className="bg-white border-b hover:bg-slate-50">
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-health-text-h text-[10px] sm:text-xs md:text-sm">
                            {app.patientId?.name || app.name}
                          </td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                            {new Date(app.date).toLocaleDateString()} at {app.time}
                          </td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm max-w-[140px] truncate">
                            {app.reason}
                          </td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium capitalize ${statusBadge(app.status)}`}>
                              {app.status.replace('cancelled-by-patient', 'cancelled')}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                            {app.status === 'approved' && (
                              <button
                                onClick={() => handlePatientVisited(app._id)}
                                className="bg-blue-100 text-blue-600 px-2 sm:px-3 py-1 rounded-full hover:bg-blue-200 transition-all text-[10px] sm:text-xs whitespace-nowrap"
                              >
                                Patient Visited
                              </button>
                            )}
                            {app.status === 'pending' && (
                              <div className="flex gap-1 sm:gap-2 justify-center">
                                <button onClick={() => handleStatus(app._id, 'approve')} className="bg-green-100 text-green-600 p-1 sm:p-2 rounded-full hover:bg-green-200 transition-all">
                                  <Check size={13} className="sm:w-4 sm:h-4" />
                                </button>
                                <button onClick={() => handleStatus(app._id, 'reject')} className="bg-red-100 text-red-600 p-1 sm:p-2 rounded-full hover:bg-red-200 transition-all">
                                  <X size={13} className="sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 sm:py-12 text-health-text-p text-sm sm:text-base px-3">
                    <p>No appointments in the last 4 days.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </main>
    </div>
  );
};

export default DoctorDashboard;
