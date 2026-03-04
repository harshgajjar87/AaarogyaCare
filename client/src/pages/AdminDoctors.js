import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import DoctorCard from '../components/DoctorCard';
import { Search, Plus, ToggleRight, ToggleLeft, ArrowLeft } from 'lucide-react';

const AdminDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialization: '', qualifications: '',
    clinicName: '', clinicAddress: '', consultationFee: '', phone: '',
    age: '', gender: '', bloodGroup: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = doctors.filter(doctor =>
      doctor.name?.toLowerCase().includes(lowercasedTerm) ||
      doctor.email?.toLowerCase().includes(lowercasedTerm) ||
      doctor.profile?.phone?.includes(lowercasedTerm) ||
      doctor.doctorDetails?.specialization?.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/doctors/new');
      setDoctors(response.data.doctors || []);
    } catch (error) {
      toast.error(`Failed to load doctors: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/doctors', form);
      toast.success('Doctor created successfully');
      setShowForm(false);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to save doctor');
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    const action = newStatus ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} this doctor?`)) {
      try {
        await axios.patch(`/admin/doctors/new/${id}/toggle-active`);
        toast.success(`Doctor ${action}d successfully`);
        fetchDoctors();
      } catch (error) {
        toast.error(error.response?.data?.msg || `Failed to ${action} doctor`);
      }
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Manage Doctors</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="w-full sm:w-auto bg-teal-600 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
          <Plus size={14} className="sm:w-4 sm:h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-500"
            placeholder="Search doctors by name, email, phone, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] sm:text-xs md:text-sm text-left text-health-text-p">
              <thead className="text-[9px] sm:text-xs text-health-text-p uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Name</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Email & Phone</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Specialization</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Register Date</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Status</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 font-medium text-health-text-h">{doctor.name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{doctor.email}<br/><span className="text-[9px] sm:text-xs text-slate-500">{doctor.profile?.phone || 'N/A'}</span></td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{doctor.doctorDetails?.specialization || 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{formatDate(doctor.createdAt)}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-center">
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold leading-tight rounded-full text-[9px] sm:text-xs ${doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-center">
                      <button onClick={() => handleToggleStatus(doctor._id, !doctor.isActive)} className={`p-1 sm:p-2 rounded-full transition-colors ${doctor.isActive ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-500 hover:bg-green-100'}`}>
                        {doctor.isActive ? <ToggleLeft size={16} className="sm:w-5 sm:h-5" /> : <ToggleRight size={16} className="sm:w-5 sm:h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDoctors.length === 0 && <p className="text-center py-6 sm:py-8 text-health-text-p text-xs sm:text-sm">No doctors found.</p>}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b">
              <h5 className="text-lg sm:text-xl font-bold">Add New Doctor</h5>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Name" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" required />
                <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" required />
                <input type="password" name="password" value={form.password} onChange={handleInputChange} placeholder="Password" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" required />
                <input type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Phone" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                <input type="number" name="age" value={form.age} onChange={handleInputChange} placeholder="Age" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                <select name="gender" value={form.gender} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base"><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base"><option value="">Blood Group</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select>
                <input type="text" name="specialization" value={form.specialization} onChange={handleInputChange} placeholder="Specialization" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                <input type="text" name="qualifications" value={form.qualifications} onChange={handleInputChange} placeholder="Qualifications" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                <input type="text" name="clinicName" value={form.clinicName} onChange={handleInputChange} placeholder="Clinic Name" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                <input type="text" name="clinicAddress" value={form.clinicAddress} onChange={handleInputChange} placeholder="Clinic Address" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleInputChange} placeholder="Consultation Fee" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-3 sm:pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 text-slate-700 px-4 sm:px-6 py-2 rounded-full hover:bg-slate-200 transition-all font-medium text-sm sm:text-base">Cancel</button>
                <button type="submit" className="bg-teal-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium text-sm sm:text-base">Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
