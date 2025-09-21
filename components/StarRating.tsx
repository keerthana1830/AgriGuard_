import React, { useState } from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  onRate?: (rating: number) => void;
  size?: string;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  onRate,
  size = 'w-5 h-5',
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const isInteractive = !!onRate;

  const handleClick = (rate: number) => {
    if (onRate) {
      onRate(rate);
    }
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const currentRating = hoverRating || rating;

        return (
          <button
            key={starValue}
            onClick={() => handleClick(starValue)}
            onMouseEnter={isInteractive ? () => setHoverRating(starValue) : undefined}
            onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
            disabled={!isInteractive}
            className={`
              transition-colors duration-150
              ${isInteractive ? 'cursor-pointer' : 'cursor-default'}
            `}
            aria-label={`Rate ${starValue} out of ${totalStars} stars`}
          >
            <StarIcon
              className={`
                ${size}
                ${starValue <= currentRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-slate-600'
                }
                ${isInteractive ? 'hover:text-yellow-300' : ''}
              `}
            />
          </button>
        );
      })}
    </div>
  );
};
