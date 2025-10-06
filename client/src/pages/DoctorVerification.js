import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import PatientNavbar from '../components/PaitentNavbar';

const DoctorVerification = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [formData, setFormData] = useState({
    idProof: null,
    license: null
  });
  const [files, setFiles] = useState({
    idProof: null,
    license: null
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    checkVerificationStatus();
  }, [user, navigate]);

  const checkVerificationStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await axios.get('/verification/status');
      setVerificationStatus(response.data);
    } catch (error) {
      console.error('Error checking verification status:', error);
      // If no verification exists, status will be null
    } finally {
      setStatusLoading(false);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${field} must be a PDF or JPG file`);
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${field} file size must be less than 5MB`);
        return;
      }

      setFiles(prev => ({
        ...prev,
        [field]: file
      }));

      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idProof || !formData.license) {
      toast.error('Please upload both ID proof and license documents');
      return;
    }

    const submitData = new FormData();
    submitData.append('idProof', formData.idProof);
    submitData.append('license', formData.license);

    try {
      setLoading(true);
      const response = await axios.post('/verification/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Doctor verification request submitted successfully!');
      setVerificationStatus(response.data.verification);
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error(error.response?.data?.msg || 'Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Pending Review</span>;
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return null;
    }
  };

  if (statusLoading) {
    return (
      <>
        <PatientNavbar />
        <div className="container mt-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PatientNavbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h3 className="card-title mb-0">
                  <i className="fas fa-user-md me-2"></i>
                  Doctor Verification
                </h3>
              </div>
              <div className="card-body p-4">
                {verificationStatus && verificationStatus.status !== 'not_submitted' ? (
                  // Show current status
                  <div className="text-center mb-4">
                    <h4>Verification Status</h4>
                    <div className="mb-3">
                      {getStatusBadge(verificationStatus.status)}
                    </div>

                    {verificationStatus.status === 'pending' && (
                      <div className="alert alert-info">
                        <i className="fas fa-clock me-2"></i>
                        Your verification request is being reviewed. You will receive an email notification once it's processed.
                      </div>
                    )}

                    {verificationStatus.status === 'approved' && (
                      <div className="alert alert-success">
                        <i className="fas fa-check-circle me-2"></i>
                        Congratulations! Your doctor verification has been approved. You now have access to doctor features.
                      </div>
                    )}

                    {verificationStatus.status === 'rejected' && (
                      <div className="alert alert-danger">
                        <i className="fas fa-times-circle me-2"></i>
                        Your verification request was rejected.
                        {verificationStatus.adminNotes && (
                          <div className="mt-2">
                            <strong>Reason:</strong> {verificationStatus.adminNotes}
                          </div>
                        )}
                        <div className="mt-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setVerificationStatus(null)}
                          >
                            Submit New Request
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-muted">
                      <small>Submitted on: {new Date(verificationStatus.submittedAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ) : (
                  // Show application form
                  <>
                    <div className="text-center mb-4">
                      <h4>Apply to Become a Doctor</h4>
                      <p className="text-muted">
                        Submit your credentials for verification. Our admin team will review your documents within 2-3 business days.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label fw-bold">
                          <i className="fas fa-id-card me-2"></i>
                          ID Proof Document
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => handleFileChange(e, 'idProof')}
                          required
                        />
                        <div className="form-text">
                          Upload your government-issued ID (PDF or JPG, max 5MB)
                        </div>
                        {files.idProof && (
                          <div className="mt-2 text-success">
                            <i className="fas fa-check me-1"></i>
                            {files.idProof.name}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-bold">
                          <i className="fas fa-certificate me-2"></i>
                          Medical License
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => handleFileChange(e, 'license')}
                          required
                        />
                        <div className="form-text">
                          Upload your medical license or certification (PDF or JPG, max 5MB)
                        </div>
                        {files.license && (
                          <div className="mt-2 text-success">
                            <i className="fas fa-check me-1"></i>
                            {files.license.name}
                          </div>
                        )}
                      </div>

                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        <strong>Important:</strong> Please ensure all documents are clear and legible.
                        Only PDF and JPG formats are accepted. Maximum file size is 5MB per document.
                      </div>

                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5"
                          disabled={loading || !formData.idProof || !formData.license}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-2"></i>
                              Submit Verification Request
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorVerification;
