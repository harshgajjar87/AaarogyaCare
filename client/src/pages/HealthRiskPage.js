import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import HealthRiskCalculator from '../components/HealthRisk';

const HealthRiskPage = () => {
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
        <h1 className="text-3xl font-bold text-health-text-h">Health Risk Assessment</h1>
      </div>
      <div className="text-center mb-8 -mt-4">
        <p className="text-health-text-p">Use our AI tool to assess potential health risks based on your vitals.</p>
      </div>
      <HealthRiskCalculator />
    </div>
  );
};

export default HealthRiskPage;