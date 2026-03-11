import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { X, Mail, Shield } from 'lucide-react';

const EmailChangeModal = ({ isOpen, onClose, currentEmail, onEmailChanged }) => {
  const [step, setStep] = useState(1); // 1: Enter new email, 2: Verify OTP
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Invalid email address');
      return;
    }

    if (newEmail === currentEmail) {
      toast.error('New email must be different from current email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/otp/send-email-change', { newEmail });
      toast.success(response.data.msg);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndChange = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/otp/verify-email-change', { newEmail, otp });
      toast.success(response.data.msg);
      onEmailChanged(newEmail);
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/otp/send-email-change', { newEmail });
      toast.success('Verification code resent');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setNewEmail('');
    setOtp('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="text-teal-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-health-text-h">Change Email Address</h2>
          <p className="text-health-text-p text-sm mt-2">
            {step === 1 ? 'Enter your new email address' : 'Verify your new email'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Email
              </label>
              <input
                type="email"
                value={currentEmail}
                disabled
                className="w-full rounded-lg border-slate-300 bg-slate-50 py-2 px-4 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-2 px-4 border focus:outline-none focus:border-transparent transition-all text-sm"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndChange} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Verification code sent!</p>
                  <p className="mt-1">
                    We've sent a 6-digit code to <strong>{newEmail}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-2 px-4 border focus:outline-none focus:border-transparent transition-all text-sm text-center text-lg tracking-widest font-semibold"
                maxLength={6}
                required
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Verifying...' : 'Verify & Change'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailChangeModal;
