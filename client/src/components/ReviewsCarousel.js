import React, { useEffect, useState, useRef } from 'react';
import { getAllReviews } from '../api/reviewAPI';
import { getProfileImageUrl } from '../utils/imageUtils';
import { Star } from 'lucide-react';

const ReviewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getAllReviews(10);
        setReviews(data.reviews);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev === reviews.length - 1 ? 0 : prev + 1));
      }, 6000);
    }
    return () => clearInterval(intervalRef.current);
  }, [reviews.length]);

  const renderStars = (rating) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
    ))
  );

  if (loading) return <div className="text-center py-8">Loading testimonials...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Could not load testimonials.</div>;
  if (reviews.length === 0) return <div className="text-center py-8 text-slate-500">No testimonials yet.</div>;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-health-text-h">What Our Patients Say</h2>
        <p className="text-health-text-p mt-2">Real experiences from our satisfied patients</p>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {reviews.map((review) => (
            <div key={review._id} className="w-full flex-shrink-0 p-4">
              <div className="bg-white rounded-xl shadow-sm border p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={getProfileImageUrl(review.patientId?.profileImage)} alt={review.patientName} className="w-14 h-14 rounded-full object-cover"/>
                    <div>
                      <h4 className="font-bold text-health-text-h">{review.patientName}</h4>
                      <p className="text-sm text-slate-500">Treated by Dr. {review.doctorId?.name}</p>
                    </div>
                  </div>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <p className="text-slate-600 italic">"{review.description}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {reviews.map((_, index) => (
          <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'w-4 bg-teal-600' : 'bg-slate-300 hover:bg-slate-400'}`}/>
        ))}
      </div>
    </div>
  );
};

export default ReviewsCarousel;
