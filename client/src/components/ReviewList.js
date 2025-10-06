import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { getDoctorReviews } from '../api/reviewAPI';
import { getFullImageUrl } from '../utils/imageUtils';

const ReviewList = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const limit = 5;

  useEffect(() => {
    fetchReviews();
  }, [doctorId, currentPage, sortBy, sortOrder]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getDoctorReviews(doctorId, currentPage, limit, sortBy, sortOrder);
      setReviews(response.reviews);
      setTotalPages(response.totalPages);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No reviews yet. Be the first to review this doctor!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Options */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Patient Reviews ({reviews.length})</h5>
        <div className="dropdown">
          <button
            className="btn btn-outline-secondary btn-sm dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            Sort: {sortBy === 'createdAt' ? 'Newest' : 'Highest Rated'} 
            {sortOrder === 'desc' ? ' ↓' : ' ↑'}
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleSortChange('createdAt')}
              >
                Newest {sortBy === 'createdAt' && sortOrder === 'desc' && '↓'}
                {sortBy === 'createdAt' && sortOrder === 'asc' && '↑'}
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleSortChange('rating')}
              >
                Highest Rated {sortBy === 'rating' && sortOrder === 'desc' && '↓'}
                {sortBy === 'rating' && sortOrder === 'asc' && '↑'}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Reviews List */}
      <div className="review-list">
        {reviews.map((review) => (
          <div key={review._id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center">
                  {review.patientId?.profileImage && !review.isAnonymous ? (
                    <img
                      src={getFullImageUrl(review.patientId.profileImage)}
                      alt={review.patientName}
                      className="rounded-circle me-3"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-avtar.jpg';
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: '40px', height: '40px' }}
                    >
                      {review.patientName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h6 className="mb-0">{review.patientName}</h6>
                    <small className="text-muted">
                      {formatDate(review.createdAt)}
                    </small>
                  </div>
                </div>
                <StarRating
                  rating={review.rating}
                  size={16}
                  editable={false}
                  showRating={false}
                />
              </div>
              
              <p className="card-text mt-3">{review.description}</p>
              
              {review.appointmentId && (
                <small className="text-muted">
                  Based on an appointment experience
                </small>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Review pagination">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ReviewList;
