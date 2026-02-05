import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SymptomChecker from '../components/SymptomChecker';

const SymptomCheckerPage = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">AI Symptom Checker</h1>
      </div>
      <div className="text-center mb-8 -mt-4">
        <p className="text-health-text-p">Describe your symptoms to get a preliminary analysis and a recommendation for a specialist.</p>
      </div>
      <SymptomChecker />
    </div>
  );
};

export default SymptomCheckerPage;