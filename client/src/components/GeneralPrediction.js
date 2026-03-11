import React, { useState } from 'react';
import axios from '../utils/axios';
import { ArrowLeft, Loader2, Heart, TrendingUp, AlertCircle, CheckCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const GeneralPrediction = ({ onBack }) => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState({
    // Section 1: Basic Health Information
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
    familyHistory: '',
    chronicConditions: '',
    currentMedications: '',
    allergies: '',
    
    // Section 2: Lifestyle & Habits
    smokingStatus: '',
    alcoholConsumption: '',
    alcoholFrequency: '',
    dietType: '',
    mealsPerDay: '',
    waterIntake: '',
    caffeineIntake: '',
    fastFoodFrequency: '',
    vegetableIntake: '',
    fruitIntake: '',
    stressLevel: '',
    screenTime: '',
    
    // Section 3: Sleep & Activity Patterns
    sleepHours: '',
    sleepQuality: '',
    sleepSchedule: '',
    exerciseFrequency: '',
    exerciseType: '',
    exerciseDuration: '',
    physicalActivity: '',
    sittingHours: '',
    mentalHealth: '',
    workEnvironment: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextSection = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentSection(prev => Math.min(prev + 1, 3));
  };

  const prevSection = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentSection(prev => Math.max(prev - 1, 1));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text, fontSize = 10, isBold = false, spacing = 5) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach((line) => {
        if (yPosition + fontSize * 0.4 > pageHeight - margin - 10) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.4;
      });
      yPosition += spacing;
    };

    // Header
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('General Health Prediction Report', pageWidth / 2, 20, { align: 'center' });
    
    yPosition = 40;
    doc.setTextColor(0, 0, 0);

    // Health Score
    addText(`Health Score: ${prediction.healthScore}/100`, 16, true, 8);
    addText(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, false, 10);

    // Patient Information
    addText('PATIENT INFORMATION', 14, true, 3);
    addText(`Age: ${formData.age} years`, 10, false, 2);
    addText(`Gender: ${formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}`, 10, false, 2);
    
    const heightInCm = formData.heightUnit === 'cm' 
      ? parseFloat(formData.heightCm)
      : (parseFloat(formData.heightFeet) * 30.48) + (parseFloat(formData.heightInches || 0) * 2.54);
    const bmi = (parseFloat(formData.weight) / Math.pow(heightInCm / 100, 2)).toFixed(1);
    
    addText(`Height: ${heightInCm.toFixed(1)} cm`, 10, false, 2);
    addText(`Weight: ${formData.weight} kg`, 10, false, 2);
    addText(`BMI: ${bmi}`, 10, false, 8);

    // Overall Assessment
    if (prediction.overallAssessment) {
      doc.setTextColor(37, 99, 235);
      addText('OVERALL ASSESSMENT', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      addText(prediction.overallAssessment, 10, false, 8);
    }

    // Risk Factors
    if (prediction.riskFactors && prediction.riskFactors.length > 0) {
      doc.setTextColor(249, 115, 22);
      addText('RISK FACTORS', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      prediction.riskFactors.forEach((risk) => {
        const riskText = typeof risk === 'object' ? `${risk.factor} (${risk.severity}): ${risk.explanation}` : risk;
        addText(`• ${riskText}`, 10, false, 3);
      });
      yPosition += 3;
    }

    // Potential Conditions
    if (prediction.potentialConditions && prediction.potentialConditions.length > 0) {
      doc.setTextColor(239, 68, 68);
      addText('POTENTIAL HEALTH CONCERNS', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      prediction.potentialConditions.forEach((condition) => {
        const condText = typeof condition === 'object' ? `${condition.condition} (${condition.risk}): ${condition.description}` : condition;
        addText(`• ${condText}`, 10, false, 3);
      });
      yPosition += 3;
    }

    // Daily Routine
    if (prediction.dailyRoutine) {
      doc.setTextColor(234, 179, 8);
      addText('DAILY ROUTINE', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      if (prediction.dailyRoutine.morning?.length > 0) {
        addText('Morning:', 11, true, 2);
        prediction.dailyRoutine.morning.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.dailyRoutine.afternoon?.length > 0) {
        addText('Afternoon:', 11, true, 2);
        prediction.dailyRoutine.afternoon.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.dailyRoutine.evening?.length > 0) {
        addText('Evening:', 11, true, 2);
        prediction.dailyRoutine.evening.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.dailyRoutine.night?.length > 0) {
        addText('Night:', 11, true, 2);
        prediction.dailyRoutine.night.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      yPosition += 3;
    }

    // Diet Plan
    if (prediction.dietPlan) {
      doc.setTextColor(34, 197, 94);
      addText('DIET PLAN', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      if (prediction.dietPlan.breakfast?.length > 0) {
        addText('Breakfast:', 11, true, 2);
        prediction.dietPlan.breakfast.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.dietPlan.lunch?.length > 0) {
        addText('Lunch:', 11, true, 2);
        prediction.dietPlan.lunch.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.dietPlan.dinner?.length > 0) {
        addText('Dinner:', 11, true, 2);
        prediction.dietPlan.dinner.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.dietPlan.snacks?.length > 0) {
        addText('Snacks:', 11, true, 2);
        prediction.dietPlan.snacks.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.dietPlan.hydration) {
        addText('Hydration:', 11, true, 2);
        addText(`  ${prediction.dietPlan.hydration}`, 9, false, 2);
      }
      if (prediction.dietPlan.avoid?.length > 0) {
        addText('Foods to Avoid:', 11, true, 2);
        prediction.dietPlan.avoid.forEach(item => addText(`  ✗ ${item}`, 9, false, 2));
      }
      yPosition += 3;
    }

    // Exercise Plan
    if (prediction.exercisePlan) {
      doc.setTextColor(239, 68, 68);
      addText('EXERCISE PLAN', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      if (prediction.exercisePlan.cardio) {
        addText('Cardio:', 11, true, 2);
        addText(`  ${prediction.exercisePlan.cardio}`, 9, false, 2);
      }
      if (prediction.exercisePlan.strength) {
        addText('Strength Training:', 11, true, 2);
        addText(`  ${prediction.exercisePlan.strength}`, 9, false, 2);
      }
      if (prediction.exercisePlan.flexibility) {
        addText('Flexibility:', 11, true, 2);
        addText(`  ${prediction.exercisePlan.flexibility}`, 9, false, 2);
      }
      if (prediction.exercisePlan.weeklySchedule) {
        addText('Weekly Schedule:', 11, true, 2);
        addText(`  ${prediction.exercisePlan.weeklySchedule}`, 9, false, 2);
      }
      yPosition += 3;
    }

    // Mental Wellness
    if (prediction.mentalWellness) {
      doc.setTextColor(139, 92, 246);
      addText('MENTAL WELLNESS', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      if (prediction.mentalWellness.stressManagement?.length > 0) {
        addText('Stress Management:', 11, true, 2);
        prediction.mentalWellness.stressManagement.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.mentalWellness.mindfulness?.length > 0) {
        addText('Mindfulness:', 11, true, 2);
        prediction.mentalWellness.mindfulness.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      yPosition += 3;
    }

    // Preventive Care
    if (prediction.preventiveCare) {
      doc.setTextColor(59, 130, 246);
      addText('PREVENTIVE CARE', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      if (prediction.preventiveCare.screenings?.length > 0) {
        addText('Recommended Screenings:', 11, true, 2);
        prediction.preventiveCare.screenings.forEach(item => addText(`  • ${item}`, 9, false, 2));
      }
      if (prediction.preventiveCare.checkupFrequency) {
        addText('Checkup Frequency:', 11, true, 2);
        addText(`  ${prediction.preventiveCare.checkupFrequency}`, 9, false, 2);
      }
      yPosition += 3;
    }

    // Do's and Don'ts
    if (prediction.dosList?.length > 0 || prediction.dontsList?.length > 0) {
      doc.setTextColor(20, 184, 166);
      addText("DO'S AND DON'TS", 14, true, 3);
      doc.setTextColor(0, 0, 0);
      if (prediction.dosList?.length > 0) {
        addText("Do's:", 11, true, 2);
        prediction.dosList.forEach(item => addText(`  ✓ ${item}`, 9, false, 2));
      }
      if (prediction.dontsList?.length > 0) {
        addText("Don'ts:", 11, true, 2);
        prediction.dontsList.forEach(item => addText(`  ✗ ${item}`, 9, false, 2));
      }
      yPosition += 3;
    }

    // Goals
    if (prediction.shortTermGoals?.length > 0 || prediction.longTermGoals?.length > 0) {
      doc.setTextColor(168, 85, 247);
      addText('HEALTH GOALS', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      if (prediction.shortTermGoals?.length > 0) {
        addText('Short-Term Goals (1-3 months):', 11, true, 2);
        prediction.shortTermGoals.forEach(goal => addText(`  → ${goal}`, 9, false, 2));
      }
      if (prediction.longTermGoals?.length > 0) {
        addText('Long-Term Goals (6-12 months):', 11, true, 2);
        prediction.longTermGoals.forEach(goal => addText(`  → ${goal}`, 9, false, 2));
      }
      yPosition += 3;
    }

    // Emergency Warnings
    if (prediction.emergencyWarnings?.length > 0) {
      doc.setTextColor(220, 38, 38);
      addText('EMERGENCY WARNING SIGNS', 14, true, 3);
      addText('Seek immediate medical attention if you experience:', 10, true, 2);
      doc.setTextColor(0, 0, 0);
      prediction.emergencyWarnings.forEach(warning => addText(`  ! ${warning}`, 9, false, 2));
      yPosition += 3;
    }

    // Recommendations
    if (prediction.recommendations && prediction.recommendations.length > 0) {
      doc.setTextColor(34, 197, 94);
      addText('RECOMMENDATIONS', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      prediction.recommendations.forEach((rec) => {
        const recText = typeof rec === 'object' ? `${rec.action} (${rec.priority} priority): ${rec.explanation}` : rec;
        addText(`• ${recText}`, 10, false, 3);
      });
      yPosition += 3;
    }

    // Disclaimer
    if (yPosition + 30 > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFillColor(239, 246, 255);
    doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 25, 'F');
    doc.setTextColor(37, 99, 235);
    addText('DISCLAIMER', 11, true, 3);
    doc.setTextColor(0, 0, 0);
    addText('This is an AI-generated health prediction for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.', 9, false, 5);

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by AarogyaCare Health Prediction System', pageWidth / 2, footerY, { align: 'center' });

    // Save PDF
    const fileName = `Health_Prediction_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only submit if on section 3
    if (currentSection !== 3) {
      nextSection();
      return;
    }
    
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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6">
      <button onClick={onBack} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 sm:mb-6 text-sm sm:text-base">
        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        Back to Options
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-6">General Health Prediction</h1>

      {!prediction ? (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 overflow-x-auto">
              {[1, 2, 3].map((section) => (
                <div key={section} className="flex items-center flex-1 min-w-0">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base flex-shrink-0 ${
                    currentSection === section ? 'bg-teal-600 text-white' :
                    currentSection > section ? 'bg-green-500 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {currentSection > section ? '✓' : section}
                  </div>
                  <div className="flex-1 ml-1 sm:ml-2 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium truncate ${currentSection >= section ? 'text-teal-600' : 'text-slate-400'}`}>
                      {section === 1 ? 'Basic Health' : section === 2 ? 'Lifestyle' : 'Sleep & Activity'}
                    </p>
                  </div>
                  {section < 3 && (
                    <div className={`h-1 flex-1 mx-1 sm:mx-2 rounded ${currentSection > section ? 'bg-green-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Section 1: Basic Health Information */}
            {currentSection === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="border-b pb-3 sm:pb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Basic Health Information</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">Tell us about your basic health metrics</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Age *</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Height *</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg) *</label>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Family History</label>
                  <input type="text" name="familyHistory" value={formData.familyHistory} onChange={handleChange} placeholder="e.g., diabetes, heart disease, cancer" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Chronic Conditions</label>
                  <input type="text" name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} placeholder="e.g., asthma, hypertension, arthritis" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Medications</label>
                  <input type="text" name="currentMedications" value={formData.currentMedications} onChange={handleChange} placeholder="List any medications you're taking" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Allergies</label>
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Food, drug, or environmental allergies" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>
              </div>
            )}

            {/* Section 2: Lifestyle & Habits */}
            {currentSection === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="border-b pb-3 sm:pb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Lifestyle & Habits</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">Tell us about your daily habits and diet</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Smoking Status</label>
                    <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="never">Never</option>
                      <option value="former">Former Smoker</option>
                      <option value="current-light">Current (Light - less than 10/day)</option>
                      <option value="current-moderate">Current (Moderate - 10-20/day)</option>
                      <option value="current-heavy">Current (Heavy - more than 20/day)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Alcohol Consumption</label>
                    <select name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="none">None</option>
                      <option value="occasional">Occasional (1-2 times/month)</option>
                      <option value="moderate">Moderate (1-2 times/week)</option>
                      <option value="regular">Regular (3-4 times/week)</option>
                      <option value="heavy">Heavy (Daily)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Diet Type</label>
                    <select name="dietType" value={formData.dietType} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="balanced">Balanced (All food groups)</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Keto/Low-carb</option>
                      <option value="high-protein">High Protein</option>
                      <option value="irregular">Irregular/No specific diet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Meals Per Day</label>
                    <select name="mealsPerDay" value={formData.mealsPerDay} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="1">1 meal</option>
                      <option value="2">2 meals</option>
                      <option value="3">3 meals</option>
                      <option value="4+">4 or more meals</option>
                      <option value="irregular">Irregular</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Water Intake (glasses/day)</label>
                    <select name="waterIntake" value={formData.waterIntake} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="1-2">1-2 glasses</option>
                      <option value="3-4">3-4 glasses</option>
                      <option value="5-6">5-6 glasses</option>
                      <option value="7-8">7-8 glasses</option>
                      <option value="8+">More than 8 glasses</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Caffeine Intake</label>
                    <select name="caffeineIntake" value={formData.caffeineIntake} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="none">None</option>
                      <option value="1-cup">1 cup/day</option>
                      <option value="2-3-cups">2-3 cups/day</option>
                      <option value="4+-cups">4+ cups/day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fast Food Frequency</label>
                    <select name="fastFoodFrequency" value={formData.fastFoodFrequency} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="never">Never/Rarely</option>
                      <option value="monthly">1-2 times/month</option>
                      <option value="weekly">1-2 times/week</option>
                      <option value="frequent">3+ times/week</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vegetable Intake</label>
                    <select name="vegetableIntake" value={formData.vegetableIntake} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="rarely">Rarely</option>
                      <option value="1-serving">1 serving/day</option>
                      <option value="2-3-servings">2-3 servings/day</option>
                      <option value="4+-servings">4+ servings/day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fruit Intake</label>
                    <select name="fruitIntake" value={formData.fruitIntake} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="rarely">Rarely</option>
                      <option value="1-serving">1 serving/day</option>
                      <option value="2-3-servings">2-3 servings/day</option>
                      <option value="4+-servings">4+ servings/day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Stress Level</label>
                    <select name="stressLevel" value={formData.stressLevel} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="very-high">Very High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Screen Time (hours/day)</label>
                    <select name="screenTime" value={formData.screenTime} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="0-2">0-2 hours</option>
                      <option value="3-4">3-4 hours</option>
                      <option value="5-6">5-6 hours</option>
                      <option value="7-8">7-8 hours</option>
                      <option value="8+">More than 8 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Sleep & Activity Patterns */}
            {currentSection === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="border-b pb-3 sm:pb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Sleep & Activity Patterns</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">Tell us about your sleep and physical activity</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sleep Hours (per night)</label>
                    <select name="sleepHours" value={formData.sleepHours} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="less-4">Less than 4 hours</option>
                      <option value="4-5">4-5 hours</option>
                      <option value="6-7">6-7 hours</option>
                      <option value="7-8">7-8 hours</option>
                      <option value="8-9">8-9 hours</option>
                      <option value="9+">More than 9 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sleep Quality</label>
                    <select name="sleepQuality" value={formData.sleepQuality} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="poor">Poor (frequent waking, not restful)</option>
                      <option value="fair">Fair (some disturbances)</option>
                      <option value="good">Good (mostly restful)</option>
                      <option value="excellent">Excellent (deep, uninterrupted)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sleep Schedule</label>
                    <select name="sleepSchedule" value={formData.sleepSchedule} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="regular">Regular (same time daily)</option>
                      <option value="mostly-regular">Mostly Regular</option>
                      <option value="irregular">Irregular</option>
                      <option value="shift-work">Shift Work/Night shifts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Exercise Frequency</label>
                    <select name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="none">None</option>
                      <option value="1-2">1-2 times/week</option>
                      <option value="3-4">3-4 times/week</option>
                      <option value="5-6">5-6 times/week</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Exercise Type</label>
                    <select name="exerciseType" value={formData.exerciseType} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="none">No exercise</option>
                      <option value="cardio">Cardio (running, cycling)</option>
                      <option value="strength">Strength training</option>
                      <option value="yoga">Yoga/Pilates</option>
                      <option value="sports">Sports</option>
                      <option value="mixed">Mixed/Varied</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Exercise Duration (per session)</label>
                    <select name="exerciseDuration" value={formData.exerciseDuration} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="none">No exercise</option>
                      <option value="15-30">15-30 minutes</option>
                      <option value="30-45">30-45 minutes</option>
                      <option value="45-60">45-60 minutes</option>
                      <option value="60+">More than 60 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Daily Physical Activity</label>
                    <select name="physicalActivity" value={formData.physicalActivity} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="sedentary">Sedentary (mostly sitting)</option>
                      <option value="light">Light (some walking)</option>
                      <option value="moderate">Moderate (regular movement)</option>
                      <option value="active">Active (physically demanding job)</option>
                      <option value="very-active">Very Active (athlete/labor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sitting Hours (per day)</label>
                    <select name="sittingHours" value={formData.sittingHours} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="0-2">0-2 hours</option>
                      <option value="3-4">3-4 hours</option>
                      <option value="5-6">5-6 hours</option>
                      <option value="7-8">7-8 hours</option>
                      <option value="8+">More than 8 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mental Health</label>
                    <select name="mentalHealth" value={formData.mentalHealth} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="seeking-help">Currently seeking help</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Work Environment</label>
                    <select name="workEnvironment" value={formData.workEnvironment} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="office">Office/Desk work</option>
                      <option value="remote">Remote/Work from home</option>
                      <option value="field">Field work/Outdoor</option>
                      <option value="physical">Physical labor</option>
                      <option value="mixed">Mixed environment</option>
                      <option value="not-working">Not currently working</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 sm:pt-6 border-t gap-2 sm:gap-4">
              {currentSection > 1 && (
                <button type="button" onClick={(e) => prevSection(e)} className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
                  Previous
                </button>
              )}
              {currentSection < 3 ? (
                <button type="button" onClick={(e) => nextSection(e)} className="ml-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={loading} className="ml-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading ? <><Loader2 className="animate-spin" size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Analyzing...</span><span className="sm:hidden">Analyzing</span></> : <><span className="hidden sm:inline">Get Health Prediction</span><span className="sm:hidden">Analyze</span></>}
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Your Health Analysis</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Download size={20} />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
                <div className="flex items-center gap-2">
                  <Heart className="text-red-500" size={24} />
                  <span className="text-3xl font-bold text-teal-600">{prediction.healthScore}/100</span>
                </div>
              </div>
            </div>

            {/* Overall Assessment */}
            {prediction.overallAssessment && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Overall Assessment
                </h3>
                <p className="text-slate-700 leading-relaxed">{prediction.overallAssessment}</p>
              </div>
            )}

            {/* Hidden Patterns - WOW Factor */}
            {prediction.hiddenPatterns && prediction.hiddenPatterns.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-3xl">🔍</span>
                  Hidden Health Patterns We Discovered About You
                </h3>
                <div className="space-y-4">
                  {prediction.hiddenPatterns.map((pattern, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-r-lg p-5 shadow-sm">
                      <h4 className="font-bold text-purple-900 text-lg mb-3">{pattern.pattern}</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-purple-800"><strong className="text-purple-900">💡 Why this matters:</strong> {pattern.insight}</p>
                        <p className="text-sm text-purple-800"><strong className="text-purple-900">🔮 Future prediction:</strong> {pattern.prediction}</p>
                        <div className="bg-purple-100 border border-purple-200 rounded p-3 mt-3">
                          <p className="text-sm text-purple-900 font-medium">✨ Surprising insight: {pattern.surprise}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Insights */}
            {prediction.personalizedInsights && prediction.personalizedInsights.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-3xl">💡</span>
                  Personalized Insights Just For You
                </h3>
                <div className="space-y-4">
                  {prediction.personalizedInsights.map((insight, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-5 shadow-sm">
                      <h4 className="font-bold text-amber-900 text-lg mb-3">{insight.insight}</h4>
                      <div className="space-y-2 mb-3">
                        <p className="text-sm text-amber-800"><strong>📊 Evidence:</strong> {insight.evidence}</p>
                        <p className="text-sm text-amber-800"><strong>⚡ Impact:</strong> {insight.impact}</p>
                      </div>
                      <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded">
                        <p className="text-sm text-amber-900 font-medium"><strong>🎯 What you can do:</strong> {insight.actionable}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Surprising Connections */}
            {prediction.surprisingConnections && prediction.surprisingConnections.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-3xl">🔗</span>
                  Surprising Health Connections
                </h3>
                <div className="space-y-3">
                  {prediction.surprisingConnections.map((conn, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-900 mb-2">{conn.connection}</h4>
                      <p className="text-sm text-cyan-800 mb-2"><strong>How it works:</strong> {conn.explanation}</p>
                      <p className="text-sm text-cyan-700"><strong>Impact on you:</strong> {conn.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Future Projection */}
            {prediction.futureProjection && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-3xl">🔮</span>
                  Your Health Future - Two Paths
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      If No Changes Are Made
                    </h4>
                    <p className="text-sm text-red-800">{prediction.futureProjection.ifNoChange}</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                      <span>✅</span>
                      With Recommended Changes
                    </h4>
                    <p className="text-sm text-green-800">{prediction.futureProjection.withChanges}</p>
                  </div>
                </div>
                {prediction.futureProjection.keyMilestones && prediction.futureProjection.keyMilestones.length > 0 && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">Key Milestones to Track:</h5>
                    <ul className="space-y-1">
                      {prediction.futureProjection.keyMilestones.map((milestone, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600">→</span>
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {prediction.riskFactors?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-orange-500" size={24} />
                  Risk Factors Identified
                </h3>
                <div className="space-y-4">
                  {prediction.riskFactors.map((risk, idx) => {
                    const isDetailed = typeof risk === 'object' && risk.factor;
                    return (
                      <div key={idx} className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-5 shadow-sm">
                        {isDetailed ? (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-orange-900 text-lg">{risk.factor}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                risk.severity === 'high' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                                risk.severity === 'moderate' ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                                'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                              }`}>
                                {risk.severity?.toUpperCase()} SEVERITY
                              </span>
                            </div>
                            <p className="text-sm text-orange-800 mb-3 leading-relaxed">{risk.explanation}</p>
                            <div className="bg-orange-100 border border-orange-200 rounded p-3 mb-3">
                              <p className="text-sm text-orange-900"><strong>⚡ Impact on your health:</strong> {risk.impact}</p>
                            </div>
                            {risk.timeline && (
                              <p className="text-sm text-orange-700 mb-3"><strong>⏰ Timeline:</strong> {risk.timeline}</p>
                            )}
                            {risk.earlyWarnings && risk.earlyWarnings.length > 0 && (
                              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
                                <p className="text-xs font-bold text-red-900 mb-2">🚨 Early warning signs to watch for:</p>
                                <ul className="space-y-1">
                                  {risk.earlyWarnings.map((warning, i) => (
                                    <li key={i} className="text-xs text-red-800 flex items-start gap-2">
                                      <span className="text-red-600">•</span>
                                      <span>{warning}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-orange-800">{risk}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {prediction.potentialConditions?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-red-500" size={24} />
                  Potential Health Concerns
                </h3>
                <div className="space-y-4">
                  {prediction.potentialConditions.map((condition, idx) => {
                    const isDetailed = typeof condition === 'object' && condition.condition;
                    return (
                      <div key={idx} className="bg-red-50 border-2 border-red-300 rounded-lg p-5 shadow-md">
                        {isDetailed ? (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-red-900 text-lg">{condition.condition}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                condition.risk === 'high' ? 'bg-red-100 text-red-700 border-2 border-red-400' :
                                condition.risk === 'moderate' ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                                'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                              }`}>
                                {condition.risk?.toUpperCase()} RISK
                              </span>
                            </div>
                            {condition.likelihood && (
                              <div className="bg-red-100 border border-red-200 rounded p-2 mb-3">
                                <p className="text-sm text-red-900 font-bold">📊 Likelihood: {condition.likelihood}</p>
                              </div>
                            )}
                            <p className="text-sm text-red-800 mb-3 leading-relaxed">{condition.description}</p>
                            {condition.whyYou && (
                              <div className="bg-gradient-to-r from-red-100 to-orange-100 border-l-4 border-red-500 p-4 rounded-r mb-3">
                                <p className="text-sm text-red-900 font-semibold mb-1">🎯 Why YOU specifically are at risk:</p>
                                <p className="text-sm text-red-800">{condition.whyYou}</p>
                              </div>
                            )}
                            {condition.earlySymptoms && condition.earlySymptoms.length > 0 && (
                              <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-3">
                                <p className="text-xs font-bold text-yellow-900 mb-2">⚠️ You might already be experiencing these without realizing:</p>
                                <ul className="space-y-1">
                                  {condition.earlySymptoms.map((symptom, i) => (
                                    <li key={i} className="text-xs text-yellow-800 flex items-start gap-2">
                                      <span className="text-yellow-600">→</span>
                                      <span>{symptom}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {condition.preventionTips && condition.preventionTips.length > 0 && (
                              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
                                <p className="text-xs font-bold text-green-900 mb-2">✅ How to prevent this:</p>
                                <ul className="space-y-1">
                                  {condition.preventionTips.map((tip, i) => (
                                    <li key={i} className="text-xs text-green-800 flex items-start gap-2">
                                      <span className="text-green-600">•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-red-800">{condition}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {prediction.recommendations?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={24} />
                  Personalized Recommendations
                </h3>
                <div className="space-y-4">
                  {prediction.recommendations.map((rec, idx) => {
                    const isDetailed = typeof rec === 'object' && rec.action;
                    return (
                      <div key={idx} className="bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-300 rounded-lg p-5 shadow-sm">
                        {isDetailed ? (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <span className="text-teal-600 text-2xl mt-1">→</span>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-900 text-lg mb-2">{rec.action}</p>
                                  {rec.reason && (
                                    <p className="text-sm text-slate-700 mb-2"><strong>🎯 Why you need this:</strong> {rec.reason}</p>
                                  )}
                                  {rec.howTo && (
                                    <div className="bg-teal-100 border-l-4 border-teal-500 p-3 rounded-r mb-2">
                                      <p className="text-sm text-teal-900"><strong>📝 How to do it:</strong> {rec.howTo}</p>
                                    </div>
                                  )}
                                  {rec.expectedResults && (
                                    <div className="bg-green-100 border border-green-200 rounded p-3 mb-2">
                                      <p className="text-sm text-green-900"><strong>✨ What to expect:</strong> {rec.expectedResults}</p>
                                    </div>
                                  )}
                                  {rec.scienceExplained && (
                                    <p className="text-xs text-slate-600 italic mt-2"><strong>🔬 The science:</strong> {rec.scienceExplained}</p>
                                  )}
                                </div>
                              </div>
                              {rec.priority && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                                  rec.priority === 'high' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                                  'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                }`}>
                                  {rec.priority?.toUpperCase()} PRIORITY
                                </span>
                              )}
                            </div>
                            {rec.category && (
                              <span className="inline-block text-xs bg-teal-600 text-white px-3 py-1 rounded-full font-medium">
                                {rec.category}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="flex items-start gap-2">
                            <span className="text-teal-600 mt-1">→</span>
                            <span className="text-slate-700">{rec}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {prediction.overallAssessment && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Overall Assessment</h3>
                <p className="text-slate-700">{prediction.overallAssessment}</p>
              </div>
            )}
          </div>

          {/* Daily Routine */}
          {prediction.dailyRoutine && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                🌅 Daily Routine
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {prediction.dailyRoutine.morning && prediction.dailyRoutine.morning.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Morning</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dailyRoutine.morning.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.dailyRoutine.afternoon && prediction.dailyRoutine.afternoon.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Afternoon</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dailyRoutine.afternoon.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.dailyRoutine.evening && prediction.dailyRoutine.evening.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Evening</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dailyRoutine.evening.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.dailyRoutine.night && prediction.dailyRoutine.night.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Night</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dailyRoutine.night.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Diet Plan */}
          {prediction.dietPlan && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                🥗 Diet Plan
              </h3>
              <div className="space-y-4">
                {prediction.dietPlan.breakfast && prediction.dietPlan.breakfast.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Breakfast</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dietPlan.breakfast.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.dietPlan.lunch && prediction.dietPlan.lunch.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Lunch</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dietPlan.lunch.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.dietPlan.dinner && prediction.dietPlan.dinner.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Dinner</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dietPlan.dinner.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.dietPlan.snacks && prediction.dietPlan.snacks.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Healthy Snacks</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dietPlan.snacks.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.dietPlan.hydration && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Hydration</h4>
                    <p className="text-sm text-slate-700">{prediction.dietPlan.hydration}</p>
                  </div>
                )}
                {prediction.dietPlan.avoid && prediction.dietPlan.avoid.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Foods to Avoid</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.dietPlan.avoid.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercise Plan */}
          {prediction.exercisePlan && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                🏃 Exercise Plan
              </h3>
              <div className="space-y-4">
                {prediction.exercisePlan.cardio && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Cardio</h4>
                    <p className="text-sm text-slate-700">{prediction.exercisePlan.cardio}</p>
                  </div>
                )}
                {prediction.exercisePlan.strength && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Strength Training</h4>
                    <p className="text-sm text-slate-700">{prediction.exercisePlan.strength}</p>
                  </div>
                )}
                {prediction.exercisePlan.flexibility && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Flexibility</h4>
                    <p className="text-sm text-slate-700">{prediction.exercisePlan.flexibility}</p>
                  </div>
                )}
                {prediction.exercisePlan.weeklySchedule && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Weekly Schedule</h4>
                    <p className="text-sm text-slate-700">{prediction.exercisePlan.weeklySchedule}</p>
                  </div>
                )}
                {prediction.exercisePlan.tips && prediction.exercisePlan.tips.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Exercise Tips</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.exercisePlan.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mental Wellness */}
          {prediction.mentalWellness && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                🧠 Mental Wellness
              </h3>
              <div className="space-y-4">
                {prediction.mentalWellness.stressManagement && prediction.mentalWellness.stressManagement.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Stress Management</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.mentalWellness.stressManagement.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.mentalWellness.mindfulness && prediction.mentalWellness.mindfulness.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Mindfulness Practices</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.mentalWellness.mindfulness.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.mentalWellness.socialHealth && prediction.mentalWellness.socialHealth.length > 0 && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Social Health</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.mentalWellness.socialHealth.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-pink-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.mentalWellness.hobbies && prediction.mentalWellness.hobbies.length > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Recommended Activities</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.mentalWellness.hobbies.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-teal-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preventive Care */}
          {prediction.preventiveCare && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                🏥 Preventive Care
              </h3>
              <div className="space-y-4">
                {prediction.preventiveCare.screenings && prediction.preventiveCare.screenings.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Recommended Screenings</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.preventiveCare.screenings.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.preventiveCare.vaccinations && prediction.preventiveCare.vaccinations.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Vaccinations</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.preventiveCare.vaccinations.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.preventiveCare.checkupFrequency && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Checkup Frequency</h4>
                    <p className="text-sm text-slate-700">{prediction.preventiveCare.checkupFrequency}</p>
                  </div>
                )}
                {prediction.preventiveCare.monitoring && prediction.preventiveCare.monitoring.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Home Monitoring</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {prediction.preventiveCare.monitoring.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Do's and Don'ts */}
          <div className="grid md:grid-cols-2 gap-6">
            {prediction.dosList && prediction.dosList.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  ✅ Do's
                </h3>
                <ul className="space-y-2">
                  {prediction.dosList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {prediction.dontsList && prediction.dontsList.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  ❌ Don'ts
                </h3>
                <ul className="space-y-2">
                  {prediction.dontsList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Goals */}
          <div className="grid md:grid-cols-2 gap-6">
            {prediction.shortTermGoals && prediction.shortTermGoals.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  🎯 Short-Term Goals (1-3 months)
                </h3>
                <ul className="space-y-2">
                  {prediction.shortTermGoals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-teal-600">→</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {prediction.longTermGoals && prediction.longTermGoals.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  🏆 Long-Term Goals (6-12 months)
                </h3>
                <ul className="space-y-2">
                  {prediction.longTermGoals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-purple-600">→</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Emergency Warnings */}
          {prediction.emergencyWarnings && prediction.emergencyWarnings.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                ⚠️ Emergency Warning Signs
              </h3>
              <p className="text-sm text-red-700 mb-3 font-medium">Seek immediate medical attention if you experience:</p>
              <ul className="space-y-2">
                {prediction.emergencyWarnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-600 font-bold">!</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => setPrediction(null)} className="w-full bg-slate-600 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors">
            New Prediction
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneralPrediction;
