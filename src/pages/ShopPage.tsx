import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc, QrCode } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { SEOHead } from '../components/SEOHead';
import { ProductWarnings } from '../components/ProductWarnings';
import { QRCodeModal } from '../components/QRCodeModal';
import { useAnalytics } from '../components/AnalyticsPlaceholder';
import ProductCard from '../components/products/ProductCard';
import productsData from '../data/products.json';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  strainType: string;
  thcaPercentage: number;
  thcPercentage: number;
  price: number;
  images: string[];
  description: string;
  effects: string[];
  terpenes: Array<{ name: string; percentage: number }>;
  batchNumber: string;
  harvestDate: string;
  labResultsUrl: string;
  inventory: number;
  featured: boolean;
}

interface ShopPageProps {
  isStateBlocked: boolean;
}

export const ShopPage = ({ isStateBlocked }: ShopPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedStrain, setSelectedStrain] = useState<Product | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrStrain, setQRStrain] = useState<Product | null>(null);
  const { trackCOAView } = useAnalytics();

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = productsData.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'all' || product.strainType.toLowerCase() === filterCategory.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'potency':
          return b.thcaPercentage - a.thcaPercentage;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, filterCategory]);

  const getPotencyBadge = (potency: number) => {
    if (potency >= 30) {
      return <Badge className="bg-risevia-purple text-white">Premium {potency}%</Badge>;
    } else if (potency >= 25) {
      return <Badge className="bg-risevia-teal text-white">Strong {potency}%</Badge>;
    } else {
      return <Badge className="bg-gray-600 text-white">Standard {potency}%</Badge>;
    }
  };

  const getInventoryIndicator = (inventory: number) => {
    if (inventory < 50) {
      return <span className="text-red-400 text-sm">Limited Stock</span>;
    } else if (inventory < 100) {
      return <span className="text-yellow-400 text-sm">Available</span>;
    } else {
      return <span className="text-green-400 text-sm">In Stock</span>;
    }
  };

  const handleViewCOA = (product: Product) => {
    setQRStrain(product);
    setShowQRModal(true);
    trackCOAView(product.batchNumber);
  };

  const StrainDetailModal = ({ strain }: { strain: Product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = strain.images || [strain.images?.[0], strain.images?.[0], strain.images?.[0]];
    
    return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 text-risevia-black dark:text-gray-100">
      <DialogHeader>
        <DialogTitle className="text-2xl gradient-text">{strain.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="aspect-video bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-lg overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={strain.name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
          />
          <div className="flex justify-center mt-2 space-x-2">
            {images.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-risevia-teal' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-risevia-purple">Product Details</h4>
            <p><span className="text-risevia-charcoal dark:text-gray-300">THCA Potency:</span> {getPotencyBadge(strain.thcaPercentage)}</p>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Price:</span> ${strain.price} {getInventoryIndicator(strain.inventory)}</p>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Type:</span> {strain.strainType}</p>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Batch ID:</span> {strain.batchNumber}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-risevia-teal">Compliance Info</h4>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Harvest Date:</span> {strain.harvestDate}</p>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Inventory:</span> {strain.inventory} units</p>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleViewCOA(strain)}
                variant="outline"
                size="sm"
                className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
              >
                <QrCode className="w-4 h-4 mr-2" />
                View COA
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-risevia-teal mb-2">Description</h4>
          <p className="text-risevia-charcoal dark:text-gray-300">{strain.description}</p>
        </div>

        <div>
          <h4 className="font-semibold text-risevia-purple mb-2">Effects</h4>
          <div className="flex flex-wrap gap-2">
            {strain.effects?.map((effect: string, index: number) => (
              <Badge key={index} variant="outline" className="border-risevia-teal text-risevia-teal">
                {effect}
              </Badge>
            ))}
          </div>
        </div>

        <ProductWarnings placement="product" />

        {isStateBlocked && (
          <Alert className="compliance-warning border-red-500">
            <AlertDescription className="text-white">
              ⚠️ This product cannot be shipped to your state due to local regulations.
            </AlertDescription>
          </Alert>
        )}

        {!isStateBlocked && (
          <div className="space-y-4">
            <ProductWarnings placement="cart" compact />
            <div className="flex space-x-4">
              <Button
                disabled
                className="flex-1 bg-gray-600 text-gray-400 cursor-not-allowed"
              >
                Add to Cart (Coming Soon)
              </Button>
              <Button
                variant="outline"
                className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
              >
                Save to Wishlist
              </Button>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
    );
  };

  return (
    <div className="min-h-screen bg-risevia-light py-8">
      <SEOHead
        title="Premium THCA Strains Shop"
        description="Browse RiseViA's complete collection of lab-tested THCA cannabis strains. High-potency, federally compliant products with detailed COAs and batch information."
        canonical="https://risevia.com/shop"
      />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            Premium THCA Strains
          </h1>
          <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-2xl mx-auto">
            Discover our complete collection of lab-tested, high-potency THCA products. 
            Each strain is carefully cultivated and third-party tested for quality assurance.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between"
        >
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-risevia-charcoal dark:text-gray-300 w-4 h-4" />
              <Input
                placeholder="Search strains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-risevia-black dark:text-gray-100 placeholder-risevia-charcoal/60"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 bg-white border-gray-200 text-risevia-black dark:text-gray-100">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="all" className="text-risevia-black dark:text-gray-100">All Types</SelectItem>
                <SelectItem value="indica" className="text-risevia-black dark:text-gray-100">Indica</SelectItem>
                <SelectItem value="sativa" className="text-risevia-black dark:text-gray-100">Sativa</SelectItem>
                <SelectItem value="hybrid" className="text-risevia-black dark:text-gray-100">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-white border-gray-200 text-risevia-black dark:text-gray-100">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="name" className="text-risevia-black dark:text-gray-100">A-Z</SelectItem>
                <SelectItem value="potency" className="text-risevia-black dark:text-gray-100">Potency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-risevia-charcoal dark:text-gray-300">
            Showing {filteredAndSortedProducts.length} of {productsData.products.length} products
          </p>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredAndSortedProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onViewDetails={(product: Product) => setSelectedStrain(product)}
            />
          ))}
        </motion.div>

        {filteredAndSortedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-risevia-charcoal dark:text-gray-300 text-lg">No strains found matching your criteria.</p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
              }}
              variant="outline"
              className="mt-4 border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {selectedStrain && (
          <Dialog open={!!selectedStrain} onOpenChange={() => setSelectedStrain(null)}>
            <StrainDetailModal strain={selectedStrain} />
          </Dialog>
        )}
        
        {qrStrain && (
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            coaUrl={qrStrain.labResultsUrl}
            batchId={qrStrain.batchNumber}
            strainName={qrStrain.name}
          />
        )}
      </div>
    </div>
  );
};
