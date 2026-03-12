import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminAppointments from './pages/AdminAppointments';
import AppointmentForm from './pages/AppointmentForm';
import MyAppointments from './pages/MyAppointments';
import ReportList from './pages/ReportList';
import Profile from './pages/Profile';
import DoctorUploadReport from './pages/DoctorUploadReport';
import DoctorAppointments from './pages/DoctorAppointments';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorReports from './pages/DoctorReports';
import DoctorPatients from './pages/DoctorPatients';
import DoctorReviews from './pages/DoctorReviews';

import DoctorProfile from './pages/DoctorProfile'; // Corrected path
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import About from './pages/About';
import AdminQueries from './pages/AdminQueries';
import Notifications from './pages/Notifications';
import Privacy from './pages/Privacy';
import DoctorVerification from './pages/DoctorVerification';
import AdminDoctorVerifications from './pages/AdminDoctorVerifications';
import HealthRiskPage from './pages/HealthRiskPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import DoctorRegister from './pages/DoctorRegister';
import ChatDoctorPage from './pages/ChatDoctorPage';
import DashboardPage from './pages/DashboardPage';
import VoiceDoctorPage from './pages/VoiceDoctorPage';
import PaymentHistory from './pages/PaymentHistory';
import PrescriptionForm from './pages/PrescriptionForm';
import PatientPrescriptions from './pages/PatientPrescriptions';
import PatientDetails from './pages/PatientDetails';
import DoctorAnalytics from './pages/DoctorAnalytics';
import AdminAnalytics from './pages/AdminAnalytics';
import HealthPrediction from './pages/HealthPrediction';

// Import Toast and Notification
import { ToastContainer } from 'react-toastify';
import { NotificationProvider } from './context/NotificationContext';
import 'react-toastify/dist/ReactToastify.css';

// Import navigation components
import PatientNavbar from './components/PaitentNavbar';
import DoctorNavbar from './components/DoctorNavbar';
import AdminNavbar from './components/AdminNavbar';
import PublicNavbar from './components/PublicNavbar';

// Layout component for consistent structure

