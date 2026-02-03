import { useCallback } from "react";
import { FaStar } from "react-icons/fa";
import { MdOutlineStar } from "react-icons/md";

export default function RatingBoard({ rating, ratingSize }: { rating: number, ratingSize: number }) {
 
  const formatRatingArray = useCallback((rating: number) => {
    // rating이 유효하지 않으면 0으로 처리
    const validRating = isNaN(rating) || rating < 0 ? 0 : Math.min(5, rating);
    const integerPart = Math.floor(validRating);
    const fractionalPart = Math.round((validRating - integerPart) * 100);

    return new Array(5).fill(0).map((_, i) => {
      if (i < integerPart) {
        return 100;
      }
      if (i === integerPart) {
        return fractionalPart;
      }
      return 0;
    });
  }, []);

  return (
    <div 
      style={{
        display: 'flex'
      }}
    >
      {formatRatingArray(rating)
        .filter(value => value > 0)
        .map((value, idx) => {
          return (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <MdOutlineStar 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `${ratingSize}px`,
                  height: `${ratingSize}px`,
                  position: 'relative',
                  fill: value === 100 ? 'rgba(252, 196, 0, 1)' : 'rgba(119, 119, 119, 1)',
                  color: value === 100 ? 'rgba(252, 196, 0, 1)' : 'rgba(119, 119, 119, 1)',
                }}
              />
            </div>
          )
        })}
    </div>
  );
}
