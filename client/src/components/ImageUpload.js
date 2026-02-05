import React, { useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { Upload, File, X, Loader2 } from 'lucide-react';

const ImageUpload = ({ onUploadSuccess, uploadType = 'general', multiple = false }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB.`);
        return false;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} has an invalid file type.`);
        return false;
      }
      return true;
    });
    setFiles(multiple ? [...files, ...selectedFiles] : selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }
    setUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append(multiple ? 'images' : 'image', file));
      formData.append('type', uploadType);

      const endpoint = multiple ? '/upload/upload-multiple' : '/upload/upload';
      const response = await axios.post(endpoint, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      toast.success(response.data.message);
      onUploadSuccess(response.data.data);
      setFiles([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-health-text-p mb-2">
          Select {multiple ? 'Images/PDFs' : 'Image/PDF'}
        </label>
        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
          <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">Drag & drop or click to upload</p>
            <p className="text-xs text-slate-500">PNG, JPG, GIF, PDF up to 5MB</p>
          </div>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*,.pdf" multiple={multiple} onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h6 className="text-sm font-medium">Selected files:</h6>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                    <File size={16} className="text-slate-500"/>
                    <span className="font-medium text-slate-700">{file.name}</span>
                    <span className="text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button type="button" onClick={() => handleRemoveFile(index)} disabled={uploading} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploading && (
        <div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-center mt-1">{progress}%</p>
        </div>
      )}

      <button onClick={handleUpload} disabled={uploading || files.length === 0} className="w-full bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50">
        {uploading ? <Loader2 className="animate-spin"/> : <Upload size={16}/>}
        {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
      </button>
    </div>
  );
};

export default ImageUpload;
