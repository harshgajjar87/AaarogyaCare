import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllDoctors } from '../api/doctorAPI';
import { createAppointment, getAvailableSlots } from '../api/appointmentAPI';
import { createPaymentOrder, verifyPaymentAndBook } from '../api/paymentAPI';
import useRazorpay from '../hooks/useRazorpay';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Clock, MessageSquare, Stethoscope, Book, Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

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
        } catch (error) {
          toast.error('Failed to load available time slots');
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [form.doctorId, form.date]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
    
    // If doctor is selected, store doctor details
    if (name === 'doctorId') {
      const doctor = doctors.find(doc => doc._id === value);
      setSelectedDoctor(doctor);
    }
  }, [doctors]);

  const handleVoiceTranscript = useCallback((transcript) => {
    setForm(prevForm => ({
      ...prevForm,
      reason: prevForm.reason + (prevForm.reason ? ' ' : '') + transcript
    }));
  }, []);

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

  const FormSection = React.memo(({ title, icon, children }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-health-text-h flex items-center gap-2 border-b pb-2">
        {icon}
        <span>{title}</span>
      </h3>
      {children}
    </div>
  ));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">Book an Appointment</h1>
      </div>
      <div className="text-center mb-8 -mt-4">
        <p className="text-health-text-p">Schedule your consultation with our expert doctors</p>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection title="Patient Information" icon={<User size={20} className="text-health-primary" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full rounded-lg border-slate-300" required />
              <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Age" className="w-full rounded-lg border-slate-300" required />
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full rounded-lg border-slate-300" required>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </FormSection>

          <FormSection title="Select Doctor" icon={<Stethoscope size={20} className="text-health-primary" />}>
            <select name="doctorId" value={form.doctorId} onChange={handleChange} className="w-full rounded-lg border-slate-300" required disabled={loading}>
              <option value="">{loading ? 'Loading doctors...' : 'Select a Doctor'}</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.doctorDetails?.specialization || 'General'}
                </option>
              ))}
            </select>
            {selectedDoctor && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Consultation Fee:</span>
                  <span className="text-lg font-bold text-blue-900">₹{selectedDoctor.doctorDetails?.consultationFee || 500}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Payment will be processed via Razorpay</p>
              </div>
            )}
          </FormSection>

          <FormSection title="Appointment Details" icon={<Calendar size={20} className="text-health-primary" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-lg border-slate-300" min={minDate} required disabled={!form.doctorId} />
              <div className="relative">
                <select name="time" value={form.time} onChange={handleChange} className="w-full rounded-lg border-slate-300" required disabled={!form.date || slotsLoading || availableSlots.length === 0}>
                  <option value="">{slotsLoading ? 'Loading slots...' : 'Select Time'}</option>
                  {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                {slotsLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={20}/>}
              </div>
            </div>
          </FormSection>

          <FormSection title="Reason for Visit" icon={<MessageSquare size={20} className="text-health-primary" />}>
            <div className="relative">
              <textarea 
                name="reason" 
                value={form.reason} 
                onChange={handleChange} 
                placeholder="Describe your symptoms or reason for visit..." 
                rows="4" 
                className="w-full rounded-lg border-slate-300 pr-12"
              />
              <div className="absolute top-2 right-2">
                <VoiceInput onTranscript={handleVoiceTranscript} />
              </div>
            </div>
          </FormSection>

          <div className="text-center pt-4">
            <button type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50" disabled={loading || !form.doctorId || !form.time || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
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


