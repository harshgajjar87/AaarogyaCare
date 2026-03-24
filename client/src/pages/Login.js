import { useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      const fullUser = {
        ...res.data.user,
        token: res.data.token,
      };

      // Block pending_doctor before setting any session
      if (fullUser.role === 'pending_doctor') {
        toast.info('Your doctor account is pending admin approval. You will be notified once approved.');
        return;
      }

      login(fullUser);
      localStorage.setItem('userRole', fullUser.role);
      toast.success('Login Successful');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login Failed');
    }
  };

  useEffect(() => {
    if (user && user.role) {
      if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Medical Abstract Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-section bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-6xl mb-6">🩺</div>
          <h1 className="text-4xl font-bold mb-4 text-white">Welcome Back</h1>
          <p className="text-xl text-center max-w-md text-white">
            Access your health records, book appointments, and connect with healthcare professionals.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-health-secondary">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8 lg:hidden">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🩺</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-health-text-h">AarogyaCare</h1>
          </div>

          <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-health-text-h mb-4 sm:mb-6 text-center">Login to Your Account</h2>

            {location.state?.message && (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded-md text-sm sm:text-base">
                <p>{location.state.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-1.5 sm:mb-2">Email</label>
                <input
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-1.5 sm:py-2 px-3 sm:px-4 border focus:outline-none focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-1.5 sm:mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-1.5 sm:py-2 px-3 sm:px-4 pr-10 border focus:outline-none focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Enter your password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link to='/forgot-password' className="text-xs sm:text-sm text-health-primary hover:text-teal-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-teal-700 transition-all font-medium text-sm sm:text-base"
              >
                Login
              </button>

              {/* <GoogleAuthButton mode="signin" role="patient" /> */}

              <p className="text-center text-health-text-p text-xs sm:text-sm">
                Don't have an account?{' '}
                <Link to='/register' className="text-health-primary hover:text-teal-700 font-medium transition-colors">
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
