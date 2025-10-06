import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ReviewList from '../components/ReviewList';
import { getReviewStatistics } from '../api/reviewAPI';
import StarRating from '../components/StarRating';
import '../styles/pages/DoctorReviews.css';

const DoctorReviews = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviewStatistics();
  }, [user]);

  const fetchReviewStatistics = async () => {
    try {
      setLoading(true);
      if (user && user._id) {
        const stats = await getReviewStatistics(user._id);
        setStatistics(stats);
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load review statistics');
      console.error('Error fetching review statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading reviews...</span>
          </div>
          <p className="mt-2">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h2>My Reviews</h2>
        <p>Track your patient feedback and ratings</p>
      </div>

      {/* Review Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="card-body">
            <h5 className="card-title">Overall Rating</h5>
            <div className="rating-display">
              <StarRating
                rating={statistics.averageRating}
                size={28}
                editable={false}
                showRating={true}
              />
            </div>
            <p className="card-text">
              {statistics.averageRating.toFixed(1)} out of 5
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-body">
            <h5 className="card-title">Total Reviews</h5>
            <h2 className="display-4">{statistics.totalReviews}</h2>
            <p className="card-text">patient reviews</p>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="rating-distribution-card">
        <div className="card-body">
          <h5 className="card-title">Rating Distribution</h5>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar-item">
                <span className="rating-stars">{rating}★</span>
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${statistics.totalReviews > 0 ? (statistics.ratingDistribution[rating] / statistics.totalReviews * 100) : 0}%`
                    }}
                  >
                    {statistics.ratingDistribution[rating]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list-card">
        <div className="card-body">
          <h5 className="card-title">Patient Reviews</h5>
          {user && user._id ? (
            <ReviewList doctorId={user._id} />
          ) : (
            <p className="text-muted">Please log in to view reviews.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReviews;
