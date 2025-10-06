import React, { useState } from 'react';
import StarRating from './StarRating';
import { createReview } from '../api/reviewAPI';
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ doctorId, onReviewSubmitted, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [description, setDescription] = useState(existingReview?.description || '');
  const [isAnonymous, setIsAnonymous] = useState(existingReview?.isAnonymous || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!description.trim()) {
      setError('Please write a review');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reviewData = {
        rating,
        description: description.trim(),
        doctorId,
        isAnonymous
      };

      await createReview(reviewData);
      setSuccess('Review submitted successfully!');
      setDescription('');
      setRating(0);
      setIsAnonymous(false);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setError('');
  };

  if (!user) {
    return (
      <div className="alert alert-info">
        Please log in to leave a review.
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h5>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Rating Section */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Your Rating</label>
            <div className="mb-2">
              <StarRating
                rating={rating}
                onRatingChange={handleRatingChange}
                editable={true}
                showRating={false}
                size={24}
              />
            </div>
            <small className="text-muted">
              Click on the stars to rate (1-5 stars)
            </small>
          </div>

          {/* Review Description */}
          <div className="mb-3">
            <label htmlFor="reviewDescription" className="form-label fw-semibold">
              Your Review
            </label>
            <textarea
              id="reviewDescription"
              className="form-control"
              rows="4"
              placeholder="Share your experience with this doctor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              required
            />
            <small className="text-muted">
              {description.length}/1000 characters
            </small>
          </div>

          {/* Anonymous Option */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="anonymousCheck"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="anonymousCheck">
              Post anonymously
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || rating === 0 || !description.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              existingReview ? 'Update Review' : 'Submit Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
