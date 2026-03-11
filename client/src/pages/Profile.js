import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getProfileImageUrl, getClinicImageUrl } from '../utils/imageUtils';
import { updateDoctorProfile } from '../api/doctorAPI';
import { AuthContext } from '../context/AuthContext';
import EmailChangeModal from '../components/EmailChangeModal';
import { Camera, User, Briefcase, Brain, Calendar, ArrowLeft, X, Image as ImageIcon, Mail } from 'lucide-react';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    profile: { age: '', gender: '', phone: '', address: '', bloodGroup: '', emergencyContact: '' },
    doctorDetails: { specialization: '', experience: '', qualifications: '', clinicName: '', clinicAddress: '', consultationFee: '', about: '', expertise: { conditions: '', treatments: '' } },
    availability: {}
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [clinicImages, setClinicImages] = useState([]);
  const [clinicImageFiles, setClinicImageFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get('/profile/me');
      setFormData({
        name: data.name || '',
        profile: data.profile || { age: '', gender: '', phone: '', address: '', bloodGroup: '', emergencyContact: '' },
        doctorDetails: data.doctorDetails || { specialization: '', experience: '', qualifications: '', clinicName: '', clinicAddress: '', consultationFee: '', about: '', expertise: { conditions: '', treatments: '' } },
        availability: data.doctorDetails?.availability?.reduce((acc, slot) => {
          acc[slot.day] = { startTime: slot.startTime, endTime: slot.endTime };
          return acc;
        }, {}) || {}
      });

      setCurrentEmail(data.email || '');
      setPreviewImage(data.profileImage ? getProfileImageUrl(data.profileImage) : null);
      setClinicImages(data.doctorDetails?.clinicImages || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch user profile');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    if (keys.length > 1) {
      setFormData(prev => {
        const updated = { ...prev };
        let current = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const updateData = { ...formData };
        if (user.role === 'doctor') {
            updateData.doctorDetails.qualifications = formData.doctorDetails.qualifications.split(',').map(q => q.trim());
            updateData.doctorDetails.expertise.conditions = formData.doctorDetails.expertise.conditions.split(',').map(c => c.trim());
            updateData.doctorDetails.expertise.treatments = formData.doctorDetails.expertise.treatments.split(',').map(t => t.trim());
            updateData.doctorDetails.availability = Object.entries(formData.availability).map(([day, times]) => ({ day, ...times }));
            await updateDoctorProfile(updateData);
        } else {
            await axios.put('/profile/update', { name: formData.name, profile: formData.profile });
        }
        toast.success('Profile updated successfully');
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };
  
  const handleImageUpload = async () => {
    if (!profileImage) return;
    const imgData = new FormData();
    imgData.append('profileImage', profileImage);
    try {
      await axios.post('/profile/upload-image', imgData);
      toast.success('Profile image updated');
      fetchUserProfile();
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleClinicImagesUpload = async () => {
    if (clinicImageFiles.length === 0) return;
    const formData = new FormData();
    clinicImageFiles.forEach(file => formData.append('clinicImages', file));
    try {
      await axios.post('/doctors/upload-clinic-images', formData);
      toast.success('Clinic images uploaded');
      setClinicImageFiles([]);
      fetchUserProfile();
    } catch (err) {
      toast.error('Failed to upload clinic images');
    }
  };

  const handleDeleteClinicImage = async (imageUrl) => {
    try {
      await axios.delete('/doctors/clinic-images', { data: { imageUrl } });
      toast.success('Clinic image deleted');
      fetchUserProfile();
    } catch (err) {
      toast.error('Failed to delete clinic image');
    }
  };

  const handleEmailChanged = async (newEmail) => {
    setCurrentEmail(newEmail);
    // Update the user context with new email
    const updatedUser = { ...user, email: newEmail };
    login(updatedUser);
    // Refresh profile data
    fetchUserProfile();
  };

  if (loading) return <div className="text-center p-8">Loading profile...</div>;

  const FormSection = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-health-text-h flex items-center gap-2 mb-3 sm:mb-4 border-b pb-2">
        {icon} <span>{title}</span>
      </h3>
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <button
          onClick={() => navigate(user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">My Profile</h1>
      </div>
      <div className="text-center mb-4 sm:mb-6 md:mb-8 -mt-2 sm:-mt-4">
        <p className="text-health-text-p text-xs sm:text-sm md:text-base">Manage your personal and professional information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-5 md:p-6 text-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto">
              <img
                src={previewImage || '/images/default-avtar.jpg'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover ring-4 ring-teal-100"
              />
              <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-teal-600 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors">
                <Camera size={14} className="sm:w-4 sm:h-4" />
                <input id="profile-image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
            {profileImage && (
              <button 
                onClick={handleImageUpload} 
                className="mt-3 sm:mt-4 bg-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Upload Image
              </button>
            )}
            <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-health-text-h">{formData.name}</h2>
            <p className="text-health-text-p text-xs sm:text-sm mt-1">{currentEmail}</p>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 mx-auto"
            >
              <Mail size={14} />
              Change Email
            </button>
            <div className="mt-3 sm:mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
              {user.role === 'doctor' ? 'Doctor' : 'Patient'}
            </div>
          </div>
          {user.role === 'doctor' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-health-text-h flex items-center gap-2 mb-3 sm:mb-4">
                <ImageIcon size={18} className="sm:w-5 sm:h-5" /> 
                <span>Clinic Images</span>
              </h3>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => setClinicImageFiles(Array.from(e.target.files))} 
                className="w-full text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" 
              />
              {clinicImageFiles.length > 0 && (
                <button 
                  onClick={handleClinicImagesUpload} 
                  className="mt-2 w-full bg-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  Upload {clinicImageFiles.length} Image{clinicImageFiles.length > 1 ? 's' : ''}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2 mt-3 sm:mt-4">
                {clinicImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img 
                      src={getClinicImageUrl(img)} 
                      alt={`Clinic ${i + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-lg" 
                    />
                    <button 
                      onClick={() => handleDeleteClinicImage(img)} 
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
            <FormSection title="Personal Information" icon={<User size={18} className="sm:w-5 sm:h-5" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input type="text" name="profile.phone" value={formData.profile.phone} onChange={handleChange} placeholder="Phone" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Age</label>
                      <input type="number" name="profile.age" value={formData.profile.age} onChange={handleChange} placeholder="Age" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <select name="profile.gender" value={formData.profile.gender || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2"><option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                      <select name="profile.bloodGroup" value={formData.profile.bloodGroup} onChange={handleChange} className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2"><option value="">Select Blood Group</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
                      <input type="text" name="profile.emergencyContact" value={formData.profile.emergencyContact} onChange={handleChange} placeholder="Emergency Contact" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                    </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea name="profile.address" value={formData.profile.address} onChange={handleChange} placeholder="Address" rows="3" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2"></textarea>
                </div>
            </FormSection>
            
            {user.role === 'doctor' && (
              <>
                <FormSection title="Professional Details" icon={<Briefcase size={18} className="sm:w-5 sm:h-5" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <input type="text" name="doctorDetails.specialization" value={formData.doctorDetails.specialization} onChange={handleChange} placeholder="Specialization" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                        <input type="number" name="doctorDetails.experience" value={formData.doctorDetails.experience} onChange={handleChange} placeholder="Experience (years)" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                        <input type="number" name="doctorDetails.consultationFee" value={formData.doctorDetails.consultationFee} onChange={handleChange} placeholder="Consultation Fee" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                        <input type="text" name="doctorDetails.qualifications" value={formData.doctorDetails.qualifications} onChange={handleChange} placeholder="Qualifications (comma-separated)" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                        <input type="text" name="doctorDetails.clinicName" value={formData.doctorDetails.clinicName} onChange={handleChange} placeholder="Clinic Name" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                    </div>
                    <textarea name="doctorDetails.clinicAddress" value={formData.doctorDetails.clinicAddress} onChange={handleChange} placeholder="Clinic Address" rows="3" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2"></textarea>
                    <textarea name="doctorDetails.about" value={formData.doctorDetails.about} onChange={handleChange} placeholder="About section..." rows="4" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2"></textarea>
                </FormSection>
                <FormSection title="Expertise" icon={<Brain size={18} className="sm:w-5 sm:h-5" />}>
                    <textarea name="doctorDetails.expertise.conditions" value={formData.doctorDetails.expertise.conditions} onChange={handleChange} placeholder="Conditions treated (comma-separated)" rows="3" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2"></textarea>
                    <textarea name="doctorDetails.expertise.treatments" value={formData.doctorDetails.expertise.treatments} onChange={handleChange} placeholder="Treatments & procedures (comma-separated)" rows="3" className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2"></textarea>
                </FormSection>
                <FormSection title="Weekly Availability" icon={<Calendar size={18} className="sm:w-5 sm:h-5" />}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="grid grid-cols-3 items-center gap-2">
                            <label className="text-xs sm:text-sm font-medium">{day}</label>
                            <input type="time" name={`availability.${day}.startTime`} value={formData.availability[day]?.startTime || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                            <input type="time" name={`availability.${day}.endTime`} value={formData.availability[day]?.endTime || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 text-xs sm:text-sm py-1.5 sm:py-2" />
                        </div>
                    ))}
                </FormSection>
              </>
            )}
            <div className="flex justify-end">
              <button type="submit" className="bg-teal-600 text-white px-6 sm:px-8 py-1.5 sm:py-2 rounded-full hover:bg-teal-700 transition-all font-medium text-sm sm:text-base w-full sm:w-auto">Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentEmail={currentEmail}
        onEmailChanged={handleEmailChanged}
      />
    </div>
  );
};

export default Profile;
