import React, { useState } from 'react';
import axios from '../utils/axios';
import { ArrowLeft, Loader2, Heart, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const GeneralPrediction = ({ onBack }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    heightUnit: 'cm',
    heightCm: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    cholesterol: '',
    smokingStatus: '',
    alcoholConsumption: '',
    exerciseFrequency: '',
    sleepHours: '',
    familyHistory: '',
    chronicConditions: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let heightInCm = formData.heightUnit === 'cm' 
        ? parseFloat(formData.heightCm)
        : (parseFloat(formData.heightFeet) * 30.48) + (parseFloat(formData.heightInches || 0) * 2.54);
      
      const bmi = (parseFloat(formData.weight) / Math.pow(heightInCm / 100, 2)).toFixed(1);
      const res = await axios.post('/health/general-prediction', { ...formData, height: heightInCm, bmi });
      setPrediction(res.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
        <ArrowLeft size={20} />
        Back to Options
      </button>

      <h1 className="text-3xl font-bold text-slate-800 mb-6">General Health Prediction</h1>

      {!prediction ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Height</label>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setFormData({...formData, heightUnit: 'cm'})} className={`px-4 py-2 rounded-lg ${formData.heightUnit === 'cm' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'}`}>CM</button>
                <button type="button" onClick={() => setFormData({...formData, heightUnit: 'feet'})} className={`px-4 py-2 rounded-lg ${formData.heightUnit === 'feet' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Feet/Inches</button>
              </div>
              {formData.heightUnit === 'cm' ? (
                <input type="number" name="heightCm" value={formData.heightCm} onChange={handleChange} required placeholder="e.g., 170" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              ) : (
                <div className="flex gap-2">
                  <input type="number" name="heightFeet" value={formData.heightFeet} onChange={handleChange} required placeholder="Feet" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                  <input type="number" name="heightInches" value={formData.heightInches} onChange={handleChange} placeholder="Inches" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Blood Pressure (Systolic)</label>
              <input type="number" name="bloodPressureSystolic" value={formData.bloodPressureSystolic} onChange={handleChange} placeholder="e.g., 120" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Blood Pressure (Diastolic)</label>
              <input type="number" name="bloodPressureDiastolic" value={formData.bloodPressureDiastolic} onChange={handleChange} placeholder="e.g., 80" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Blood Sugar (mg/dL)</label>
              <input type="number" name="bloodSugar" value={formData.bloodSugar} onChange={handleChange} placeholder="Fasting" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cholesterol (mg/dL)</label>
              <input type="number" name="cholesterol" value={formData.cholesterol} onChange={handleChange} placeholder="Total" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Smoking Status</label>
              <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="">Select</option>
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="current">Current</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Alcohol Consumption</label>
              <select name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Exercise Frequency</label>
              <select name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="1-2">1-2 times/week</option>
                <option value="3-4">3-4 times/week</option>
                <option value="5+">5+ times/week</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sleep Hours (per night)</label>
              <input type="number" name="sleepHours" value={formData.sleepHours} onChange={handleChange} placeholder="e.g., 7" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Family History (comma separated)</label>
            <input type="text" name="familyHistory" value={formData.familyHistory} onChange={handleChange} placeholder="e.g., diabetes, heart disease" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Chronic Conditions (comma separated)</label>
            <input type="text" name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} placeholder="e.g., asthma, hypertension" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Analyzing...</> : 'Get Health Prediction'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Your Health Analysis</h2>
              <div className="flex items-center gap-2">
                <Heart className="text-red-500" size={24} />
                <span className="text-3xl font-bold text-teal-600">{prediction.healthScore}/100</span>
              </div>
            </div>

            {prediction.riskFactors?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="text-orange-500" size={20} />
                  Risk Factors
                </h3>
                <ul className="space-y-2">
                  {prediction.riskFactors.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prediction.potentialConditions?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="text-red-500" size={20} />
                  Potential Health Concerns
                </h3>
                <ul className="space-y-2">
                  {prediction.potentialConditions.map((condition, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prediction.recommendations?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button onClick={() => setPrediction(null)} className="w-full bg-slate-600 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors">
            New Prediction
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneralPrediction;
