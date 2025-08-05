import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import StarRating from '../ui/StarRating';
import { ProductReview } from '../../types/reviews';

export default function ReviewModeration() {
  const [pendingReviews, setPendingReviews] = useState<ProductReview[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const adminFlag = localStorage.getItem('risevia-admin') === 'true';
      setIsAdmin(adminFlag);
      
      if (adminFlag) {
        loadPendingReviews();
      }
    };

    const loadPendingReviews = () => {
      const stored = localStorage.getItem('risevia-reviews');
      const allReviews = stored ? JSON.parse(stored) : [];
      const pending = allReviews.filter((review: ProductReview) => !review.approved);
      setPendingReviews(pending);
    };

    checkAdmin();
  }, []);

  const handleApprove = (reviewId: string) => {
    const stored = localStorage.getItem('risevia-reviews');
    const allReviews = stored ? JSON.parse(stored) : [];
    const updatedReviews = allReviews.map((review: ProductReview) =>
      review.id === reviewId ? { ...review, approved: true } : review
    );
    
    localStorage.setItem('risevia-reviews', JSON.stringify(updatedReviews));
    setPendingReviews(prev => prev.filter(review => review.id !== reviewId));
  };

  const handleReject = (reviewId: string) => {
    const stored = localStorage.getItem('risevia-reviews');
    const allReviews = stored ? JSON.parse(stored) : [];
    const updatedReviews = allReviews.filter((review: ProductReview) => review.id !== reviewId);
    
    localStorage.setItem('risevia-reviews', JSON.stringify(updatedReviews));
    setPendingReviews(prev => prev.filter(review => review.id !== reviewId));
  };

  if (!isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 right-4 z-50 max-w-md"
    >
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Review Moderation ({pendingReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto space-y-3">
          {pendingReviews.length === 0 ? (
            <p className="text-sm text-gray-600">No pending reviews</p>
          ) : (
            pendingReviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={review.rating} readonly size="sm" />
                  <span className="text-xs text-gray-500">{review.userName}</span>
                </div>
                <h5 className="font-medium text-sm mb-1">{review.title}</h5>
                {review.comment && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{review.comment}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(review.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-auto"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(review.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50 text-xs px-2 py-1 h-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
