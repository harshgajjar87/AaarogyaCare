import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProfileImageUrl, getFullImageUrl } from '../utils/imageUtils';
import { getDoctorById } from '../api/doctorAPI';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { useAuth } from '../context/AuthContext';
import { checkUserReview } from '../api/reviewAPI';
import { Star, MapPin, IndianRupee, User, ArrowLeft, Briefcase, GraduationCap, Info, Brain, Calendar, Image as ImageIcon } from 'lucide-react';

const DoctorProfile = () => {
  const { doctorId } = useParams();
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
    if (user?.role === 'doctor') navigate('/doctor/dashboard');
    else if (user?.role === 'admin') navigate('/admin/doctors');
    else navigate('/patient/dashboard');
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorData = await getDoctorById(doctorId);
        setDoctor(doctorData);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId, refreshReviews]);

  useEffect(() => {
    const checkReviewStatus = async () => {
      if (user && user.role === 'patient' && doctor) {
        try {
          const hasReviewed = await checkUserReview(doctor._id);
          setHasUserReviewed(hasReviewed);
        } catch (error) {
          // Silently fail, as this is not critical
        }
      }
    };
    checkReviewStatus();
  }, [user, doctor, refreshReviews]);

  const handleReviewSubmitted = () => {
    setHasUserReviewed(true);
    setShowReviewForm(false);
    setRefreshReviews(prev => prev + 1);
  };

  if (loading) return <div className="text-center p-8">Loading doctor's profile...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!doctor) return <div className="text-center p-8">Doctor not found.</div>;

  const doctorDetails = doctor.doctorDetails || {};
  
  const InfoCard = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 md:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-health-text-h flex items-center gap-2 mb-3 sm:mb-4">{icon} {title}</h4>
        <div className="text-health-text-p space-y-2">{children}</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
      <div className="flex items-center justify-between gap-2">
        <button onClick={handleBackToDashboard} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-health-text-p hover:text-health-primary">
          <ArrowLeft size={16} className="sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Back to Dashboard</span><span className="xs:hidden">Back</span>
        </button>
        {user?.role === 'patient' && (
          <button onClick={handleBookAppointment} className="bg-teal-600 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full hover:bg-teal-700 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">
            Book Appointment
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="text-center">
            <img src={getProfileImageUrl(doctor.profileImage)} alt={doctor.name} className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto ring-4 ring-teal-100" />
          </div>
          <div className="md:col-span-2 space-y-2 sm:space-y-3 md:space-y-4">
            <div>
              <span className="inline-block bg-teal-100 text-health-primary text-xs sm:text-sm font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{doctorDetails.specialization || 'General'}</span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h mt-2">{doctor.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-health-text-p text-xs sm:text-sm">
              <div className="flex items-center gap-1"><Star size={14} className="text-yellow-400 sm:w-4 sm:h-4" /> <span>{doctorDetails.rating?.toFixed(1) || 0} ({doctorDetails.totalReviews || 0} reviews)</span></div>
              <div className="flex items-center gap-1"><IndianRupee size={14} className="text-green-500 sm:w-4 sm:h-4" /> <span>{doctorDetails.consultationFee || 0}</span></div>
            </div>
            <div className="text-xs sm:text-sm text-health-text-p flex items-start gap-2"><MapPin size={14} className="mt-0.5 sm:mt-1 flex-shrink-0 sm:w-4 sm:h-4" /> <span>{doctorDetails.clinicName}, {doctorDetails.clinicAddress}</span></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <InfoCard title="About" icon={<Info size={18} className="sm:w-5 sm:h-5"/>}><p className="text-sm sm:text-base">{doctorDetails.about || 'N/A'}</p></InfoCard>
        <InfoCard title="Experience" icon={<Briefcase size={18} className="sm:w-5 sm:h-5"/>}><p className="text-sm sm:text-base">{doctorDetails.experience || 0} years</p></InfoCard>
        <InfoCard title="Qualifications" icon={<GraduationCap size={18} className="sm:w-5 sm:h-5"/>}><p className="text-sm sm:text-base">{Array.isArray(doctorDetails.qualifications) ? doctorDetails.qualifications.join(', ') : doctorDetails.qualifications || 'N/A'}</p></InfoCard>
        <InfoCard title="Expertise" icon={<Brain size={18} className="sm:w-5 sm:h-5"/>}>
            {doctorDetails.expertise && (doctorDetails.expertise.conditions?.length > 0 || doctorDetails.expertise.treatments?.length > 0) ? (
                <>
                  <h5 className="font-semibold text-sm sm:text-base">Conditions</h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">{doctorDetails.expertise.conditions?.map((c,i) => <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 sm:py-1 rounded-full">{c}</span>)}</div>
                  <h5 className="font-semibold mt-2 text-sm sm:text-base">Treatments</h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">{doctorDetails.expertise.treatments?.map((t,i) => <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-0.5 sm:py-1 rounded-full">{t}</span>)}</div>
                </>
            ) : <p className="text-sm sm:text-base">N/A</p>}
        </InfoCard>
        <InfoCard title="Clinic Images" icon={<ImageIcon size={18} className="sm:w-5 sm:h-5"/>}>
          {doctorDetails.clinicImages?.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {doctorDetails.clinicImages.map((img, i) => <img key={i} src={getFullImageUrl(img)} alt={`Clinic ${i+1}`} className="w-full h-20 sm:h-24 object-cover rounded-md" />)}
            </div>
          ) : <p className="text-sm sm:text-base">No images available.</p>}
        </InfoCard>
        <InfoCard title="Availability" icon={<Calendar size={18} className="sm:w-5 sm:h-5"/>}>
          {doctorDetails.availability?.length > 0 ? (
            <div className="space-y-1">
              {doctorDetails.availability.map((slot, i) => <div key={i} className="flex justify-between text-xs sm:text-sm"><span className="font-medium">{slot.day}</span><span>{slot.startTime} - {slot.endTime}</span></div>)}
            </div>
          ) : <p className="text-sm sm:text-base">Contact clinic for availability.</p>}
        </InfoCard>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 mb-4">
            <h4 className="text-lg sm:text-xl font-bold text-health-text-h">Patient Reviews</h4>
            {user && user.role === 'patient' && !hasUserReviewed && (
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>
          {showReviewForm && <ReviewForm doctorId={doctor._id} onReviewSubmitted={handleReviewSubmitted} />}
          <ReviewList doctorId={doctor._id} key={refreshReviews} />
      </div>

    </div>
  );
};

export default DoctorProfile;
