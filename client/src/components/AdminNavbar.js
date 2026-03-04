import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import { LayoutDashboard, Stethoscope, HelpCircle, User, LogOut, Menu, X } from 'lucide-react';

const AdminNavbar = () => {
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
    navigate('/login');
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { to: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, text: "Dashboard" },
    { to: "/admin/verifications", icon: <Stethoscope className="h-4 w-4" />, text: "Doctor Verifications" },
    { to: "/admin/queries", icon: <HelpCircle className="h-4 w-4" />, text: "Queries" }
  ];

  return (
    <>
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link to="/admin/dashboard" className="flex items-center gap-2 text-xl font-bold text-health-primary transition-transform hover:scale-105">
          <span className="text-2xl">👑</span>
          <span>Admin Panel</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          {navLinks.map(link => (
            <NavLink 
              key={link.to}
              to={link.to} 
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                  isActive ? 'bg-teal-50 text-health-primary' : 'text-health-text-p hover:bg-slate-100'
                }`
              }
            >
              {link.icon}
              <span>{link.text}</span>
            </NavLink>
          ))}
          <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
            <span className="flex items-center gap-2 text-sm text-health-text-p">
              <User className="h-4 w-4" />
              {user?.name || 'Admin'}
            </span>
            <button 
              className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center gap-2 text-sm" 
              onClick={handleLogoutClick}
            >
              <LogOut className="h-4 w-4" />
              Logout
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
                <span className="flex items-center gap-3 text-base text-health-text-p px-4">
                  <User className="h-5 w-5" />
                  {user?.name || 'Admin'}
                </span>
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

export default AdminNavbar;
