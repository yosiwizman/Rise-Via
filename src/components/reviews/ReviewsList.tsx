import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import StarRating from '../ui/StarRating';
import { ProductReview } from '../../types/reviews';

interface ReviewsListProps {
  reviews: ProductReview[];
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterRating === 'all') return true;
      return review.rating === parseInt(filterRating);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-risevia-charcoal dark:text-gray-300">
          No reviews yet. Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Rating</SelectItem>
            <SelectItem value="lowest">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-40 bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredAndSortedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} readonly size="sm" />
                {review.verified && (
                  <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <h4 className="font-semibold text-risevia-black dark:text-white mb-1">
              {review.title}
            </h4>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              by {review.userName || 'Anonymous'}
            </p>
            
            {review.comment && (
              <p className="text-risevia-charcoal dark:text-gray-300 mb-3">
                {review.comment}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-risevia-purple">
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
