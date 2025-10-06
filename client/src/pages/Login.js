import { useState, useContext } from 'react';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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

    login(fullUser);

    // Set userRole in localStorage for backward compatibility
    localStorage.setItem('userRole', fullUser.role);

    toast.success('Login Successful');
    console.log('logged in user role:', fullUser.role);

    if (fullUser.role === 'doctor') {
      navigate('/doctor/dashboard');
    } else if (fullUser.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/patient/dashboard');
    }
  } catch (err) {
    toast.error(err.response?.data?.msg || 'Login Failed');
  }
};



  return (
    <>
    <div className='container mt-5 fade-in-up'>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg fade-zoom-in">
            <div className="card-body p-5">
              <h2 className='mb-4 text-center fade-in-down'>Login</h2>
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <label className="fade-in-left">Email</label>
                  <input
                    type='email'
                    name='email'
                    value={form.email}
                    onChange={handleChange}
                    className='form-control animated-input'
                    required
                  />
                </div>
                <div className='mb-3'>
                  <label className="fade-in-left" style={{animationDelay: '0.1s'}}>Password</label>
                  <input
                    type='password'
                    name='password'
                    value={form.password}
                    onChange={handleChange}
                    className='form-control animated-input'
                    required
                  />
                </div>
                <button className='btn btn-primary w-100 hover-lift fade-in-up' style={{animationDelay: '0.2s'}}>Login</button>
                <p className='mt-3 text-center fade-in-up' style={{animationDelay: '0.3s'}}>
                  <Link to='/forgot-password' className='btn btn-link p-0'>
                    Forgot Password?
                  </Link>
                </p>
                <p className='mt-3 text-center fade-in-up' style={{animationDelay: '0.4s'}}>
          Don't have an account?{' '}
          <Link to='/register' className='btn btn-outline-secondary btn-sm ms-2 hover-scale'>
            Register
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

export default Login;
