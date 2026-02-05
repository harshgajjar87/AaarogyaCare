
import React, { useState } from 'react';
import axios from '../utils/axios';

const HealthRiskCalculator = () => {
    const [age, setAge] = useState('');
    const [bmi, setBmi] = useState('');
    const [bp, setBp] = useState('');
    const [risk, setRisk] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setRisk(null);
        try {
            const res = await axios.post('/ai/assess-risk', { age, bmi, bp });
            setRisk(res.data.risk_level);
        } catch (error) {
            console.error('Error fetching health risk:', error);
        }
        setLoading(false);
    };

    const getRiskBadgeClass = () => {
        if (!risk) return '';
        return risk.toLowerCase() === 'high risk' ? 'bg-red-500' : 'bg-green-500';
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-center">Health Risk Calculator</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                        Age
                    </label>
                    <input
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your age"
                    />
                </div>
                <div>
                    <label htmlFor="bmi" className="block text-sm font-medium text-gray-700">
                        BMI (Body Mass Index)
                    </label>
                    <input
                        type="number"
                        id="bmi"
                        value={bmi}
                        onChange={(e) => setBmi(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your BMI"
                    />
                </div>
                <div>
                    <label htmlFor="bp" className="block text-sm font-medium text-gray-700">
                        Blood Pressure (Systolic)
                    </label>
                    <input
                        type="number"
                        id="bp"
                        value={bp}
                        onChange={(e) => setBp(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your blood pressure"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                    {loading ? 'Analyzing...' : 'Analyze Risk'}
                </button>
            </form>
            {risk && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md text-center">
                    <h3 className="text-lg font-semibold">Health Risk Assessment:</h3>
                    <span className={`px-4 py-2 rounded-full text-white text-lg ${getRiskBadgeClass()}`}>
                        {risk}
                    </span>
                </div>
            )}
        </div>
    );
};

export default HealthRiskCalculator;
