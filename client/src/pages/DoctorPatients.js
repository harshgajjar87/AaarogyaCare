import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { getPatientsByDoctorId } from '../api/appointmentAPI';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
// DoctorNavbar removed - already handled in Layout component

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchPatients = async () => {
    try {
      if (!user || !user._id) {
        throw new Error('Doctor not authenticated or ID not available');
      }

      const doctorId = user._id;
      const res = await getPatientsByDoctorId(doctorId);
      setPatients(res.data || []);
    } catch (err) {
      toast.error('Failed to load patients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <>
      <div className="container mt-5">
        <h2>My Patients</h2>
        <p className="text-muted">Patients who have taken appointments with you</p>

        {loading ? (
          <div className="text-center mt-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center mt-5 p-4 bg-light rounded">
            <h4>No patients found</h4>
            <p className="text-muted">You don't have any patients who have taken appointments with you yet.</p>
          </div>
        ) : (
          <div className="table-responsive mt-4">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Appointments</th>
                  <th>Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td><strong>{patient.name || 'N/A'}</strong></td>
                    <td>{patient.email || 'N/A'}</td>
                    <td>{patient.phone || 'N/A'}</td>
                    <td><span className="badge bg-info">{patient.appointmentCount || 0}</span></td>
                    <td>
                      {patient.lastAppointmentDate
                        ? new Date(patient.lastAppointmentDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorPatients;