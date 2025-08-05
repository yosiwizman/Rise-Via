import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import StarRating from '../ui/StarRating';
import { useProductReviews } from '../../hooks/useProductReviews';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const { addReview } = useProductReviews(productId);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    userName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a review title');
      return;
    }

    setIsSubmitting(true);

    try {
      await addReview({
        productId,
        rating: formData.rating as 1 | 2 | 3 | 4 | 5,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        verified: false,
        userName: formData.userName.trim() || 'Anonymous'
      });

      setFormData({ rating: 0, title: '', comment: '', userName: '' });
      setShowForm(false);
      onReviewSubmitted();
      
      alert('Thank you for your review! It will be published after moderation.');
    } catch {
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
      >
        Write a Review
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <Card className="card-light border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-risevia-purple">
            Review {productName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating *</label>
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Name (optional)</label>
              <Input
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="Your name"
                className="bg-white border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Review Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience"
                required
                className="bg-white border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Review (optional)</label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Tell us more about your experience..."
                rows={4}
                className="bg-white border-gray-200"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || formData.rating === 0}
                className="flex-1 bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
