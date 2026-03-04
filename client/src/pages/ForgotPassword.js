import { useState } from 'react';
import axios from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Key } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/auth/forgot-password', { email });
      toast.success('Password reset OTP sent to your email');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-emerald-700 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-hero-section bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 text-center text-white p-12">
          <Key size={64} className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Forgot Your Password?</h1>
          <p className="text-xl max-w-md">
            No worries! Enter your email and we'll send you a code to reset it.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-health-secondary">
        <div className="w-full max-w-md">
          <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-health-text-h mb-4 sm:mb-6 text-center">Reset Password</h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
                <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                  We'll send a password reset OTP to this email.
                </p>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-teal-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-teal-700 transition-all font-medium disabled:opacity-50 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset OTP'}
              </button>
            </form>
            
            <div className="text-center mt-4 sm:mt-6">
              <Link to="/login" className="text-xs sm:text-sm text-health-primary hover:text-teal-700">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
