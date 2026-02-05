import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { ShieldCheck, Clock, XCircle, Stethoscope } from 'lucide-react';

const DoctorVerification = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [statusLoading, setStatusLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'doctor') {
      navigate('/patient/dashboard');
      return;
    }
    checkVerificationStatus();
  }, [user, navigate]);

  const checkVerificationStatus = async () => {
    try {
      const { data } = await axios.get('/verification/status');
      setVerificationStatus(data);
    } catch (error) {
      console.error("Error checking verification status:", error);
      setVerificationStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const StatusDisplay = () => {
    if (!verificationStatus || !verificationStatus.status || verificationStatus.status === 'not_submitted') {
        return (
            <div className="text-center p-8 border rounded-xl bg-slate-50">
                <h4 className="text-xl font-bold mb-4">No Submission Found</h4>
                <p className="text-health-text-p">We could not find a verification submission for your account.</p>
            </div>
        );
    }

    const statusInfo = {
      pending: { icon: <Clock className="text-yellow-500" />, text: "Pending Review", message: "Your registration request is being reviewed by our admin team. You'll be notified via email once it's processed." },
      approved: { icon: <ShieldCheck className="text-green-500" />, text: "Approved", message: "Congratulations! Your account is fully verified. You have access to all doctor features." },
      rejected: { icon: <XCircle className="text-red-500" />, text: "Rejected", message: `Your request was rejected. Reason: ${verificationStatus.adminNotes || 'Not provided.'}` },
    }[verificationStatus.status];

    if (!statusInfo) return null;

    return (
        <div className={`text-center p-8 border rounded-xl bg-slate-50`}>
            <div className="flex justify-center items-center gap-2 text-xl font-bold mb-4">
                {statusInfo.icon}
                <h4>Verification Status: {statusInfo.text}</h4>
            </div>
            <p className="text-health-text-p">{statusInfo.message}</p>
            <p className="text-xs text-slate-400 mt-4">Submitted on: {new Date(verificationStatus.submittedAt).toLocaleDateString()}</p>
        </div>
    );
  };
  
  if (statusLoading) return <div className="text-center p-8">Loading verification status...</div>;
  
  return (
    <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <Stethoscope size={48} className="mx-auto text-health-primary" />
            <h1 className="text-3xl font-bold text-health-text-h mt-4">Doctor Verification Status</h1>
        </div>
        <StatusDisplay />
    </div>
  );
};

export default DoctorVerification;
