import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllDoctors } from '../api/doctorAPI';
import { createAppointment, getAvailableSlots } from '../api/appointmentAPI';
import { createPaymentOrder, verifyPaymentAndBook, getPaymentPreview } from '../api/paymentAPI';
import useRazorpay from '../hooks/useRazorpay';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Calendar, Clock, MessageSquare, Stethoscope, Book, Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

const FormSection = ({ title, icon, children }) => (
  <div className="space-y-3 sm:space-y-4">
    <h3 className="text-base sm:text-lg font-semibold text-health-text-h flex items-center gap-2 border-b pb-2">
      {icon}
      <span>{title}</span>
    </h3>
    {children}
  </div>
);

const AppointmentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processPayment, isProcessing } = useRazorpay();
  const [form, setForm] = useState({
    name: '', age: '', gender: '', date: '', time: '', reason: '', doctorId: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [feePreview, setFeePreview] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Fetch ALL doctors for the dropdown (no pagination limit)
        const response = await getAllDoctors({ limit: 1000 }); // Set high limit to get all doctors
        setDoctors(response.doctors || []);
        
        // Check if doctor was passed via navigation state
        const preSelectedDoctor = location.state?.selectedDoctor;
        if (preSelectedDoctor) {
          setForm(prev => ({ ...prev, doctorId: preSelectedDoctor._id }));
          setSelectedDoctor(preSelectedDoctor);
        }
      } catch (error) {
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
    setMinDate(new Date().toISOString().split('T')[0]);
  }, [location.state]);

  useEffect(() => {
    if (form.doctorId && form.date) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const response = await getAvailableSlots(form.doctorId, form.date);

          // Filter out past slots client-side (avoids UTC/IST server timezone issues)
          const today = new Date().toISOString().split('T')[0];
          const isToday = form.date === today;
          const now = new Date();

          const isPastSlot = (slot) => {
            if (!isToday) return false;
            const [h, m] = slot.split(':').map(Number);
            const slotTime = new Date();
            slotTime.setHours(h, m, 0, 0);
            return slotTime <= now;
          };

          const available = (response.availableSlots || []).filter(s => !isPastSlot(s));
          const pastSlots = (response.availableSlots || []).filter(s => isPastSlot(s));
          const booked = [...(response.bookedSlots || []), ...pastSlots];

          setAvailableSlots(available);
          setBookedSlots(booked);
          
          // Show message if no slots available
          if (!response.availableSlots || response.availableSlots.length === 0) {
            if (response.message) {
              toast.info(response.message);
            } else {
              toast.info('No available time slots for this date');
            }
          }
        } catch (error) {
          const errorMsg = error.response?.data?.msg || 'Failed to load available time slots';
          toast.error(errorMsg);
          setAvailableSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    } else {
      // Reset slots when doctor or date is cleared
      setAvailableSlots([]);
      setBookedSlots([]);
    }
  }, [form.doctorId, form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'doctorId') {
      const doctor = doctors.find(doc => doc._id === value);
      setSelectedDoctor(doctor);
      setFeePreview(null);
      // Reset date and time when doctor changes
      setForm(prev => ({ ...prev, date: '', time: '' }));
      setAvailableSlots([]);
      // Fetch fee preview for selected doctor
      if (doctor?.doctorDetails?.consultationFee) {
        getPaymentPreview(doctor.doctorDetails.consultationFee)
          .then(data => { if (data.success) setFeePreview(data.breakdown); })
          .catch(() => {});
      }
    }
    
    if (name === 'date') {
      // Reset time when date changes
      setForm(prev => ({ ...prev, time: '' }));
    }
  };

  const formatSlot = (slot) => {
    const [h, m] = slot.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleVoiceTranscript = (transcript) => {
    setForm(prev => ({
      ...prev,
      reason: prev.reason + (prev.reason ? ' ' : '') + transcript
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Check that a doctor is selected
    if (!selectedDoctor) {
      return toast.error('Please select a doctor');
    }
    
    try {
      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Prepare booking details with fee
      const doctorFee = selectedDoctor.doctorDetails?.consultationFee || 500;
      // Always compute totalAmount: use feePreview if available, else calculate inline (fee + ₹20 service fee)
      const serviceFee = feePreview?.platformServiceFee ?? 20;
      const totalAmount = feePreview?.totalAmount ?? (doctorFee + serviceFee);

      const bookingDetails = {
        ...form,
        doctorName: selectedDoctor.name,
        fees: doctorFee,
        totalAmount,
        email: user.email || '',
        patientId: user._id
      };
      
      // Process payment using the useRazorpay hook
      const result = await processPayment(bookingDetails);
      
      // Payment successful - navigate regardless of result structure
      toast.success('Payment Successful! Appointment booked');
      setForm({ name: '', age: '', gender: '', date: '', time: '', reason: '', doctorId: '' });
      setAvailableSlots([]);
      setSelectedDoctor(null);
      
      // Navigate after a short delay to ensure toast is visible
      setTimeout(() => {
        navigate('/my-appointments');
      }, 1000);
      
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.message || err.response?.data?.msg || 'Payment Failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Book an Appointment</h1>
      </div>
      <div className="text-center mb-4 sm:mb-6 md:mb-8 -mt-2 sm:-mt-4">
        <p className="text-health-text-p text-xs sm:text-sm md:text-base">Schedule your consultation with our expert doctors</p>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
          <FormSection title="Patient Information" icon={<User size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Age" className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" required />
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" required>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection title="Select Doctor" icon={<Stethoscope size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Choose Doctor</label>
              <select name="doctorId" value={form.doctorId} onChange={handleChange} className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" required disabled={loading}>
                <option value="">{loading ? 'Loading doctors...' : 'Select a Doctor'}</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.doctorDetails?.specialization || 'General'}
                  </option>
                ))}
              </select>
            </div>
            {selectedDoctor && (
              <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-blue-800">Consultation Fee:</span>
                  <span className="text-base sm:text-lg font-bold text-blue-900">₹{selectedDoctor.doctorDetails?.consultationFee || 500}</span>
                </div>
                {feePreview ? (
                  <div className="mt-2 space-y-1 text-xs text-blue-700 border-t border-blue-200 pt-2">
                    <div className="flex justify-between">
                      <span>Doctor consultation fee</span>
                      <span>₹{feePreview.doctorFees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform service fee</span>
                      <span>₹{feePreview.platformServiceFee}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-blue-900 border-t border-blue-300 pt-1 mt-1 text-sm">
                      <span>Total payable</span>
                      <span>₹{feePreview.totalAmount}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-blue-600 mt-1">Payment will be processed via Razorpay</p>
                )}
              </div>
            )}
          </FormSection>

          <FormSection title="Appointment Details" icon={<Calendar size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" min={minDate} required disabled={!form.doctorId} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Time Slot</label>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                    <Loader2 className="animate-spin" size={16} /> Loading slots...
                  </div>
                ) : !form.date ? (
                  <p className="text-xs text-slate-400 py-2">Select a date first</p>
                ) : availableSlots.length === 0 && bookedSlots.length === 0 ? (
                  <p className="text-xs text-amber-600 py-2">No slots available for this date.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {/* Available slots */}
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, time: slot }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          form.time === slot
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-teal-500 hover:text-teal-600'
                        }`}
                      >
                        {formatSlot(slot)}
                      </button>
                    ))}
                    {/* Booked / past slots — shown but unclickable */}
                    {bookedSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        disabled
                        title="This slot is unavailable"
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed line-through"
                      >
                        {formatSlot(slot)}
                      </button>
                    ))}
                  </div>
                )}
                {/* Hidden input to keep form validation working */}
                <input type="hidden" name="time" value={form.time} required />
                {!slotsLoading && form.date && form.time === '' && availableSlots.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">Please select a time slot</p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Reason for Visit" icon={<MessageSquare size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Describe your symptoms</label>
              <div className="relative">
                <textarea 
                  name="reason" 
                  value={form.reason} 
                  onChange={handleChange} 
                  placeholder="Describe your symptoms or reason for visit..." 
                  rows="4" 
                  className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 pr-10 sm:pr-12 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <div className="absolute top-2 right-2">
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>
              </div>
            </div>
          </FormSection>

          <div className="text-center pt-2 sm:pt-4">
            <button type="submit" className="w-full sm:w-auto bg-teal-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50 text-sm sm:text-base" disabled={loading || !form.doctorId || !form.time || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin sm:w-5 sm:h-5" size={18} />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} className="sm:w-5 sm:h-5" />
                  <span>Pay & Book Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;


