import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, Share2, Filter, SortAsc, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { SEOHead } from '../SEOHead';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/use-toast';
import { WishlistItem } from '../../types/wishlist';
import { OptimizedImage } from '../ui/OptimizedImage';

interface WishlistPageProps {
  onNavigate?: (page: string) => void;
}

export const WishlistPage = ({ onNavigate }: WishlistPageProps) => {
  const {
    items,
    stats,
    removeFromWishlist,
    updateItemPriority,
    clearWishlist,
    setPriceAlert,
    removePriceAlert,
    generateShareLink,
    sortItems
  } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [sortBy, setSortBy] = useState<'name' | 'price' | 'dateAdded' | 'priority'>('dateAdded');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [priceAlertItem, setPriceAlertItem] = useState<WishlistItem | null>(null);
  const [alertPrice, setAlertPrice] = useState('');

  const filteredAndSortedItems = useMemo(() => {
    return sortItems(sortBy).filter(item => 
      item && (filterPriority === 'all' || item.priority === filterPriority)
    );
  }, [filterPriority, sortItems, sortBy]);

  const handleShare = async () => {
    try {
      const url = await generateShareLink();
      setShareUrl(url);
      setShowShareDialog(true);
    } catch {
      // Silently fail per code standards
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const handleSetPriceAlert = (item: WishlistItem) => {
    setPriceAlertItem(item);
  };

  const handleSavePriceAlert = () => {
    if (priceAlertItem && alertPrice) {
      setPriceAlert(priceAlertItem.id, parseFloat(alertPrice));
      setPriceAlertItem(null);
      setAlertPrice('');
    }
  };

  const WishlistItemCard = ({ item }: { item: WishlistItem }) => {
    const priorityColors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 bg-white border-gray-200">
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 relative overflow-hidden">
            <OptimizedImage
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <Button
                onClick={() => removeFromWishlist(item.id)}
                size="icon"
                variant="ghost"
                className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full"
              >
                <Trash2 size={16} />
              </Button>
            </div>
            <div className="absolute top-3 left-3">
              <div className={`w-3 h-3 rounded-full ${priorityColors[item.priority]}`} />
            </div>
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-risevia-black text-lg flex items-center justify-between">
            {item.name}
            {item.priceAlert && (
              <AlertCircle className="w-4 h-4 text-risevia-teal" />
            )}
          </CardTitle>
          <div className="flex justify-between items-center text-sm text-risevia-charcoal">
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
            {item.thcContent && (
              <span className="text-risevia-teal font-semibold">
                {item.thcContent}% THC
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Priority:</Label>
            <Select
              value={item.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') => 
                updateItemPriority(item.id, value)
              }
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {item.price > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-risevia-charcoal">Price:</span>
              <span className="font-semibold text-risevia-black">${item.price}</span>
            </div>
          )}

          {item.priceAlert ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-risevia-teal">Alert at ${item.priceAlert.targetPrice}</span>
              <Button
                onClick={() => removePriceAlert(item.id)}
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700"
              >
                Remove Alert
              </Button>
            </div>
          ) : (
            item.price > 0 && (
              <Button
                onClick={() => handleSetPriceAlert(item)}
                size="sm"
                variant="outline"
                className="w-full text-xs border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
              >
                Set Price Alert
              </Button>
            )
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => {
                addToCart({
                  productId: item.id,
                  name: item.name,
                  price: item.price,
                  originalPrice: item.price,
                  image: item.image,
                  category: item.category,
                  strainType: item.category || 'Unknown',
                  thcaPercentage: 0
                });
                toast({
                  title: "Added to Cart",
                  description: `${item.name} has been added to your cart.`,
                });
              }}
              size="sm"
              className="flex-1 bg-risevia-teal hover:bg-risevia-teal/80 text-white"
            >
              <ShoppingCart size={14} className="mr-1" />
              Add to Cart
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            Added {new Date(item.dateAdded).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-risevia-light py-8">
        <SEOHead
          title="My Wishlist - RiseViA"
          description="Your saved THCA strains and products wishlist"
          canonical="https://risevia.com/wishlist"
        />
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-risevia-black mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-risevia-charcoal mb-8 max-w-md mx-auto">
              Start building your wishlist by browsing our premium THCA strains and saving your favorites.
            </p>
            <Button
              onClick={() => onNavigate?.('shop')}
              className="bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
            >
              Browse Products
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-risevia-light py-8">
      <SEOHead
        title="My Wishlist - RiseViA"
        description="Your saved THCA strains and products wishlist"
        canonical="https://risevia.com/wishlist"
      />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                My Wishlist
              </h1>
              <p className="text-risevia-charcoal">
                {stats.totalItems} items • Total value: ${stats.totalValue.toFixed(2)}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Wishlist
              </Button>
              <Button
                onClick={clearWishlist}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-risevia-purple">
                  {stats.totalItems}
                </div>
                <div className="text-sm text-risevia-charcoal">Total Items</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-risevia-teal">
                  ${stats.averagePrice.toFixed(0)}
                </div>
                <div className="text-sm text-risevia-charcoal">Avg. Price</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {stats.priorityCounts.high}
                </div>
                <div className="text-sm text-risevia-charcoal">High Priority</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {Object.keys(stats.categoryCounts).length}
                </div>
                <div className="text-sm text-risevia-charcoal">Categories</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-wrap gap-4 items-center justify-between"
        >
          <div className="flex space-x-4">
            <Select value={filterPriority} onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => setFilterPriority(value)}>
              <SelectTrigger className="w-40 bg-white border-gray-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'name' | 'price' | 'dateAdded' | 'priority') => setSortBy(value)}>
              <SelectTrigger className="w-40 bg-white border-gray-200">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-risevia-charcoal">
            Showing {filteredAndSortedItems.length} of {items.length} items
          </div>
        </motion.div>

        {/* Wishlist Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredAndSortedItems.filter(item => item !== null).map((item, index) => (
            <motion.div
              key={item!.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <WishlistItemCard item={item as WishlistItem} />
            </motion.div>
          ))}
        </motion.div>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-risevia-black">Share Your Wishlist</DialogTitle>
              <DialogDescription className="sr-only">
                Generate and share a link to your wishlist with friends
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-risevia-charcoal">
                Share this link with friends to let them view and import your wishlist:
              </p>
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-gray-50 border-gray-200"
                />
                <Button
                  onClick={handleCopyShareLink}
                  variant="outline"
                  className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
                >
                  Copy
                </Button>
              </div>
              <Alert>
                <AlertDescription className="text-risevia-charcoal">
                  This link will expire in 7 days. Anyone with this link can view and import your wishlist items.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>

        {/* Price Alert Dialog */}
        <Dialog open={!!priceAlertItem} onOpenChange={() => setPriceAlertItem(null)}>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-risevia-black">Set Price Alert</DialogTitle>
              <DialogDescription className="sr-only">
                Set a price alert to get notified when {priceAlertItem?.name} reaches your target price
              </DialogDescription>
            </DialogHeader>
            {priceAlertItem && (
              <div className="space-y-4">
                <p className="text-risevia-charcoal">
                  Get notified when <strong>{priceAlertItem.name}</strong> drops to your target price:
                </p>
                <div className="space-y-2">
                  <Label htmlFor="alertPrice">Target Price ($)</Label>
                  <Input
                    id="alertPrice"
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    placeholder="Enter target price"
                    className="bg-white border-gray-200"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSavePriceAlert}
                    className="flex-1 bg-risevia-teal hover:bg-risevia-teal/80 text-white"
                  >
                    Set Alert
                  </Button>
                  <Button
                    onClick={() => setPriceAlertItem(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
