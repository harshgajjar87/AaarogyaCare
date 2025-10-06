import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import '../styles/components/About.css';
import PublicNavbar from '../components/PublicNavbar';
import PatientNavbar from '../components/PaitentNavbar';
import DoctorNavbar from '../components/DoctorNavbar';
import AdminNavbar from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';

const About = () => {
  const { user } = useAuth();

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

  return (
    <>
      <div className="container mt-5 about-container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {/* About Section */}
            <div className="card mb-4 about-card fade-in-up">
              <div className="card-header bg-primary text-white about-header">
                <h2 className="mb-0 fade-in-down">About Aarogya Clinic</h2>
              </div>
              <div className="card-body about-content">
                <p className="lead fade-in-up" style={{animationDelay: '0.2s'}}>
                  Welcome to Aarogya Clinic - Your trusted healthcare partner for comprehensive medical care.
                </p>

              <h4 className="fade-in-left" style={{animationDelay: '0.4s'}}>Our Mission</h4>
              <p className="fade-in-right" style={{animationDelay: '0.5s'}}>
                We are committed to providing exceptional healthcare services with compassion,
                innovation, and excellence. Our mission is to make quality healthcare accessible
                to everyone through our advanced digital platform.
              </p>

              <h4 className="fade-in-left" style={{animationDelay: '0.6s'}}>Our Services</h4>
              <ul className="stagger-fade-in">
                <li>Online Doctor Consultations with board-certified specialists</li>
                <li>Easy and quick Appointment Booking System with real-time availability</li>
                <li>Comprehensive Medical Report Management with secure access</li>
                <li>Secure Patient-Doctor Communication through chat and video calls</li>
                <li>Emergency Contact Services available 24/7 for urgent care</li>
              </ul>

              <h4 className="fade-in-left" style={{animationDelay: '0.7s'}}>Why Choose Us?</h4>
              <ul className="stagger-fade-in">
                <li>Experienced and Qualified Medical Professionals dedicated to your care</li>
                <li>State-of-the-art Digital Healthcare Platform with user-friendly interface</li>
                <li>24/7 Accessibility and Support to meet your healthcare needs anytime</li>
                <li>Secure and Confidential Services ensuring your privacy and data protection</li>
                <li>Personalized care plans tailored to your individual health goals</li>
              </ul>

              <h4 className="fade-in-left" style={{animationDelay: '0.8s'}}>Contact Information</h4>
              <p className="fade-in-up" style={{animationDelay: '0.9s'}}>
                <strong>Admin Email:</strong> admin@aarogyaclinic.com<br/>
                <strong>Support:</strong> support@aarogyaclinic.com<br/>
                <strong>Phone:</strong> +1 (555) 123-HELP<br/>
                <strong>Address:</strong> 123 Healthcare Avenue, Medical District, City - 12345
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card fade-in-up" style={{animationDelay: '1s'}}>
            <div className="card-header bg-success text-white">
              <h3 className="mb-0 fade-in-down">Contact Us</h3>
            </div>
            <div className="card-body">
              <p className="fade-in-up">Have questions or need assistance? Send us a message and we'll get back to you soon.</p>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label fade-in-left">Name *</label>
                    <input
                      type="text"
                      className="form-control animated-input"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label fade-in-left" style={{animationDelay: '0.1s'}}>Email *</label>
                    <input
                      type="email"
                      className="form-control animated-input"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="subject" className="form-label fade-in-left" style={{animationDelay: '0.2s'}}>Subject *</label>
                  <input
                    type="text"
                    className="form-control animated-input"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label fade-in-left" style={{animationDelay: '0.3s'}}>Message *</label>
                  <textarea
                    className="form-control animated-input"
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary hover-lift fade-in-up"
                  disabled={loading}
                  style={{animationDelay: '0.4s'}}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default About;
