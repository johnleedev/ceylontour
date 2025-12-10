import { useCallback } from "react";
import { FaStar } from "react-icons/fa";
import { MdOutlineStar } from "react-icons/md";

export default function RatingBoard({ rating }: { rating: number }) {
 
  const formatRatingArray = useCallback((rating: number) => {
    const integerPart = Math.floor(rating);
    const fractionalPart = Math.round((rating - integerPart) * 100);

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
    <div className="rating__board__wrapper" style={{display:'flex'}}  >
      {formatRatingArray(rating).map((value, idx) => {
        return (
          <div className="rating__icon" key={idx} >
            <MdOutlineStar size={16}
              className={value === 100 ? "filled__star" : "empty__star"}
            />
          </div>
        )
      })}
    </div>
  );
}
