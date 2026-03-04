import React, { useState } from 'react';
import axios from '../utils/axios';
import { Loader2, Heart, Activity, User, Calendar, Stethoscope, AlertTriangle, CheckCircle } from 'lucide-react';

const HealthPredictor = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Info
        age: '', gender: '', height: '', weight: '', heightUnit: 'cm', feet: '', inches: '',
        // Vitals
        bloodPressure: '', heartRate: '', bloodSugar: '', cholesterol: '',
        // Lifestyle
        smokingStatus: '', alcoholConsumption: '', exerciseFrequency: '', sleepHours: '',
        // Medical History
        familyHistory: [], currentMedications: '', chronicConditions: [],
        // Symptoms
        currentSymptoms: [], stressLevel: '', dietQuality: ''
    });
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked 
                    ? [...prev[name], value]
                    : prev[name].filter(item => item !== value)
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const getHeightInCm = () => {
        if (formData.heightUnit === 'cm') {
            return parseFloat(formData.height) || 0;
        } else {
            const feet = parseFloat(formData.feet) || 0;
            const inches = parseFloat(formData.inches) || 0;
            return (feet * 30.48) + (inches * 2.54);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setPrediction(null);
        
        try {
            const heightInCm = getHeightInCm();
            const bmi = (parseFloat(formData.weight) / Math.pow(heightInCm / 100, 2)).toFixed(1);
            const healthData = {
                ...formData,
                bmi: parseFloat(bmi),
                age: parseInt(formData.age),
                height: heightInCm,
                weight: parseFloat(formData.weight)
            };
            
            const res = await axios.post('/ai/health-prediction', healthData);
            setPrediction(res.data);
        } catch (err) {
            setError('Failed to generate health prediction. Please try again.');
            console.error('Error:', err);
        }
        setLoading(false);
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-health-text-h flex items-center gap-2">
                <User size={20} /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Height</label>
                    <div className="space-y-2">
                        <select name="heightUnit" value={formData.heightUnit} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary">
                            <option value="cm">Centimeters (cm)</option>
                            <option value="ft">Feet & Inches</option>
                        </select>
                        {formData.heightUnit === 'cm' ? (
                            <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="170" required className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                        ) : (
                            <div className="flex gap-2">
                                <input type="number" name="feet" value={formData.feet} onChange={handleChange} placeholder="5" required className="w-1/2 rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                                <span className="flex items-center text-sm text-gray-500">ft</span>
                                <input type="number" name="inches" value={formData.inches} onChange={handleChange} placeholder="8" required className="w-1/2 rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                                <span className="flex items-center text-sm text-gray-500">in</span>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} required className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-health-text-h flex items-center gap-2">
                <Activity size={20} /> Vital Signs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Blood Pressure (mmHg)</label>
                    <input type="text" name="bloodPressure" placeholder="120/80" value={formData.bloodPressure} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Heart Rate (bpm)</label>
                    <input type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Blood Sugar (mg/dL)</label>
                    <input type="number" name="bloodSugar" value={formData.bloodSugar} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Cholesterol (mg/dL)</label>
                    <input type="number" name="cholesterol" value={formData.cholesterol} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-health-text-h flex items-center gap-2">
                <Heart size={20} /> Lifestyle Factors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Smoking Status</label>
                    <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary">
                        <option value="">Select Status</option>
                        <option value="never">Never Smoked</option>
                        <option value="former">Former Smoker</option>
                        <option value="current">Current Smoker</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Alcohol Consumption</label>
                    <select name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary">
                        <option value="">Select Frequency</option>
                        <option value="none">None</option>
                        <option value="occasional">Occasional</option>
                        <option value="moderate">Moderate</option>
                        <option value="heavy">Heavy</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Exercise Frequency</label>
                    <select name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary">
                        <option value="">Select Frequency</option>
                        <option value="none">None</option>
                        <option value="1-2">1-2 times/week</option>
                        <option value="3-4">3-4 times/week</option>
                        <option value="daily">Daily</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-health-text-p mb-2">Sleep Hours/Night</label>
                    <input type="number" name="sleepHours" value={formData.sleepHours} onChange={handleChange} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
            </div>
        </div>
    );

    const renderPredictionReport = () => {
        if (!prediction) return null;
        
        return (
            <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border">
                <h3 className="text-2xl font-bold text-health-text-h mb-4 flex items-center gap-2">
                    <Stethoscope size={24} /> Health Prediction Report
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Overall Health Score</h4>
                            <div className="text-3xl font-bold text-blue-600">{prediction.healthScore || 'N/A'}/100</div>
                        </div>
                        
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} /> Risk Factors
                            </h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                {prediction.riskFactors?.map((risk, idx) => (
                                    <li key={idx}>• {risk}</li>
                                )) || <li>No significant risk factors identified</li>}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <CheckCircle size={16} /> Recommendations
                            </h4>
                            <ul className="text-sm text-green-700 space-y-1">
                                {prediction.recommendations?.map((rec, idx) => (
                                    <li key={idx}>• {rec}</li>
                                )) || <li>Maintain current healthy lifestyle</li>}
                            </ul>
                        </div>
                        
                        <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-2">Potential Conditions</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                {prediction.potentialConditions?.map((condition, idx) => (
                                    <li key={idx}>• {condition}</li>
                                )) || <li>No concerning conditions detected</li>}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>Disclaimer:</strong> This prediction is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-health-surface rounded-xl shadow-md border border-slate-100">
            <h2 className="text-3xl font-bold text-center text-health-text-h mb-6">AI Health Predictor</h2>
            
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    {[1, 2, 3].map(step => (
                        <div key={step} className={`flex items-center ${step < 3 ? 'flex-1' : ''}}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                currentStep >= step ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                {step}
                            </div>
                            {step < 3 && <div className={`flex-1 h-1 mx-2 ${
                                currentStep > step ? 'bg-teal-600' : 'bg-gray-200'
                            }`} />}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                
                <div className="flex justify-between">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                    )}
                    
                    {currentStep < 3 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="ml-auto px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-auto flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : 'Generate Prediction'}
                        </button>
                    )}
                </div>
            </form>
            
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}
            
            {renderPredictionReport()}
        </div>
    );
};

export default HealthPredictor;