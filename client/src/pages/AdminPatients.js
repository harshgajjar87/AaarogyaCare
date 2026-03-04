import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllPatients, togglePatientActiveStatus } from '../api/adminAPI';
import { Search, ToggleRight, ToggleLeft, ArrowLeft } from 'lucide-react';

const AdminPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = patients.filter(patient =>
      patient.name?.toLowerCase().includes(lowercasedTerm) ||
      patient.email?.toLowerCase().includes(lowercasedTerm) ||
      patient.profile?.phone?.includes(lowercasedTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getAllPatients();
      setPatients(response.data || []);
    } catch (error) {
      toast.error(`Failed to load patients: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    const action = newStatus ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} this patient?`)) {
      try {
        await togglePatientActiveStatus(id);
        toast.success(`Patient ${action}d successfully`);
        fetchPatients();
      } catch (error) {
        toast.error(error.response?.data?.msg || `Failed to ${action} patient`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Manage Patients</h1>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6">
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-500"
            placeholder="Search patients by name, email, or phone..."
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
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Register Date</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Status</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 font-medium text-health-text-h">{patient.name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{patient.email}<br/><span className="text-[9px] sm:text-xs text-slate-500">{patient.profile?.phone || 'N/A'}</span></td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{formatDate(patient.createdAt)}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-center">
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold leading-tight rounded-full text-[9px] sm:text-xs ${patient.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-center">
                      <button onClick={() => handleToggleStatus(patient._id, !patient.isActive)} className={`p-1 sm:p-2 rounded-full transition-colors ${patient.isActive ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-500 hover:bg-green-100'}`}>
                        {patient.isActive ? <ToggleLeft size={16} className="sm:w-5 sm:h-5" /> : <ToggleRight size={16} className="sm:w-5 sm:h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPatients.length === 0 && <p className="text-center py-6 sm:py-8 text-health-text-p text-xs sm:text-sm">No patients found.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPatients;
