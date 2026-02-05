import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import NotificationBell from './NotificationBell';
import { LayoutDashboard, Upload, Calendar, FileText, Star, User, Info, LogOut, Menu, X, CreditCard } from 'lucide-react';

const DoctorNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    { to: "/doctor/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, text: "Dashboard" },
    { to: "/doctor/upload", icon: <Upload className="h-4 w-4" />, text: "Upload Report" },
    { to: "/doctor/appointments", icon: <Calendar className="h-4 w-4" />, text: "Appointments" },
    { to: "/doctor/payments", icon: <CreditCard className="h-4 w-4" />, text: "Payments" },
    { to: "/doctor/reports", icon: <FileText className="h-4 w-4" />, text: "Reports" },
    { to: "/doctor/reviews", icon: <Star className="h-4 w-4" />, text: "Reviews" },
    { to: `/doctor/${user?._id}`, icon: <User className="h-4 w-4" />, text: "My Profile" },
    { to: "/about", icon: <Info className="h-4 w-4" />, text: "About" },
  ];

  return (
    <>
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link to="/doctor/dashboard" className="flex items-center gap-2 text-xl font-bold text-health-primary transition-transform hover:scale-105">
          <span className="text-2xl">🩺</span>
          <span>Doctor Panel</span>
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
                <div className="px-4">
                  <NotificationBell />
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

export default DoctorNavbar;
