import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { getProfileImageUrl } from '../utils/imageUtils';
import { X, Camera, Edit, Save, User, Mail, Phone, MapPin, Droplets, Heart } from 'lucide-react';

const ProfileModal = ({ show, onClose, userData, onUpdate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', profile: {} });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        profile: userData.profile || {},
      });
      setPreviewImage(getProfileImageUrl(userData.profileImage));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({ ...prev, profile: { ...prev.profile, [profileField]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    const imgData = new FormData();
    imgData.append('profileImage', profileImage);
    try {
      const { data } = await axios.post('/profile/upload-image', imgData);
      toast.success('Profile image updated');
      onUpdate(data.user);
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put('/profile/update', { 
          name: formData.name, 
          profile: {
              ...formData.profile,
              age: formData.profile.age ? parseInt(formData.profile.age, 10) : undefined
          }
      });
      toast.success('Profile updated');
      onUpdate(data);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update profile');
    }
  };

  if (!show) return null;
  
  const InputField = ({ name, value, label, icon, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-2">{icon}{label}</label>
        <input name={name} value={value} onChange={handleChange} {...props} className="w-full rounded-lg border-slate-300 read-only:bg-slate-100" readOnly={!isEditing} />
    </div>
  );
  
  const SelectField = ({ name, value, label, icon, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-2">{icon}{label}</label>
        <select name={name} value={value} onChange={handleChange} className="w-full rounded-lg border-slate-300 disabled:bg-slate-100" disabled={!isEditing}>{children}</select>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100] p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h5 className="text-xl font-bold text-slate-800">My Profile</h5>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X/></button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto">
              <img src={previewImage} alt="Profile" className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-100" />
              <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-teal-700"><Camera size={16} /><input type="file" className="hidden" onChange={handleImageChange} accept="image/*"/></label>
            </div>
            {profileImage && <button className="mt-2 text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full" onClick={handleImageUpload}>Upload Image</button>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField name="name" value={formData.name} label="Name" icon={<User size={16}/>} type="text" />
                <InputField name="email" value={formData.email} label="Email" icon={<Mail size={16}/>} type="email" readOnly />
                <InputField name="profile.age" value={formData.profile.age} label="Age" icon={<User size={16}/>} type="number" />
                <SelectField name="profile.gender" value={formData.profile.gender} label="Gender" icon={<User size={16}/>}>
                    <option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option>
                </SelectField>
                <InputField name="profile.phone" value={formData.profile.phone} label="Phone" icon={<Phone size={16}/>} type="tel" />
                <SelectField name="profile.bloodGroup" value={formData.profile.bloodGroup} label="Blood Group" icon={<Droplets size={16}/>}>
                    <option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                </SelectField>
            </div>
            <InputField name="profile.address" value={formData.profile.address} label="Address" icon={<MapPin size={16}/>} type="text" />
            <InputField name="profile.emergencyContact" value={formData.profile.emergencyContact} label="Emergency Contact" icon={<Heart size={16}/>} type="tel" />

            <div className="pt-4 flex justify-end gap-4">
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)} className="bg-teal-600 text-white px-6 py-2 rounded-full flex items-center gap-2"><Edit size={16}/> Edit Profile</button>
                ) : (
                  <>
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-200 px-6 py-2 rounded-full">Cancel</button>
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-full flex items-center gap-2"><Save size={16}/> Save Changes</button>
                  </>
                )}
              </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileModal;