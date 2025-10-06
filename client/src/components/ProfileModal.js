import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProfileImageUrl } from '../utils/imageUtils';

const ProfileModal = ({ show, onClose, userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profile: {
      age: '',
      gender: '',
      phone: '',
      address: '',
      bloodGroup: '',
      emergencyContact: ''
    }
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        profile: {
          age: userData.profile?.age || '',
          gender: userData.profile?.gender || '',
          phone: userData.profile?.phone || '',
          address: userData.profile?.address || '',
          bloodGroup: userData.profile?.bloodGroup || '',
          emergencyContact: userData.profile?.emergencyContact || ''
        }
      });
      
      if (userData?.profileImage) {
        // This logic correctly sets the previewImage state
        setPreviewImage(getProfileImageUrl(userData.profileImage));
      } else {
        setPreviewImage('/images/default-avtar.jpg');
      }
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
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

  const handleImageUpload = async () => {
    if (!profileImage) return;

    const imgData = new FormData();
    imgData.append('profileImage', profileImage);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/profile/upload-image', imgData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Profile image updated successfully');
      onUpdate(response.data.user);
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const processedData = {
        ...formData,
        profile: {
          ...formData.profile,
          age: formData.profile.age ? parseInt(formData.profile.age, 10) : undefined,
          gender: formData.profile.gender ? formData.profile.gender.toLowerCase() : undefined
        }
      };
      
      const response = await axios.put('/profile/update', processedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Profile updated successfully');
      onUpdate(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message);
      toast.error(err.response?.data?.msg || 'Failed to update profile');
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content profile-modal">
          <div className="modal-header">
            <h5 className="modal-title">My Profile</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <img
                  src={previewImage} // <-- FIXED LINE
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
                <label className="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle" 
                       style={{ width: '35px', height: '35px', cursor: 'pointer' }}>
                  <i className="fas fa-camera"></i>
                  <input
                    type="file"
                    className="d-none"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
              </div>
              {profileImage && (
                <button className="btn btn-primary btn-sm mt-2" onClick={handleImageUpload}>
                  Upload Image
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="profile.age"
                    value={formData.profile.age}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    name="profile.gender"
                    value={formData.profile.gender}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="profile.phone"
                    value={formData.profile.phone}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Blood Group</label>
                  <select
                    name="profile.bloodGroup"
                    value={formData.profile.bloodGroup}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  >
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

                <div className="col-12 mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    name="profile.address"
                    value={formData.profile.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="2"
                    disabled={!isEditing}
                  />
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label">Emergency Contact</label>
                  <input
                    type="text"
                    name="profile.emergencyContact"
                    value={formData.profile.emergencyContact}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="modal-footer">
                {!isEditing ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;