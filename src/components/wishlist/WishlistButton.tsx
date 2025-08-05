import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { useWishlist } from '../../hooks/useWishlist';
import { cn } from '../../lib/utils';

interface WishlistButtonProps {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    thcContent?: string;
    cbdContent?: string;
    effects?: string[];
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const WishlistButton = ({
  item,
  className,
  size = 'md',
  showLabel = false
}: WishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const inWishlist = isInWishlist(item.id);

  const handleToggle = () => {
    setIsAnimating(true);

    if (inWishlist) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="relative">
      <Button
        onClick={handleToggle}
        variant="ghost"
        size="icon"
        className={cn(
          'relative rounded-full transition-all duration-300 hover:scale-110',
          sizeClasses[size],
          inWishlist
            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-red-400',
          className
        )}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <motion.div
          animate={{
            scale: isAnimating ? [1, 1.2, 1] : 1,
            rotate: isAnimating ? [0, 10, -10, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            size={iconSizes[size]}
            className={cn(
              'transition-all duration-200',
              inWishlist ? 'fill-current' : 'fill-none'
            )}
          />
        </motion.div>

        {/* Pulse effect when adding */}
        {isAnimating && !inWishlist && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </Button>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full"
              style={{
                left: '50%',
                top: '50%'
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI * 2) / 8) * 30,
                y: Math.sin((i * Math.PI * 2) / 8) * 30
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
          {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </div>
  );
};
