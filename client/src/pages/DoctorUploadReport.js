import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import '../styles/pages/DoctorUploadReport.css';
// DoctorNavbar removed - already handled in Layout component

const DoctorUploadReport = () => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    title: '',
    patientId: '',
    report: null,
    reason: '',
    date: ''
  });

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/appointments/doctor/patients');
      setPatients(res.data);
    } catch (err) {
      toast.error('Failed to load patients with appointments');
    }
  };

  useEffect(() => {
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

    const formData = new FormData();
    formData.append('report', form.report);
    formData.append('title', form.title);
    formData.append('reason', form.reason);
    formData.append('date', form.date);

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) return toast.error('Token missing. Please login again.');

    try {
      await axios.post(`/reports/upload/${form.patientId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Report uploaded and email sent!');
      setForm({ title: '', patientId: '', report: null, reason: '', date: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Upload failed');
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="upload-report-container">
      <div className="upload-report-header">
        <h2>Upload Medical Report</h2>
        <p>Upload patient reports securely and efficiently</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form" encType="multipart/form-data">
        <div className="form-group">
          <label className="form-label">Report Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter report title"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Select Patient</label>
          <select
            name="patientId"
            value={form.patientId}
            onChange={handleChange}
            className="form-select patient-select"
            required
          >
            <option value="">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Medical Reason</label>
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            className="form-control"
            rows={3}
            placeholder="Describe the medical reason for this report"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Report Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Choose Report File (PDF only)</label>
          <div className="file-input-wrapper">
            <label htmlFor="report-file" className="file-input-label">
              <i className="fas fa-cloud-upload-alt"></i>
              {form.report ? form.report.name : 'Click to select PDF file'}
            </label>
            <input
              id="report-file"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
            />
          </div>
          {form.report && (
            <div className="selected-file">
              Selected: {form.report.name}
            </div>
          )}
        </div>

        <button type="submit" className="btn-upload">
          <i className="fas fa-upload me-2"></i>
          Upload Report
        </button>
      </form>
    </div>
  );
};

export default DoctorUploadReport;
