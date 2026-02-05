
import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const SymptomChecker = () => {
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null); // Will hold { detected_disease, specialist }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError('');
        try {
            const res = await axios.post('/ai/specialist', { symptoms });
            setResult(res.data); // Store the whole response object
        } catch (error) {
            console.error('Error fetching specialist:', error);
            setError('Error fetching specialist recommendation. Please try again.');
        }
        setLoading(false);
    };

    const handleBookAppointment = () => {
        if (result && result.specialist) {
            navigate(`/doctors?specialist=${result.specialist}`);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-health-surface rounded-xl shadow-md border border-slate-100 space-y-4">
            <h2 className="text-2xl font-bold text-center text-health-text-h">Symptom Checker</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="symptoms" className="block text-sm font-medium text-health-text-p mb-2">
                        Describe your symptoms
                    </label>
                    <textarea
                        id="symptoms"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        rows="4"
                        className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-health-primary focus:border-health-primary"
                        placeholder="e.g., headache, fever, cough"
                    ></textarea>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-health-primary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Checking...
                        </>
                    ) : 'Check'}
                </button>
            </form>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {result && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                    <h3 className="text-lg font-semibold text-health-text-h">Possible Condition:</h3>
                    <p className="text-md text-health-text-p capitalize">{result.detected_disease}</p>

                    <h3 className="text-lg font-semibold mt-2 text-health-text-h">Recommended Specialist:</h3>
                    <p className="text-xl font-bold text-health-primary">{result.specialist}</p>

                    <button
                        onClick={handleBookAppointment}
                        className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Book Appointment
                    </button>
                </div>
            )}
        </div>
    );
};

export default SymptomChecker;
