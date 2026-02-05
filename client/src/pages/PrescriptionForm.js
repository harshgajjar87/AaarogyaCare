import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Trash2, ArrowLeft, Send } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import MedicineDropdown from '../components/MedicineDropdown';
import axios from '../utils/axios';

const PrescriptionForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState({
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

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`/appointments/doctor`);
      const apt = response.data.find(a => a._id === appointmentId);
      setAppointment(apt);
    } catch (err) {
      toast.error('Failed to load appointment');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one frequency is selected for each medicine
    for (let med of medicines) {
      if (!med.frequency.morning && !med.frequency.evening && !med.frequency.night) {
        return toast.error('Please select at least one frequency (morning/evening/night) for each medicine');
      }
    }

    try {
      await axios.post('/prescriptions', {
        appointmentId,
        ...form,
        medicines
      });
      
      toast.success('Prescription created and sent to patient');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create prescription');
    }
  };

  if (!appointment) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">Create Prescription</h1>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
        <p><strong>Name:</strong> {appointment.patientId?.name}</p>
        <p><strong>Age:</strong> {appointment.age}</p>
        <p><strong>Gender:</strong> {appointment.gender}</p>
        <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Diagnosis *</label>
          <input
            type="text"
            value={form.diagnosis}
            onChange={(e) => setForm({...form, diagnosis: e.target.value})}
            className="w-full rounded-lg border-slate-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Clinical Notes</label>
          <div className="relative">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              rows="3"
              className="w-full rounded-lg border-slate-300 pr-12"
              placeholder="Enter clinical observations and notes..."
            />
            <div className="absolute top-2 right-2">
              <VoiceInput 
                onTranscript={(transcript) => setForm({...form, notes: form.notes + (form.notes ? ' ' : '') + transcript})}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Medicines</h3>
            <button type="button" onClick={addMedicine} className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 flex items-center gap-2">
              <Plus size={16} />
              Add Medicine
            </button>
          </div>

          {medicines.map((med, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Medicine {index + 1}</h4>
                {medicines.length > 1 && (
                  <button type="button" onClick={() => removeMedicine(index)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Medicine Name *</label>
                  <MedicineDropdown
                    value={med.name}
                    onChange={(value) => updateMedicine(index, 'name', value)}
                    placeholder="Search or type medicine name..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Dosage *</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                    placeholder="e.g., 1 tablet"
                    className="w-full rounded-lg border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Frequency *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={med.frequency.morning}
                        onChange={(e) => updateMedicine(index, 'frequency.morning', e.target.checked)}
                        className="mr-2"
                      />
                      Morning
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={med.frequency.evening}
                        onChange={(e) => updateMedicine(index, 'frequency.evening', e.target.checked)}
                        className="mr-2"
                      />
                      Evening
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={med.frequency.night}
                        onChange={(e) => updateMedicine(index, 'frequency.night', e.target.checked)}
                        className="mr-2"
                      />
                      Night
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Timing *</label>
                  <select
                    value={med.timing}
                    onChange={(e) => updateMedicine(index, 'timing', e.target.value)}
                    className="w-full rounded-lg border-slate-300"
                  >
                    <option value="before_meal">Before Meal</option>
                    <option value="after_meal">After Meal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Days *</label>
                  <input
                    type="number"
                    value={med.days}
                    onChange={(e) => updateMedicine(index, 'days', parseInt(e.target.value))}
                    min="1"
                    className="w-full rounded-lg border-slate-300"
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
            value={form.instructions}
            onChange={(e) => setForm({...form, instructions: e.target.value})}
            rows="3"
            className="w-full rounded-lg border-slate-300"
            placeholder="Additional instructions for the patient..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Follow-up Date</label>
          <input
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm({...form, followUpDate: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border-slate-300"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/doctor/dashboard')}
            className="px-6 py-2 border border-slate-300 rounded-full hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 flex items-center gap-2"
          >
            <Send size={16} />
            Send Prescription
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;