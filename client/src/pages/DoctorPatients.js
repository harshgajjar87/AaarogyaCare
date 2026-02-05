import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { Users, ArrowLeft, Calendar, CheckCircle, Clock, XCircle, IndianRupee, Phone, Mail, User } from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUtils';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      console.log('Fetching patients from /doctors/patients');
      const { data } = await axios.get('/doctors/patients');
      console.log('Patients data received:', data);
      
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setPatients(data);
      } else if (data && Array.isArray(data.patients)) {
        setPatients(data.patients);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setPatients([]);
        toast.error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
      toast.error(err.response?.data?.msg || err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading patients...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/doctor/dashboard')} className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">My Patients</h1>
      </div>
      
      {(!patients || patients.length === 0) ? (
        <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
          <Users size={64} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No Patients Yet</h3>
          <p className="text-slate-500">Patients who book appointments with you will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {patients.map((patient) => (
            <div key={patient._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <img src={getFullImageUrl(patient.profileImage)} alt={patient.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                  <button 
                    onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                    className="text-lg font-bold text-teal-600 hover:text-teal-700 hover:underline text-left"
                  >
                    {patient.name}
                  </button>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                    <Mail size={14} />
                    <span>{patient.email}</span>
                  </div>
                  {patient.profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Phone size={14} />
                      <span>{patient.profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Calendar size={16} />
                    <span className="text-xs font-medium">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{patient.totalAppointments}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <CheckCircle size={16} />
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{patient.completedAppointments}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-600 mb-1">
                    <Clock size={16} />
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700">{patient.pendingAppointments}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <IndianRupee size={16} />
                    <span className="text-xs font-medium">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">₹{patient.totalFeesPaid}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {patient.profile?.age && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Age:</span>
                    <span className="font-medium">{patient.profile.age} years</span>
                  </div>
                )}
                {patient.profile?.gender && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gender:</span>
                    <span className="font-medium capitalize">{patient.profile.gender}</span>
                  </div>
                )}
                {patient.profile?.bloodGroup && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Blood Group:</span>
                    <span className="font-medium">{patient.profile.bloodGroup}</span>
                  </div>
                )}
                {patient.lastAppointmentDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Visit:</span>
                    <span className="font-medium">{new Date(patient.lastAppointmentDate).toLocaleDateString()}</span>
                  </div>
                )}
                {patient.nextAppointmentDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Next Visit:</span>
                    <span className="font-medium text-teal-600">{new Date(patient.nextAppointmentDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedPatient(patient)}
                className="w-full mt-4 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPatient(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Patient Details</h2>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <img src={getFullImageUrl(selectedPatient.profileImage)} alt={selectedPatient.name} className="w-20 h-20 rounded-full object-cover" />
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedPatient.name}</h3>
                <p className="text-slate-600">{selectedPatient.email}</p>
                {selectedPatient.profile?.phone && <p className="text-slate-600">{selectedPatient.profile.phone}</p>}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-slate-800 mb-3">Appointment History</h4>
              <div className="space-y-2">
                {selectedPatient.appointments.map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                      <p className="text-sm text-slate-600">{apt.reason || 'No reason provided'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'completed' || apt.status === 'visited' ? 'bg-green-100 text-green-800' :
                        apt.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {apt.status}
                      </span>
                      <p className="text-sm text-slate-600 mt-1">₹{apt.fees}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
