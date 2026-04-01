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

  const downloadPrescription = async (prescriptionId) => {
    try {
      const response = await axios.get(`/prescriptions/download/${prescriptionId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Prescription downloaded successfully');
    } catch (err) {
      toast.error('Failed to download prescription');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">My Prescriptions</h1>
      </div>

      <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100">
        <div className="p-3 sm:p-4 md:p-6 border-b">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h">Your Medical Prescriptions</h2>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6">
          {prescriptions.length > 0 ? (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {prescriptions.map(prescription => (
                <div key={prescription._id} className="border border-slate-200 rounded-lg p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 sm:mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <User size={14} className="sm:w-4 sm:h-4 text-teal-600" />
                        <span className="font-semibold text-sm sm:text-base">Dr. {prescription.doctorId.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
                        <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadPrescription(prescription._id)}
                      className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
                    >
                      <Download size={12} className="sm:w-3.5 sm:h-3.5" />
                      Download PDF
                    </button>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-700 mb-1">Diagnosis</h4>
                      <p className="text-slate-900 text-xs sm:text-sm">{prescription.diagnosis}</p>
                    </div>

                    {prescription.notes && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-700 mb-1">Clinical Notes</h4>
                        <p className="text-slate-900 text-xs sm:text-sm">{prescription.notes}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-700 mb-1.5 sm:mb-2">Medicines</h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {prescription.medicines.map((med, index) => {
                          const frequency = [];
                          if (med.frequency.morning) frequency.push('Morning');
                          if (med.frequency.evening) frequency.push('Evening');
                          if (med.frequency.night) frequency.push('Night');
                          
                          return (
                            <div key={index} className="bg-slate-50 p-2 sm:p-3 rounded-lg">
                              <div className="font-medium text-xs sm:text-sm">{med.name}</div>
                              <div className="text-[10px] sm:text-xs text-slate-600 mt-0.5">
                                {med.dosage} • {frequency.join(', ')} • {med.timing.replace('_', ' ')} • {med.days} days
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {prescription.instructions && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-700 mb-1">Instructions</h4>
                        <p className="text-slate-900 text-xs sm:text-sm">{prescription.instructions}</p>
                      </div>
                    )}

                    {prescription.followUpDate && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-700 mb-1">Follow-up Date</h4>
                        <p className="text-slate-900 text-xs sm:text-sm">{new Date(prescription.followUpDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 md:py-16 text-health-text-p px-3">
              <FileText size={32} className="sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4 text-slate-400" />
              <h5 className="font-semibold text-sm sm:text-base">No Prescriptions Found</h5>
              <p className="text-xs sm:text-sm">You don't have any prescriptions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientPrescriptions;