import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import ReviewsCarousel from '../components/ReviewsCarousel';
import DoctorCard from '../components/DoctorCard';
import { getAllDoctors } from '../api/doctorAPI';
import { AuthContext } from '../context/AuthContext';
import { ArrowDown, Stethoscope, Activity, Heart, MessageCircle, Calendar, Shield } from 'lucide-react';


const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data.doctors || []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Redirect logged-in users to their dashboard
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

  if (user) {
    return null; // Render nothing while redirecting
  }

  return (
    <>
      {/* Modern Hero Section */}
      <section className="relative min-h-[50vh] sm:min-h-[55vh] lg:min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 bg-transparent"></div>


        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float hidden md:block"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float hidden md:block" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-32 w-12 h-12 bg-white/10 rounded-full animate-float hidden lg:block" style={{ animationDelay: '2s' }}></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-black px-3 sm:px-4 md:px-6 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 animate-fade-in-up">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">AarogyaCare</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-4 md:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Your Health, Our Priority 🏥
          </p>
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
            Book appointments, communicate with doctors, and manage your health reports seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center animate-fade-in-up px-4 pb-4" style={{ animationDelay: '0.6s' }}>
            <Link to="/register" className="bg-white text-teal-700 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg text-xs sm:text-sm md:text-base whitespace-nowrap w-auto">
              Register as Patient
            </Link>
            <Link
              to="/register-doctor"
              className="bg-white text-teal-700 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg text-xs sm:text-sm md:text-base whitespace-nowrap w-auto"
            >
              Register as Doctor
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <ArrowDown className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-health-text-h mb-3 md:mb-4">AI-Powered Health Tools</h2>
            <p className="text-base sm:text-lg text-health-text-p max-w-2xl mx-auto px-4">
              Use our smart tools to get a better understanding of your health.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Health Risk Calculator Card */}
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
              <div className="bg-teal-100 rounded-full p-3 md:p-4 flex-shrink-0">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Health Risk Calculator</h3>
                <p className="text-sm sm:text-base text-health-text-p mb-3 md:mb-4">Assess your health risks based on lifestyle factors and get personalized recommendations to improve your wellbeing.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-teal-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 mx-auto md:mx-0 text-sm sm:text-base"
                >
                  <span>Try Calculator</span>
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Chat with AI Doctor Card */}
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
              <div className="bg-blue-100 rounded-full p-3 md:p-4 flex-shrink-0">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Chat with AI Doctor</h3>
                <p className="text-sm sm:text-base text-health-text-p mb-3 md:mb-4">Have a text conversation with our AI-powered doctor to discuss your symptoms and get medical advice.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto md:mx-0 text-sm sm:text-base"
                >
                  <span>Start Chat</span>
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8">
            {/* Voice Call with AI Doctor Card */}
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
              <div className="bg-green-100 rounded-full p-3 md:p-4 flex-shrink-0">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Voice Call with AI Doctor</h3>
                <p className="text-sm sm:text-base text-health-text-p mb-3 md:mb-4">Speak directly with our AI-powered doctor for a more natural conversation about your health concerns.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-green-700 transition-colors font-medium flex items-center gap-2 mx-auto md:mx-0 text-sm sm:text-base"
                >
                  <span>Start Voice Call</span>
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-health-secondary">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-health-text-h mb-3 md:mb-4">Why Choose AarogyaCare?</h2>
            <p className="text-base sm:text-lg text-health-text-p max-w-2xl mx-auto px-4">
              Experience comprehensive healthcare with ease. Book appointments, communicate with doctors, and access your reports anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center group">
              <div className="bg-white rounded-full p-4 sm:p-6 shadow-md group-hover:shadow-xl transition-shadow duration-300 mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3 md:mb-4">
                <Calendar className="text-3xl sm:text-4xl text-teal-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Easy Appointment Booking</h3>
              <p className="text-sm sm:text-base text-health-text-p px-2">Schedule appointments with just a few clicks and receive reminders</p>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-full p-4 sm:p-6 shadow-md group-hover:shadow-xl transition-shadow duration-300 mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3 md:mb-4">
                <MessageCircle className="text-3xl sm:text-4xl text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Direct Doctor Communication</h3>
              <p className="text-sm sm:text-base text-health-text-p px-2">Chat with your doctors and get quick responses to your queries</p>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-full p-4 sm:p-6 shadow-md group-hover:shadow-xl transition-shadow duration-300 mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3 md:mb-4">
                <Stethoscope className="text-3xl sm:text-4xl text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Online Consultations</h3>
              <p className="text-sm sm:text-base text-health-text-p px-2">Connect with healthcare professionals from the comfort of your home</p>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-full p-4 sm:p-6 shadow-md group-hover:shadow-xl transition-shadow duration-300 mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3 md:mb-4">
                <Shield className="text-3xl sm:text-4xl text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Secure Report Viewing</h3>
              <p className="text-sm sm:text-base text-health-text-p px-2">Access your medical reports and test results securely anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-health-text-h mb-3 md:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-health-text-p max-w-2xl mx-auto px-4">
              Getting started with AarogyaCare is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl sm:text-2xl font-bold text-teal-700">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Create Account</h3>
              <p className="text-sm sm:text-base text-health-text-p px-2">Sign up with your basic information and verify your email</p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl sm:text-2xl font-bold text-teal-700">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Book Appointment</h3>
              <p className="text-sm sm:text-base text-health-text-p px-2">Select a doctor, choose a time slot, and confirm your appointment</p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl sm:text-2xl font-bold text-teal-700">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-health-text-h mb-2">Connect & Consult</h3>
              <p className="text-sm sm:text-base text-health-text-p px-2">Join the video call or chat with your doctor at the scheduled time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-12 md:py-16 bg-health-secondary">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-health-text-h mb-3 md:mb-4">Our Doctors</h2>
            <p className="text-base sm:text-lg text-health-text-p max-w-2xl mx-auto px-4">
              Consult with our team of qualified and experienced healthcare professionals
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {doctors.slice(0, 6).map((doctor) => (
                <div key={doctor._id} className="transform hover:scale-105 transition-transform duration-300">
                  <DoctorCard
                    doctor={doctor}
                    onBookAppointment={() => navigate('/login')}
                    onViewProfile={() => navigate('/login')}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link to="/register" className="bg-teal-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:bg-teal-700 transition-all font-medium text-sm sm:text-base inline-block">
              View All Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Carousel Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <ReviewsCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 px-2">Ready to Take Control of Your Health?</h2>
          <p className="text-base sm:text-lg md:text-xl text-white mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of patients who trust AarogyaCare for their healthcare needs
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link to="/register" className="bg-white text-teal-700 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg text-xs sm:text-sm md:text-base whitespace-nowrap">
              Join as a Patient
            </Link>
            <Link to="/register-doctor" className="bg-transparent border-2 border-white text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-white hover:text-teal-700 transform hover:scale-105 transition-all duration-300 text-xs sm:text-sm md:text-base whitespace-nowrap">
              Join as a Doctor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
