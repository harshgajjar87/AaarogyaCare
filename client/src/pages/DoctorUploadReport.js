import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { UploadCloud, File, Calendar, User, Book, Send, Loader2 } from 'lucide-react';

const DoctorUploadReport = () => {
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
    <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-health-text-h">Upload Medical Report</h1>
            <p className="text-health-text-p mt-2">Upload patient reports securely and efficiently.</p>
        </div>
        
        <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-health-text-p flex items-center gap-2"><Book size={16}/> Report Title</label>
                    <input id="title" name="title" type="text" value={form.title} onChange={handleChange} placeholder="e.g., Blood Test Results" className="w-full rounded-lg border-slate-300" required />
                </div>

                <div className="space-y-2">
                    <label htmlFor="patientId" className="text-sm font-medium text-health-text-p flex items-center gap-2"><User size={16}/> Select Patient</label>
                    <select id="patientId" name="patientId" value={form.patientId} onChange={handleChange} className="w-full rounded-lg border-slate-300" required>
                        <option value="">-- Select a Patient --</option>
                        {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="reason" className="text-sm font-medium text-health-text-p flex items-center gap-2"><File size={16}/> Medical Reason</label>
                    <textarea id="reason" name="reason" value={form.reason} onChange={handleChange} placeholder="Describe the reason for this report" rows="3" className="w-full rounded-lg border-slate-300" required />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-health-text-p flex items-center gap-2"><Calendar size={16}/> Report Date</label>
                    <input id="date" name="date" type="date" value={form.date} onChange={handleChange} className="w-full rounded-lg border-slate-300" required />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-health-text-p flex items-center gap-2"><UploadCloud size={16}/> Report File (PDF only)</label>
                    <label htmlFor="report-file" className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-4 text-slate-500" />
                            <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">PDF (MAX. 5MB)</p>
                        </div>
                        <input id="report-file" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} required />
                    </label>
                    {form.report && <p className="text-sm text-slate-600 mt-2">Selected: {form.report.name}</p>}
                </div>
                
                <div className="text-center pt-4">
                    <button type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50" disabled={loading}>
                        {loading ? <><Loader2 className="animate-spin" size={20} /><span>Uploading...</span></> : <><Send size={16} /><span>Upload Report</span></>}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default DoctorUploadReport;
