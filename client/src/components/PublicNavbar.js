import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-health-primary transition-transform hover:scale-105">
          <span className="text-2xl">🩺</span>
          <span>AarogyaCare</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:items-center lg:space-x-6">
        <Link to="/about" className="text-health-text-p hover:text-health-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
        <Link to="/login" className="text-health-text-p hover:text-health-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">AI Symptom Checker</Link>
        <div className="flex items-center space-x-3">
          <Link to="/login" className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium text-sm">Login</Link>
          <Link to="/register" className="bg-health-primary text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium text-sm shadow-md hover:shadow-lg">Register</Link>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
        type="button"
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 right-4 z-50 min-w-[200px] bg-white rounded-xl shadow-lg border border-slate-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/about" className="text-slate-700 hover:text-teal-700 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={closeMenu}>About</Link>
            <Link to="/login" className="text-slate-700 hover:text-teal-700 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={closeMenu}>AI Symptom Checker</Link>
            <div className="pt-4 pb-3 border-t border-slate-200">
              <div className="flex items-center px-3 space-x-3">
                <Link to="/login" className="flex-1 text-center bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-all font-medium text-sm" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="flex-1 text-center bg-health-primary text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-all font-medium text-sm" onClick={closeMenu}>Register</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
