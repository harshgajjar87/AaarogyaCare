import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

const GoogleAuthButton = ({ mode = 'signin', role = 'patient' }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            width: 350, // Use pixel value instead of percentage
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [mode]);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await axios.post('/auth/google', {
        credential: response.credential,
        role: role,
      });

      const fullUser = {
        ...res.data.user,
        token: res.data.token,
      };

      login(fullUser);
      localStorage.setItem('userRole', fullUser.role);

      toast.success(res.data.msg);

      // Navigate based on role
      if (fullUser.role === 'doctor' || fullUser.role === 'pending_doctor') {
        navigate('/doctor/dashboard');
      } else if (fullUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Google authentication failed');
    }
  };

  return (
    <div className="w-full">
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-health-surface text-health-text-p">Or continue with</span>
        </div>
      </div>
      <div id="googleSignInButton" className="w-full flex justify-center"></div>
    </div>
  );
};

export default GoogleAuthButton;
