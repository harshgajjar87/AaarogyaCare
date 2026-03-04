import React, { useState } from 'react';
import StarRating from './StarRating';
import { createReview } from '../api/reviewAPI';
import { useAuth } from '../context/AuthContext';
import { Send, Loader2 } from 'lucide-react';

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
    if (rating === 0) { setError('Please select a rating'); return; }
    if (!description.trim()) { setError('Please write a review'); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createReview({ rating, description: description.trim(), doctorId, isAnonymous });
      setSuccess('Review submitted successfully!');
      setDescription('');
      setRating(0);
      setIsAnonymous(false);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">Please log in to leave a review.</div>;
  }

  return (
    <div className="bg-slate-50 rounded-xl p-3 sm:p-4 md:p-6 my-3 sm:my-4">
      <h5 className="text-base sm:text-lg font-bold text-health-text-h mb-3 sm:mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h5>
      
      {error && <div className="p-2 sm:p-3 bg-red-100 text-red-700 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">{error}</div>}
      {success && <div className="p-2 sm:p-3 bg-green-100 text-green-700 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">Your Rating</label>
          <StarRating rating={rating} onRatingChange={(r) => { setRating(r); setError(''); }} editable={true} size={24} />
        </div>

        <div>
          <label htmlFor="reviewDescription" className="block text-xs sm:text-sm font-medium text-health-text-p mb-2">Your Review</label>
          <textarea
            id="reviewDescription"
            className="w-full rounded-lg border-slate-300 text-sm sm:text-base"
            rows="4"
            placeholder="Share your experience..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            required
          />
          <p className="text-xs text-slate-500 text-right">{description.length}/1000</p>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" id="anonymousCheck" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          <label htmlFor="anonymousCheck" className="text-xs sm:text-sm font-medium text-health-text-p">Post anonymously</label>
        </div>

        <button type="submit" className="w-full bg-teal-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-teal-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm md:text-base" disabled={loading || rating === 0 || !description.trim()}>
          {loading ? <><Loader2 className="animate-spin" size={14}/> Submitting...</> : <><Send size={14}/>{existingReview ? 'Update Review' : 'Submit Review'}</>}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
