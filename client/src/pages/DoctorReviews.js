import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReviewList from '../components/ReviewList';
import { getReviewStatistics } from '../api/reviewAPI';
import StarRating from '../components/StarRating';
import { Star, BarChart, Users, ArrowLeft } from 'lucide-react';

const DoctorReviews = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [statistics, setStatistics] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?._id) {
      fetchReviewStatistics();
    }
  }, [user]);

  const fetchReviewStatistics = async () => {
    try {
      setLoading(true);
      const stats = await getReviewStatistics(user._id);
      setStatistics(stats);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load review statistics');
    } finally {
      setLoading(false);
    }
  };
  
  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h5 className="text-slate-500 text-xs sm:text-sm">{title}</h5>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );

  if (loading) return <div className="text-center p-8">Loading reviews...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">My Reviews</h1>
      </div>
      <div className="text-center -mt-2 sm:-mt-3 md:-mt-4">
        <p className="text-health-text-p text-xs sm:text-sm md:text-base">Track your patient feedback and ratings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <StatCard title="Overall Rating" value={statistics.averageRating.toFixed(1)} icon={<Star className="text-yellow-400" size={20} />} />
        <StatCard title="Total Reviews" value={statistics.totalReviews} icon={<Users className="text-blue-500" size={20} />} />
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-health-text-h flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4"><BarChart size={16} className="sm:w-5 sm:h-5"/> Rating Distribution</h4>
        <div className="space-y-1.5 sm:space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = statistics.ratingDistribution[rating] || 0;
            const percentage = statistics.totalReviews > 0 ? (count / statistics.totalReviews * 100) : 0;
            return (
              <div key={rating} className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm text-slate-500 w-6 sm:w-8">{rating}★</span>
                <div className="w-full bg-slate-100 rounded-full h-3 sm:h-4">
                  <div className="bg-yellow-400 h-3 sm:h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-600 w-8 sm:w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-health-text-h mb-3 sm:mb-4">Patient Reviews</h4>
        {user?._id ? <ReviewList doctorId={user._id} /> : <p className="text-slate-500 text-sm sm:text-base">Log in to see reviews.</p>}
      </div>
    </div>
  );
};

export default DoctorReviews;
