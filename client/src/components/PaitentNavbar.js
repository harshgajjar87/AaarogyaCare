import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ProfileModal from './ProfileModal';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import axios from '../utils/axios';
import { getProfileImageUrl } from '../utils/imageUtils';
import '../styles/components/Header.css';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const PatientNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const closeNavbar = () => {
    const navbar = document.getElementById('navbarNav');
    if (navbar && navbar.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbar) || new bootstrap.Collapse(navbar);
      bsCollapse.hide();
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('/profile/me');
      const userData = res.data;
      // Don't modify the image path here, let imageUtils handle it
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user profile');
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

  const handleProfileClick = () => {
    closeNavbar();
    setShowProfileModal(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <>
      <nav className='header navbar navbar-expand-lg'>
        <div className='container-fluid'>
          <Link className='navbar-brand' to='/patient/dashboard'>🏥 Patient Portal</Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className='navbar-collapse collapse' id='navbarNav'>
            <ul className='navbar-nav ms-auto align-items-center'>

              <li className='nav-item'>
                <NavLink className='nav-link' to='/patient/dashboard' onClick={closeNavbar}>Dashboard</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/doctor-verification' onClick={closeNavbar}>Become a Doctor</NavLink>
              </li>

              <li className='nav-item'>
                <NavLink className='nav-link' to='/patient/appointments' onClick={closeNavbar}>Book Appointment</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/patient/my-appointments' onClick={closeNavbar}>My Appointments</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/patient/reports' onClick={closeNavbar}>Reports</NavLink>
              </li>
              <li className='nav-item'>
                <NavLink className='nav-link' to='/about' onClick={closeNavbar}>About</NavLink>
              </li>

              <li className='nav-item'>
                <NotificationBell />
              </li>

              <li className='nav-item ms-3'>
                <div 
                  className="rounded-circle overflow-hidden border border-light shadow-sm" 
                  style={{ 
                    width: '45px', 
                    height: '45px', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out'
                  }}
                  onClick={handleProfileClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={user ? getProfileImageUrl(user.profileImage) : '/images/default-avtar.jpg'}
                    alt="Profile"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/images/default-avtar.jpg';
                    }}
                  />
                </div>
              </li>

              <li className='nav-item'>
                <button className='btn logout-btn ms-3' onClick={handleLogoutClick}>Logout</button>
              </li>
            </ul>
          </div>
        </div>

        <ProfileModal 
          show={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userData={user}
          onUpdate={handleProfileUpdate}
        />
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
