import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { Users, ArrowLeft, Calendar, CheckCircle, Clock, XCircle, IndianRupee, Phone, Mail, User } from 'lucide-react';
import { getProfileImageUrl } from '../utils/imageUtils';

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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button onClick={() => navigate('/doctor/dashboard')} className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200">
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">My Patients</h1>
      </div>
      
      {(!patients || patients.length === 0) ? (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-8 sm:p-12 md:p-16 text-center">
          <Users size={48} className="sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-slate-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">No Patients Yet</h3>
          <p className="text-sm sm:text-base text-slate-500">Patients who book appointments with you will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {patients.map((patient) => (
            <div key={patient._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <img src={getProfileImageUrl(patient.profileImage)} alt={patient.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.src = '/images/default-avtar.jpg'; }} />
                <div className="flex-1 min-w-0">
                  <button 
                    onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                    className="text-base sm:text-lg font-bold text-teal-600 hover:text-teal-700 hover:underline text-left truncate block w-full"
                  >
                    {patient.name}
                  </button>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 mt-1">
                    <Mail size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  {patient.profile?.phone && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 mt-1">
                      <Phone size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span>{patient.profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-blue-600 mb-0.5 sm:mb-1">
                    <Calendar size={12} className="sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium">Total</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-700">{patient.totalAppointments}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-green-600 mb-0.5 sm:mb-1">
                    <CheckCircle size={12} className="sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium">Completed</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-green-700">{patient.completedAppointments}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-yellow-600 mb-0.5 sm:mb-1">
                    <Clock size={12} className="sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium">Pending</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-700">{patient.pendingAppointments}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-purple-600 mb-0.5 sm:mb-1">
                    <IndianRupee size={12} className="sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium">Revenue</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-purple-700">₹{patient.totalFeesPaid}</p>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
                className="w-full mt-3 sm:mt-4 bg-teal-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm sm:text-base"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50" onClick={() => setSelectedPatient(null)}>
          <div className="bg-white rounded-lg sm:rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Patient Details</h2>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
              <img src={getProfileImageUrl(selectedPatient.profileImage)} alt={selectedPatient.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" onError={(e) => { e.target.src = '/images/default-avtar.jpg'; }} />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">{selectedPatient.name}</h3>
                <p className="text-slate-600 text-sm sm:text-base">{selectedPatient.email}</p>
                {selectedPatient.profile?.phone && <p className="text-slate-600 text-sm sm:text-base">{selectedPatient.profile.phone}</p>}
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h4 className="font-semibold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base">Appointment History</h4>
              <div className="space-y-2">
                {selectedPatient.appointments.map((apt) => (
                  <div key={apt._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-slate-50 rounded-lg gap-2">
                    <div>
                      <p className="font-medium text-slate-800 text-xs sm:text-sm">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                      <p className="text-xs sm:text-sm text-slate-600">{apt.reason || 'No reason provided'}</p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        apt.status === 'completed' || apt.status === 'visited' ? 'bg-green-100 text-green-800' :
                        apt.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {apt.status}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">₹{apt.fees}</p>
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
