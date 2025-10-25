import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import all styles
import './styles/combined-styles.css';

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
import NotificationBell from './components/NotificationBell';
import DoctorProfile from './pages/DoctorProfile'; // Corrected path
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import About from './pages/About';
import AdminQueries from './pages/AdminQueries';
import Notifications from './pages/Notifications';
import Privacy from './pages/Privacy';
import DoctorVerification from './pages/DoctorVerification';
import AdminDoctorVerifications from './pages/AdminDoctorVerifications';

// Import Toast and Notification
import { ToastContainer } from 'react-toastify';
import { NotificationProvider } from './context/NotificationContext';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

// Import navigation components
import PatientNavbar from './components/PaitentNavbar';
import DoctorNavbar from './components/DoctorNavbar';
import AdminNavbar from './components/AdminNavbar';
import PublicNavbar from './components/PublicNavbar';

// Layout component for consistent structure

function Layout() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Determine navbar based on user role for authenticated routes
  // Debug logging
  console.log('Layout Debug:', {
    pathname: location.pathname,
    user: user,
    userRole: user?.role
  });

  // Fix: Ensure userRole is properly set
  const userRole = user?.role;

  const isPatientRoute = location.pathname.startsWith('/patient') ||
    (location.pathname.match(/^\/doctor\/\d+$/) && user?.role === 'patient') || 
    (location.pathname.match(/^\/doctor\/\d+\/.*$/) && user?.role === 'patient') || 
    (user?.role === 'patient' && (
      
      location.pathname !== '/about' &&
      (location.pathname === '/profile' ||
      location.pathname === '/notifications' ||
      location.pathname.startsWith('/chats'))
    ));

  const isDoctorRoute = location.pathname.startsWith('/doctor') &&
    !location.pathname.match(/^\/doctor\/\d+$/) &&
    !location.pathname.match(/^\/doctor\/\d+\/.*$/) &&
    user?.role === 'doctor' || 
    (user?.role === 'doctor' && (
      location.pathname === '/about' ||
      location.pathname === '/profile' ||
      location.pathname === '/notifications' ||
      location.pathname.startsWith('/chats')
    ));

  const isAdminRoute = location.pathname.startsWith('/admin') ||
    (user?.role === 'admin' && (
      location.pathname === '/about' ||
      location.pathname === '/profile' ||
      location.pathname === '/notifications' ||
      location.pathname.startsWith('/chats')
    ));

  // If user is logged in, never show public navbar
  const isPublicRoute = !user && !isPatientRoute && !isDoctorRoute && !isAdminRoute;

  // Debug logging
  console.log('Route determination:', {
    isPatientRoute,
    isDoctorRoute,
    isAdminRoute,
    isPublicRoute,
    willShow: isPatientRoute ? 'PatientNavbar' : isDoctorRoute ? 'DoctorNavbar' : isAdminRoute ? 'AdminNavbar' : 'PublicNavbar'
  });

  return (
    <div className="app-layout">
      {/* Header removed */}

      {/* Navigation based on route */}
      {isPatientRoute && <PatientNavbar />}
      {isDoctorRoute && <DoctorNavbar />}
      {isAdminRoute && <AdminNavbar />}
      {isPublicRoute && <PublicNavbar />}

      {/* Main Content */}
      <main className="App-main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-column">
            <div className="footer-section">
              <h4>About AarogyaCare</h4>
              <p>Your trusted healthcare partner providing quality medical services and support.</p>
            </div>
            <div className="footer-section">
              <h4>Contact Us</h4>
              <ul>
                <li>Email: aarogyacare55@gmail.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: Ahmedabad City</li>
              </ul>
            </div>
          </div>
          <div className="footer-column">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>

                <li><a href="/privacy">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <p>&copy; {new Date().getFullYear()} AarogyaCare. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <AuthProvider>
        <ThemeProvider>
          <div className={`App ${darkMode ? 'dark' : ''} ${sidebarOpen ? 'sidebar-open' : ''} fade-in`}>
            <NotificationProvider>
              <ToastContainer />
              {/* Sidebar Overlay */}
              {sidebarOpen && (
                <div
                  className="sidebar-overlay"
                  onClick={() => setSidebarOpen(false)}
                ></div>
              )}

              <Routes>
                {/* Protected routes with layout */}
                <Route element={<Layout />}>
                  {/* Public routes inside layout */}
                  <Route path='/' element={<Home />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/register' element={<Register />} />
                  <Route path='/forgot-password' element={<ForgotPassword />} />
                  <Route path='/reset-password' element={<ResetPassword />} />

                  <Route path='/patient/dashboard' element={<PatientDashboard />} />
                  <Route path='/patient/appointments' element={<AppointmentForm />} />
                  <Route path='/patient/my-appointments' element={<MyAppointments />} />
                  <Route path='/patient/reports' element={<ReportList />} />
                  <Route path='/doctor-verification' element={<DoctorVerification />} />

                  <Route path='/doctor/dashboard' element={<DoctorDashboard />} />
                  <Route path='/doctor/appointments' element={<DoctorAppointments />} />
                  <Route path='/doctor/reports' element={<DoctorReports />} />
                  <Route path='/doctor/reviews' element={<DoctorReviews />} />
                  <Route path='/doctor/upload' element={<DoctorUploadReport />} />

                  <Route path='/admin-dashboard' element={<ProtectedRoute allowedRole='admin'><AdminDashboard /></ProtectedRoute>} />
                  <Route path='/admin-doctors' element={<ProtectedRoute allowedRole='admin'><AdminDoctors /></ProtectedRoute>} />
                  <Route path='/admin-patients' element={<ProtectedRoute allowedRole='admin'><AdminPatients /></ProtectedRoute>} />
                  <Route path='/admin-appointments' element={<ProtectedRoute allowedRole='admin'><AdminAppointments /></ProtectedRoute>} />
                  <Route path='/admin-queries' element={<ProtectedRoute allowedRole='admin'><AdminQueries /></ProtectedRoute>} />
                  <Route path='/admin-doctor-verifications' element={<ProtectedRoute allowedRole='admin'><AdminDoctorVerifications /></ProtectedRoute>} />
                  <Route path='/about' element={<About />} />
                  <Route path='/privacy' element={<Privacy />} />

                  <Route path='/notifications' element={<Notifications />} />
                  <Route path='/profile' element={<Profile />} />
                  <Route path='/doctor/:id' element={<DoctorProfile />} />

                  {/* 聊天相关路由 */}
                  <Route path='/chats' element={<ChatListPage />} />
                  <Route path='/chats/:chatId' element={<ChatPage />} />
                </Route>
              </Routes>
            </NotificationProvider>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
