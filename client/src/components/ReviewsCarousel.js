import React, { useEffect, useState, useRef } from 'react';
import '../styles/components/ReviewsCarousel.css';
import { getAllReviews } from '../api/reviewAPI';
import { getProfileImageUrl } from '../utils/imageUtils';

const ReviewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Fetch reviews from API on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getAllReviews(10);
        setReviews(data.reviews);
        setLoading(false);
      } catch (err) {
        setError(err.toString());
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (reviews.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
        );
      }, 6000); // 6 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reviews.length]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return <div className="reviews-carousel-loading">Loading reviews...</div>;
  }

  if (error) {
    return <div className="reviews-carousel-error">Error: {error}</div>;
  }

  if (reviews.length === 0) {
    return <div className="reviews-carousel-empty">No reviews available.</div>;
  }

  return (
    <div className="reviews-carousel-container">
      <div className="reviews-carousel-header">
        <h2>What Our Patients Say</h2>
        <p>Real experiences from our satisfied patients</p>
      </div>

      <div className="reviews-carousel">
        <div
          className="reviews-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.8s ease-in-out'
          }}
        >
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <img
                    src={getProfileImageUrl(review.patientId?.profileImage)}
                    alt={review.patientName || 'Reviewer'}
                    className="reviewer-avatar"
                    onError={(e) => {
                      e.target.src = '/images/default-avtar.jpg';
                    }}
                  />
                  <div className="reviewer-details">
                    <h4 className="reviewer-name">{review.patientName}</h4>
                    <p className="doctor-name">Treated by {review.doctorId?.name}</p>
                  </div>
                </div>
                <div className="rating">
                  {renderStars(review.rating)}
                </div>
              </div>

              <div className="review-content">
                <p className="review-text">"{review.description}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-indicators">
        {reviews.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to review ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsCarousel;
