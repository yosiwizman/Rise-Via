import StarRating from '../ui/StarRating';
import { ReviewSummary as ReviewSummaryType } from '../../types/reviews';

interface ReviewSummaryProps {
  summary: ReviewSummaryType;
}

export default function ReviewSummary({ summary }: ReviewSummaryProps) {
  const { averageRating, totalReviews, ratingDistribution } = summary;

  if (totalReviews === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-risevia-charcoal dark:text-gray-300">
          No reviews yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-risevia-purple">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(averageRating)} readonly />
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-risevia-purple to-risevia-teal h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 w-8">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
