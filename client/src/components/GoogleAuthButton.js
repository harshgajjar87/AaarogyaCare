import React, { useEffect, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

const instanceCounter = { count: 0 };

const GoogleAuthButton = ({ mode = 'signin', role = 'patient' }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const buttonContainerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(350);
  const buttonId = useRef(`googleSignInButton_${++instanceCounter.count}`).current;

  useEffect(() => {
    // Calculate responsive width
    const updateWidth = () => {
      if (buttonContainerRef.current) {
        const containerWidth = buttonContainerRef.current.offsetWidth;
        // Use container width but cap at 400px for desktop
        const width = Math.min(containerWidth - 20, 400);
        setButtonWidth(width);
      }
    };

    // Initial calculation
    updateWidth();

    // Update on window resize
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && buttonWidth) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        const buttonContainer = document.getElementById(buttonId);
        if (buttonContainer) {
          // Clear previous button
          buttonContainer.innerHTML = '';
          
          window.google.accounts.id.renderButton(
            buttonContainer,
            {
              theme: 'outline',
              size: 'large',
              width: buttonWidth,
              text: mode === 'signup' ? 'signup_with' : 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
            }
          );
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [mode, buttonWidth]);

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
    <div className="w-full" ref={buttonContainerRef}>
      <div className="relative my-4 sm:my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-2 bg-health-surface text-health-text-p">Or continue with</span>
        </div>
      </div>
      <div 
        id={buttonId}
        className="w-full flex justify-center items-center"
        style={{ minHeight: '44px' }}
      ></div>
    </div>
  );
};

export default GoogleAuthButton;
