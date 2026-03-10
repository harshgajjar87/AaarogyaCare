import React, { useState } from 'react';
import axios from '../utils/axios';
import { ArrowLeft, Loader2, FileText, Activity, Droplet, Brain, Heart, Bone, Eye, Ear, CheckCircle, AlertCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import MedicalReportUploader from './MedicalReportUploader';

const REPORT_TYPES = [
  { 
    id: 'blood', 
    name: 'Blood Test', 
    icon: Droplet, 
    color: 'red',
    fields: [
      { name: 'hemoglobin', label: 'Hemoglobin (g/dL)', type: 'number', placeholder: 'e.g., 13.5' },
      { name: 'wbc', label: 'WBC Count (cells/mcL)', type: 'number', placeholder: 'e.g., 7500' },
      { name: 'rbc', label: 'RBC Count (million/mcL)', type: 'number', placeholder: 'e.g., 4.8' },
      { name: 'platelets', label: 'Platelet Count (/mcL)', type: 'number', placeholder: 'e.g., 250000' },
      { name: 'hematocrit', label: 'Hematocrit (%)', type: 'number', placeholder: 'e.g., 42' },
      { name: 'mcv', label: 'MCV (fL)', type: 'number', placeholder: 'e.g., 90' },
      { name: 'mch', label: 'MCH (pg)', type: 'number', placeholder: 'e.g., 30' },
      { name: 'mchc', label: 'MCHC (g/dL)', type: 'number', placeholder: 'e.g., 34' },
      { name: 'rdw', label: 'RDW (%)', type: 'number', placeholder: 'e.g., 13.5' },
      { name: 'neutrophils', label: 'Neutrophils (%)', type: 'number', placeholder: 'e.g., 60' },
      { name: 'lymphocytes', label: 'Lymphocytes (%)', type: 'number', placeholder: 'e.g., 30' },
      { name: 'monocytes', label: 'Monocytes (%)', type: 'number', placeholder: 'e.g., 5' },
      { name: 'eosinophils', label: 'Eosinophils (%)', type: 'number', placeholder: 'e.g., 3' },
      { name: 'basophils', label: 'Basophils (%)', type: 'number', placeholder: 'e.g., 1' },
      { name: 'esr', label: 'ESR (mm/hr)', type: 'number', placeholder: 'e.g., 10' }
    ]
  },
  { 
    id: 'cbc', 
    name: 'CBC (Complete Blood Count)', 
    icon: Activity, 
    color: 'pink',
    fields: [
      { name: 'hemoglobin', label: 'Hemoglobin (g/dL)', type: 'number', placeholder: 'e.g., 13.5' },
      { name: 'wbc', label: 'WBC (cells/mcL)', type: 'number', placeholder: 'e.g., 7500' },
      { name: 'rbc', label: 'RBC (million/mcL)', type: 'number', placeholder: 'e.g., 4.8' },
      { name: 'hematocrit', label: 'Hematocrit (%)', type: 'number', placeholder: 'e.g., 42' },
      { name: 'mcv', label: 'MCV (fL)', type: 'number', placeholder: 'e.g., 90' },
      { name: 'mch', label: 'MCH (pg)', type: 'number', placeholder: 'e.g., 30' },
      { name: 'mchc', label: 'MCHC (g/dL)', type: 'number', placeholder: 'e.g., 34' },
      { name: 'rdw', label: 'RDW (%)', type: 'number', placeholder: 'e.g., 13.5' },
      { name: 'platelets', label: 'Platelets (/mcL)', type: 'number', placeholder: 'e.g., 250000' },
      { name: 'neutrophils', label: 'Neutrophils (%)', type: 'number', placeholder: 'e.g., 60' },
      { name: 'lymphocytes', label: 'Lymphocytes (%)', type: 'number', placeholder: 'e.g., 30' },
      { name: 'monocytes', label: 'Monocytes (%)', type: 'number', placeholder: 'e.g., 5' },
      { name: 'eosinophils', label: 'Eosinophils (%)', type: 'number', placeholder: 'e.g., 3' },
      { name: 'basophils', label: 'Basophils (%)', type: 'number', placeholder: 'e.g., 1' },
      { name: 'esr', label: 'ESR (mm/hr)', type: 'number', placeholder: 'e.g., 10' }
    ]
  },
  { 
    id: 'lipid', 
    name: 'Lipid Profile', 
    icon: Heart, 
    color: 'orange',
    fields: [
      { name: 'totalCholesterol', label: 'Total Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g., 180' },
      { name: 'ldl', label: 'LDL Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g., 100' },
      { name: 'hdl', label: 'HDL Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g., 50' },
      { name: 'vldl', label: 'VLDL Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g., 30' },
      { name: 'triglycerides', label: 'Triglycerides (mg/dL)', type: 'number', placeholder: 'e.g., 150' },
      { name: 'cholesterolRatio', label: 'Total/HDL Ratio', type: 'number', placeholder: 'e.g., 3.6' },
      { name: 'nonHdl', label: 'Non-HDL Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g., 130' }
    ]
  },
  { 
    id: 'thyroid', 
    name: 'Thyroid Function', 
    icon: Brain, 
    color: 'purple',
    fields: [
      { name: 'tsh', label: 'TSH (mIU/L)', type: 'number', placeholder: 'e.g., 2.5' },
      { name: 't3', label: 'T3 Total (ng/dL)', type: 'number', placeholder: 'e.g., 120' },
      { name: 't4', label: 'T4 Total (mcg/dL)', type: 'number', placeholder: 'e.g., 8.5' },
      { name: 'freeT3', label: 'Free T3 (pg/mL)', type: 'number', placeholder: 'e.g., 3.2' },
      { name: 'freeT4', label: 'Free T4 (ng/dL)', type: 'number', placeholder: 'e.g., 1.3' },
      { name: 'antiTPO', label: 'Anti-TPO Antibodies (IU/mL)', type: 'number', placeholder: 'e.g., 10' }
    ]
  },
  { 
    id: 'liver', 
    name: 'Liver Function', 
    icon: Activity, 
    color: 'yellow',
    fields: [
      { name: 'alt', label: 'ALT/SGPT (U/L)', type: 'number', placeholder: 'e.g., 30' },
      { name: 'ast', label: 'AST/SGOT (U/L)', type: 'number', placeholder: 'e.g., 28' },
      { name: 'ggt', label: 'GGT (U/L)', type: 'number', placeholder: 'e.g., 25' },
      { name: 'alkalinePhosphatase', label: 'Alkaline Phosphatase (U/L)', type: 'number', placeholder: 'e.g., 80' },
      { name: 'totalBilirubin', label: 'Total Bilirubin (mg/dL)', type: 'number', placeholder: 'e.g., 0.8' },
      { name: 'directBilirubin', label: 'Direct Bilirubin (mg/dL)', type: 'number', placeholder: 'e.g., 0.3' },
      { name: 'indirectBilirubin', label: 'Indirect Bilirubin (mg/dL)', type: 'number', placeholder: 'e.g., 0.5' },
      { name: 'totalProtein', label: 'Total Protein (g/dL)', type: 'number', placeholder: 'e.g., 7.0' },
      { name: 'albumin', label: 'Albumin (g/dL)', type: 'number', placeholder: 'e.g., 4.2' },
      { name: 'globulin', label: 'Globulin (g/dL)', type: 'number', placeholder: 'e.g., 2.8' },
      { name: 'agRatio', label: 'A/G Ratio', type: 'number', placeholder: 'e.g., 1.5' }
    ]
  },
  { 
    id: 'kidney', 
    name: 'Kidney Function', 
    icon: Droplet, 
    color: 'blue',
    fields: [
      { name: 'creatinine', label: 'Creatinine (mg/dL)', type: 'number', placeholder: 'e.g., 1.0' },
      { name: 'bun', label: 'BUN (mg/dL)', type: 'number', placeholder: 'e.g., 15' },
      { name: 'egfr', label: 'eGFR (mL/min)', type: 'number', placeholder: 'e.g., 90' },
      { name: 'acr', label: 'Albumin-Creatinine Ratio (mg/g)', type: 'number', placeholder: 'e.g., 15' },
      { name: 'uricAcid', label: 'Uric Acid (mg/dL)', type: 'number', placeholder: 'e.g., 5.5' },
      { name: 'sodium', label: 'Sodium (mEq/L)', type: 'number', placeholder: 'e.g., 140' },
      { name: 'potassium', label: 'Potassium (mEq/L)', type: 'number', placeholder: 'e.g., 4.5' },
      { name: 'chloride', label: 'Chloride (mEq/L)', type: 'number', placeholder: 'e.g., 102' },
      { name: 'bicarbonate', label: 'Bicarbonate (mEq/L)', type: 'number', placeholder: 'e.g., 24' }
    ]
  },
  { 
    id: 'diabetes', 
    name: 'Diabetes Panel', 
    icon: Activity, 
    color: 'green',
    fields: [
      { name: 'fastingGlucose', label: 'Fasting Glucose (mg/dL)', type: 'number', placeholder: 'e.g., 95' },
      { name: 'postprandial', label: 'Post-Prandial Glucose (mg/dL)', type: 'number', placeholder: 'e.g., 140' },
      { name: 'randomGlucose', label: 'Random Glucose (mg/dL)', type: 'number', placeholder: 'e.g., 120' },
      { name: 'hba1c', label: 'HbA1c (%)', type: 'number', placeholder: 'e.g., 5.5' },
      { name: 'insulin', label: 'Fasting Insulin (μIU/mL)', type: 'number', placeholder: 'e.g., 10' },
      { name: 'cPeptide', label: 'C-Peptide (ng/mL)', type: 'number', placeholder: 'e.g., 2.0' }
    ]
  },
  { 
    id: 'vitamin', 
    name: 'Vitamin Levels', 
    icon: Bone, 
    color: 'indigo',
    fields: [
      { name: 'vitaminD', label: 'Vitamin D (ng/mL)', type: 'number', placeholder: 'e.g., 30' },
      { name: 'vitaminB12', label: 'Vitamin B12 (pg/mL)', type: 'number', placeholder: 'e.g., 400' },
      { name: 'folate', label: 'Folate (ng/mL)', type: 'number', placeholder: 'e.g., 10' },
      { name: 'vitaminA', label: 'Vitamin A (mcg/dL)', type: 'number', placeholder: 'e.g., 50' },
      { name: 'vitaminE', label: 'Vitamin E (mg/L)', type: 'number', placeholder: 'e.g., 10' },
      { name: 'vitaminC', label: 'Vitamin C (mg/dL)', type: 'number', placeholder: 'e.g., 1.0' },
      { name: 'calcium', label: 'Calcium (mg/dL)', type: 'number', placeholder: 'e.g., 9.5' },
      { name: 'iron', label: 'Iron (mcg/dL)', type: 'number', placeholder: 'e.g., 100' },
      { name: 'ferritin', label: 'Ferritin (ng/mL)', type: 'number', placeholder: 'e.g., 80' }
    ]
  },
  { 
    id: 'urine', 
    name: 'Urine Analysis', 
    icon: Droplet, 
    color: 'cyan',
    fields: [
      { name: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Yellow' },
      { name: 'appearance', label: 'Appearance', type: 'text', placeholder: 'e.g., Clear' },
      { name: 'ph', label: 'pH', type: 'number', placeholder: 'e.g., 6.5' },
      { name: 'specificGravity', label: 'Specific Gravity', type: 'number', placeholder: 'e.g., 1.020' },
      { name: 'protein', label: 'Protein', type: 'text', placeholder: 'e.g., Negative' },
      { name: 'glucose', label: 'Glucose', type: 'text', placeholder: 'e.g., Negative' },
      { name: 'ketones', label: 'Ketones', type: 'text', placeholder: 'e.g., Negative' },
      { name: 'blood', label: 'Blood', type: 'text', placeholder: 'e.g., Negative' },
      { name: 'leukocytes', label: 'Leukocytes', type: 'text', placeholder: 'e.g., Negative' },
      { name: 'nitrite', label: 'Nitrite', type: 'text', placeholder: 'e.g., Negative' },
      { name: 'urobilinogen', label: 'Urobilinogen', type: 'text', placeholder: 'e.g., Normal' },
      { name: 'bilirubin', label: 'Bilirubin', type: 'text', placeholder: 'e.g., Negative' }
    ]
  },
  { 
    id: 'other', 
    name: 'Other Report', 
    icon: FileText, 
    color: 'gray',
    fields: []
  }
];

const ReportAnalysis = ({ onBack }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState({});
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    setReportData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Handle AI-extracted data
  const handleDataExtracted = (extractedData) => {
    // Track which fields were auto-filled
    const filledFields = new Set(Object.keys(extractedData));
    setAutoFilledFields(filledFields);
    
    // Merge extracted data with existing report data
    setReportData(prev => ({
      ...prev,
      ...extractedData
    }));
  };

  const handleAnalyze = async () => {
    const hasData = selectedReport.fields.length === 0 
      ? reportData.customData?.trim()
      : Object.values(reportData).some(val => val?.toString().trim());

    if (!hasData) {
      alert('Please enter report details');
      return;
    }

    setLoading(true);
    try {
      const formattedData = selectedReport.fields.length === 0
        ? reportData.customData
        : selectedReport.fields.map(field => `${field.label}: ${reportData[field.name] || 'Not provided'}`).join('\n');

      const res = await axios.post('/health/analyze-report', {
        reportType: selectedReport.name,
        reportData: formattedData
      });
      setAnalysis(res.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with word wrap and proper spacing
    const addText = (text, fontSize = 10, isBold = false, spacing = 5) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach((line, index) => {
        // Check if we need a new page
        if (yPosition + fontSize * 0.4 > pageHeight - margin - 10) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.4; // Consistent line height
      });
      yPosition += spacing; // Add spacing after text block
    };

    // Header
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical Report Analysis', pageWidth / 2, 20, { align: 'center' });
    
    yPosition = 40;
    doc.setTextColor(0, 0, 0);

    // Report Type
    addText(`Report Type: ${selectedReport.name}`, 14, true, 3);
    addText(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, false, 8);

    // Summary
    if (analysis.summary) {
      addText('SUMMARY', 14, true, 3);
      addText(analysis.summary, 10, false, 8);
    }

    // Parameters
    if (analysis.parameters && analysis.parameters.length > 0) {
      addText('PARAMETER ANALYSIS', 14, true, 3);
      analysis.parameters.forEach((param, idx) => {
        const statusColor = param.status === 'normal' ? [34, 197, 94] : 
                           param.status === 'borderline' ? [234, 179, 8] : [239, 68, 68];
        
        addText(`${idx + 1}. ${param.name}`, 11, true, 2);
        doc.setTextColor(...statusColor);
        addText(`   Status: ${param.status.toUpperCase()}`, 10, true, 2);
        doc.setTextColor(0, 0, 0);
        addText(`   ${param.explanation}`, 10, false, 2);
        if (param.normalRange) {
          addText(`   Normal Range: ${param.normalRange}`, 9, false, 5);
        } else {
          yPosition += 3;
        }
      });
    }

    // Good Points
    if (analysis.goodPoints && analysis.goodPoints.length > 0) {
      doc.setTextColor(34, 197, 94);
      addText('POSITIVE FINDINGS', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      analysis.goodPoints.forEach((point, idx) => {
        addText(`✓ ${point}`, 10, false, 3);
      });
      yPosition += 3;
    }

    // Concerns
    if (analysis.concerns && analysis.concerns.length > 0) {
      doc.setTextColor(249, 115, 22);
      addText('AREAS OF CONCERN', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      analysis.concerns.forEach((concern, idx) => {
        addText(`⚠ ${concern}`, 10, false, 3);
      });
      yPosition += 3;
    }

    // Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      doc.setTextColor(20, 184, 166);
      addText('RECOMMENDATIONS', 14, true, 3);
      doc.setTextColor(0, 0, 0);
      analysis.recommendations.forEach((rec, idx) => {
        addText(`→ ${rec}`, 10, false, 3);
      });
      yPosition += 3;
    }

    // Disclaimer
    if (analysis.disclaimer) {
      // Check if we need a new page for disclaimer
      const disclaimerLines = doc.splitTextToSize(analysis.disclaimer, maxWidth - 10);
      const disclaimerHeight = disclaimerLines.length * 4 + 15;
      
      if (yPosition + disclaimerHeight > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.setFillColor(239, 246, 255);
      doc.rect(margin - 5, yPosition - 5, maxWidth + 10, disclaimerHeight, 'F');
      doc.setTextColor(37, 99, 235);
      addText('DISCLAIMER', 11, true, 3);
      doc.setTextColor(0, 0, 0);
      addText(analysis.disclaimer, 9, false, 5);
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This is an AI-generated analysis. Please consult your healthcare provider.', pageWidth / 2, footerY, { align: 'center' });

    // Save PDF
    const fileName = `${selectedReport.name.replace(/\s+/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (!selectedReport) {
    return (
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
          <ArrowLeft size={20} />
          Back to Options
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-6">Select Report Type</h1>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-teal-500"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`bg-${report.color}-100 p-3 rounded-full`}>
                    <Icon className={`text-${report.color}-600`} size={32} />
                  </div>
                  <h3 className="font-semibold text-slate-800">{report.name}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => { setSelectedReport(null); setAnalysis(null); setReportData({}); setAutoFilledFields(new Set()); }} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
          <ArrowLeft size={20} />
          Back to Report Types
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">{selectedReport.name} Analysis</h1>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Download size={20} />
            Download PDF
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Urgency Alert */}
          {analysis.urgencyLevel && analysis.urgencyLevel !== 'routine' && (
            <div className={`p-4 rounded-lg border-2 ${
              analysis.urgencyLevel === 'urgent' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={analysis.urgencyLevel === 'urgent' ? 'text-red-600' : 'text-yellow-600'} size={24} />
                <div>
                  <h4 className={`font-bold ${analysis.urgencyLevel === 'urgent' ? 'text-red-800' : 'text-yellow-800'}`}>
                    {analysis.urgencyLevel === 'urgent' ? 'Urgent Attention Needed' : 'Moderate Concern'}
                  </h4>
                  <p className={`text-sm mt-1 ${analysis.urgencyLevel === 'urgent' ? 'text-red-700' : 'text-yellow-700'}`}>
                    {analysis.urgencyMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {analysis.summary && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Summary</h3>
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {analysis.parameters && analysis.parameters.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Parameter Analysis</h3>
              <div className="space-y-3">
                {analysis.parameters.map((param, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-800">{param.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        param.status === 'normal' ? 'bg-green-100 text-green-700' :
                        param.status === 'borderline' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {param.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">{param.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.goodPoints && analysis.goodPoints.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={24} />
                What's Good
              </h3>
              <ul className="space-y-2">
                {analysis.goodPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.concerns && analysis.concerns.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertCircle className="text-orange-500" size={24} />
                Areas of Concern
              </h3>
              <div className="space-y-4">
                {analysis.concerns.map((concern, idx) => (
                  <div key={idx} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">{concern.issue || concern}</h4>
                      {concern.severity && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          concern.severity === 'severe' ? 'bg-red-100 text-red-700' :
                          concern.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {concern.severity}
                        </span>
                      )}
                    </div>
                    {concern.explanation && (
                      <p className="text-slate-700 text-sm mb-2">{concern.explanation}</p>
                    )}
                    {concern.possibleCauses && concern.possibleCauses.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-slate-600 mb-1">Possible Causes:</p>
                        <ul className="text-sm text-slate-600 list-disc list-inside">
                          {concern.possibleCauses.map((cause, i) => (
                            <li key={i}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {concern.symptoms && concern.symptoms.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-slate-600 mb-1">Watch for these symptoms:</p>
                        <ul className="text-sm text-slate-600 list-disc list-inside">
                          {concern.symptoms.map((symptom, i) => (
                            <li key={i}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Recommendations</h3>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, idx) => {
                  const isDetailed = typeof rec === 'object' && rec.action;
                  return (
                    <div key={idx} className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      {isDetailed ? (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-2 flex-1">
                              <span className="text-teal-600 mt-1">→</span>
                              <div>
                                <p className="font-medium text-slate-800">{rec.action}</p>
                                {rec.explanation && (
                                  <p className="text-sm text-slate-600 mt-1">{rec.explanation}</p>
                                )}
                                {rec.timeline && (
                                  <p className="text-xs text-teal-700 mt-2">Timeline: {rec.timeline}</p>
                                )}
                              </div>
                            </div>
                            {rec.priority && (
                              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                                rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {rec.priority} priority
                              </span>
                            )}
                          </div>
                          {rec.category && (
                            <span className="inline-block text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded mt-2">
                              {rec.category}
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="text-teal-500 mt-1">→</span>
                          <span className="text-slate-700">{rec}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dietary Suggestions */}
          {analysis.dietarySuggestions && analysis.dietarySuggestions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                🥗 Dietary Suggestions
              </h3>
              <div className="space-y-3">
                {analysis.dietarySuggestions.map((diet, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-slate-800 mb-1">{diet.recommendation}</h4>
                    <p className="text-sm text-slate-600 mb-2">{diet.reason}</p>
                    {diet.examples && diet.examples.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-green-700 mb-1">Examples:</p>
                        <ul className="text-sm text-slate-600 list-disc list-inside">
                          {diet.examples.map((example, i) => (
                            <li key={i}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Changes */}
          {analysis.lifestyleChanges && analysis.lifestyleChanges.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                🏃 Lifestyle Changes
              </h3>
              <div className="space-y-3">
                {analysis.lifestyleChanges.map((lifestyle, idx) => (
                  <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-slate-800 mb-1">{lifestyle.change}</h4>
                    <p className="text-sm text-slate-600 mb-2"><strong>Benefit:</strong> {lifestyle.benefit}</p>
                    {lifestyle.howTo && (
                      <p className="text-sm text-blue-700"><strong>How to:</strong> {lifestyle.howTo}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitoring Plan */}
          {analysis.monitoringPlan && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                📊 Monitoring Plan
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                {analysis.monitoringPlan.frequency && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">Retest Frequency:</p>
                    <p className="text-slate-600">{analysis.monitoringPlan.frequency}</p>
                  </div>
                )}
                {analysis.monitoringPlan.parameters && analysis.monitoringPlan.parameters.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Parameters to Track:</p>
                    <ul className="text-sm text-slate-600 list-disc list-inside">
                      {analysis.monitoringPlan.parameters.map((param, i) => (
                        <li key={i}>{param}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.monitoringPlan.signs && analysis.monitoringPlan.signs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Warning Signs to Watch:</p>
                    <ul className="text-sm text-slate-600 list-disc list-inside">
                      {analysis.monitoringPlan.signs.map((sign, i) => (
                        <li key={i}>{sign}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {analysis.disclaimer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">{analysis.disclaimer}</p>
            </div>
          )}
        </div>

        <button onClick={() => { setAnalysis(null); setReportData({}); setAutoFilledFields(new Set()); }} className="w-full mt-6 bg-slate-600 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors">
          Analyze Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => setSelectedReport(null)} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
        <ArrowLeft size={20} />
        Back to Report Types
      </button>

      <h1 className="text-3xl font-bold text-slate-800 mb-6">{selectedReport.name} Analysis</h1>

      <div className="space-y-6">
        {/* Option Selection */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border-2 border-teal-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">Choose How to Add Your Report</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border-2 border-teal-300 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-teal-100 p-2 rounded-full">
                  <FileText className="text-teal-600" size={24} />
                </div>
                <h3 className="font-semibold text-slate-800">Option 1: Upload Report</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">Upload an image or PDF of your medical report. Our AI will automatically extract the data for you.</p>
              <div className="flex items-center gap-2 text-xs text-teal-700">
                <CheckCircle size={16} />
                <span>Fast & Automatic</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-2 border-blue-300 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Activity className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-slate-800">Option 2: Enter Manually</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">Type in your report values manually using the form fields below.</p>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle size={16} />
                <span>Precise Control</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Report Uploader */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-teal-600" size={24} />
            <h3 className="text-lg font-semibold text-slate-800">Upload Your Report</h3>
          </div>
          <MedicalReportUploader 
            onDataExtracted={handleDataExtracted}
            reportType={selectedReport.id}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-slate-300"></div>
          <span className="text-slate-500 font-medium">OR</span>
          <div className="flex-1 border-t border-slate-300"></div>
        </div>

        {/* Manual Entry Form */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-slate-800">Enter Values Manually</h3>
          </div>
        {selectedReport.fields.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {selectedReport.fields.map((field) => {
                const isAutoFilled = autoFilledFields.has(field.name);
                return (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.label}
                      {isAutoFilled && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          AI Filled
                        </span>
                      )}
                    </label>
                    <input
                      type={field.type}
                      value={reportData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        isAutoFilled ? 'border-green-300 bg-green-50' : 'border-slate-300'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enter your report details
            </label>
            <textarea
              value={reportData.customData || ''}
              onChange={(e) => handleFieldChange('customData', e.target.value)}
              rows={12}
              placeholder="Paste your complete report text here..."
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="animate-spin" size={20} /> Analyzing Report...</> : 'Analyze Report'}
        </button>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalysis;
