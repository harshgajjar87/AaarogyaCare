import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
// PatientNavbar removed - already handled in Layout component
import { getAllDoctors } from '../api/doctorAPI';
import { createAppointment, getAvailableSlots } from '../api/appointmentAPI';

const AppointmentForm = () => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    date: '',
    time: '',
    reason: '',
    doctorId: ''
  });
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getAllDoctors();
        setDoctors(response.doctors || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to load doctors');
        setLoading(false);
      }
    };
    fetchDoctors();

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setMinDate(today);
  }, []);

  // Fetch doctor availability when doctorId changes
  useEffect(() => {
    const fetchDoctorAvailability = async () => {
      if (!form.doctorId) {
        setDoctorAvailability(null);
        setFilteredTimeSlots([]);
        return;
      }

      try {
        const response = await axios.get(`/doctors/${form.doctorId}`);
        const doctor = response.data;
        setSelectedDoctor(doctor);
        setDoctorAvailability(doctor.doctorDetails?.availability || []);

        // Don't generate time slots until a date is selected
        setFilteredTimeSlots([]);
      } catch (error) {
        console.error('Error fetching doctor availability:', error);
        toast.error('Failed to load doctor availability');
        setFilteredTimeSlots([]);
      }
    };

    fetchDoctorAvailability();
  }, [form.doctorId]);

  const handleChange = e => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    
    // Fetch available slots when date changes
    if (name === 'date' && updatedForm.doctorId && value) {
      fetchAvailableSlots(updatedForm.doctorId, value);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await getAvailableSlots(doctorId, date);
      setFilteredTimeSlots(response.availableSlots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
      setFilteredTimeSlots([]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createAppointment(form);
      toast.success('Appointment Requested');
      setForm({
        name: '',
        age: '',
        gender: '',
        date: '',
        time: '',
        reason: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Booking Failed');
    }
  };

  // Time slots will be dynamically generated based on doctor availability

  return (
    <>
      <div className='container mt-4'>
        <div className='welcome-section mb-4 text-center'>
          <h2 className='welcome-title'>Book an Appointment</h2>
          <p className='text-muted'>Schedule your consultation with our expert doctors</p>
        </div>

        <div className='row justify-content-center'>
          <div className='col-lg-8'>
            <div className='card shadow-sm enhanced-card mb-4'>
              <div className='card-header enhanced-header text-center'>
                <h5 className='mb-0'>
                  <i className="fas fa-calendar-plus me-2"></i>
                  Appointment Details
                </h5>
              </div>
              <div className='card-body p-4'>
                <form onSubmit={handleSubmit}>

                  {/* Patient Information Section */}
                  <div className='mb-4'>
                    <h6 className='fw-bold text-primary mb-3'>
                      <i className="fas fa-user me-2"></i>
                      Patient Information
                    </h6>
                    <div className='row'>
                      <div className='col-md-6 mb-3'>
                        <label className='form-label fw-semibold'>Patient Name</label>
                        <input
                          type='text'
                          name='name'
                          value={form.name}
                          onChange={handleChange}
                          className='form-control enhanced-input'
                          placeholder='Enter your full name'
                          required
                        />
                      </div>
                      <div className='col-md-3 mb-3'>
                        <label className='form-label fw-semibold'>Age</label>
                        <input
                          type='number'
                          name='age'
                          value={form.age}
                          onChange={handleChange}
                          className='form-control enhanced-input'
                          placeholder='Age'
                          min='1'
                          required
                        />
                      </div>
                      <div className='col-md-3 mb-3'>
                        <label className='form-label fw-semibold'>Gender</label>
                        <select
                          name='gender'
                          value={form.gender}
                          onChange={handleChange}
                          className='form-control enhanced-input'
                          required
                        >
                          <option value=''>Select Gender</option>
                          <option value='Male'>Male</option>
                          <option value='Female'>Female</option>
                          <option value='Other'>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Selection Section */}
                  <div className='mb-4'>
                    <h6 className='fw-bold text-primary mb-3'>
                      <i className="fas fa-user-md me-2"></i>
                      Select Doctor
                    </h6>
                    <div className='mb-3'>
                      {loading ? (
                        <div className='form-control enhanced-input d-flex align-items-center'>
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          Loading doctors...
                        </div>
                      ) : (
                        <select
                          name='doctorId'
                          value={form.doctorId}
                          onChange={handleChange}
                          className='form-control enhanced-input'
                          required
                        >
                          <option value=''>Select a Doctor</option>
                          {doctors.map((doctor) => (
                            <option key={doctor._id} value={doctor._id}>
                              {doctor.name} - {doctor.doctorDetails?.specialization || 'General Physician'}
                              {doctor.doctorDetails?.availability && doctor.doctorDetails.availability.length > 0 ? ' ✓ Available' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {selectedDoctor && selectedDoctor.doctorDetails?.availability && selectedDoctor.doctorDetails.availability.length > 0 && (
                      <div className="alert alert-info enhanced-alert">
                        <small className="fw-semibold">
                          <i className="fas fa-clock me-1"></i>
                          Doctor's Availability:
                        </small>
                        <div className='mt-2'>
                          {selectedDoctor.doctorDetails.availability.map((slot, index) => (
                            <span key={index} className="badge bg-primary me-2 mb-1">
                              {slot.day}: {slot.startTime}-{slot.endTime}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Appointment Details Section */}
                  <div className='mb-4'>
                    <h6 className='fw-bold text-primary mb-3'>
                      <i className="fas fa-calendar-check me-2"></i>
                      Appointment Details
                    </h6>
                    <div className='row'>
                      <div className='col-md-6 mb-3'>
                        <label className='form-label fw-semibold'>Preferred Date</label>
                        <input
                          type='date'
                          name='date'
                          value={form.date}
                          onChange={handleChange}
                          className='form-control enhanced-input'
                          min={minDate}
                          required
                        />
                      </div>
                      <div className='col-md-6 mb-3'>
                        <label className='form-label fw-semibold'>Preferred Time</label>
                        <select
                          name='time'
                          value={form.time}
                          onChange={handleChange}
                          className='form-control enhanced-input'
                          required
                          disabled={!form.doctorId || !form.date || filteredTimeSlots.length === 0}
                        >
                          <option value=''>Select Time</option>
                          {filteredTimeSlots.map((slot, index) => (
                            <option key={index} value={slot}>{slot}</option>
                          ))}
                        </select>
                        {doctorAvailability && doctorAvailability.length > 0 && (
                          <small className="text-muted d-block mt-1">
                            <i className="fas fa-info-circle me-1"></i>
                            Available times based on doctor's schedule
                          </small>
                        )}
                        {form.doctorId && form.date && filteredTimeSlots.length === 0 && (
                          <small className="text-danger d-block mt-1">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            No available time slots for the selected date
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason Section */}
                  <div className='mb-4'>
                    <h6 className='fw-bold text-primary mb-3'>
                      <i className="fas fa-comment-medical me-2"></i>
                      Consultation Details
                    </h6>
                    <div className='mb-3'>
                      <label className='form-label fw-semibold'>Reason for Visit</label>
                      <textarea
                        name='reason'
                        value={form.reason}
                        onChange={handleChange}
                        className='form-control enhanced-input'
                        rows='4'
                        placeholder='Please describe your symptoms, concerns, or reason for the appointment...'
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className='text-center'>
                    <button
                      className='btn btn-success enhanced-btn px-5 py-2'
                      disabled={loading || !form.doctorId}
                      type='submit'
                    >
                      <i className="fas fa-calendar-check me-2"></i>
                      Book Appointment
                    </button>
                    {loading && (
                      <div className='mt-3'>
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentForm;


