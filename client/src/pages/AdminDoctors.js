import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import AdminNavbar from '../components/AdminNavbar';
import DoctorCard from '../components/DoctorCard';

const AdminDoctorsNew = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [doctorsBySpecialization, setDoctorsBySpecialization] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [specializationLoading, setSpecializationLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    qualifications: '',
    clinicName: '',
    clinicAddress: '',
    consultationFee: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    const filterDoctors = () => {
      if (!searchTerm.trim()) {
        setFilteredDoctors(doctors);
        return;
      }

      const filtered = doctors.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.profile?.phone?.includes(searchTerm) ||
        doctor.doctorDetails?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    };

    filterDoctors();
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors using new API...');
      const response = await axios.get('/admin/doctors/new');
      console.log('New API Response:', response.data);

      if (!response.data) {
        throw new Error('No data received from API');
      }

      // Get doctors from the response
      const doctors = response.data.doctors || [];
      console.log(`Received ${doctors.length} doctors from new API`);

      setDoctors(doctors);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error response:', error.response);
      toast.error(`Failed to load doctors: ${error.message}`);
      setDoctors([]);
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get('/doctors/specializations');
      setSpecializations(response.data || []);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      toast.error('Failed to load specializations');
    }
  };

  const fetchDoctorsBySpecialization = async (specialization) => {
    try {
      setSpecializationLoading(true);
      setSelectedSpecialization(specialization);
      
      const response = await axios.get(`/admin/doctors/new/specialization/${encodeURIComponent(specialization)}`);
      
      if (response.data.success) {
        setDoctorsBySpecialization(response.data.doctors || []);
      } else {
        toast.error('Failed to fetch doctors by specialization');
        setDoctorsBySpecialization([]);
      }
    } catch (error) {
      console.error('Error fetching doctors by specialization:', error);
      toast.error('Failed to load doctors for this specialization');
      setDoctorsBySpecialization([]);
    } finally {
      setSpecializationLoading(false);
    }
  };

  const handleSpecializationClick = (specialization) => {
    fetchDoctorsBySpecialization(specialization);
  };

  const handleDoctorSelect = async (doctorId) => {
    try {
      const response = await axios.get(`/doctors/${doctorId}`);
      setSelectedDoctor(response.data);
      setShowDoctorModal(true);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to load doctor profile');
    }
  };

  const closeDoctorModal = () => {
    setShowDoctorModal(false);
    setSelectedDoctor(null);
    // Refresh the page to show updated doctor list
    window.location.reload();
  };

  const handleViewProfile = (doctor) => {
    closeDoctorModal();
    // Navigate to doctor profile page
    window.open(`/doctor/${doctor._id}`, '_blank');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create new doctor
      await axios.post('/admin/doctors', form);
      toast.success('Doctor created successfully');

      // Reset form and close modal
      setForm({
        name: '',
        email: '',
        password: '',
        specialization: '',
        qualifications: '',
        clinicName: '',
        clinicAddress: '',
        consultationFee: '',
        phone: '',
        age: '',
        gender: '',
        bloodGroup: ''
      });

      setShowForm(false);
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error(error.response?.data?.msg || 'Failed to save doctor');
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    const action = newStatus ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} this doctor?`)) {
      try {
        await axios.patch(`/admin/doctors/new/${id}/toggle-active`);
        toast.success(`Doctor ${action}d successfully`);
        fetchDoctors();
      } catch (error) {
        console.error('Error toggling doctor status:', error);
        toast.error(error.response?.data?.msg || `Failed to ${action} doctor`);
      }
    }
  };

  const handleAddNew = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      specialization: '',
      qualifications: '',
      clinicName: '',
      clinicAddress: '',
      consultationFee: '',
      phone: '',
      age: '',
      gender: '',
      bloodGroup: ''
    });
    setShowForm(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  return (
    <>
      <div className='container mt-5'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h2>Manage Doctors</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search doctors by name, email, phone, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>
              Clear
            </button>
          </div>
        </div>

        {/* Specialization Filter Section */}
        <div className="mb-4">
          <h4>Filter by Specialization</h4>
          <div className="d-flex flex-wrap gap-2">
            {specializations.map((spec) => (
              <button
                key={spec}
                className={`btn btn-outline-primary btn-sm ${selectedSpecialization === spec ? 'active' : ''}`}
                onClick={() => handleSpecializationClick(spec)}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors by Specialization Dropdown */}
        {selectedSpecialization && (
          <div className="mb-4">
            <h5>Doctors in {selectedSpecialization}</h5>
            {specializationLoading ? (
              <div className="text-center">Loading doctors...</div>
            ) : (
              <div className="mb-3">
                <select 
                  className="form-select"
                  onChange={(e) => handleDoctorSelect(e.target.value)}
                  defaultValue=""
                >
                  <option value="">Select a doctor</option>
                  {doctorsBySpecialization.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.doctorDetails?.experience || 0} years experience
                    </option>
                  ))}
                </select>
                {doctorsBySpecialization.length === 0 && (
                  <div className="text-muted mt-2">No doctors found for this specialization</div>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className='text-center'>Loading doctors...</div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-striped table-hover'>
              <thead className='table-dark'>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Phone</th>
                  <th>Register Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor, index) => (
                  <tr key={doctor._id || index}>
                    <td>{doctor.name || 'N/A'}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.doctorDetails?.specialization || 'N/A'}</td>
                    <td>{doctor.profile?.phone || 'N/A'}</td>
                    <td>{formatDate(doctor.createdAt)}</td>
                    <td>
                      <span className={`badge ${doctor.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${doctor.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(doctor._id, !doctor.isActive)}
                      >
                        {doctor.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDoctors.length === 0 && (
              <div className='text-center py-4'>
                <p>No doctors found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Doctor Form Modal */}
      {showForm && (
        <div className='modal fade show d-block' tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Add New Doctor</h5>
                <button type='button' className='btn-close' onClick={() => setShowForm(false)}></button>
              </div>
              <div className='modal-body'>
                <form onSubmit={handleSubmit}>
                  <div className='row mb-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Name</label>
                      <input
                        type='text'
                        name='name'
                        value={form.name}
                        onChange={handleInputChange}
                        className='form-control'
                        required
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Email</label>
                      <input
                        type='email'
                        name='email'
                        value={form.email}
                        onChange={handleInputChange}
                        className='form-control'
                        required
                      />
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Password</label>
                      <input
                        type='password'
                        name='password'
                        value={form.password}
                        onChange={handleInputChange}
                        className='form-control'
                        required
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Phone</label>
                      <input
                        type='text'
                        name='phone'
                        value={form.phone}
                        onChange={handleInputChange}
                        className='form-control'
                      />
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Age</label>
                      <input
                        type='number'
                        name='age'
                        value={form.age}
                        onChange={handleInputChange}
                        className='form-control'
                        min='1'
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Gender</label>
                      <select
                        name='gender'
                        value={form.gender}
                        onChange={handleInputChange}
                        className='form-control'
                      >
                        <option value=''>Select Gender</option>
                        <option value='Male'>Male</option>
                        <option value='Female'>Female</option>
                        <option value='Other'>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Blood Group</label>
                      <select
                        name='bloodGroup'
                        value={form.bloodGroup}
                        onChange={handleInputChange}
                        className='form-control'
                      >
                        <option value=''>Select Blood Group</option>
                        <option value='A+'>A+</option>
                        <option value='A-'>A-</option>
                        <option value='B+'>B+</option>
                        <option value='B-'>B-</option>
                        <option value='AB+'>AB+</option>
                        <option value='AB-'>AB-</option>
                        <option value='O+'>O+</option>
                        <option value='O-'>O-</option>
                      </select>
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Specialization</label>
                      <input
                        type='text'
                        name='specialization'
                        value={form.specialization}
                        onChange={handleInputChange}
                        className='form-control'
                      />
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='col-md-12'>
                      <label className='form-label'>Qualifications</label>
                      <input
                        type='text'
                        name='qualifications'
                        value={form.qualifications}
                        onChange={handleInputChange}
                        className='form-control'
                        placeholder='Separate with comma'
                      />
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Clinic Name</label>
                      <input
                        type='text'
                        name='clinicName'
                        value={form.clinicName}
                        onChange={handleInputChange}
                        className='form-control'
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Clinic Address</label>
                      <input
                        type='text'
                        name='clinicAddress'
                        value={form.clinicAddress}
                        onChange={handleInputChange}
                        className='form-control'
                      />
                    </div>
                  </div>

                  <div className='mb-3'>
                    <label className='form-label'>Consultation Fee (₹)</label>
                    <input
                      type='number'
                      name='consultationFee'
                      value={form.consultationFee}
                      onChange={handleInputChange}
                      className='form-control'
                      min='0'
                    />
                  </div>

                  <div className='modal-footer'>
                    <button type='button' className='btn btn-secondary' onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                    <button type='submit' className='btn btn-primary'>
                      Add Doctor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Profile Modal */}
      {showDoctorModal && selectedDoctor && (
        <div className='modal fade show d-block' tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-lg'>
            <div className='modal-content doctor-profile-modal'>
              <div className='modal-header'>
                <h5 className='modal-title'>Doctor Profile</h5>
                <button type='button' className='btn-close' onClick={closeDoctorModal}></button>
              </div>
              <div className='modal-body doctor-profile-modal-body'>
                <DoctorCard
                  doctor={selectedDoctor}
                  showFullDetails={true}
                  showBookAppointmentButton={false}
                  onViewProfile={handleViewProfile}
                />
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' onClick={closeDoctorModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDoctorsNew;
