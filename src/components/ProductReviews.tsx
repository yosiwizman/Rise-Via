import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, MessageCircle, User, Calendar } from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: ''
  });

  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReviews: Review[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Sarah M.',
          rating: 5,
          title: 'Excellent quality and effects',
          comment: 'This THCA flower exceeded my expectations. Great taste, smooth smoke, and perfect effects for evening relaxation. Will definitely order again!',
          date: '2024-08-01',
          verified: true,
          helpful: 12,
          images: []
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Mike R.',
          rating: 4,
          title: 'Good product, fast shipping',
          comment: 'Quality product that arrived quickly. The effects are as described. Only minor complaint is the packaging could be better.',
          date: '2024-07-28',
          verified: true,
          helpful: 8,
          images: []
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Jessica L.',
          rating: 5,
          title: 'Perfect for my needs',
          comment: 'Exactly what I was looking for. Great for pain relief and helps with sleep. The customer service was also excellent when I had questions.',
          date: '2024-07-25',
          verified: false,
          helpful: 15,
          images: []
        }
      ];
      
      setReviews(mockReviews);
      setIsLoading(false);
    };

    loadReviews();
  }, [productId]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newReview.rating === 0 || !newReview.title.trim() || !newReview.comment.trim()) {
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      helpful: 0,
      images: []
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 0, title: '', comment: '' });
    setShowReviewForm(false);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-400'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800" data-testid="product-reviews">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Customer Reviews</h3>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-gradient-to-r from-risevia-purple to-risevia-green text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Write Review
        </button>
      </div>

      {/* Review Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(averageRating))}
          </div>
          <p className="text-gray-400">Based on {reviews.length} reviews</p>
        </div>

        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm w-8">{rating}★</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-risevia-purple to-risevia-green h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700"
        >
          <h4 className="text-lg font-semibold mb-4">Write a Review for {productName}</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview({ ...newReview, rating })
              )}
            </div>

            <div>
              <label htmlFor="review-title" className="block text-sm font-medium text-gray-300 mb-2">
                Review Title
              </label>
              <input
                type="text"
                id="review-title"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-risevia-purple focus:border-transparent"
                placeholder="Summarize your experience"
                required
              />
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-300 mb-2">
                Your Review
              </label>
              <textarea
                id="review-comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-risevia-purple focus:border-transparent"
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-risevia-purple to-risevia-green text-white py-2 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="border border-gray-600 text-gray-300 py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">No reviews yet</h4>
            <p className="text-gray-400">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-700 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-risevia-purple to-risevia-green rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{review.userName}</span>
                      {review.verified && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <h5 className="font-semibold mb-2">{review.title}</h5>
              <p className="text-gray-300 mb-3">{review.comment}</p>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <button className="flex items-center gap-1 hover:text-risevia-purple transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
