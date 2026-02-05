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
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <h5 className="text-slate-500">{title}</h5>
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );

  if (loading) return <div className="text-center p-8">Loading reviews...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">My Reviews</h1>
      </div>
      <div className="text-center -mt-4">
        <p className="text-health-text-p">Track your patient feedback and ratings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatCard title="Overall Rating" value={statistics.averageRating.toFixed(1)} icon={<Star className="text-yellow-400" />} />
        <StatCard title="Total Reviews" value={statistics.totalReviews} icon={<Users className="text-blue-500" />} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-health-text-h flex items-center gap-2 mb-4"><BarChart size={20}/> Rating Distribution</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = statistics.ratingDistribution[rating] || 0;
            const percentage = statistics.totalReviews > 0 ? (count / statistics.totalReviews * 100) : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-slate-500 w-8">{rating}★</span>
                <div className="w-full bg-slate-100 rounded-full h-4">
                  <div className="bg-yellow-400 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-sm font-bold text-slate-600 w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-health-text-h mb-4">Patient Reviews</h4>
        {user?._id ? <ReviewList doctorId={user._id} /> : <p className="text-slate-500">Log in to see reviews.</p>}
      </div>
    </div>
  );
};

export default DoctorReviews;
