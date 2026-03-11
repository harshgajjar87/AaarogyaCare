import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import axios from '../utils/axios';

const MedicalReportUploader = ({ onDataExtracted, reportType }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPG, PNG, or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportType', reportType || 'blood');

    try {
      const response = await axios.post('/ai/extract-medical-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.extractedData) {
        setSuccess(true);
        // Pass extracted data, full text, and file to parent
        onDataExtracted(
          response.data.extractedData, 
          response.data.fullText || response.data.rawText || '', 
          file
        );
        
        // Clear file after 2 seconds
        setTimeout(() => {
          setFile(null);
          setPreview(null);
          setSuccess(false);
        }, 2000);
      } else {
        setError('Failed to extract data from the report');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.msg || 'Failed to process the report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-4 sm:p-6 border-2 border-teal-300">
      <p className="text-sm text-slate-600 mb-4">
        Upload your medical report (JPG, PNG, or PDF) and let AI automatically extract the test values for you.
      </p>

      {!file ? (
        <label className="block">
          <div className="border-2 border-dashed border-teal-400 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:bg-teal-50 transition-colors">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-teal-100 rounded-full">
                <Upload className="text-teal-600" size={32} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG or PDF (max 10MB)</p>
              </div>
            </div>
          </div>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              {preview ? (
                <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center">
                  <FileText className="text-slate-400" size={32} />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>

              <button
                onClick={handleRemoveFile}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                disabled={uploading}
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Extracting data...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle size={20} />
                <span>Data extracted successfully!</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Extract Data with AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-green-700">
            Data extracted successfully! The values have been auto-filled in the form below. You can review and edit them before analyzing.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicalReportUploader;
