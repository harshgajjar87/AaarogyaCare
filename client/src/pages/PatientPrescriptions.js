import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, FileText, Calendar, User, Download } from 'lucide-react';
import axios from '../utils/axios';

const PatientPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get('/prescriptions/patient');
      setPrescriptions(response.data);
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const downloadPrescription = (prescription) => {
    const medicineList = prescription.medicines.map(med => {
      const frequency = [];
      if (med.frequency.morning) frequency.push('Morning');
      if (med.frequency.evening) frequency.push('Evening');
      if (med.frequency.night) frequency.push('Night');
      
      return `• ${med.name} - ${med.dosage} (${frequency.join(', ')}) ${med.timing.replace('_', ' ')} for ${med.days} days`;
    }).join('\n');

    const prescriptionContent = `
AAROGYACARE PRESCRIPTION
========================

Date: ${new Date(prescription.createdAt).toLocaleDateString()}
Doctor: Dr. ${prescription.doctorId.name}
Patient: ${prescription.patientId?.name || 'N/A'}

DIAGNOSIS
=========
${prescription.diagnosis}

${prescription.notes ? `CLINICAL NOTES\n==============\n${prescription.notes}\n` : ''}

MEDICINES
=========
${medicineList}

${prescription.instructions ? `INSTRUCTIONS\n============\n${prescription.instructions}\n` : ''}

${prescription.followUpDate ? `FOLLOW-UP DATE\n==============\n${new Date(prescription.followUpDate).toLocaleDateString()}\n` : ''}

Thank you for choosing AarogyaCare!
    `;

    const blob = new Blob([prescriptionContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${new Date(prescription.createdAt).toLocaleDateString().replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">My Prescriptions</h1>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-health-text-h">Your Medical Prescriptions</h2>
        </div>
        
        <div className="p-6">
          {prescriptions.length > 0 ? (
            <div className="space-y-6">
              {prescriptions.map(prescription => (
                <div key={prescription._id} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-teal-600" />
                        <span className="font-semibold">Dr. {prescription.doctorId.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={14} />
                        <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadPrescription(prescription)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-2 text-sm"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-1">Diagnosis</h4>
                      <p className="text-slate-900">{prescription.diagnosis}</p>
                    </div>

                    {prescription.notes && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-1">Clinical Notes</h4>
                        <p className="text-slate-900">{prescription.notes}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Medicines</h4>
                      <div className="space-y-2">
                        {prescription.medicines.map((med, index) => {
                          const frequency = [];
                          if (med.frequency.morning) frequency.push('Morning');
                          if (med.frequency.evening) frequency.push('Evening');
                          if (med.frequency.night) frequency.push('Night');
                          
                          return (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg">
                              <div className="font-medium">{med.name}</div>
                              <div className="text-sm text-slate-600">
                                {med.dosage} • {frequency.join(', ')} • {med.timing.replace('_', ' ')} • {med.days} days
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {prescription.instructions && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-1">Instructions</h4>
                        <p className="text-slate-900">{prescription.instructions}</p>
                      </div>
                    )}

                    {prescription.followUpDate && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-1">Follow-up Date</h4>
                        <p className="text-slate-900">{new Date(prescription.followUpDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-health-text-p">
              <FileText size={40} className="mx-auto mb-4 text-slate-400" />
              <h5 className="font-semibold">No Prescriptions Found</h5>
              <p>You don't have any prescriptions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientPrescriptions;