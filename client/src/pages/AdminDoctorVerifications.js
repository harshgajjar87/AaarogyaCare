import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPendingVerifications, approveVerification, rejectVerification } from '../api/doctorVerificationAPI';
import AdminNavbar from '../components/AdminNavbar';

const AdminDoctorVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [actionType, setActionType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await getPendingVerifications();
      setVerifications(response);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedVerification || !actionType) return;

    setActionLoading(selectedVerification._id);

    try {
      if (actionType === 'approve') {
        await approveVerification(selectedVerification._id, adminNotes);
        toast.success('Doctor verification approved successfully');
      } else if (actionType === 'reject') {
        await rejectVerification(selectedVerification._id, adminNotes);
        toast.success('Doctor verification rejected successfully');
      }

      // Refresh the list
      await fetchVerifications();

      // Close modal and reset state
      setShowModal(false);
      setSelectedVerification(null);
      setActionType('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error processing verification:', error);
      toast.error('Failed to process verification');
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (verification, action) => {
    setSelectedVerification(verification);
    setActionType(action);
    setAdminNotes('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVerification(null);
    setActionType('');
    setAdminNotes('');
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="container mt-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mt-5">
        <h2>Doctor Verification Requests</h2>

        {verifications.length === 0 ? (
          <div className="text-center mt-5">
            <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
            <h4>No pending verifications</h4>
            <p>All doctor verification requests have been processed.</p>
          </div>
        ) : (
          <div className="row">
            {verifications.map((verification) => (
              <div key={verification._id} className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{verification.userId.name}</h5>
                    <p className="card-text">
                      <strong>Email:</strong> {verification.userId.email}
                    </p>
                    <p className="card-text">
                      <strong>Submitted:</strong> {new Date(verification.submittedAt).toLocaleDateString()}
                    </p>
                    <p className="card-text">
                      <strong>ID Proof:</strong> <a href={`http://localhost:5000/${verification.idProof}`} target="_blank" rel="noopener noreferrer">View Document</a>
                    </p>
                    <p className="card-text">
                      <strong>License:</strong> <a href={`http://localhost:5000/${verification.license}`} target="_blank" rel="noopener noreferrer">View Document</a>
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => openModal(verification, 'approve')}
                        disabled={actionLoading === verification._id}
                      >
                        {actionLoading === verification._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openModal(verification, 'reject')}
                        disabled={actionLoading === verification._id}
                      >
                        {actionLoading === verification._id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for admin notes */}
        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {actionType === 'approve' ? 'Approve' : 'Reject'} Doctor Verification
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Doctor:</strong> {selectedVerification?.userId.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedVerification?.userId.email}
                  </p>
                  {actionType === 'reject' && (
                    <div className="mb-3">
                      <label htmlFor="adminNotes" className="form-label">
                        Admin Notes (Required for rejection)
                      </label>
                      <textarea
                        className="form-control"
                        id="adminNotes"
                        rows="3"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                        required
                      ></textarea>
                    </div>
                  )}
                  {actionType === 'approve' && (
                    <div className="mb-3">
                      <label htmlFor="adminNotes" className="form-label">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="adminNotes"
                        rows="3"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Optional notes for approval..."
                      ></textarea>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                    onClick={handleAction}
                    disabled={actionType === 'reject' && !adminNotes.trim()}
                  >
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDoctorVerifications;
