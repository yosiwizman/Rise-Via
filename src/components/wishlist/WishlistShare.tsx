import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, ArrowLeft, Share2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { SEOHead } from '../SEOHead';
import { useWishlist } from '../../hooks/useWishlist';
import { WishlistItem } from '../../types/wishlist';
import { OptimizedImage } from '../ui/OptimizedImage';

interface SharedWishlistData {
  items: WishlistItem[];
  shareCode: string;
  createdAt: number;
  expiresAt?: number;
  title?: string;
  description?: string;
}

interface SharedWishlistPageProps {
  shareCode?: string;
  onNavigate?: (page: string) => void;
}

export const SharedWishlistPage = ({ shareCode, onNavigate }: SharedWishlistPageProps) => {
  const { importWishlist, addToWishlist, isInWishlist } = useWishlist();
  
  const [sharedData, setSharedData] = useState<SharedWishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    if (!shareCode) {
      setError('Invalid share code');
      setLoading(false);
      return;
    }

    try {
      const existingShares = JSON.parse(localStorage.getItem('wishlist_shares') || '[]');
      const shareData = existingShares.find((share: SharedWishlistData) => share.shareCode === shareCode);

      if (!shareData) {
        setError('Shared wishlist not found. The link may be invalid or expired.');
        setLoading(false);
        return;
      }

      if (shareData.expiresAt && Date.now() > shareData.expiresAt) {
        setError('This shared wishlist has expired.');
        setLoading(false);
        return;
      }

      setSharedData(shareData);
    } catch {
      setError('Failed to load shared wishlist data.');
    } finally {
      setLoading(false);
    }
  }, [shareCode]);

  const handleImportWishlist = async () => {
    if (!shareCode) return;

    setImporting(true);
    try {
      const success = await importWishlist(shareCode);
      if (success) {
        setImportSuccess(true);
        setTimeout(() => {
          onNavigate?.('wishlist');
        }, 2000);
      } else {
        setError('Failed to import wishlist. Some items may already be in your wishlist.');
      }
    } catch {
      setError('Failed to import wishlist.');
    } finally {
      setImporting(false);
    }
  };

  const handleAddSingleItem = (item: WishlistItem) => {
    if (!isInWishlist(item.id)) {
      addToWishlist({
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        thcContent: item.thcContent,
        cbdContent: item.cbdContent,
        effects: item.effects
      });
    }
  };

  const SharedItemCard = ({ item }: { item: WishlistItem }) => {
    const inMyWishlist = isInWishlist(item.id);

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 bg-white border-gray-200">
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 relative overflow-hidden">
            <OptimizedImage
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {inMyWishlist && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-500 text-white">
                  In My Wishlist
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-risevia-black text-lg">
            {item.name}
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
          {item.price > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-risevia-charcoal">Price:</span>
              <span className="font-semibold text-risevia-black">${item.price}</span>
            </div>
          )}

          <Button
            onClick={() => handleAddSingleItem(item)}
            disabled={inMyWishlist}
            size="sm"
            className={`w-full ${
              inMyWishlist
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-risevia-teal hover:bg-risevia-teal/80 text-white'
            }`}
          >
            <Heart className="w-4 h-4 mr-2" />
            {inMyWishlist ? 'Already in Wishlist' : 'Add to My Wishlist'}
          </Button>

          <div className="text-xs text-gray-500">
            Added {new Date(item.dateAdded).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-risevia-light py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-risevia-purple border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-risevia-light py-8">
        <SEOHead
          title="Shared Wishlist - RiseViA"
          description="View and import a shared THCA strains wishlist"
          canonical={`https://risevia.com/wishlist/shared/${shareCode}`}
        />
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-6" />
            <h1 className="text-3xl font-bold text-risevia-black mb-4">
              Wishlist Not Found
            </h1>
            <p className="text-risevia-charcoal mb-8 max-w-md mx-auto">
              {error}
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

  if (!sharedData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-risevia-light py-8">
      <SEOHead
        title="Shared Wishlist - RiseViA"
        description="View and import a shared THCA strains wishlist"
        canonical={`https://risevia.com/wishlist/shared/${shareCode}`}
      />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-6">
            <Button
              onClick={() => onNavigate?.('wishlist')}
              variant="ghost"
              size="sm"
              className="mr-4 text-risevia-charcoal hover:text-risevia-purple"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Shared Wishlist
              </h1>
              <p className="text-risevia-charcoal">
                {sharedData.items.length} items shared • Created {new Date(sharedData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Import Success Alert */}
          {importSuccess && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <AlertDescription className="text-green-700">
                ✅ Wishlist imported successfully! Redirecting to your wishlist...
              </AlertDescription>
            </Alert>
          )}

          {/* Import Actions */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex space-x-3">
              <Button
                onClick={handleImportWishlist}
                disabled={importing || importSuccess}
                className="bg-risevia-teal hover:bg-risevia-teal/80 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {importing ? 'Importing...' : 'Import All Items'}
              </Button>
              <Button
                onClick={() => onNavigate?.('wishlist')}
                variant="outline"
                className="border-risevia-purple text-risevia-purple hover:bg-risevia-purple hover:text-white"
              >
                View My Wishlist
              </Button>
            </div>

            {sharedData.expiresAt && (
              <div className="text-sm text-risevia-charcoal">
                Expires: {new Date(sharedData.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-risevia-purple">
                  {sharedData.items.length}
                </div>
                <div className="text-sm text-risevia-charcoal">Total Items</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-risevia-teal">
                  {sharedData.items.filter(item => !isInWishlist(item.id)).length}
                </div>
                <div className="text-sm text-risevia-charcoal">New Items</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {sharedData.items.filter(item => isInWishlist(item.id)).length}
                </div>
                <div className="text-sm text-risevia-charcoal">Already Have</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {sharedData.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SharedItemCard item={item} />
            </motion.div>
          ))}
        </motion.div>

        {/* Share Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Alert className="max-w-2xl mx-auto">
            <Share2 className="w-4 h-4" />
            <AlertDescription className="text-risevia-charcoal">
              This wishlist was shared with you. You can import all items or add individual items to your own wishlist.
              {sharedData.expiresAt && (
                <> This link will expire on {new Date(sharedData.expiresAt).toLocaleDateString()}.</>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  );
};
