import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, IndianRupee, Stethoscope, Check, Calendar } from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUtils';

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

  return (
    <div onClick={handleViewProfile} className="bg-health-surface rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 overflow-hidden group cursor-pointer">
      <div className="relative p-6 flex justify-center">
        <div className="relative">
          <img
            src={getFullImageUrl(doctor.profileImage)}
            alt={doctor.name}
            className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform"
          />
          {doctor.verified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1.5 shadow-md">
              <Check size={20} />
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 text-center">
        <h3 className="text-xl font-bold text-health-text-h mb-1">{doctor.name}</h3>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-health-primary mb-3">
          <Stethoscope size={14} />
          {doctor.doctorDetails?.specialization || 'General'}
        </div>
        
        <div className="space-y-3 text-sm text-health-text-p text-left mb-5">
            <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span>{doctor.doctorDetails?.clinicName || 'Clinic'}, {doctor.doctorDetails?.clinicAddress || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1"><Star size={16} className="text-yellow-400"/> <b>{doctor.doctorDetails?.rating || 0}</b> ({doctor.doctorDetails?.totalReviews || 0})</div>
                <div className="flex items-center gap-1"><IndianRupee size={16} className="text-green-500"/> <b>{doctor.doctorDetails?.consultationFee || 0}</b></div>
            </div>
            <div><b>Experience:</b> {doctor.doctorDetails?.experience || 0} years</div>
        </div>

        {showBookAppointmentButton && (
          <button onClick={handleBookAppointment} className="w-full bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mb-2">
            <Calendar size={16} /> Book Appointment
          </button>
        )}

        <button onClick={handleViewProfile} className="w-full bg-slate-100 text-slate-700 px-6 py-2 rounded-full hover:bg-slate-200 transition-all font-medium">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;