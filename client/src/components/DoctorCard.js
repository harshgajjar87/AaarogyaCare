import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, IndianRupee, Stethoscope, Check, Calendar } from 'lucide-react';
import { getFullImageUrl, getProfileImageUrl } from '../utils/imageUtils';

const DoctorCard = ({ doctor, showBookAppointmentButton = true, onViewProfile, onBookAppointment }) => {
  const navigate = useNavigate();

  const handleBookAppointment = (e) => {
    e.stopPropagation();
    if (onBookAppointment) onBookAppointment(doctor);
    else navigate('/patient/appointments', { state: { selectedDoctor: doctor } });
  };

  const handleViewProfile = (e) => {
    e.stopPropagation();
    if (onViewProfile) onViewProfile(doctor);
    else navigate(`/doctor/${doctor._id}`);
  };

  const isAvailableToday = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return doctor.doctorDetails?.availability?.some(day => day.day === today && day.isAvailable);
  };
  // eslint-disable-next-line no-unused-vars
  const availableToday = isAvailableToday();

  return (
    <div onClick={handleViewProfile} className="bg-health-surface rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 overflow-hidden group cursor-pointer h-full flex flex-col">
      <div className="relative p-4 sm:p-6 flex justify-center">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          <img
            src={getProfileImageUrl(doctor.profileImage)}
            alt={doctor.name}
            className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform"
          />
          {doctor.verified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 sm:p-1.5 shadow-md">
              <Check size={16} className="sm:w-5 sm:h-5" />
            </div>
          )}
        </div>
      </div>

      <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 text-center flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h mb-1 line-clamp-1">{doctor.name}</h3>
        <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-teal-50 text-health-primary mb-2 sm:mb-3 mx-auto">
          <Stethoscope size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="line-clamp-1">{doctor.doctorDetails?.specialization || 'General'}</span>
        </div>
        
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-health-text-p text-left mb-3 sm:mb-4 md:mb-5 flex-1">
            <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                <span className="line-clamp-2">{doctor.doctorDetails?.clinicName || 'Clinic'}, {doctor.doctorDetails?.clinicAddress || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-1"><Star size={14} className="text-yellow-400 sm:w-4 sm:h-4"/> <b>{doctor.doctorDetails?.rating || 0}</b> <span className="text-xs">({doctor.doctorDetails?.totalReviews || 0})</span></div>
                <div className="flex items-center gap-1"><IndianRupee size={14} className="text-green-500 sm:w-4 sm:h-4"/> <b>{doctor.doctorDetails?.consultationFee || 0}</b></div>
            </div>
            <div className="text-xs sm:text-sm"><b>Experience:</b> {doctor.doctorDetails?.experience || 0} years</div>
        </div>

        {showBookAppointmentButton && (
          <button onClick={handleBookAppointment} className="w-full bg-teal-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mb-2 text-xs sm:text-sm md:text-base">
            <Calendar size={14} className="sm:w-4 sm:h-4" /> <span>Book Appointment</span>
          </button>
        )}

        <button onClick={handleViewProfile} className="w-full bg-slate-100 text-slate-700 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-slate-200 transition-all font-medium text-xs sm:text-sm md:text-base">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;