import React, { useState } from 'react';
import { Star } from 'lucide-react';

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
    if (editable && onRatingChange) onRatingChange(newRating);
  };

  const handleMouseEnter = (starIndex) => {
    if (editable) setHoverRating(starIndex);
  };

  const handleMouseLeave = () => {
    if (editable) setHoverRating(0);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex" onMouseLeave={handleMouseLeave}>
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <Star
              key={starValue}
              size={size}
              className={`transition-colors ${editable ? 'cursor-pointer' : ''} ${starValue <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
            />
          );
        })}
      </div>
      {showRating && (
        <span className="font-bold text-slate-700">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
