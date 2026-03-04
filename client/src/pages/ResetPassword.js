import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Key } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      toast.success('Password reset successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await axios.post('/otp/send', { email: formData.email });
      toast.success('New OTP sent to your email');
    } catch (err) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-emerald-700 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-hero-section bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 text-center text-white p-12">
          <Key size={64} className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Reset Your Password</h1>
          <p className="text-xl max-w-md">
            Enter the OTP from your email and create a new password.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-health-secondary">
        <div className="w-full max-w-md">
          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-health-text-h mb-4 sm:mb-6 text-center">Create New Password</h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required readOnly={!!location.state?.email} className="w-full rounded-lg border-slate-300 bg-slate-100 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">OTP Code</label>
                    <input type="text" name="otp" value={formData.otp} onChange={handleChange} required maxLength="6" placeholder="Enter 6-digit OTP" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">New Password</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required minLength="6" placeholder="Enter new password" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength="6" placeholder="Confirm new password" className="w-full rounded-lg border-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base" />
                </div>
              <button type="submit" className="w-full bg-teal-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-teal-700 transition-all font-medium disabled:opacity-50 text-sm sm:text-base" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            <div className="text-center mt-3 sm:mt-4">
              <button type="button" className="text-xs sm:text-sm text-health-primary hover:text-teal-700" onClick={handleResendOTP} disabled={loading}>
                Resend OTP
              </button>
            </div>
            <div className="text-center mt-2">
              <Link to="/login" className="text-xs sm:text-sm text-slate-500 hover:text-health-primary">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
