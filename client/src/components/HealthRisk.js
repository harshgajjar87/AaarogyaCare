import React, { useState } from 'react';
import axios from '../utils/axios';
import { Loader2 } from 'lucide-react';

const HealthRiskCalculator = () => {
    const [formData, setFormData] = useState({ age: '', bmi: '', bp: '' });
    const [risk, setRisk] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRisk(null);
        try {
            const { age, bmi, bp } = formData;
            const res = await axios.post('/ai/assess-risk', {
                age: Number(age),
                bmi: Number(bmi),
                bp: Number(bp)
            });
            setRisk(res.data.label); // Backend returns { risk_score: 0|1, label: 'High Risk'|'Low Risk' }
        } catch (err) {
            setError('Failed to assess health risk. Please check your inputs and try again.');
            console.error('Error fetching health risk:', err);
        }
        setLoading(false);
    };

    const getRiskBadge = () => {
        if (!risk) return null;

        const isHighRisk = risk.toLowerCase().includes('high');
        const badgeClass = isHighRisk
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800';

        return (
            <span className={`px-3 py-1 text-base font-semibold rounded-full ${badgeClass}`}>
                {risk}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-health-surface rounded-xl shadow-md border border-slate-100 space-y-4">
            <h2 className="text-2xl font-bold text-center text-health-text-h">Health Risk Calculator</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-health-text-p mb-2">Age</label>
                    <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
                <div>
                    <label htmlFor="bmi" className="block text-sm font-medium text-health-text-p mb-2">BMI (Body Mass Index)</label>
                    <input type="number" step="0.1" name="bmi" id="bmi" value={formData.bmi} onChange={handleChange} required className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
                <div>
                    <label htmlFor="bp" className="block text-sm font-medium text-health-text-p mb-2">Average Blood Pressure</label>
                    <input type="number" name="bp" id="bp" value={formData.bp} onChange={handleChange} required className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary" />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-health-primary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Analyzing...
                        </>
                    ) : 'Analyze Risk'}
                </button>
            </form>
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            {risk && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border text-center">
                    <h3 className="text-lg font-semibold text-health-text-h">Health Risk Assessment:</h3>
                    <div className="mt-2">
                        {getRiskBadge()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthRiskCalculator;