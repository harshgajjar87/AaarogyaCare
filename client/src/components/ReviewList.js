import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { getDoctorReviews } from '../api/reviewAPI';
import { getFullImageUrl } from '../utils/imageUtils';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';

const ReviewList = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [sortBy, setSortBy] = useState('createdAt_desc');

  useEffect(() => {
    fetchReviews();
  }, [doctorId, pagination.page, sortBy]);

  const fetchReviews = async () => {
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
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  if (reviews.length === 0) return <div className="text-center py-8 text-slate-500">No reviews yet.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-semibold text-slate-800">Patient Reviews ({reviews.length})</h5>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm rounded-full border-slate-300">
            <option value="createdAt_desc">Newest</option>
            <option value="createdAt_asc">Oldest</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="rating_asc">Lowest Rated</option>
        </select>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="p-4 border rounded-xl bg-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={getFullImageUrl(review.patientId?.profileImage)} alt={review.patientName} className="w-10 h-10 rounded-full object-cover"/>
                <div>
                  <h6 className="font-semibold text-slate-900">{review.patientName}</h6>
                  <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <StarRating rating={review.rating} size={16} />
            </div>
            <p className="text-sm text-slate-700 mt-3">{review.description}</p>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <nav className="flex justify-center pt-4">
          <ul className="flex items-center -space-x-px h-8 text-sm">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <li key={page}>
                <button onClick={() => setPagination(prev => ({...prev, page}))} className={`flex items-center justify-center px-3 h-8 leading-tight ${pagination.page === page ? 'text-blue-600 border-blue-300 bg-blue-50' : 'text-gray-500 bg-white border-gray-300'} border hover:bg-gray-100 hover:text-gray-700`}>
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
