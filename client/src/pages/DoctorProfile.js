import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaRupeeSign, FaUserMd, FaArrowLeft } from 'react-icons/fa';
import { getFullImageUrl } from '../utils/imageUtils';
import { getDoctorById } from '../api/doctorAPI';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { useAuth } from '../context/AuthContext';
import { checkUserReview } from '../api/reviewAPI';
import '../styles/components/DoctorProfile.css';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);

  const handleBookAppointment = () => {
    navigate('/patient/appointments', { state: { selectedDoctor: doctor } });
  };

  const handleBackToDashboard = () => {
    if (user?.role === 'doctor') {
      navigate('/doctor/dashboard');
    } else if (user?.role === 'admin') {
      navigate('/admin-doctors');
    } else {
      navigate('/patient/dashboard');
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorData = await getDoctorById(id);
        setDoctor(doctorData);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor details');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const checkReviewStatus = async () => {
      if (user && user.role === 'patient' && doctor) {
        try {
          const hasReviewed = await checkUserReview(doctor._id);
          setHasUserReviewed(hasReviewed);
        } catch (error) {
          console.error('Error checking review status:', error);
        }
      }
    };

    checkReviewStatus();
  }, [user, doctor, refreshReviews]);

  const handleReviewSubmitted = () => {
    setHasUserReviewed(true);
    setShowReviewForm(false);
    setRefreshReviews(prev => prev + 1);

    // Refresh doctor data to get updated rating
    const fetchUpdatedDoctor = async () => {
      try {
        const doctorData = await getDoctorById(id);
        setDoctor(doctorData);
      } catch (err) {
        console.error('Failed to fetch updated doctor details:', err);
      }
    };

    fetchUpdatedDoctor();
  };

  const toggleReviewForm = () => {
    setShowReviewForm(!showReviewForm);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center py-5">
        {error}
        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="alert alert-warning text-center py-5">
        Doctor not found
        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
      </div>
    );
  }

  const doctorDetails = doctor.doctorDetails || {};

  return (
    <div>
      <div className="container py-4 doctor-profile-container">
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn-back-dashboard me-3"
          onClick={handleBackToDashboard}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h2 className="mb-0">Doctor Profile</h2>
        <button
          className="btn btn-primary ms-auto"
          onClick={handleBookAppointment}
        >
          Book Appointment
        </button>
      </div>

      <div className="profile-card mb-4">
        <div className="row g-0 doctor-profile-row">
          {/* Doctor Image */}
          <div className="col-md-4">
            <img
              src={getFullImageUrl(doctor.profileImage) || '/images/default-avtar.jpg'}
              alt={doctor.name}
              className="img-fluid"
              onError={(e) => {
                e.target.src = '/images/default-avtar.jpg';
              }}
            />
          </div>

          {/* Doctor Information */}
          <div className="col-md-8 doctor-profile-content">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="card-title mb-1">{doctor.name}</h3>
                  <p className="card-text">
                    <FaUserMd className="text-primary me-2" />
                    <span className="badge bg-primary fs-6">{doctorDetails.specialization || 'General'}</span>
                  </p>
                </div>
                <div className="text-end">
                  <div className="d-flex align-items-center mb-1">
                    <FaStar className="text-warning me-1" />
                    <span className="fw-bold">{doctorDetails.rating || 0}</span>
                    <span className="text-muted ms-1">({doctorDetails.totalReviews || 0} reviews)</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaRupeeSign className="text-success me-1" />
                    <span className="fw-bold">₹{doctorDetails.consultationFee || 0}</span>
                  </div>
                </div>
              </div>

              <div className="doctor-info-section">
                <h5>
                  <i className="fas fa-info-circle me-2"></i>
                  About the Doctor
                </h5>
                <p>{doctorDetails.about || 'No information provided.'}</p>
              </div>

              <div className="doctor-info-section">
                <h5>
                  <i className="fas fa-briefcase me-2"></i>
                  Experience
                </h5>
                <p>{doctorDetails.experience || 0} years</p>
              </div>

              <div className="doctor-info-section">
                <h5>
                  <i className="fas fa-graduation-cap me-2"></i>
                  Qualifications
                </h5>
                <p>{doctorDetails.qualifications || doctorDetails.education || 'Not specified'}</p>
              </div>

              <div className="doctor-info-section">
                <h5>
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Clinic Address
                </h5>
                <p>
                  <FaMapMarkerAlt className="text-danger me-2" />
                  {doctorDetails.clinicName || 'Clinic Name'}, {doctorDetails.clinicAddress || 'Address not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Images Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Clinic Images</h4>
          {doctorDetails.clinicImages && doctorDetails.clinicImages.length > 0 ? (
            <div className="row g-3">
              {doctorDetails.clinicImages.map((image, index) => (
                <div key={index} className="col-md-4 col-sm-6">
                  <img
                    src={getFullImageUrl(image)}
                    alt={`Clinic Image ${index + 1}`}
                    className="img-fluid rounded"
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/images/default-avtar.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No clinic images available</p>
          )}
        </div>
      </div>

      {/* Expertise Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Expertise</h4>
          {doctorDetails.expertise && (doctorDetails.expertise.conditions?.length > 0 || doctorDetails.expertise.treatments?.length > 0) ? (
            <div className="row">
              <div className="col-md-6">
                <h5>Medical Conditions</h5>
                <div className="d-flex flex-wrap">
                  {doctorDetails.expertise.conditions?.map((condition, index) => (
                    <span key={index} className="badge bg-info me-2 mb-2">{condition}</span>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <h5>Treatments & Procedures</h5>
                <div className="d-flex flex-wrap">
                  {doctorDetails.expertise.treatments?.map((treatment, index) => (
                    <span key={index} className="badge bg-success me-2 mb-2">{treatment}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted">No specific expertise information available</p>
          )}
        </div>
      </div>

      {/* Available Time Slots */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Available Time Slots</h4>
          {doctorDetails.availability && doctorDetails.availability.length > 0 ? (
            <div className="row">
              {doctorDetails.availability.map((slot, index) => (
                <div key={slot._id || index} className="col-md-4 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">{slot.day}</h6>
                      <p className="card-text">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-muted mb-3">No available time slots specified</p>
              <button
                className="btn btn-primary"
                onClick={handleBookAppointment}
              >
                Book Appointment to See Available Slots
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="card-title mb-0">Patient Reviews</h4>
            {user && user.role === 'patient' && !hasUserReviewed && (
              <button
                className="btn btn-outline-primary"
                onClick={toggleReviewForm}
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <ReviewForm
              doctorId={doctor._id}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}

          {/* Review List */}
          <ReviewList doctorId={doctor._id} key={refreshReviews} />
        </div>
      </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
