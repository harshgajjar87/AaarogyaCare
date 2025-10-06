import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/pages/Home.css';
import ReviewsCarousel from '../components/ReviewsCarousel';
import DoctorCard from '../components/DoctorCard';
import { getAllDoctors } from '../api/doctorAPI';
import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/PublicNavbar';

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data.doctors || []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBookAppointment = () => {
    if (!user) {
      navigate('/login');
    } else {
      // This will be handled by DoctorCard's default behavior
    }
  };

  const handleViewProfile = () => {
    if (!user) {
      navigate('/login');
    } else {
      // This will be handled by DoctorCard's default behavior
    }
  };

  return (
    <>
      {/* <PublicNavbar /> */}
      <div className="hero-section d-flex align-items-center justify-content-center text-center text-black">
        <img src="/images/herosection.webp" alt="Hero Section" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, zIndex: 1}} />
        <div className="hero-content">
          <h1 className="display-4 fw-bold fade-in-up">Welcome to AarogyaCare</h1>
          <p className="lead mt-3 fade-in-up" style={{animationDelay: '0.2s'}}>Your Health, Our Priority 🏥</p>
          <p className="fade-in-up" style={{animationDelay: '0.4s'}}>Book appointments, communicate with doctors, and manage your health reports seamlessly.</p>
          <div className="mt-4 fade-in-up" style={{animationDelay: '0.6s'}}>
            <Link to="/register" className="btn btn-light btn-lg me-3 hover-lift">Register Now</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg hover-lift">Login</Link>
          </div>
        </div>
      </div>

      <div className="container mt-5">
        <div className="row text-center">
          <div className="col-md-6 mb-4">
            <img src="images/homeopathy1.jpg" className="img-fluid rounded shadow fade-in-left hover-scale" alt="Homeopathy Healing" />
          </div>
          <div className="col-md-6 text-start d-flex align-items-center">
            <div className="fade-in-right">
              <h2 className="mb-3">Why Choose AarogyaCare?</h2>
              <p>
                Experience comprehensive healthcare with ease. Book appointments, communicate with doctors, and access your reports anytime.
              </p>
              <ul className="stagger-fade-in">
                <li>✓ Easy Appointment Booking</li>
                <li>✓ Direct Doctor Communication</li>
                <li>✓ Online Consultations</li>
                <li>✓ Secure Report Viewing</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-5" />

        <div className="row text-center">
          <div className="col-md-6 text-start d-flex align-items-center">
            <div className="fade-in-left">
              <h2>Book Your Appointment Today</h2>
              <p>
                Schedule consultations with top doctors, discuss your health concerns, and get personalized care from the comfort of your home.
              </p>
              <Link to="/login" className="btn btn-success btn-lg mt-3 hover-lift">Book Appointment</Link>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <img src="clinic.jpeg" className="img-fluid rounded shadow fade-in-right hover-scale" alt="Book Appointment" />
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="container mt-5">
        <h2 className="text-center mb-4">Our Doctors</h2>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {doctors.slice(0, 6).map((doctor) => (
              <div key={doctor._id} className="col-lg-4 col-md-6 mb-4">
                <DoctorCard
                  doctor={doctor}
                  onBookAppointment={handleBookAppointment}
                  onViewProfile={handleViewProfile}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Carousel Section */}
      <div className="container-fluid mt-5">
        <ReviewsCarousel />
      </div>
    </>
  );
};

export default Home;
