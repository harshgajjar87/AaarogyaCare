import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AdminNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const closeNavbar = () => {
    const navbar = document.getElementById('navbarNav');
    if (navbar && navbar.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbar) || new bootstrap.Collapse(navbar);
      bsCollapse.hide();
    }
  };

  const handleLogoutClick = () => {
    closeNavbar();
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

  return (
    <>
      <nav className="header navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <Link className="navbar-brand" to="/admin-dashboard">Admin Panel</Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="navbar-collapse collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin-dashboard" onClick={closeNavbar}>Dashboard</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin-doctor-verifications" onClick={closeNavbar}>Doctor Verifications</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin-queries" onClick={closeNavbar}>Queries</NavLink>
              </li>
              <li className="nav-item">
                <span className="nav-link">Welcome, {user?.name || 'Admin'}</span>
              </li>
              <li className="nav-item">
                <button className="btn logout-btn nav-link" onClick={handleLogoutClick}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
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
