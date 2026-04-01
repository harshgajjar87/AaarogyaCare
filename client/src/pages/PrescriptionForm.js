import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Trash2, ArrowLeft, Send, Pill, ClipboardList, User, Calendar } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import MedicineDropdown from '../components/MedicineDropdown';
import axios from '../utils/axios';

const FormSection = ({ title, icon, children }) => (
  <div className="space-y-3 sm:space-y-4">
    <h3 className="text-base sm:text-lg font-semibold text-health-text-h flex items-center gap-2 border-b pb-2">
      {icon}
      <span>{title}</span>
    </h3>
    {children}
  </div>
);

const inputCls = 'w-full rounded-lg border border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors';
const labelCls = 'block text-xs sm:text-sm font-medium text-slate-700 mb-1';

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

  useEffect(() => { fetchAppointment(); }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`/appointments/doctor`);
      const apt = response.data.find(a => a._id === appointmentId);
      setAppointment(apt);
    } catch {
      toast.error('Failed to load appointment');
    }
  };

  const addMedicine = () => setMedicines([...medicines, {
    name: '', dosage: '',
    frequency: { morning: false, evening: false, night: false },
    timing: 'after_meal', days: 1
  }]);

  const removeMedicine = (index) => setMedicines(medicines.filter((_, i) => i !== index));

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
    for (let med of medicines) {
      if (!med.frequency.morning && !med.frequency.evening && !med.frequency.night) {
        return toast.error('Please select at least one frequency for each medicine');
      }
    }
    try {
      await axios.post('/prescriptions', { appointmentId, ...form, medicines });
      toast.success('Prescription created and sent to patient');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create prescription');
    }
  };

  if (!appointment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Create Prescription</h1>
      </div>
      <div className="text-center mb-4 sm:mb-6 md:mb-8 -mt-2 sm:-mt-4">
        <p className="text-health-text-p text-xs sm:text-sm md:text-base">Fill in the details below and send to the patient</p>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8">

        {/* Patient Info card */}
        <FormSection title="Patient Information" icon={<User size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Name', value: appointment.patientId?.name },
              { label: 'Age', value: appointment.age },
              { label: 'Gender', value: appointment.gender },
              { label: 'Date', value: new Date(appointment.date).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-health-text-h">{value || '—'}</p>
              </div>
            ))}
          </div>
        </FormSection>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

          {/* Diagnosis & Notes */}
          <FormSection title="Clinical Details" icon={<ClipboardList size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label className={labelCls}>
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                placeholder="e.g. Viral fever, Hypertension"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Clinical Notes</label>
              <div className="relative">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows="3"
                  placeholder="Enter clinical observations and notes..."
                  className={`${inputCls} pr-10 sm:pr-12`}
                />
                <div className="absolute top-2 right-2">
                  <VoiceInput
                    onTranscript={(t) => setForm({ ...form, notes: form.notes + (form.notes ? ' ' : '') + t })}
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Medicines */}
          <FormSection title="Medicines" icon={<Pill size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={addMedicine}
                className="bg-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-teal-700 flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {medicines.map((med, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-3 sm:p-4 md:p-5 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <span className="text-sm sm:text-base font-semibold text-health-text-h">
                      Medicine {index + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="p-1.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Remove medicine"
                      >
                        <Trash2 size={15} className="sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Medicine Name */}
                    <div>
                      <label className={labelCls}>
                        Medicine Name <span className="text-red-500">*</span>
                      </label>
                      <MedicineDropdown
                        value={med.name}
                        onChange={(value) => updateMedicine(index, 'name', value)}
                        placeholder="Search or type medicine name..."
                      />
                    </div>

                    {/* Dosage */}
                    <div>
                      <label className={labelCls}>
                        Dosage <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        placeholder="e.g. 1 tablet, 5ml"
                        className={inputCls}
                        required
                      />
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className={labelCls}>
                        Frequency <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 sm:gap-3 mt-1 flex-wrap">
                        {['morning', 'evening', 'night'].map((slot) => (
                          <label
                            key={slot}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs sm:text-sm cursor-pointer select-none transition-all ${
                              med.frequency[slot]
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={med.frequency[slot]}
                              onChange={(e) => updateMedicine(index, `frequency.${slot}`, e.target.checked)}
                              className="hidden"
                            />
                            {slot.charAt(0).toUpperCase() + slot.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Timing */}
                    <div>
                      <label className={labelCls}>Timing</label>
                      <select
                        value={med.timing}
                        onChange={(e) => updateMedicine(index, 'timing', e.target.value)}
                        className={inputCls}
                      >
                        <option value="before_meal">Before Meal</option>
                        <option value="after_meal">After Meal</option>
                      </select>
                    </div>

                    {/* Days */}
                    <div>
                      <label className={labelCls}>
                        Duration (days) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={med.days}
                        onChange={(e) => updateMedicine(index, 'days', Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max="365"
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Instructions & Follow-up */}
          <FormSection title="Additional Details" icon={<Calendar size={18} className="text-health-primary sm:w-5 sm:h-5" />}>
            <div>
              <label className={labelCls}>Instructions for Patient</label>
              <textarea
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                rows="3"
                placeholder="e.g. Drink plenty of water, avoid spicy food..."
                className={inputCls}
              />
            </div>

            <div className="sm:w-1/2">
              <label className={labelCls}>Follow-up Date</label>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={inputCls}
              />
            </div>
          </FormSection>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/doctor/dashboard')}
              className="px-6 py-2 sm:py-2.5 border border-slate-300 rounded-full text-sm sm:text-base text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-600 text-white px-6 py-2 sm:py-2.5 rounded-full hover:bg-teal-700 flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors"
            >
              <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
              Send Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
