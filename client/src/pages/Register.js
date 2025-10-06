import { useState, useContext } from 'react';
import axios from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import OTPVerification from '../components/OTPVerification';
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

      // All new users start as 'patient' role and go to patient dashboard
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className='container mt-5 fade-in-up'>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg fade-zoom-in">
            <div className="card-body p-5">
              <h2 className='mb-4 text-center fade-in-down'>Register</h2>
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <label className="fade-in-left">Name</label>
                  <input
                    type='text'
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    className='form-control animated-input'
                    required
                  />
                </div>

                <div className='mb-3'>
                  <label className="fade-in-left" style={{animationDelay: '0.1s'}}>Email</label>
                  <div className="input-group">
                    <input
                      type='email'
                      name='email'
                      value={form.email}
                      onChange={handleChange}
                      className='form-control animated-input'
                      required
                      disabled={otpVerified}
                    />
                    {!otpVerified && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleSendOTP}
                        disabled={otpLoading || otpSent}
                      >
                        {otpLoading ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                  {otpVerified && (
                    <div className="text-success mt-1">
                      <small>✓ Email verified</small>
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

                <div className='mb-3'>
                  <label className="fade-in-left" style={{animationDelay: '0.2s'}}>Password</label>
                  <input
                    type='password'
                    name='password'
                    value={form.password}
                    onChange={handleChange}
                    className='form-control animated-input'
                    required
                  />
                </div>

                <div className='mb-3'>
                  <label className="fade-in-left" style={{animationDelay: '0.3s'}}>Confirm Password</label>
                  <input
                    type='password'
                    name='confirm'
                    value={form.confirm}
                    onChange={handleChange}
                    className='form-control animated-input'
                    required
                  />
                </div>

                <button className='btn btn-primary w-100 hover-lift fade-in-up' style={{animationDelay: '0.4s'}} disabled={loading || !otpVerified}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
                <p className='mt-3 text-center fade-in-up' style={{animationDelay: '0.5s'}}>
          Already have an account?{' '}
          <Link to='/login' className='btn btn-outline-secondary btn-sm ms-2 hover-scale'>
            Login
          </Link>
        </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;
