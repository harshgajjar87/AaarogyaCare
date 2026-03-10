import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllDoctors } from '../api/doctorAPI';
import { createAppointment, getAvailableSlots } from '../api/appointmentAPI';
import { createPaymentOrder, verifyPaymentAndBook } from '../api/paymentAPI';
import useRazorpay from '../hooks/useRazorpay';
import { useNavigate } from 'react-router-dom';
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
  const { processPayment, isProcessing } = useRazorpay();
  const [form, setForm] = useState({
    name: '', age: '', gender: '', date: '', time: '', reason: '', doctorId: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getAllDoctors();
        setDoctors(response.doctors || []);
      } catch (error) {
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
    setMinDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (form.doctorId && form.date) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const response = await getAvailableSlots(form.doctorId, form.date);
          setAvailableSlots(response.availableSlots || []);
          
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
    }
  }, [form.doctorId, form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'doctorId') {
      const doctor = doctors.find(doc => doc._id === value);
      setSelectedDoctor(doctor);
      // Reset date and time when doctor changes
      setForm(prev => ({ ...prev, date: '', time: '' }));
      setAvailableSlots([]);
    }
    
    if (name === 'date') {
      // Reset time when date changes
      setForm(prev => ({ ...prev, time: '' }));
    }
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
      const bookingDetails = {
        ...form,
        doctorName: selectedDoctor.name,
        fees: selectedDoctor.doctorDetails?.consultationFee || 500, // Default fee if not set
        email: user.email || '',
        patientId: user._id
      };
      
      // Process payment using the useRazorpay hook
      const result = await processPayment(bookingDetails);
      
      if (result.success) {
        toast.success('Payment Successful! Appointment booked');
        setForm({ name: '', age: '', gender: '', date: '', time: '', reason: '', doctorId: '' });
        setAvailableSlots([]);
        setSelectedDoctor(null);
        navigate('/my-appointments');
      }
    } catch (err) {
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
                <p className="text-xs text-blue-600 mt-1">Payment will be processed via Razorpay</p>
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
                <div className="relative">
                  <select name="time" value={form.time} onChange={handleChange} className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" required disabled={!form.date || slotsLoading || availableSlots.length === 0}>
                    <option value="">
                      {slotsLoading ? 'Loading slots...' : 
                       !form.date ? 'Select a date first' :
                       availableSlots.length === 0 ? 'No slots available' : 
                       'Select Time'}
                    </option>
                    {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                  {slotsLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400 pointer-events-none" size={18}/>}
                </div>
                {!slotsLoading && form.date && availableSlots.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No available slots for this date. Please try another date.</p>
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
                  <Loader2 className="animate-spin" size={18} className="sm:w-5 sm:h-5" />
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


