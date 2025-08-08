import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, MessageCircle, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  helpfulCount: number;
}

interface ProductReviewsIntegrationProps {
  productId: string;
  productName: string;
}

export const ProductReviewsIntegration: React.FC<ProductReviewsIntegrationProps> = ({
  productId,
  productName
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const mockReviews: Review[] = [
        {
          id: '1',
          customerName: 'Sarah M.',
          rating: 5,
          title: 'Excellent quality!',
          comment: 'This product exceeded my expectations. Great quality and fast shipping.',
          verifiedPurchase: true,
          createdAt: '2024-01-15',
          helpfulCount: 12
        },
        {
          id: '2',
          customerName: 'Mike R.',
          rating: 4,
          title: 'Good value',
          comment: 'Solid product for the price. Would recommend to others.',
          verifiedPurchase: true,
          createdAt: '2024-01-10',
          helpfulCount: 8
        },
        {
          id: '3',
          customerName: 'Jennifer L.',
          rating: 5,
          title: 'Love it!',
          comment: 'Perfect for my needs. Will definitely order again.',
          verifiedPurchase: false,
          createdAt: '2024-01-05',
          helpfulCount: 5
        }
      ];

      setReviews(mockReviews);
      setTotalReviews(mockReviews.length);
      setAverageRating(
        mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
      );
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-risevia-black">
          Customer Reviews
        </h3>
        <Button variant="outline" size="sm">
          Write a Review
        </Button>
      </div>

      <div className="flex items-center space-x-4 p-4 bg-risevia-light rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold text-risevia-black">
            {averageRating.toFixed(1)}
          </div>
          {renderStars(averageRating, 'lg')}
          <div className="text-sm text-risevia-charcoal mt-1">
            {totalReviews} reviews
          </div>
        </div>
        
        <Separator orientation="vertical" className="h-16" />
        
        <div className="flex-1">
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="w-8">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-risevia-black">
                      {review.customerName}
                    </span>
                    {review.verifiedPurchase && (
                      <Badge variant="secondary" className="text-xs">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(review.rating, 'sm')}
                    <span className="text-sm text-risevia-charcoal">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-risevia-black mb-1">
                {review.title}
              </h4>
              <p className="text-risevia-charcoal text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-risevia-charcoal hover:text-risevia-teal"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Helpful ({review.helpfulCount})
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-risevia-charcoal hover:text-risevia-teal"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Reply
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-risevia-black mb-2">
            No reviews yet
          </h3>
          <p className="text-risevia-charcoal mb-4">
            Be the first to review {productName}
          </p>
          <Button>Write the First Review</Button>
        </div>
      )}
    </div>
  );
};
