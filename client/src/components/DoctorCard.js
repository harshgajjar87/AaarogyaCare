import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaRupeeSign, FaUserMd } from 'react-icons/fa';
import { getFullImageUrl } from '../utils/imageUtils';
import '../styles/components/DoctorCard.css';

const DoctorCard = ({ doctor, showBookAppointmentButton = true, onViewProfile, onBookAppointment }) => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    if (onBookAppointment) {
      onBookAppointment(doctor);
    } else {
      navigate('/patient/appointments', { state: { selectedDoctor: doctor } });
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(doctor);
    } else {
      navigate(`/doctor/${doctor._id}`);
    }
  };

  return (
    <div className="doctor-card card h-100">
      {/* Scrollable Clinic Images */}
      <div className="clinic-images-carousel">
        {doctor.doctorDetails?.clinicImages && doctor.doctorDetails.clinicImages.length > 0 ? (
          <div className="clinic-images-container">
            {doctor.doctorDetails.clinicImages.map((image, index) => (
              <img
                key={index}
                src={getFullImageUrl(image)}
                alt={`Clinic Image ${index + 1}`}
                className="clinic-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-avtar.jpg';
                }}
              />
            ))}
          </div>
        ) : (
          <div className="clinic-images-container">
            <img
              src="/images/default-avtar.jpg"
              alt="Default clinic"
              className="clinic-image"
            />
          </div>
        )}
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-primary">
            <FaUserMd className="me-1" />
            {doctor.doctorDetails?.specialization || 'General'}
          </span>
        </div>
      </div>

      <div className="card-body d-flex flex-column">
        {/* Doctor name with photo */}
        <div className="d-flex align-items-center mb-3">
          <img
            src={getFullImageUrl(doctor.profileImage) || '/images/default-avtar.jpg'}
            alt={doctor.name}
            className="doctor-photo me-3"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-avtar.jpg';
            }}
          />
          <h5 className="card-title mb-0">{doctor.name}</h5>
        </div>

        <div className="mb-2">
          <small className="text-muted">
            <FaMapMarkerAlt className="me-1" />
            {doctor.doctorDetails?.clinicName || 'Clinic'}
          </small>
        </div>

        <div className="mb-2">
          <small className="text-muted">
            <FaMapMarkerAlt className="me-1" />
            {doctor.doctorDetails?.clinicAddress || 'Address not provided'}
          </small>
        </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <FaStar className="text-warning me-1" />
                <span>{doctor.doctorDetails?.rating || 0} ({doctor.doctorDetails?.totalReviews || 0} reviews)</span>
              </div>
              <div>
                <FaRupeeSign className="text-success me-1" />
                <span className="fw-bold">{doctor.doctorDetails?.consultationFee || 0}</span>
              </div>
            </div>

        <div className="mb-3">
          <small className="text-muted">
            Experience: {doctor.doctorDetails?.experience || 0} years
          </small>
        </div>

      <div className="mt-auto">
        <div className="d-grid gap-2">
          {showBookAppointmentButton && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleBookAppointment}
            >
              Book Appointment
            </button>
          )}
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleViewProfile}
          >
            View Profile
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DoctorCard;