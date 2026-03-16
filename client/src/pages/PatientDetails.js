import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { ArrowLeft, User, Calendar, FileText, Pill, Phone, Mail, MapPin, Download, Plus, Send, Trash2 } from 'lucide-react';
import { getProfileImageUrl } from '../utils/imageUtils';
import MedicineDropdown from '../components/MedicineDropdown';
import VoiceInput from '../components/VoiceInput';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    notes: '',
    instructions: '',
    followUpDate: ''
  });
  const [medicines, setMedicines] = useState([{
    name: '',
    dosage: '',
    frequency: { morning: false, evening: false, night: false },
    timing: 'after_meal',
    days: 1
  }]);
  const [submitting, setSubmitting] = useState(false);

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

  const handleDownloadPrescription = async (prescriptionId) => {
    try {
      const response = await axios.get(`/prescriptions/download/${prescriptionId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription_${patient.name}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Prescription downloaded successfully');
    } catch (err) {
      toast.error('Failed to download prescription');
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, {
      name: '',
      dosage: '',
      frequency: { morning: false, evening: false, night: false },
      timing: 'after_meal',
      days: 1
    }]);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index][parent][child] = value;
    } else {
      updated[index][field] = value;
    }
    setMedicines(updated);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    
    // Validate at least one frequency is selected for each medicine
    for (let med of medicines) {
      if (!med.frequency.morning && !med.frequency.evening && !med.frequency.night) {
        return toast.error('Please select at least one frequency (morning/evening/night) for each medicine');
      }
    }

    setSubmitting(true);
    try {
      await axios.post('/prescriptions/direct', {
        patientId,
        ...prescriptionForm,
        medicines
      });
      
      toast.success('Prescription created and sent to patient');
      setShowPrescriptionForm(false);
      setPrescriptionForm({
        diagnosis: '',
        notes: '',
        instructions: '',
        followUpDate: ''
      });
      setMedicines([{
        name: '',
        dosage: '',
        frequency: { morning: false, evening: false, night: false },
        timing: 'after_meal',
        days: 1
      }]);
      fetchPatientDetails(); // Refresh to show new prescription
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
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
          <img src={getProfileImageUrl(patient.profileImage)} alt={patient.name} className="w-24 h-24 rounded-full object-cover" onError={(e) => { e.target.src = '/images/default-avtar.jpg'; }} />
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Pill size={20} />
            Prescriptions ({prescriptions.length})
          </h3>
          <button
            onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
            className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            {showPrescriptionForm ? 'Cancel' : 'Create Prescription'}
          </button>
        </div>

        {/* Prescription Form */}
        {showPrescriptionForm && (
          <form onSubmit={handleSubmitPrescription} className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">New Prescription</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Diagnosis *</label>
                <input
                  type="text"
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                  className="w-full rounded-lg border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Clinical Notes</label>
                <div className="relative">
                  <textarea
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                    rows="3"
                    className="w-full rounded-lg border-slate-300 pr-12"
                    placeholder="Enter clinical observations and notes..."
                  />
                  <div className="absolute top-2 right-2">
                    <VoiceInput 
                      onTranscript={(transcript) => setPrescriptionForm({...prescriptionForm, notes: prescriptionForm.notes + (prescriptionForm.notes ? ' ' : '') + transcript})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-base font-semibold">Medicines</h5>
                  <button type="button" onClick={addMedicine} className="bg-teal-600 text-white px-3 py-1.5 rounded-full hover:bg-teal-700 flex items-center gap-2 text-sm">
                    <Plus size={14} />
                    Add Medicine
                  </button>
                </div>

                {medicines.map((med, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 mb-4 bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <h6 className="font-medium text-sm">Medicine {index + 1}</h6>
                      {medicines.length > 1 && (
                        <button type="button" onClick={() => removeMedicine(index)} className="text-red-600 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1">Medicine Name *</label>
                        <MedicineDropdown
                          value={med.name}
                          onChange={(value) => updateMedicine(index, 'name', value)}
                          placeholder="Search or type medicine name..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs mb-1">Dosage *</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                          placeholder="e.g., 1 tablet"
                          className="w-full rounded-lg border-slate-300 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs mb-1">Frequency *</label>
                        <div className="flex gap-3">
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={med.frequency.morning}
                              onChange={(e) => updateMedicine(index, 'frequency.morning', e.target.checked)}
                              className="mr-1.5"
                            />
                            Morning
                          </label>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={med.frequency.evening}
                              onChange={(e) => updateMedicine(index, 'frequency.evening', e.target.checked)}
                              className="mr-1.5"
                            />
                            Evening
                          </label>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={med.frequency.night}
                              onChange={(e) => updateMedicine(index, 'frequency.night', e.target.checked)}
                              className="mr-1.5"
                            />
                            Night
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs mb-1">Timing *</label>
                        <select
                          value={med.timing}
                          onChange={(e) => updateMedicine(index, 'timing', e.target.value)}
                          className="w-full rounded-lg border-slate-300 text-sm"
                        >
                          <option value="before_meal">Before Meal</option>
                          <option value="after_meal">After Meal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs mb-1">Days *</label>
                        <input
                          type="number"
                          value={med.days}
                          onChange={(e) => updateMedicine(index, 'days', parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-full rounded-lg border-slate-300 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Instructions</label>
                <textarea
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  rows="2"
                  className="w-full rounded-lg border-slate-300"
                  placeholder="Additional instructions for the patient..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                <input
                  type="date"
                  value={prescriptionForm.followUpDate}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, followUpDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionForm(false)}
                  className="px-6 py-2 border border-slate-300 rounded-full hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  {submitting ? 'Sending...' : 'Send Prescription'}
                </button>
              </div>
            </div>
          </form>
        )}

        {prescriptions.length === 0 ? (
          <p className="text-slate-500">No prescriptions found</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-slate-800">Prescription</h4>
                    {prescription.diagnosis && (
                      <p className="text-sm text-slate-600 mt-1"><span className="font-medium">Diagnosis:</span> {prescription.diagnosis}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{new Date(prescription.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDownloadPrescription(prescription._id)}
                      className="p-2 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                {prescription.medicines && prescription.medicines.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Medicines:</h5>
                    <div className="space-y-2">
                      {prescription.medicines.map((med, index) => (
                        <div key={index} className="text-sm text-slate-600 bg-white p-2 rounded">
                          <div className="font-medium">{med.name}</div>
                          <div className="text-xs mt-1">
                            <span>Dosage: {med.dosage}</span> | 
                            <span> Timing: {med.timing.replace('_', ' ')}</span> | 
                            <span> Days: {med.days}</span>
                          </div>
                          <div className="text-xs mt-1">
                            {med.frequency.morning && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mr-1">Morning</span>}
                            {med.frequency.evening && <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded mr-1">Evening</span>}
                            {med.frequency.night && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Night</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {prescription.instructions && (
                  <div className="mb-2">
                    <h5 className="text-sm font-medium text-slate-700 mb-1">Instructions:</h5>
                    <p className="text-sm text-slate-600">{prescription.instructions}</p>
                  </div>
                )}
                {prescription.notes && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-1">Notes:</h5>
                    <p className="text-sm text-slate-600">{prescription.notes}</p>
                  </div>
                )}
                {prescription.followUpDate && (
                  <div className="mt-2 text-sm text-slate-600">
                    <span className="font-medium">Follow-up:</span> {new Date(prescription.followUpDate).toLocaleDateString()}
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