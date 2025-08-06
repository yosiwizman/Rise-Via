import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface AddToCartToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function AddToCartToast({ message, isVisible, onClose }: AddToCartToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg"
        >
          <CheckCircle className="w-5 h-5" />
          <p>{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
