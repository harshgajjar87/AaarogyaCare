import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { ArrowLeft, User, Calendar, FileText, Pill, Phone, Mail, MapPin } from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUtils';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      const { data } = await axios.get(`/doctors/patients/${patientId}`);
      setData(data);
    } catch (err) {
      toast.error('Failed to load patient details');
      navigate('/doctor/patients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading patient details...</div>;
  if (!data) return <div className="text-center p-8">Patient not found</div>;

  const { patient, appointments, prescriptions } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/doctor/patients')} className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-slate-800">Patient Details</h1>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start gap-6">
          <img src={getFullImageUrl(patient.profileImage)} alt={patient.name} className="w-24 h-24 rounded-full object-cover" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{patient.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-500" />
                <span>{patient.email}</span>
              </div>
              {patient.profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-500" />
                  <span>{patient.profile.phone}</span>
                </div>
              )}
              {patient.profile?.age && (
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-500" />
                  <span>{patient.profile.age} years, {patient.profile.gender}</span>
                </div>
              )}
              {patient.profile?.bloodGroup && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                  <span>{patient.profile.bloodGroup}</span>
                </div>
              )}
              {patient.profile?.address && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin size={16} className="text-slate-500" />
                  <span>{patient.profile.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Appointments ({appointments.length})
        </h3>
        {appointments.length === 0 ? (
          <p className="text-slate-500">No appointments found</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                  <p className="text-sm text-slate-600">{apt.reason || 'No reason provided'}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
        )}
      </div>

      {/* Prescriptions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Pill size={20} />
          Prescriptions ({prescriptions.length})
        </h3>
        {prescriptions.length === 0 ? (
          <p className="text-slate-500">No prescriptions found</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-slate-800">Prescription</h4>
                  <span className="text-sm text-slate-500">{new Date(prescription.createdAt).toLocaleDateString()}</span>
                </div>
                {prescription.medications && prescription.medications.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Medications:</h5>
                    <div className="space-y-1">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="text-sm text-slate-600">
                          <span className="font-medium">{med.name}</span> - {med.dosage} ({med.frequency})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {prescription.notes && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-1">Notes:</h5>
                    <p className="text-sm text-slate-600">{prescription.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;