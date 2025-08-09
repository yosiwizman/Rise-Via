import { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { reviewService } from '../services/reviewService';
import { Review, ReviewStats } from '../types/reviews';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as File[]
  });

  const loadReviews = useCallback(async () => {
    const { data } = await reviewService.getProductReviews(productId, sortBy);
    if (data) setReviews(data);
    setLoading(false);
  }, [productId, sortBy]);

  const loadStats = useCallback(async () => {
    const { data } = await reviewService.getReviewStats(productId);
    if (data) setStats(data);
  }, [productId]);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [productId, sortBy, loadReviews, loadStats]);

  const handleSubmitReview = async () => {
    const { data } = await reviewService.createReview({
      ...reviewForm,
      productId,
      customerId: 'anonymous',
      images: []
    });
    
    if (data) {
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '', images: [] });
      loadReviews();
      loadStats();
    }
  };

  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const ReviewCard = ({ review }: { review: Review }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <StarRating rating={review.rating} />
              {review.verified_purchase && (
                <Badge className="bg-green-500 text-white text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Purchase
                </Badge>
              )}
            </div>
            <h4 className="font-semibold text-risevia-black">{review.title}</h4>
          </div>
          <span className="text-sm text-risevia-charcoal">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-risevia-charcoal mb-3">{review.comment}</p>
        
        {review.images && review.images.length > 0 && (
          <div className="flex space-x-2 mb-3">
            {review.images.map((image, idx) => (
              <img
                key={idx}
                src={image}
                alt={`Review image ${idx + 1}`}
                className="w-16 h-16 object-cover rounded border"
              />
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => reviewService.voteHelpful(review.id, 'anonymous', 'helpful')}
            className="text-risevia-teal hover:text-risevia-teal/80"
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            Helpful ({review.helpful_count})
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Customer Reviews</span>
              <Badge>{stats.totalReviews} reviews</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-3xl font-bold text-risevia-black">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.averageRating)} size="lg" />
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${stats.totalReviews > 0 
                          ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 
                          : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm w-8">
                    {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <Select value={sortBy} onValueChange={(value: 'recent' | 'helpful' | 'rating') => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
            <SelectItem value="rating">Highest Rating</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
        >
          Write a Review
        </Button>
      </div>

      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="title">Review Title</Label>
              <Input
                id="title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                placeholder="Summarize your experience"
              />
            </div>
            
            <div>
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your thoughts about this product"
                rows={4}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSubmitReview} className="bg-risevia-teal text-white">
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        {reviews.length > 0 ? (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-risevia-charcoal">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
