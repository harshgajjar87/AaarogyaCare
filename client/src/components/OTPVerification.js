import { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const OTPVerification = ({ email, onVerified, onResend }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const otpInputRef = useRef(null);

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
    <div className="bg-slate-50 rounded-lg p-4 mt-4">
      <h5 className="font-bold text-health-text-h text-center">Verify Email Address</h5>
      <p className="text-sm text-health-text-p text-center mb-4">
        Enter the 6-digit OTP sent to <strong>{email}</strong>
      </p>

      <div className="space-y-4">
        <input
          ref={otpInputRef}
          type="text"
          className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-2 px-4 border focus:outline-none focus:border-transparent transition-all text-center tracking-[1em]"
          placeholder="------"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          maxLength="6"
          required
        />

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            className="w-full bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium disabled:opacity-50"
            disabled={loading}
            onClick={handleVerify}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            className="text-sm text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
