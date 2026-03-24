import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, UploadCloud, FileText, Send, User, Mail, Key, Briefcase, GraduationCap, Building, IndianRupee, Eye, EyeOff } from 'lucide-react';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Clear any existing session — doctor must wait for admin approval
      logout();
      toast.success('Registration submitted! Please wait for admin approval before logging in.');
      navigate('/login', { state: { message: 'Your doctor registration is under review. You will be notified once approved.' } });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-health-secondary flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl w-full">
        <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <Stethoscope size={40} className="sm:w-12 sm:h-12 mx-auto text-health-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-health-text-h mt-3 sm:mt-4">Doctor Registration</h1>
            <p className="text-health-text-p mt-2 text-sm sm:text-base">Join our network of trusted healthcare professionals.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <FormSection title="Personal & Account Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <InputField icon={<User size={14} className="sm:w-4 sm:h-4"/>} name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
                <InputField icon={<Mail size={14} className="sm:w-4 sm:h-4"/>} name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address" required />
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400"><Key size={14} className="sm:w-4 sm:h-4"/></span>
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Password" required className="w-full rounded-lg border-slate-300 text-sm sm:text-base py-1.5 sm:py-2 pl-8 sm:pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400"><Key size={14} className="sm:w-4 sm:h-4"/></span>
                  <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required className="w-full rounded-lg border-slate-300 text-sm sm:text-base py-1.5 sm:py-2 pl-8 sm:pl-10 pr-10" />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <InputField name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
                <InputField name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" />
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full rounded-lg border-slate-300 text-sm sm:text-base py-1.5 sm:py-2 px-3 sm:px-4"><option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
              </div>
            </FormSection>

            <FormSection title="Professional Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Briefcase size={14} className="sm:w-4 sm:h-4"/></span>
                  <select name="specialization" value={form.specialization} onChange={handleChange} required className="w-full rounded-lg border-slate-300 text-sm sm:text-base py-1.5 sm:py-2 pl-8 sm:pl-10 pr-4 appearance-none">
                    <option value="">Select Specialization</option>
                    <option>General Physician</option>
                    <option>Cardiologist</option>
                    <option>Dermatologist</option>
                    <option>Neurologist</option>
                    <option>Orthopedic Surgeon</option>
                    <option>Pediatrician</option>
                    <option>Gynecologist</option>
                    <option>Psychiatrist</option>
                    <option>Ophthalmologist</option>
                    <option>ENT Specialist</option>
                    <option>Gastroenterologist</option>
                    <option>Pulmonologist</option>
                    <option>Endocrinologist</option>
                    <option>Nephrologist</option>
                    <option>Oncologist</option>
                    <option>Urologist</option>
                    <option>Rheumatologist</option>
                    <option>Dentist</option>
                    <option>Radiologist</option>
                    <option>Anesthesiologist</option>
                    <option>Homeopathy</option>
                    <option>Ayurveda</option>
                    <option>Other</option>
                  </select>
                </div>
                <InputField icon={<GraduationCap size={14} className="sm:w-4 sm:h-4"/>} name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="Qualifications (e.g., MBBS, MD)" required />
                <InputField name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="Experience (in years)" required />
                <InputField icon={<IndianRupee size={14} className="sm:w-4 sm:h-4"/>} name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} placeholder="Consultation Fee" required />
                <InputField icon={<Building size={14} className="sm:w-4 sm:h-4"/>} name="clinicName" value={form.clinicName} onChange={handleChange} placeholder="Clinic Name" />
              </div>
              <textarea name="clinicAddress" value={form.clinicAddress} onChange={handleChange} placeholder="Clinic Address" rows="3" className="w-full rounded-lg border-slate-300 mt-3 sm:mt-4 text-sm sm:text-base py-1.5 sm:py-2 px-3 sm:px-4"></textarea>
            </FormSection>

            <FormSection title="Verification Documents">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FileInput name="idProof" label="ID Proof Document (PDF, JPG, PNG)" file={form.idProof} onChange={handleFileChange} />
                <FileInput name="license" label="Medical License (PDF, JPG, PNG)" file={form.license} onChange={handleFileChange} />
              </div>
            </FormSection>

            <div className="text-center pt-3 sm:pt-4">
              <button type="submit" className="bg-teal-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto" disabled={loading}>
                {loading ? 'Submitting...' : <><Send size={14} className="sm:w-4 sm:h-4" /><span>Submit for Verification</span></>}
              </button>
            </div>

            <p className="text-center text-health-text-p text-xs sm:text-sm">Already have an account? <Link to='/login' className="text-health-primary hover:text-teal-700 font-medium">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

const FormSection = ({ title, children }) => (<div className="space-y-3 sm:space-y-4"><h3 className="text-base sm:text-lg font-semibold text-health-text-h border-b pb-2">{title}</h3>{children}</div>);
const InputField = ({ icon, ...props }) => (<div className="relative">{icon && <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}<input {...props} className={`w-full rounded-lg border-slate-300 text-sm sm:text-base py-1.5 sm:py-2 ${icon ? 'pl-8 sm:pl-10 pr-3 sm:pr-4' : 'px-3 sm:px-4'}`} /></div>);
const FileInput = ({ name, label, file, onChange }) => (<div><label className="text-xs sm:text-sm font-medium text-health-text-p flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2"><FileText size={14} className="sm:w-4 sm:h-4" /> {label}</label><label htmlFor={name} className="relative flex flex-col items-center justify-center w-full h-20 sm:h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"><div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 px-2"><UploadCloud size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />{file ? <span className="font-semibold text-teal-700 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{file.name}</span> : <span className="text-xs sm:text-sm">Click to upload</span>}</div><input id={name} name={name} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e, name)} required /></label></div>);

export default DoctorRegister;