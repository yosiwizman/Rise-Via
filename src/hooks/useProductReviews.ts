import { useState, useEffect } from 'react';
import { ProductReview, ReviewSummary } from '../types/reviews';

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadReviews = () => {
      const stored = localStorage.getItem('risevia-reviews');
      const allReviews = stored ? JSON.parse(stored) : [];
      const productReviews = allReviews.filter((review: ProductReview) => 
        review.productId === productId && review.approved
      );
      setReviews(productReviews);
      setIsLoading(false);
    };

    loadReviews();
  }, [productId, refreshTrigger]);

  const addReview = (reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'helpful' | 'approved'>) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      helpful: 0,
      approved: false
    };

    const stored = localStorage.getItem('risevia-reviews');
    const allReviews = stored ? JSON.parse(stored) : [];
    const updatedReviews = [...allReviews, newReview];
    
    localStorage.setItem('risevia-reviews', JSON.stringify(updatedReviews));
    
    return newReview.id;
  };

  const getReviewSummary = (): ReviewSummary => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    return { averageRating, totalReviews, ratingDistribution };
  };

  const refreshReviews = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    reviews,
    isLoading,
    addReview,
    getReviewSummary,
    refreshReviews
  };
}
