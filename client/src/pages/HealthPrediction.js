import React, { useState } from 'react';
import { Activity, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GeneralPrediction from '../components/GeneralPrediction';
import ReportAnalysis from '../components/ReportAnalysis';

const HealthPrediction = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  if (selectedOption === 'general') {
    return <GeneralPrediction onBack={() => setSelectedOption(null)} />;
  }

  if (selectedOption === 'report') {
    return <ReportAnalysis onBack={() => setSelectedOption(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Health Analyzer</h1>
      </div>

      <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 text-center">
        Choose an option to analyze your health
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div 
          onClick={() => setSelectedOption('general')}
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-6 sm:p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-teal-500"
        >
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
            <div className="bg-teal-100 p-3 sm:p-4 rounded-full">
              <Activity className="text-teal-600 w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800">General Prediction</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Get personalized health predictions based on your body metrics, lifestyle, and medical history
            </p>
          </div>
        </div>

        <div 
          onClick={() => setSelectedOption('report')}
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-6 sm:p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
            <div className="bg-blue-100 p-3 sm:p-4 rounded-full">
              <FileText className="text-blue-600 w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800">Report Analysis</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Upload and analyze your medical reports to understand what they mean and get actionable insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HealthPrediction;
