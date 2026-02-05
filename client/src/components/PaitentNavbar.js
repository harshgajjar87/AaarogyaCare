import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import axios from '../utils/axios';
import { getProfileImageUrl } from '../utils/imageUtils';
import { LayoutDashboard, Stethoscope, Calendar, FileText, Info, LogOut, Menu, X, User } from 'lucide-react';

const PatientNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('/profile/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user profile');
    }
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const navLinks = [
    { to: "/about", icon: <Info className="h-4 w-4" />, text: "About" },
  ];

  return (
    <>
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link to="/patient/dashboard" className="flex items-center gap-2 text-xl font-bold text-health-primary transition-transform hover:scale-105">
          <span className="text-2xl">🩺</span>
          <span>Patient Portal</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map(link => (
            <NavLink 
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-full transition-colors ${
                  isActive ? 'bg-teal-50 text-health-primary' : 'text-health-text-p hover:bg-slate-100'
                }`
              }
            >
              {link.icon}
              <span>{link.text}</span>
            </NavLink>
          ))}
          <div className="flex items-center gap-4 pl-2">
            <NotificationBell />
            <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-teal-100 hover:border-teal-600 transition-all">
              <img
                src={user ? getProfileImageUrl(user.profileImage) : '/images/default-avtar.jpg'}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/images/default-avtar.jpg'; }}
              />
            </Link>
            <button 
              className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center gap-2 text-sm" 
              onClick={handleLogoutClick}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
          type="button"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 z-50">
            <div className="p-4 space-y-2">
              {navLinks.map(link => (
                <NavLink 
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 text-base font-medium px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-teal-50 text-health-primary' : 'text-health-text-p hover:bg-slate-100'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.text}</span>
                </NavLink>
              ))}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div className="px-4 flex justify-between">
                  <NotificationBell />
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-full overflow-hidden cursor-pointer">
                    <img
                      src={user ? getProfileImageUrl(user.profileImage) : '/images/default-avtar.jpg'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/images/default-avtar.jpg'; }}
                    />
                  </Link>
                </div>
                <div className="px-4">
                  <button
                    className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 text-base"
                    onClick={handleLogoutClick}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <ConfirmLogoutModal 
        show={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </>
  );
};

export default PatientNavbar;
