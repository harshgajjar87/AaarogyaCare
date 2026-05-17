import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { getAllDoctors } from '../api/doctorAPI';
import { getAvailableSlots } from '../api/appointmentAPI';
import { getPaymentPreview } from '../api/paymentAPI';
import useRazorpay from '../hooks/useRazorpay';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  User, Calendar, MessageSquare, Stethoscope,
  Loader2, ArrowLeft, CreditCard, UserCheck, UserPlus
} from 'lucide-react';
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

const EMPTY_FORM = { name: '', age: '', gender: '', phone: '', date: '', time: '', reason: '', doctorId: '' };

const AppointmentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processPayment, isProcessing } = useRazorpay();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [bookingForSelf, setBookingForSelf] = useState(true);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [feePreview, setFeePreview] = useState(null);

  // Auto-fill from logged-in user profile
  const fillFromUser = () => {
    if (!user) return;
    setForm(prev => ({
      ...prev,
      name: user.name || '',
      age: user.profile?.age?.toString() || '',
      gender: capitalizeGender(user.profile?.gender) || '',
      phone: user.profile?.phone || '',
    }));
    setErrors({});
  };

  const capitalizeGender = (g) => {
    if (!g) return '';
    return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getAllDoctors({ limit: 1000 });
        setDoctors(response.doctors || []);

        const preSelectedDoctor = location.state?.selectedDoctor;
        if (preSelectedDoctor) {
          setForm(prev => ({ ...prev, doctorId: preSelectedDoctor._id }));
          setSelectedDoctor(preSelectedDoctor);
          if (preSelectedDoctor.doctorDetails?.consultationFee) {
            getPaymentPreview(preSelectedDoctor.doctorDetails.consultationFee)
              .then(data => { if (data.success) setFeePreview(data.breakdown); })
              .catch(() => {});
          }
        }
      } catch {
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
    setMinDate(new Date().toISOString().split('T')[0]);
  }, [location.state]);

  // Auto-fill on mount when booking for self
  useEffect(() => {
    if (bookingForSelf) fillFromUser();
    else setForm(prev => ({ ...prev, name: '', age: '', gender: '', phone: '' }));
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingForSelf]);

  useEffect(() => {
    if (form.doctorId && form.date) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const response = await getAvailableSlots(form.doctorId, form.date);
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

          if (!response.availableSlots || response.availableSlots.length === 0) {
            toast.info(response.message || 'No available time slots for this date');
          }
        } catch (error) {
          toast.error(error.response?.data?.msg || 'Failed to load available time slots');
          setAvailableSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
      setBookedSlots([]);
    }
  }, [form.doctorId, form.date]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    const name = form.name.trim();
    if (!name) e.name = 'Full name is required.';
    else if (name.length < 2) e.name = 'Name must be at least 2 characters.';
    else if (!/^[a-zA-Z\s.'-]+$/.test(name)) e.name = 'Name can only contain letters, spaces, and . \' -';

    const age = Number(form.age);
    if (!form.age) e.age = 'Age is required.';
    else if (!Number.isInteger(age) || age < 1 || age > 120)
      e.age = 'Age must be a whole number between 1 and 120.';

    if (!form.gender) e.gender = 'Please select a gender.';

    if (form.phone) {
      if (!/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
        e.phone = 'Phone must be a 10-digit number.';
    }

    if (!form.doctorId) e.doctorId = 'Please select a doctor.';
    if (!form.date) e.date = 'Please select a date.';
    if (!form.time) e.time = 'Please select a time slot.';

    const reason = form.reason.trim();
    if (!reason) e.reason = 'Please describe your reason for visit.';
    else if (reason.length < 10) e.reason = 'Please provide at least 10 characters.';

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Age: block non-integer input
    if (name === 'age') {
      if (value !== '' && !/^\d+$/.test(value)) return;
    }

    // Phone: digits only
    if (name === 'phone') {
      if (value !== '' && !/^\d*$/.test(value)) return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'doctorId') {
      const doctor = doctors.find(doc => doc._id === value);
      setSelectedDoctor(doctor || null);
      setFeePreview(null);
      setForm(prev => ({ ...prev, doctorId: value, date: '', time: '' }));
      setAvailableSlots([]);
      if (doctor?.doctorDetails?.consultationFee) {
        getPaymentPreview(doctor.doctorDetails.consultationFee)
          .then(data => { if (data.success) setFeePreview(data.breakdown); })
          .catch(() => {});
      }
    }

    if (name === 'date') {
      setForm(prev => ({ ...prev, date: value, time: '' }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    try {
      const doctorFee = selectedDoctor.doctorDetails?.consultationFee || 500;
      const serviceFee = feePreview?.platformServiceFee ?? 20;
      const totalAmount = feePreview?.totalAmount ?? (doctorFee + serviceFee);

      const bookingDetails = {
        ...form,
        name: form.name.trim(),
        reason: form.reason.trim(),
        doctorName: selectedDoctor.name,
        fees: doctorFee,
        totalAmount,
        email: user.email || '',
        patientId: user._id,
      };

      await processPayment(bookingDetails);
      toast.success('Payment Successful! Appointment booked');
      setForm(EMPTY_FORM);
      setAvailableSlots([]);
      setSelectedDoctor(null);
      setTimeout(() => navigate('/my-appointments'), 1000);
    } catch (err) {
      toast.error(err.message || err.response?.data?.msg || 'Payment Failed');
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg border py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-300'
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
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
        <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-6 md:space-y-8">

          {/* ── Patient Information ─────────────────────────────────────── */}
          <FormSection title="Patient Information" icon={<User size={18} className="text-health-primary sm:w-5 sm:h-5" />}>

            {/* Booking toggle */}
            <div className="flex gap-2 sm:gap-3 mb-1">
              <button
                type="button"
                onClick={() => setBookingForSelf(true)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                  bookingForSelf
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
                }`}
              >
                <UserCheck size={14} className="sm:w-4 sm:h-4" />
                Booking for myself
              </button>
              <button
                type="button"
                onClick={() => setBookingForSelf(false)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                  !bookingForSelf
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
                }`}
              >
                <UserPlus size={14} className="sm:w-4 sm:h-4" />
                Booking for someone else
              </button>
            </div>

            {bookingForSelf && (
              <p className="text-xs text-slate-500 -mt-1">
                Details auto-filled from your profile.{' '}
                <button type="button" onClick={fillFromUser} className="text-teal-600 underline hover:text-teal-700">
                  Re-fill
                </button>
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className={inputClass('name')}
                  readOnly={bookingForSelf}
                  onFocus={e => { if (bookingForSelf) e.target.readOnly = false; }}
                />
                <ErrorMsg field="name" />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 28"
                  min="1"
                  max="120"
                  step="1"
                  className={inputClass('age')}
                />
                <ErrorMsg field="age" />
              </div>

              {/* Gender */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={inputClass('gender')}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <ErrorMsg field="gender" />
              </div>

              {/* Phone */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={inputClass('phone')}
                />
                <ErrorMsg field="phone" />
              </div>
            </div>
          </FormSection>

          {/* ── Select Doctor ───────────────────────────────────────────── */}
          <FormSection title="Select Doctor" icon={<Stethoscope size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Choose Doctor <span className="text-red-500">*</span>
              </label>
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                className={inputClass('doctorId')}
                disabled={loading}
              >
                <option value="">{loading ? 'Loading doctors...' : 'Select a Doctor'}</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} — {doctor.doctorDetails?.specialization || 'General'}
                  </option>
                ))}
              </select>
              <ErrorMsg field="doctorId" />
            </div>

            {selectedDoctor && (
              <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 overflow-hidden">
                {/* Header */}
                <div className="bg-teal-600 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <CreditCard size={15} />
                    Price Summary
                  </span>
                  <span className="text-teal-100 text-xs">Secured by Razorpay</span>
                </div>

                {feePreview ? (
                  <div className="px-4 py-3 space-y-2 text-sm">
                    {/* Line items */}
                    <div className="flex justify-between text-slate-600">
                      <span>Consultation fee</span>
                      <span className="font-medium text-slate-800">₹{feePreview.doctorFees}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        Platform service fee
                        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">one-time</span>
                      </span>
                      <span className="font-medium text-slate-800">₹{feePreview.platformServiceFee}</span>
                    </div>

                    {/* Divider + Total */}
                    <div className="border-t border-teal-200 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Total payable</span>
                      <span className="text-lg font-bold text-teal-700">₹{feePreview.totalAmount}</span>
                    </div>

                    <p className="text-xs text-slate-400 pt-0.5">
                      No hidden charges. Amount shown is final.
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={14} className="animate-spin text-teal-500" />
                    Calculating fee breakdown...
                  </div>
                )}
              </div>
            )}
          </FormSection>

          {/* ── Appointment Details ─────────────────────────────────────── */}
          <FormSection title="Appointment Details" icon={<Calendar size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={inputClass('date')}
                  min={minDate}
                  disabled={!form.doctorId}
                />
                {!form.doctorId && <p className="text-xs text-slate-400 mt-1">Select a doctor first</p>}
                <ErrorMsg field="date" />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  Time Slot <span className="text-red-500">*</span>
                </label>
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
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => { setForm(prev => ({ ...prev, time: slot })); setErrors(prev => ({ ...prev, time: '' })); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          form.time === slot
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-teal-500 hover:text-teal-600'
                        }`}
                      >
                        {formatSlot(slot)}
                      </button>
                    ))}
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
                <input type="hidden" name="time" value={form.time} />
                <ErrorMsg field="time" />
              </div>
            </div>
          </FormSection>

          {/* ── Reason for Visit ────────────────────────────────────────── */}
          <FormSection title="Reason for Visit" icon={<MessageSquare size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Describe your symptoms <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Describe your symptoms or reason for visit (min. 10 characters)..."
                  rows="4"
                  className={`${inputClass('reason')} pr-10 sm:pr-12`}
                />
                <div className="absolute top-2 right-2">
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <ErrorMsg field="reason" />
                <span className={`text-xs ml-auto ${form.reason.trim().length < 10 ? 'text-slate-400' : 'text-teal-600'}`}>
                  {form.reason.trim().length} chars
                </span>
              </div>
            </div>
          </FormSection>

          <div className="text-center pt-2 sm:pt-4">
            {feePreview && (
              <p className="text-sm text-slate-500 mb-2">
                You will be charged <span className="font-bold text-teal-700">₹{feePreview.totalAmount}</span>
              </p>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto bg-teal-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50 text-sm sm:text-base"
              disabled={loading || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin sm:w-5 sm:h-5" size={18} />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} className="sm:w-5 sm:h-5" />
                  <span>Pay {feePreview ? `₹${feePreview.totalAmount} & ` : '& '}Book Appointment</span>
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
