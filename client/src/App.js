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

  const isPatientRoute =
    location.pathname.startsWith('/patient') ||
    location.pathname === '/doctor-verification' ||
    (location.pathname.match(/^\/doctor\/\d+$/) && user?.role === 'patient') ||
    (location.pathname.match(/^\/doctor\/\d+\/.*$/) && user?.role === 'patient') ||
    (user?.role === 'patient' &&
      location.pathname !== '/about' &&
      (location.pathname === '/profile' ||
        location.pathname === '/notifications' ||
        location.pathname.startsWith('/chats')));

  const isDoctorRoute =
    user?.role === 'doctor' &&
    (location.pathname.startsWith('/doctor') ||
      location.pathname === '/about' ||
      location.pathname === '/profile' ||
      location.pathname === '/notifications' ||
      location.pathname.startsWith('/chats'));

  const isAdminRoute = location.pathname.startsWith('/admin') ||
    (user?.role === 'admin' && (
      location.pathname === '/about' ||
      location.pathname === '/profile' ||
      location.pathname === '/notifications' ||
      location.pathname.startsWith('/chats')
    ));

  const isPublicRoute = !user && !isPatientRoute && !isDoctorRoute && !isAdminRoute;

  return (
    <div className="min-h-screen bg-health-secondary text-health-text-p font-sans antialiased">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100">
        {isPatientRoute && <PatientNavbar />}
        {isDoctorRoute && <DoctorNavbar />}
        {isAdminRoute && <AdminNavbar />}
        {isPublicRoute && <PublicNavbar />}
      </header>

      <main className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                <span role="img" aria-label="logo">🩺</span>
                <span className="text-health-primary">AarogyaCare</span>
              </div>
              <p className="text-health-text-p">
                Your trusted healthcare partner providing quality medical services, secure records, and guided care journeys.
              </p>
              <div className="text-sm text-slate-500">
                Ahmedabad, India
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-health-text-h">Explore</h4>
              <ul className="mt-4 space-y-3 text-sm text-health-text-p">
                <li><a className="transition-colors hover:text-health-primary" href="/">Home</a></li>
                <li><a className="transition-colors hover:text-health-primary" href="/about">About</a></li>
                <li><a className="transition-colors hover:text-health-primary" href="/privacy">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-health-text-h">Contact</h4>
              <ul className="mt-4 space-y-3 text-sm text-health-text-p">
                <li>Email: <a className="text-health-primary hover:underline" href="mailto:aarogyacare55@gmail.com">aarogyacare55@gmail.com</a></li>
                <li>Phone: +91 999 888 7777</li>
                <li>Address: Ahmedabad, India</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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
              <Route path='/doctor/prescription/:appointmentId' element={<PrescriptionForm />} />
              <Route path='/doctor/patient/:patientId' element={<PatientDetails />} />
              <Route path='/doctor/reports' element={<DoctorReports />} />
              <Route path='/doctor/reviews' element={<DoctorReviews />} />
              <Route path='/doctor/upload' element={<DoctorUploadReport />} />

              <Route path='/admin-dashboard' element={<ProtectedRoute allowedRole='admin'><AdminDashboard /></ProtectedRoute>} />
              <Route path='/admin-doctors' element={<ProtectedRoute allowedRole='admin'><AdminDoctors /></ProtectedRoute>} />
              <Route path='/admin-patients' element={<ProtectedRoute allowedRole='admin'><AdminPatients /></ProtectedRoute>} />
              <Route path='/admin-appointments' element={<ProtectedRoute allowedRole='admin'><AdminAppointments /></ProtectedRoute>} />
              <Route path='/admin-queries' element={<ProtectedRoute allowedRole='admin'><AdminQueries /></ProtectedRoute>} />
              <Route path='/admin/analytics' element={<ProtectedRoute allowedRole='admin'><DashboardPage /></ProtectedRoute>} />
              <Route path='/admin-doctor-verifications' element={<ProtectedRoute allowedRole='admin'><AdminDoctorVerifications /></ProtectedRoute>} />
              <Route path='/about' element={<About />} />
              <Route path='/privacy' element={<Privacy />} />
              <Route path='/health-risk' element={<HealthRiskPage />} />
              <Route path='/symptom-checker' element={<SymptomCheckerPage />} />
              <Route path='/patient/chat-doctor' element={<ChatDoctorPage />} />
              <Route path='/patient/voice-doctor' element={<VoiceDoctorPage />} />
              <Route path='/doctor/analytics' element={<ProtectedRoute allowedRole='doctor'><DashboardPage /></ProtectedRoute>} />

              <Route path='/notifications' element={<Notifications />} />
              <Route path='/profile' element={<Profile />} />
              {/* Patient aliases to avoid "No routes matched" errors */}
              <Route path='/patient/profile' element={<Profile />} />
              <Route path='/doctor/:id' element={<DoctorProfile />} />

              {/* Chat routes */}
              <Route path='/chats' element={<ChatListPage />} />
              <Route path='/chats/:chatId' element={<ChatPage />} />
              {/* Patient alias for chat */}
              <Route path='/patient/chat' element={<ChatListPage />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
