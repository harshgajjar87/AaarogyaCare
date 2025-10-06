import React, { useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const ImageUpload = ({ onUploadSuccess, uploadType = 'general', multiple = false }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate files
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} has invalid file type`);
        return false;
      }
      
      return true;
    });

    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append(multiple ? 'images' : 'image', file);
      });
      
      formData.append('type', uploadType);

      const endpoint = multiple ? '/upload/upload-multiple' : '/upload/upload';
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      toast.success(response.data.message);
      onUploadSuccess(response.data.data);
      setFiles([]);
      setProgress(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="image-upload">
      <div className="mb-3">
        <label className="form-label">
          Select {multiple ? 'Images' : 'Image'} ({multiple ? 'Max 10' : 'Max 1'})
        </label>
        <input 
          type="file" 
          accept="image/*,.pdf"
          multiple={multiple}
          onChange={handleFileChange}
          className="form-control"
          disabled={uploading}
        />
      </div>

      {files.length > 0 && (
        <div className="mb-3">
          <h6>Selected Files:</h6>
          <ul className="list-group">
            {files.map((file, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploading && (
        <div className="mb-3">
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={uploading || files.length === 0}
        className="btn btn-primary"
      >
        {uploading ? 'Uploading...' : `Upload ${multiple ? 'Images' : 'Image'}`}
      </button>
    </div>
  );
};

export default ImageUpload;
