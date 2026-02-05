import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { Stethoscope, UploadCloud, FileText, Send, User, Mail, Key, Briefcase, GraduationCap, Building, IndianRupee } from 'lucide-react';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    // User fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Profile fields
    phone: '',
    age: '',
    gender: '',
    // DoctorDetails fields
    specialization: '',
    experience: '',
    qualifications: '',
    clinicName: '',
    clinicAddress: '',
    consultationFee: '',
    // Files
    idProof: null,
    license: null,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!form.idProof || !form.license) {
      return toast.error('Both ID proof and license documents are required.');
    }

    setLoading(true);

    const formData = new FormData();
    // Append all form fields
    Object.keys(form).forEach(key => {
      if (key !== 'idProof' && key !== 'license') {
        formData.append(key, form[key]);
      }
    });
    formData.append('idProof', form.idProof);
    formData.append('license', form.license);

    try {
      await axios.post('/auth/register-doctor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Registration request sent! Your profile will be reviewed by an admin.');
      navigate('/login', { state: { message: 'Please wait for admin approval before logging in.' } });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-health-secondary flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="text-center mb-8">
            <Stethoscope size={48} className="mx-auto text-health-primary" />
            <h1 className="text-3xl font-bold text-health-text-h mt-4">Doctor Registration</h1>
            <p className="text-health-text-p mt-2">Join our network of trusted healthcare professionals.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <FormSection title="Personal & Account Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={<User size={16}/>} name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
                <InputField icon={<Mail size={16}/>} name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address" required />
                <InputField icon={<Key size={16}/>} name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
                <InputField icon={<Key size={16}/>} name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
                <InputField name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
                <InputField name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" />
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full rounded-lg border-slate-300"><option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
              </div>
            </FormSection>

            <FormSection title="Professional Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={<Briefcase size={16}/>} name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization (e.g., Cardiology)" required />
                <InputField icon={<GraduationCap size={16}/>} name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="Qualifications (e.g., MBBS, MD)" required />
                <InputField name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="Experience (in years)" required />
                <InputField icon={<IndianRupee size={16}/>} name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} placeholder="Consultation Fee" required />
                <InputField icon={<Building size={16}/>} name="clinicName" value={form.clinicName} onChange={handleChange} placeholder="Clinic Name" />
              </div>
              <textarea name="clinicAddress" value={form.clinicAddress} onChange={handleChange} placeholder="Clinic Address" rows="3" className="w-full rounded-lg border-slate-300 mt-4"></textarea>
            </FormSection>

            <FormSection title="Verification Documents">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileInput name="idProof" label="ID Proof Document (PDF, JPG, PNG)" file={form.idProof} onChange={handleFileChange} />
                <FileInput name="license" label="Medical License (PDF, JPG, PNG)" file={form.license} onChange={handleFileChange} />
              </div>
            </FormSection>

            <div className="text-center pt-4">
              <button type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50" disabled={loading}>
                {loading ? 'Submitting...' : <><Send size={16} /><span>Submit for Verification</span></>}
              </button>
            </div>
            <p className="text-center text-health-text-p">Already have an account? <Link to='/login' className="text-health-primary hover:text-teal-700 font-medium">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

const FormSection = ({ title, children }) => (<div className="space-y-4"><h3 className="text-lg font-semibold text-health-text-h border-b pb-2">{title}</h3>{children}</div>);
const InputField = ({ icon, ...props }) => (<div className="relative">{icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}<input {...props} className={`w-full rounded-lg border-slate-300 ${icon ? 'pl-10' : 'pl-4'}`} /></div>);
const FileInput = ({ name, label, file, onChange }) => (<div><label className="text-sm font-medium text-health-text-p flex items-center gap-2 mb-2"><FileText size={16} /> {label}</label><label htmlFor={name} className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"><div className="flex items-center gap-2 text-slate-500"><UploadCloud size={20} />{file ? <span className="font-semibold text-teal-700">{file.name}</span> : <span className="text-sm">Click to upload</span>}</div><input id={name} name={name} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e, name)} required /></label></div>);

export default DoctorRegister;