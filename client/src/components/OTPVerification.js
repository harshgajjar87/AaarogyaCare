import { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const OTPVerification = ({ email, onVerified, onResend }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const otpInputRef = useRef(null);

  // ✅ Autofocus when component mounts
  useEffect(() => {
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, []);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/otp/verify', { email, otp });
      toast.success(response.data.msg);
      onVerified();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await axios.post('/otp/resend', { email });
      toast.success(response.data.msg);
      onResend();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="card-title">Verify Email Address</h5>
        <p className="text-muted">
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>

        <div>
          <div className="mb-3">
            <input
              ref={otpInputRef} // ✅ Focus here
              type="text"
              className="form-control"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              maxLength="6"
              required
            />
          </div>

          <div className="d-grid gap-2">
            <button
              type="button" // ✅ No parent form submit
              className="btn btn-primary"
              disabled={loading}
              onClick={handleVerify}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              className="btn btn-link"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
