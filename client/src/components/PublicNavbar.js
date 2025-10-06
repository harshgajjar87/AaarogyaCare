import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Header.css';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const PublicNavbar = () => {
  const closeNavbar = () => {
    const navbar = document.getElementById('navbarNav');
    if (navbar && navbar.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbar) || new bootstrap.Collapse(navbar);
      bsCollapse.hide();
    }
  };

  return (
    <nav className="header navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Aarogya Clinic</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="navbar-collapse collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link to="/about" className="btn btn-primary hover-lift fade-in-up me-2" onClick={closeNavbar}>About</Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className="btn btn-primary hover-lift fade-in-up me-2" onClick={closeNavbar}>Login</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="btn btn-primary hover-lift fade-in-up" onClick={closeNavbar}>Register</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
