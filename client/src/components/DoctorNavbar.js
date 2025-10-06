import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import NotificationBell from './NotificationBell';
import '../styles/components/Header.css';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const DoctorNavbar = () => {
  const { logout } = useContext(AuthContext);
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
    navigate('/');
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className='header navbar navbar-expand-lg'>
        <div className='container-fluid'>
          <Link className='navbar-brand' to='/doctor/dashboard'>🩺 Doctor Panel</Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className='navbar-collapse collapse' id='navbarNav'>
            <ul className='navbar-nav ms-auto align-items-center'>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/doctor/dashboard' onClick={closeNavbar}>Dashboard</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/doctor/upload' onClick={closeNavbar}>Upload Report</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/doctor/appointments' onClick={closeNavbar}>Appointments</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/doctor/reports' onClick={closeNavbar}>Reports</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/doctor/reviews' onClick={closeNavbar}>Reviews</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/profile' onClick={closeNavbar}>My Profile</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/about' onClick={closeNavbar}>About</NavLink>
              </li>

              <li className='nav-item d-flex align-items-center ms-3'>
                <NotificationBell />
              </li>

              <li className='nav-item'>
                <button className='btn logout-btn ms-3' onClick={handleLogoutClick}>Logout</button>
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

export default DoctorNavbar;
