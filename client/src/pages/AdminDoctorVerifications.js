import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPendingVerifications, approveVerification, rejectVerification } from '../api/doctorVerificationAPI';
import { ArrowLeft, CheckCircle, XCircle, Eye, X } from 'lucide-react';

const AdminDoctorVerifications = () => {
  const navigate = useNavigate();
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Doctor Verification Requests</h1>
      </div>

      {verifications.length === 0 ? (
        <div className="text-center mt-8 sm:mt-12 bg-health-surface rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8 md:p-12">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-500 sm:w-16 sm:h-16" />
          <h4 className="text-lg sm:text-xl font-bold text-health-text-h mb-2">No pending verifications</h4>
          <p className="text-sm sm:text-base text-health-text-p">All doctor verification requests have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {verifications.map((verification) => (
            <div key={verification._id} className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <h5 className="text-lg sm:text-xl font-bold text-health-text-h mb-3 sm:mb-4">{verification.userId.name}</h5>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-health-text-p mb-4 sm:mb-6">
                <p><strong>Email:</strong> <span className="break-all">{verification.userId.email}</span></p>
                <p><strong>Submitted:</strong> {new Date(verification.submittedAt).toLocaleDateString()}</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <a 
                    href={`http://localhost:5000/${verification.idProof}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-health-primary hover:underline flex items-center gap-1"
                  >
                    <Eye size={14} />
                    <span>View ID Proof</span>
                  </a>
                  <a 
                    href={`http://localhost:5000/${verification.license}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-health-primary hover:underline flex items-center gap-1"
                  >
                    <Eye size={14} />
                    <span>View License</span>
                  </a>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
                  onClick={() => openModal(verification, 'approve')}
                  disabled={actionLoading === verification._id}
                >
                  <CheckCircle size={16} />
                  {actionLoading === verification._id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
                  onClick={() => openModal(verification, 'reject')}
                  disabled={actionLoading === verification._id}
                >
                  <XCircle size={16} />
                  {actionLoading === verification._id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center">
              <h5 className="text-lg sm:text-xl font-bold">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Doctor Verification
              </h5>
              <button onClick={closeModal} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100">
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base">
                <strong>Doctor:</strong> {selectedVerification?.userId.name}
              </p>
              <p className="text-sm sm:text-base break-all">
                <strong>Email:</strong> {selectedVerification?.userId.email}
              </p>
              {actionType === 'reject' && (
                <div>
                  <label htmlFor="adminNotes" className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">
                    Admin Notes (Required for rejection)
                  </label>
                  <textarea
                    className="w-full rounded-lg border-slate-300 py-2 px-3 text-sm sm:text-base"
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
                <div>
                  <label htmlFor="adminNotes" className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    className="w-full rounded-lg border-slate-300 py-2 px-3 text-sm sm:text-base"
                    id="adminNotes"
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Optional notes for approval..."
                  ></textarea>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <button 
                onClick={closeModal}
                className="bg-slate-100 text-slate-700 px-4 sm:px-6 py-2 rounded-full hover:bg-slate-200 transition-all font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionType === 'reject' && !adminNotes.trim()}
                className={`px-4 sm:px-6 py-2 rounded-full transition-all font-medium text-sm sm:text-base disabled:opacity-50 ${
                  actionType === 'approve' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorVerifications;
