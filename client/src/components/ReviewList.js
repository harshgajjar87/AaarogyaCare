import React, { useState, useEffect, useCallback } from 'react';
import StarRating from './StarRating';
import { getDoctorReviews } from '../api/reviewAPI';
import { getFullImageUrl } from '../utils/imageUtils';

const ReviewList = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [sortBy, setSortBy] = useState('createdAt_desc');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const [sortField, sortOrder] = sortBy.split('_');
      const response = await getDoctorReviews(doctorId, pagination.page, 5, sortField, sortOrder);
      setReviews(response.reviews);
      setPagination(prev => ({ ...prev, totalPages: response.totalPages }));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [doctorId, pagination.page, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  if (reviews.length === 0) return <div className="text-center py-8 text-slate-500">No reviews yet.</div>;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
        <h5 className="font-semibold text-slate-800 text-sm sm:text-base">Patient Reviews ({reviews.length})</h5>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs sm:text-sm rounded-full border-slate-300 py-1 px-2 sm:px-3">
            <option value="createdAt_desc">Newest</option>
            <option value="createdAt_asc">Oldest</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="rating_asc">Lowest Rated</option>
        </select>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="p-3 sm:p-4 border rounded-xl bg-white">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <img src={getFullImageUrl(review.patientId?.profileImage)} alt={review.patientName} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"/>
                <div className="min-w-0">
                  <h6 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{review.patientName}</h6>
                  <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <StarRating rating={review.rating} size={14} />
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 sm:mt-3">{review.description}</p>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <nav className="flex justify-center pt-3 sm:pt-4">
          <ul className="flex items-center gap-1 sm:gap-0 sm:-space-x-px text-xs sm:text-sm flex-wrap justify-center">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <li key={page}>
                <button onClick={() => setPagination(prev => ({...prev, page}))} className={`flex items-center justify-center px-2 sm:px-3 h-7 sm:h-8 leading-tight rounded sm:rounded-none ${pagination.page === page ? 'text-blue-600 border-blue-300 bg-blue-50' : 'text-gray-500 bg-white border-gray-300'} border hover:bg-gray-100 hover:text-gray-700`}>
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ReviewList;
