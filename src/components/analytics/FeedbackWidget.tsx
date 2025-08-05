import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Star } from 'lucide-react';

declare global {
  function gtag(...args: unknown[]): void;
}

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const feedbackData = {
      feedback,
      rating,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    const existingFeedback = JSON.parse(localStorage.getItem('risevia-feedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('risevia-feedback', JSON.stringify(existingFeedback));
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'feedback_submitted', {
        event_category: 'engagement',
        event_label: 'user_feedback',
        value: rating
      });
    }
    
    setIsSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsSubmitted(false);
      setFeedback('');
      setRating(0);
    }, 2000);
  };

  return (
    <>
      {/* Feedback Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-gradient-to-r from-risevia-purple to-risevia-teal text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Give feedback"
      >
        <MessageCircle className="w-5 h-5" />
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Share Your Feedback</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Thank you!</h4>
                  <p className="text-gray-600">Your feedback helps us improve RiseViA.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      How would you rate your experience?
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Tell us more (optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="What did you like? What could be improved?"
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-risevia-purple focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={rating === 0}
                    className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
