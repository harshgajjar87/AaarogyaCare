import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const About = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/contact', formData);
      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InfoSection = ({ title, children }) => (
    <div className="mb-6">
      <h4 className="text-xl font-bold text-health-text-h mb-2">{title}</h4>
      <div className="text-health-text-p space-y-2">{children}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back to Dashboard Button */}
      {user && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(user?.role === 'doctor' ? '/doctor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard')}
            className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-lg font-medium text-health-text-h">Back to Dashboard</span>
        </div>
      )}
      {/* About Section */}
      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-8 mb-8">
        <h2 className="text-3xl font-bold text-center text-health-text-h mb-2">About AarogyaCare</h2>
        <p className="text-center text-health-text-p mb-8">
          Your trusted healthcare partner for comprehensive medical care.
        </p>

        <InfoSection title="Our Mission">
          <p>
            We are committed to providing exceptional healthcare services with compassion,
            innovation, and excellence. Our mission is to make quality healthcare accessible
            to everyone through our advanced digital platform.
          </p>
        </InfoSection>

        <InfoSection title="Our Services">
          <ul className="list-disc list-inside space-y-1">
            <li>Online Doctor Consultations with board-certified specialists</li>
            <li>Easy and quick Appointment Booking System with real-time availability</li>
            <li>Comprehensive Medical Report Management with secure access</li>
            <li>Secure Patient-Doctor Communication through chat and video calls</li>
          </ul>
        </InfoSection>

        <InfoSection title="Why Choose Us?">
          <ul className="list-disc list-inside space-y-1">
            <li>Experienced and Qualified Medical Professionals</li>
            <li>State-of-the-art Digital Healthcare Platform</li>
            <li>24/7 Accessibility and Support</li>
            <li>Secure and Confidential Services</li>
          </ul>
        </InfoSection>

        <InfoSection title="Contact Information">
          <p><strong>Email:</strong> admin@aarogyaclinic.com</p>
          <p><strong>Support:</strong> support@aarogyaclinic.com</p>
        </InfoSection>
      </div>

      {/* Contact Form */}
      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-2xl font-bold text-center text-health-text-h mb-4">Contact Us</h3>
        <p className="text-center text-health-text-p mb-8">
          Have questions or need assistance? Send us a message.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-health-text-p mb-2">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-2 px-4"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-health-text-p mb-2">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-2 px-4"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-health-text-p mb-2">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-2 px-4"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-health-text-p mb-2">Message *</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 py-2 px-4"
              required
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-teal-600 text-white px-8 py-3 rounded-full hover:bg-teal-700 transition-all font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default About;
