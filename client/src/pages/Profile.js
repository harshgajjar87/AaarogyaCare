import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';   // ✅ use our axios instance
import { toast } from 'react-toastify';
import { getProfileImageUrl, getClinicImageUrl } from '../utils/imageUtils';
import { updateDoctorProfile } from '../api/doctorAPI';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/components/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    profile: {
      age: '',
      gender: '',
      phone: '',
      address: '',
      bloodGroup: '',
      emergencyContact: ''
    },
    doctorDetails: {
      specialization: '',
      experience: '',
      qualifications: '',
      clinicName: '',
      clinicAddress: '',
      consultationFee: '',
      about: '',
      expertise: {
        conditions: '',
        treatments: ''
      }
    },
    availability: {}
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [clinicImages, setClinicImages] = useState([]);
  const [clinicImageFiles, setClinicImageFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

const fetchUserProfile = async () => {
  try {
    const res = await axios.get('/profile/me');  // ✅ no token needed manually
      setUser(res.data);

      const baseFormData = {
        name: res.data.name,
        profile: {
          age: res.data.profile?.age || '',
          gender: res.data.profile?.gender || '',
          phone: res.data.profile?.phone || '',
          address: res.data.profile?.address || '',
          bloodGroup: res.data.profile?.bloodGroup || '',
          emergencyContact: res.data.profile?.emergencyContact || res.data.emergencyContact || ''
        }
      };

      if (res.data.role === 'doctor') {
        baseFormData.doctorDetails = {
          specialization: res.data.doctorDetails?.specialization || '',
          experience: res.data.doctorDetails?.experience || '',
          qualifications: res.data.doctorDetails?.qualifications?.join(', ') || '',
          clinicName: res.data.doctorDetails?.clinicName || '',
          clinicAddress: res.data.doctorDetails?.clinicAddress || '',
          consultationFee: res.data.doctorDetails?.consultationFee || '',
          about: res.data.doctorDetails?.about || '',
          expertise: {
            conditions: res.data.doctorDetails?.expertise?.conditions?.join(', ') || '',
            treatments: res.data.doctorDetails?.expertise?.treatments?.join(', ') || ''
          }
        };
      }

      setFormData(baseFormData);
      setPreviewImage(res.data.profileImage ? getProfileImageUrl(res.data.profileImage) : null);
      setClinicImages(res.data.doctorDetails?.clinicImages || []);
      
      // Initialize availability data
      if (res.data.role === 'doctor' && res.data.doctorDetails?.availability) {
        const availabilityObj = {};
        res.data.doctorDetails.availability.forEach(slot => {
          availabilityObj[slot.day] = {
            startTime: slot.startTime,
            endTime: slot.endTime
          };
        });
        setFormData(prev => ({...prev, availability: availabilityObj}));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch user profile', err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle availability inputs
    if (name.startsWith('availability.')) {
      const parts = name.split('.');
      const day = parts[1];
      const field = parts[2];
      
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [day]: {
            ...prev.availability[day],
            [field]: value
          }
        }
      }));
      return;
    }

    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else if (name.startsWith('doctorDetails.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        // Handle simple doctorDetails fields (e.g., doctorDetails.specialization)
        const doctorField = parts[1];
        setFormData(prev => ({
          ...prev,
          doctorDetails: {
            ...prev.doctorDetails,
            [doctorField]: value
          }
        }));
      } else if (parts.length === 3) {
        // Handle nested doctorDetails fields (e.g., doctorDetails.expertise.conditions)
        const mainField = parts[1];
        const nestedField = parts[2];
        setFormData(prev => ({
          ...prev,
          doctorDetails: {
            ...prev.doctorDetails,
            [mainField]: {
              ...prev.doctorDetails[mainField],
              [nestedField]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.profile.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (user.role === 'doctor') {
      if (!formData.doctorDetails.specialization.trim()) {
        toast.error('Specialization is required');
        return;
      }

      if (!formData.doctorDetails.experience) {
        toast.error('Experience is required');
        return;
      }

      if (!formData.doctorDetails.consultationFee) {
        toast.error('Consultation fee is required');
        return;
      }
    }

    try {
      const updateData = {
        name: formData.name,
        profile: formData.profile
      };

      if (user.role === 'doctor') {
        updateData.doctorDetails = {
          ...formData.doctorDetails,
          qualifications: formData.doctorDetails.qualifications
            ? formData.doctorDetails.qualifications
                .split(',')
                .map(q => q.trim())
                .filter(q => q !== '')
            : [],
          expertise: {
            conditions: formData.doctorDetails.expertise?.conditions
              ? formData.doctorDetails.expertise.conditions
                  .split(',')
                  .map(c => c.trim())
                  .filter(c => c !== '')
              : [],
            treatments: formData.doctorDetails.expertise?.treatments
              ? formData.doctorDetails.expertise.treatments
                  .split(',')
                  .map(t => t.trim())
                  .filter(t => t !== '')
              : []
          }
        };
        
        // Convert availability object to array format
        const availabilityArray = Object.keys(formData.availability || {}).map(day => ({
          day: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(), // Ensure proper day format
          startTime: formData.availability[day].startTime || '',
          endTime: formData.availability[day].endTime || ''
        })).filter(slot => slot.startTime && slot.endTime);
        
        // Validate day names match server expectations
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        updateData.doctorDetails.availability = availabilityArray
          .filter(slot => validDays.includes(slot.day) && 
                         timeRegex.test(slot.startTime) && 
                         timeRegex.test(slot.endTime) &&
                         slot.startTime < slot.endTime)
          .map(slot => ({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime
          }));
      }

      console.log('Sending update data:', updateData); // Debug log
      console.log('Profile Data:', formData.profile); // Log profile data
      console.log('Doctor Details:', formData.doctorDetails); // Log doctor details
      
      if (user.role === 'doctor') {
        // Use doctor-specific API for doctor profiles
        await updateDoctorProfile(updateData);
      } else {
        // Use general profile API for non-doctor users
        await axios.put('/profile/update', updateData);
      }
      
      toast.success('Profile updated successfully');
      fetchUserProfile();
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message); // Enhanced error logging
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;

    const imgData = new FormData();
    imgData.append('profileImage', profileImage);

    try {
      await axios.post('/profile/upload-image', imgData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile image updated successfully');
      fetchUserProfile();
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleClinicImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setClinicImageFiles(files);
    }
  };

  const handleClinicImagesUpload = async () => {
    if (clinicImageFiles.length === 0) return;

    const formData = new FormData();
    clinicImageFiles.forEach(file => {
      formData.append('clinicImages', file);
    });

    try {
      // Use axios instance which already has the token interceptor
      await axios.post('/doctors/upload-clinic-images', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Clinic images uploaded successfully');
      setClinicImageFiles([]);
      fetchUserProfile();
    } catch (err) {
      console.error('Clinic images upload error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to upload clinic images');
    }
  };

  const handleDeleteClinicImage = async (imageUrl) => {
    try {
      await axios.delete('/doctors/clinic-images', { data: { imageUrl } });
      toast.success('Clinic image deleted successfully');
      fetchUserProfile();
    } catch (err) {
      toast.error('Failed to delete clinic image');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-page-background">
      <div className="container mt-4">
        <div className='welcome-section mb-4 text-center'>
          <h2 className='welcome-title'>My Profile</h2>
          <p className='text-muted'>Manage your personal and professional information</p>
        </div>

        <div className="row">
          <div className="col-md-3">
            <div className='card shadow-sm enhanced-card mb-4'>
              <div className='card-header enhanced-header text-center'>
                <h6 className='mb-0'>
                  <i className="fas fa-camera me-2"></i>
                  Profile Picture
                </h6>
              </div>
              <div className='card-body text-center'>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Profile"
                    width="120"
                    className="rounded-circle mb-3 profile-image"
                    onError={(e) => {
                      e.target.src = '/images/default-avtar.jpg';
                    }}
                  />
                )}
                <div className='mb-3'>
                  <input type="file" onChange={handleImageChange} className="form-control form-control-sm enhanced-input" />
                </div>
                <button className="btn btn-primary btn-sm enhanced-btn w-100" onClick={handleImageUpload}>
                  <i className="fas fa-upload me-1"></i>
                  Upload Image
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <form onSubmit={handleSubmit}>
              <div className="profile-form-section">
                <div className="mb-3">
                  <label className="profile-label">
                    <i className="fas fa-id-card me-2"></i>
                    Full Name
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control profile-input" />
                </div>

                <h5 className="profile-section-header">
                  <i className="fas fa-user me-2"></i>
                  Personal Information
                </h5>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fas fa-birthday-cake me-1"></i>
                      Age
                    </label>
                    <input type="number" name="profile.age" value={formData.profile.age} onChange={handleChange} placeholder="Enter your age" className="form-control profile-input mb-3" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fas fa-venus-mars me-1"></i>
                      Gender
                    </label>
                    <select name="profile.gender" value={formData.profile.gender} onChange={handleChange} className="form-control profile-input mb-3">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fas fa-phone me-1"></i>
                      Phone Number
                    </label>
                    <input type="text" name="profile.phone" value={formData.profile.phone} onChange={handleChange} placeholder="Enter phone number" className="form-control profile-input mb-3" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fas fa-tint me-1"></i>
                      Blood Group
                    </label>
                    <select name="profile.bloodGroup" value={formData.profile.bloodGroup} onChange={handleChange} className="form-control profile-input mb-3">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <label className="form-label">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  Address
                </label>
                <input type="text" name="profile.address" value={formData.profile.address} onChange={handleChange} placeholder="Enter your address" className="form-control profile-input mb-3" />

                <label className="form-label">
                  <i className="fas fa-phone-square me-1"></i>
                  Emergency Contact
                </label>
                <input type="text" name="profile.emergencyContact" value={formData.profile.emergencyContact} onChange={handleChange} placeholder="Emergency contact number" className="form-control profile-input mb-3" />
              </div>

              {user.role === 'doctor' && (
                <>
                  <div className="profile-form-section">
                    <h5 className="profile-section-header">
                      <i className="fas fa-stethoscope me-2"></i>
                      Doctor Information
                    </h5>
                    <input type="text" name="doctorDetails.specialization" value={formData.doctorDetails.specialization} onChange={handleChange} placeholder="Specialization" className="form-control profile-input mb-2" />
                    <input type="number" name="doctorDetails.experience" value={formData.doctorDetails.experience} onChange={handleChange} placeholder="Years of Experience" className="form-control profile-input mb-2" />
                    <input type="text" name="doctorDetails.qualifications" value={formData.doctorDetails.qualifications} onChange={handleChange} placeholder="Qualifications (comma separated)" className="form-control profile-input mb-2" />
                    <input type="text" name="doctorDetails.clinicName" value={formData.doctorDetails.clinicName} onChange={handleChange} placeholder="Clinic Name" className="form-control profile-input mb-2" />
                    <textarea name="doctorDetails.clinicAddress" value={formData.doctorDetails.clinicAddress} onChange={handleChange} placeholder="Clinic Address" className="form-control profile-input mb-2" rows="3"></textarea>
                    <input type="number" name="doctorDetails.consultationFee" value={formData.doctorDetails.consultationFee} onChange={handleChange} placeholder="Consultation Fee" className="form-control profile-input mb-2" />
                    <textarea name="doctorDetails.about" value={formData.doctorDetails.about} onChange={handleChange} placeholder="About" className="form-control profile-input mb-2" rows="4"></textarea>
                  </div>

                  <div className="profile-form-section">
                    <h5 className="profile-section-header">
                      <i className="fas fa-brain me-2"></i>
                      Expertise
                    </h5>
                    <textarea
                      name="doctorDetails.expertise.conditions"
                      value={formData.doctorDetails.expertise.conditions}
                      onChange={handleChange}
                      placeholder="Medical Conditions (comma separated, e.g., Diabetes, Hypertension, Asthma)"
                      className="form-control profile-input mb-2"
                      rows="3"
                    ></textarea>
                    <textarea
                      name="doctorDetails.expertise.treatments"
                      value={formData.doctorDetails.expertise.treatments}
                      onChange={handleChange}
                      placeholder="Treatments & Procedures (comma separated, e.g., General Checkup, Vaccination, Minor Surgery)"
                      className="form-control profile-input mb-2"
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="profile-form-section">
                    <h5 className="profile-section-header">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Availability
                    </h5>
                    <div className="mb-3">
                      <label className="form-label">Set your weekly availability</label>
                      <div className="days-container">
                        {[
                          { value: 'Monday', label: 'Monday' },
                          { value: 'Tuesday', label: 'Tuesday' },
                          { value: 'Wednesday', label: 'Wednesday' },
                          { value: 'Thursday', label: 'Thursday' },
                          { value: 'Friday', label: 'Friday' },
                          { value: 'Saturday', label: 'Saturday' },
                          { value: 'Sunday', label: 'Sunday' }
                        ].map(day => (
                          <div key={day.value} className="day-card mb-3">
                            <h6 className="mb-2">{day.label}</h6>
                            <div className="time-inputs d-flex gap-2">
                              <input
                                type="time"
                                name={`availability.${day.value}.startTime`}
                                value={formData.availability?.[day.value]?.startTime || ''}
                                onChange={handleChange}
                                className="form-control profile-input"
                              />
                              <input
                                type="time"
                                name={`availability.${day.value}.endTime`}
                                value={formData.availability?.[day.value]?.endTime || ''}
                                onChange={handleChange}
                                className="form-control profile-input"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <small className="text-muted">Set your working hours for each day. Leave blank if you are not available on that day.</small>
                    </div>
                  </div>

                  <div className="profile-form-section">
                    <h5 className="profile-section-header">
                      <i className="fas fa-images me-2"></i>
                      Clinic Images
                    </h5>
                    <div className="mb-3">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleClinicImageChange}
                        className="form-control profile-input mb-2"
                      />
                      <button
                        type="button"
                        className="btn btn-primary mb-3 enhanced-btn"
                        onClick={handleClinicImagesUpload}
                        disabled={clinicImageFiles.length === 0}
                      >
                        <i className="fas fa-upload me-1"></i>
                        Upload Clinic Images ({clinicImageFiles.length} selected)
                      </button>
                    </div>

                    <div className="mb-3">
                      <h6 className="profile-section-header">
                        <i className="fas fa-image me-2"></i>
                        Current Clinic Images ({clinicImages.length}/5)
                      </h6>
                      <div className="row">
                        {clinicImages.map((image, index) => (
                          <div key={index} className="col-md-4 mb-3">
                            <div className="position-relative">
                              <img
                                src={getClinicImageUrl(image)}
                                alt={`Clinic ${index + 1}`}
                                className="img-fluid rounded"
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                onClick={() => handleDeleteClinicImage(image)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-success">Update Profile</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