function Layout() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Simple navbar selection logic
  let NavbarComponent = PublicNavbar;
  
  if (user?.role === 'patient' && location.pathname.startsWith('/patient')) {
    NavbarComponent = PatientNavbar;
  } else if (user?.role === 'doctor' && location.pathname.startsWith('/doctor')) {
    NavbarComponent = DoctorNavbar;
  } else if (user?.role === 'admin' && location.pathname.startsWith('/admin')) {
    NavbarComponent = AdminNavbar;
  } else if (user?.role === 'patient' && (location.pathname === '/profile' || location.pathname === '/notifications' || location.pathname.startsWith('/chats'))) {
    NavbarComponent = PatientNavbar;
  } else if (user?.role === 'doctor' && (location.pathname === '/profile' || location.pathname === '/notifications' || location.pathname.startsWith('/chats'))) {
    NavbarComponent = DoctorNavbar;
  } else if (user?.role === 'admin' && (location.pathname === '/profile' || location.pathname === '/notifications' || location.pathname.startsWith('/chats'))) {
    NavbarComponent = AdminNavbar;
  }

  return (
    <div className="flex flex-col min-h-screen bg-health-secondary text-health-text-p font-sans antialiased">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100">
        <NavbarComponent />
      </header>

      <main className="relative flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-100 bg-white/80 backdrop-blur mt-auto">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-8 md:py-10">
          <div className="grid gap-6 md:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                <span role="img" aria-label="logo">🩺</span>
                <span className="text-health-primary">AarogyaCare</span>
              </div>
              <p className="text-health-text-p text-sm md:text-base">
                Your trusted healthcare partner providing quality medical services, secure records, and guided care journeys.
              </p>
              <div className="text-xs md:text-sm text-slate-500">
                Ahmedabad, India
              </div>
            </div>

            <div>
              <h4 className="text-sm md:text-base font-semibold text-health-text-h">Explore</h4>
              <ul className="mt-3 md:mt-4 space-y-2 md:space-y-3 text-xs md:text-sm text-health-text-p">
                <li><a className="transition-colors hover:text-health-primary" href="/">Home</a></li>
                <li><a className="transition-colors hover:text-health-primary" href="/about">About</a></li>
                <li><a className="transition-colors hover:text-health-primary" href="/privacy">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm md:text-base font-semibold text-health-text-h">Contact</h4>
              <ul className="mt-3 md:mt-4 space-y-2 md:space-y-3 text-xs md:text-sm text-health-text-p">
                <li>Email: <a className="text-health-primary hover:underline break-all" href="mailto:aarogyacare55@gmail.com">aarogyacare55@gmail.com</a></li>
                <li>Phone: +91 999 888 7777</li>
                <li>Address: Ahmedabad, India</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 md:mt-10 flex flex-col gap-2 md:gap-3 border-t border-slate-100 pt-4 md:pt-6 text-xs md:text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} AarogyaCare. All rights reserved.</span>
            <span className="text-slate-400">Built for trust, privacy, and care.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer position="top-right" theme='light' />
          <Routes>
            {/* Protected routes with layout */}
            <Route element={<Layout />}>
              {/* Public routes inside layout */}
              <Route path='/' element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/register-doctor' element={<DoctorRegister />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password' element={<ResetPassword />} />

              <Route path='/patient/dashboard' element={<PatientDashboard />} />
              <Route path='/patient/appointments' element={<AppointmentForm />} />
              <Route path='/patient/my-appointments' element={<MyAppointments />} />
              <Route path='/my-appointments' element={<MyAppointments />} />
              <Route path='/patient/payments' element={<PaymentHistory />} />
              <Route path='/payments' element={<PaymentHistory />} />
              <Route path='/patient/prescriptions' element={<PatientPrescriptions />} />
              <Route path='/patient/reports' element={<ReportList />} />
              <Route path='/doctor-verification' element={<DoctorVerification />} />

              <Route path='/doctor/dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor/appointments' element={<DoctorAppointments />} />
              <Route path='/doctor/patients' element={<DoctorPatients />} />
              <Route path='/doctor/payments' element={<PaymentHistory />} />
              <Route path='/doctor/reports' element={<DoctorReports />} />
              <Route path='/doctor/upload-report' element={<DoctorUploadReport />} />
              <Route path='/doctor/reviews' element={<DoctorReviews />} />
              <Route path='/doctor/analytics' element={<DoctorAnalytics />} />
              <Route path='/doctor/prescriptions/:appointmentId' element={<PrescriptionForm />} />
              <Route path='/doctor/prescription/:appointmentId' element={<PrescriptionForm />} />
              <Route path='/patient/:patientId' element={<PatientDetails />} />
              <Route path='/doctor/patient/:patientId' element={<PatientDetails />} />

              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path='/admin/doctors' element={<AdminDoctors />} />
              <Route path='/admin/patients' element={<AdminPatients />} />
              <Route path='/admin/appointments' element={<AdminAppointments />} />
              <Route path='/admin/queries' element={<AdminQueries />} />
              <Route path='/admin/verifications' element={<AdminDoctorVerifications />} />
              <Route path='/admin/analytics' element={<AdminAnalytics />} />

              <Route path='/profile' element={<Profile />} />
              <Route path='/notifications' element={<Notifications />} />
              <Route path='/about' element={<About />} />
              <Route path='/privacy' element={<Privacy />} />
              <Route path='/health-risk' element={<HealthRiskPage />} />
              <Route path='/health-prediction' element={<HealthPrediction />} />
              <Route path='/symptom-checker' element={<SymptomCheckerPage />} />
              <Route path='/dashboard' element={<DashboardPage />} />

              <Route path='/doctor/:doctorId' element={<DoctorProfile />} />
              <Route path='/doctor/:doctorId/chat' element={<ChatDoctorPage />} />
              <Route path='/doctor/:doctorId/voice' element={<VoiceDoctorPage />} />

              <Route path='/chats' element={<ChatListPage />} />
              <Route path='/chats/:chatId' element={<ChatPage />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
        
