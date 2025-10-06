import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ 
  rating, 
  onRatingChange, 
  size = 20, 
  editable = false, 
  showRating = true,
  className = '' 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (newRating) => {
    if (editable && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (editable) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  const renderStar = (index) => {
    const displayRating = hoverRating || rating;
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = displayRating % 1 !== 0;
    
    if (index < fullStars) {
      return (
        <FaStar
          className="text-warning"
          style={{ cursor: editable ? 'pointer' : 'default', fontSize: size }}
          onClick={() => handleClick(index + 1)}
          onMouseEnter={() => handleMouseEnter(index + 1)}
        />
      );
    } else if (hasHalfStar && index === fullStars) {
      return (
        <FaStarHalfAlt
          className="text-warning"
          style={{ cursor: editable ? 'pointer' : 'default', fontSize: size }}
          onClick={() => handleClick(index + 1)}
          onMouseEnter={() => handleMouseEnter(index + 1)}
        />
      );
    } else {
      return (
        <FaRegStar
          className="text-warning"
          style={{ cursor: editable ? 'pointer' : 'default', fontSize: size }}
          onClick={() => handleClick(index + 1)}
          onMouseEnter={() => handleMouseEnter(index + 1)}
        />
      );
    }
  };

  return (
    <div className={`d-flex align-items-center ${className}`}>
      <div 
        className="d-flex"
        onMouseLeave={handleMouseLeave}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <span key={index} className="me-1">
            {renderStar(index)}
          </span>
        ))}
      </div>
      {showRating && (
        <span className="ms-2 fw-bold">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
