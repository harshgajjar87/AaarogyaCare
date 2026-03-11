import { useState, useContext } from 'react';
import axios from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import OTPVerification from '../components/OTPVerification';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    if (!form.email) {
      toast.error('Please enter email address');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      toast.error('Invalid email address');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post('/otp/send', { email: form.email });
      toast.success(response.data.msg);
      setOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    setOtpVerified(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error('Please verify your email with OTP');
      return;
    }

    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password
      };

      const res = await axios.post('/auth/register', payload);

      const fullUser = {
        ...res.data.user,
        token: res.data.token,
      };

      login(fullUser);
      localStorage.setItem('userRole', fullUser.role);

      toast.success('Registration Successful');

      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Medical Abstract Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-section bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-6xl mb-6">🩺</div>
          <h1 className="text-4xl font-bold mb-4">Join AarogyaCare</h1>
          <p className="text-xl text-center max-w-md">
            Create your account to access quality healthcare services, book appointments, and manage your health journey.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-health-secondary">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8 lg:hidden">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🩺</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-health-text-h">AarogyaCare</h1>
          </div>

          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-health-text-h mb-4 sm:mb-6 text-center">Create Your Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-1.5 sm:mb-2">Full Name</label>
                <input
                  type='text'
                  name='name'
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-1.5 sm:py-2 px-3 sm:px-4 border focus:outline-none focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-1.5 sm:mb-2">Email</label>
                <div className="flex gap-2">
                  <input
                    type='email'
                    name='email'
                    value={form.email}
                    onChange={handleChange}
                    className="flex-1 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-1.5 sm:py-2 px-3 sm:px-4 border focus:outline-none focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Enter your email"
                    required
                    disabled={otpVerified}
                  />
                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || otpSent}
                      className="bg-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-teal-700 transition-all font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      {otpLoading ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                    </button>
                  )}
                </div>
                {otpVerified && (
                  <div className="mt-2 text-xs sm:text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email verified
                  </div>
                )}
              </div>

              {otpSent && !otpVerified && (
                <OTPVerification
                  email={form.email}
                  onVerified={handleVerifyOTP}
                  onResend={handleSendOTP}
                />
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-1.5 sm:mb-2">Password</label>
                <input
                  type='password'
                  name='password'
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-1.5 sm:py-2 px-3 sm:px-4 border focus:outline-none focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-1.5 sm:mb-2">Confirm Password</label>
                <input
                  type='password'
                  name='confirm'
                  value={form.confirm}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-1.5 sm:py-2 px-3 sm:px-4 border focus:outline-none focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !otpVerified}
                className="w-full bg-teal-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-teal-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <GoogleAuthButton mode="signup" role="patient" />

              <p className="text-center text-health-text-p text-xs sm:text-sm">
                Already have an account?{' '}
                <Link to='/login' className="text-health-primary hover:text-teal-700 font-medium transition-colors">
                  Login
                </Link>
              </p>

              <p className="text-center text-xs sm:text-sm text-health-text-p mt-3 sm:mt-4">
                Are you a healthcare professional?{' '}
                <Link to='/register-doctor' className="text-health-primary hover:text-teal-700 font-medium transition-colors">
                  Register as a Doctor
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
