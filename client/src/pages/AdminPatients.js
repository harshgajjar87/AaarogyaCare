import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import AdminNavbar from '../components/AdminNavbar';
import { getAllPatients, togglePatientActiveStatus } from '../api/adminAPI';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filterPatients = () => {
      if (!searchTerm.trim()) {
        setFilteredPatients(patients);
        return;
      }

      const filtered = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.profile?.phone?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    };

    filterPatients();
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const response = await getAllPatients();
      console.log('Patients API Response:', response.data);

      if (!response.data) {
        throw new Error('No data received from API');
      }

      // Log each patient's data for debugging
      response.data.forEach((patient, index) => {
        console.log(`Patient ${index}:`, patient);
        console.log(`Patient ${index} createdAt:`, patient.createdAt);
      });

      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      console.error('Error response:', error.response);
      toast.error(`Failed to load patients: ${error.message}`);
      setPatients([]);
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
        console.error('Error toggling patient status:', error);
        toast.error(error.response?.data?.msg || `Failed to ${action} patient`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  return (
    <>
      <div className='container mt-5'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h2>Manage Patients</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className='text-center'>Loading patients...</div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-striped table-hover'>
              <thead className='table-dark'>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Register Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={patient._id || index}>
                    <td>{patient.name || 'N/A'}</td>
                    <td>{patient.profile?.phone || 'N/A'}</td>
                    <td>{patient.email}</td>
                    <td>{formatDate(patient.createdAt)}</td>
                    <td>
                      <span className={`badge ${patient.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${patient.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(patient._id, !patient.isActive)}
                      >
                        {patient.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPatients.length === 0 && (
              <div className='text-center py-4'>
                <p>{searchTerm ? 'No patients found matching your search' : 'No patients found.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPatients;
