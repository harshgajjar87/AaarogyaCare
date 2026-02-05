import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getProfileImageUrl, getClinicImageUrl } from '../utils/imageUtils';
import { updateDoctorProfile } from '../api/doctorAPI';
import { AuthContext } from '../context/AuthContext';
import { Camera, User, Briefcase, Brain, Calendar, ArrowLeft, X, Image as ImageIcon } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
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

  if (loading) return <div className="text-center p-8">Loading profile...</div>;

  const FormSection = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-health-text-h flex items-center gap-2 mb-4">
        {icon} {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">My Profile</h1>
      </div>
      <div className="text-center -mt-4">
        <p className="text-health-text-p">Manage your personal and professional information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={previewImage || '/images/default-avtar.jpg'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-teal-100"
              />
              <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700">
                <Camera size={16} />
                <input id="profile-image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
            {profileImage && <button onClick={handleImageUpload} className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">Upload Image</button>}
            <h2 className="mt-4 text-xl font-bold text-health-text-h">{formData.name}</h2>
            <p className="text-health-text-p">{user.email}</p>
          </div>
          {user.role === 'doctor' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-health-text-h flex items-center gap-2 mb-4"><ImageIcon /> Clinic Images</h3>
              <input type="file" multiple accept="image/*" onChange={(e) => setClinicImageFiles(Array.from(e.target.files))} className="w-full text-sm" />
              {clinicImageFiles.length > 0 && <button onClick={handleClinicImagesUpload} className="mt-2 w-full bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">Upload ({clinicImageFiles.length})</button>}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {clinicImages.map((img, i) => <div key={i} className="relative"><img src={getClinicImageUrl(img)} className="w-full h-16 object-cover rounded-md" /><button onClick={() => handleDeleteClinicImage(img)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10} /></button></div>)}
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <FormSection title="Personal Information" icon={<User size={20} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full rounded-lg border-slate-300" />
                    <input type="text" name="profile.phone" value={formData.profile.phone} onChange={handleChange} placeholder="Phone" className="w-full rounded-lg border-slate-300" />
                    <input type="number" name="profile.age" value={formData.profile.age} onChange={handleChange} placeholder="Age" className="w-full rounded-lg border-slate-300" />
                    <select name="profile.gender" value={formData.profile.gender} onChange={handleChange} className="w-full rounded-lg border-slate-300"><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
                    <select name="profile.bloodGroup" value={formData.profile.bloodGroup} onChange={handleChange} className="w-full rounded-lg border-slate-300"><option value="">Blood Group</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select>
                    <input type="text" name="profile.emergencyContact" value={formData.profile.emergencyContact} onChange={handleChange} placeholder="Emergency Contact" className="w-full rounded-lg border-slate-300" />
                </div>
                <textarea name="profile.address" value={formData.profile.address} onChange={handleChange} placeholder="Address" rows="3" className="w-full rounded-lg border-slate-300"></textarea>
            </FormSection>
            
            {user.role === 'doctor' && (
              <>
                <FormSection title="Professional Details" icon={<Briefcase size={20} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="doctorDetails.specialization" value={formData.doctorDetails.specialization} onChange={handleChange} placeholder="Specialization" className="w-full rounded-lg border-slate-300" />
                        <input type="number" name="doctorDetails.experience" value={formData.doctorDetails.experience} onChange={handleChange} placeholder="Experience (years)" className="w-full rounded-lg border-slate-300" />
                        <input type="number" name="doctorDetails.consultationFee" value={formData.doctorDetails.consultationFee} onChange={handleChange} placeholder="Consultation Fee" className="w-full rounded-lg border-slate-300" />
                        <input type="text" name="doctorDetails.qualifications" value={formData.doctorDetails.qualifications} onChange={handleChange} placeholder="Qualifications (comma-separated)" className="w-full rounded-lg border-slate-300" />
                        <input type="text" name="doctorDetails.clinicName" value={formData.doctorDetails.clinicName} onChange={handleChange} placeholder="Clinic Name" className="w-full rounded-lg border-slate-300" />
                    </div>
                    <textarea name="doctorDetails.clinicAddress" value={formData.doctorDetails.clinicAddress} onChange={handleChange} placeholder="Clinic Address" rows="3" className="w-full rounded-lg border-slate-300"></textarea>
                    <textarea name="doctorDetails.about" value={formData.doctorDetails.about} onChange={handleChange} placeholder="About section..." rows="4" className="w-full rounded-lg border-slate-300"></textarea>
                </FormSection>
                <FormSection title="Expertise" icon={<Brain size={20} />}>
                    <textarea name="doctorDetails.expertise.conditions" value={formData.doctorDetails.expertise.conditions} onChange={handleChange} placeholder="Conditions treated (comma-separated)" rows="3" className="w-full rounded-lg border-slate-300"></textarea>
                    <textarea name="doctorDetails.expertise.treatments" value={formData.doctorDetails.expertise.treatments} onChange={handleChange} placeholder="Treatments & procedures (comma-separated)" rows="3" className="w-full rounded-lg border-slate-300"></textarea>
                </FormSection>
                <FormSection title="Weekly Availability" icon={<Calendar size={20} />}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="grid grid-cols-3 items-center gap-2">
                            <label className="text-sm font-medium">{day}</label>
                            <input type="time" name={`availability.${day}.startTime`} value={formData.availability[day]?.startTime || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 text-sm" />
                            <input type="time" name={`availability.${day}.endTime`} value={formData.availability[day]?.endTime || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 text-sm" />
                        </div>
                    ))}
                </FormSection>
              </>
            )}
            <div className="flex justify-end">
              <button type="submit" className="bg-teal-600 text-white px-8 py-2 rounded-full hover:bg-teal-700 transition-all font-medium">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
