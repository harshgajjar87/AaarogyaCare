import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { UploadCloud, File, Calendar, User, Book, Send, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FormSection = ({ title, icon, children }) => (
  <div className="space-y-3 sm:space-y-4">
    <h3 className="text-base sm:text-lg font-semibold text-health-text-h flex items-center gap-2 border-b pb-2">
      {icon}
      <span>{title}</span>
    </h3>
    {children}
  </div>
);

const DoctorUploadReport = () => {
  console.log('DoctorUploadReport component rendered');
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    patientId: '',
    report: null,
    reason: '',
    date: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/appointments/doctor/patients');
        setPatients(res.data);
      } catch (err) {
        toast.error('Failed to load patients');
      }
    };
    fetchPatients();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    setForm(prev => ({ ...prev, report: e.target.files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.report || !form.patientId || !form.title || !form.reason || !form.date) {
      return toast.error('All fields are required');
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('report', form.report);
    formData.append('title', form.title);
    formData.append('reason', form.reason);
    formData.append('date', form.date);

    try {
      await axios.post(`/reports/upload/${form.patientId}`, formData);
      toast.success('Report uploaded and email sent!');
      setForm({ title: '', patientId: '', report: null, reason: '', date: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Upload Medical Report</h1>
      </div>
      <div className="text-center mb-4 sm:mb-6 md:mb-8 -mt-2 sm:-mt-4">
        <p className="text-health-text-p text-xs sm:text-sm md:text-base">Upload patient reports securely and efficiently</p>
      </div>
        
      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
          <FormSection title="Report Information" icon={<Book size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Report Title</label>
              <input 
                id="title" 
                name="title" 
                type="text" 
                value={form.title} 
                onChange={handleChange} 
                placeholder="e.g., Blood Test Results" 
                className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                required 
              />
            </div>
          </FormSection>

          <FormSection title="Patient Selection" icon={<User size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label htmlFor="patientId" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Select Patient</label>
              <select 
                id="patientId" 
                name="patientId" 
                value={form.patientId} 
                onChange={handleChange} 
                className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                required
              >
                <option value="">-- Select a Patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>
          </FormSection>
          
          <FormSection title="Report Details" icon={<File size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="reason" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Medical Reason</label>
                <textarea 
                  id="reason" 
                  name="reason" 
                  value={form.reason} 
                  onChange={handleChange} 
                  placeholder="Describe the reason for this report" 
                  rows="3" 
                  className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Report Date</label>
                <input 
                  id="date" 
                  name="date" 
                  type="date" 
                  value={form.date} 
                  onChange={handleChange} 
                  className="w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                  required 
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Upload File" icon={<UploadCloud size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Report File (PDF only)</label>
              <label 
                htmlFor="report-file" 
                className="relative flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-6">
                  <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-slate-500" />
                  <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-slate-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">PDF (MAX. 5MB)</p>
                </div>
                <input 
                  id="report-file" 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  required 
                />
              </label>
              {form.report && (
                <div className="mt-2 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs sm:text-sm text-green-800 font-medium">
                    Selected: {form.report.name}
                  </p>
                </div>
              )}
            </div>
          </FormSection>
          
          <div className="text-center pt-2 sm:pt-4">
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-teal-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50 text-sm sm:text-base" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Upload Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorUploadReport;
