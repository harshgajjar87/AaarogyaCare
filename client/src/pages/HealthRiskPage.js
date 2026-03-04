import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import HealthPredictor from '../components/HealthRisk';

const HealthRiskPage = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">AI Health Predictor</h1>
      </div>
      <div className="text-center mb-6 sm:mb-8 -mt-2 sm:-mt-4">
        <p className="text-xs sm:text-sm md:text-base text-health-text-p">Get comprehensive health predictions based on your personal information, vitals, and lifestyle factors.</p>
      </div>
      <HealthPredictor />
    </div>
  );
};

export default HealthRiskPage;