import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getFullImageUrl } from '../utils/imageUtils';
import { getDoctorById } from '../api/doctorAPI';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { useAuth } from '../context/AuthContext';
import { checkUserReview } from '../api/reviewAPI';
import { Star, MapPin, IndianRupee, User, ArrowLeft, Briefcase, GraduationCap, Info, Brain, Calendar, Image as ImageIcon } from 'lucide-react';

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
    if (user?.role === 'doctor') navigate('/doctor/dashboard');
    else if (user?.role === 'admin') navigate('/admin-doctors');
    else navigate('/patient/dashboard');
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
  }, [id, refreshReviews]);

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
    <div className="bg-white rounded-xl shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-health-text-h flex items-center gap-2 mb-4">{icon} {title}</h4>
        <div className="text-health-text-p space-y-2">{children}</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={handleBackToDashboard} className="flex items-center gap-2 text-sm text-health-text-p hover:text-health-primary">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        {user?.role === 'patient' && (
          <button onClick={handleBookAppointment} className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 font-medium">
            Book Appointment
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <img src={getFullImageUrl(doctor.profileImage)} alt={doctor.name} className="w-40 h-40 rounded-full object-cover mx-auto ring-4 ring-teal-100" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="inline-block bg-teal-100 text-health-primary text-sm font-semibold px-3 py-1 rounded-full">{doctorDetails.specialization || 'General'}</span>
              <h1 className="text-3xl font-bold text-health-text-h mt-2">{doctor.name}</h1>
            </div>
            <div className="flex items-center gap-6 text-health-text-p">
              <div className="flex items-center gap-1"><Star size={16} className="text-yellow-400" /> <span>{doctorDetails.rating?.toFixed(1) || 0} ({doctorDetails.totalReviews || 0} reviews)</span></div>
              <div className="flex items-center gap-1"><IndianRupee size={16} className="text-green-500" /> <span>{doctorDetails.consultationFee || 0}</span></div>
            </div>
            <div className="text-sm text-health-text-p flex items-start gap-2"><MapPin size={16} className="mt-1 flex-shrink-0" /> <span>{doctorDetails.clinicName}, {doctorDetails.clinicAddress}</span></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InfoCard title="About" icon={<Info size={20}/>}><p>{doctorDetails.about || 'N/A'}</p></InfoCard>
        <InfoCard title="Experience" icon={<Briefcase size={20}/>}><p>{doctorDetails.experience || 0} years</p></InfoCard>
        <InfoCard title="Qualifications" icon={<GraduationCap size={20}/>}><p>{Array.isArray(doctorDetails.qualifications) ? doctorDetails.qualifications.join(', ') : doctorDetails.qualifications || 'N/A'}</p></InfoCard>
        <InfoCard title="Expertise" icon={<Brain size={20}/>}>
            {doctorDetails.expertise && (doctorDetails.expertise.conditions?.length > 0 || doctorDetails.expertise.treatments?.length > 0) ? (
                <>
                  <h5 className="font-semibold">Conditions</h5>
                  <div className="flex flex-wrap gap-2">{doctorDetails.expertise.conditions?.map((c,i) => <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{c}</span>)}</div>
                  <h5 className="font-semibold mt-2">Treatments</h5>
                  <div className="flex flex-wrap gap-2">{doctorDetails.expertise.treatments?.map((t,i) => <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{t}</span>)}</div>
                </>
            ) : <p>N/A</p>}
        </InfoCard>
        <InfoCard title="Clinic Images" icon={<ImageIcon size={20}/>}>
          {doctorDetails.clinicImages?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {doctorDetails.clinicImages.map((img, i) => <img key={i} src={getFullImageUrl(img)} alt={`Clinic ${i+1}`} className="w-full h-24 object-cover rounded-md" />)}
            </div>
          ) : <p>No images available.</p>}
        </InfoCard>
        <InfoCard title="Availability" icon={<Calendar size={20}/>}>
          {doctorDetails.availability?.length > 0 ? (
            <div className="space-y-1">
              {doctorDetails.availability.map((slot, i) => <div key={i} className="flex justify-between text-sm"><span className="font-medium">{slot.day}</span><span>{slot.startTime} - {slot.endTime}</span></div>)}
            </div>
          ) : <p>Contact clinic for availability.</p>}
        </InfoCard>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-bold text-health-text-h">Patient Reviews</h4>
            {user && user.role === 'patient' && !hasUserReviewed && (
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
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
