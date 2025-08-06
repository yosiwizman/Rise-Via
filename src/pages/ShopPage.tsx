import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc, Eye, QrCode } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { SEOHead } from '../components/SEOHead';
import { ProductWarnings } from '../components/ProductWarnings';
import { QRCodeModal } from '../components/QRCodeModal';
import { useAnalytics } from '../components/AnalyticsPlaceholder';
import { WishlistButton } from '../components/wishlist/WishlistButton';
import strainsData from '../data/strains.json';

interface ShopPageProps {
  isStateBlocked: boolean;
}

export const ShopPage = ({ isStateBlocked }: ShopPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedStrain, setSelectedStrain] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrStrain, setQRStrain] = useState<any>(null);
  const { trackCOAView } = useAnalytics();

  const filteredAndSortedStrains = useMemo(() => {
    let filtered = strainsData.filter(strain => 
      strain.strain_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'all' || strain.category.toLowerCase() === filterCategory.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'potency':
          return parseFloat(b.thca_potency) - parseFloat(a.thca_potency);
        case 'name':
          return a.strain_name.localeCompare(b.strain_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, filterCategory]);

  const getPotencyBadge = (potency: string) => {
    const potencyNum = parseFloat(potency);
    if (potencyNum >= 30) {
      return <Badge className="bg-risevia-purple text-white">Premium {potency}%</Badge>;
    } else if (potencyNum >= 25) {
      return <Badge className="bg-risevia-teal text-white">Strong {potency}%</Badge>;
    } else {
      return <Badge className="bg-gray-600 text-white">Standard {potency}%</Badge>;
    }
  };

  const getVolumeIndicator = (volume: string) => {
    const volumeNum = parseInt(volume.replace('+', ''));
    if (volumeNum < 50) {
      return <span className="text-red-400 text-sm">Limited Stock</span>;
    } else if (volumeNum < 100) {
      return <span className="text-yellow-400 text-sm">Available</span>;
    } else {
      return <span className="text-green-400 text-sm">In Stock</span>;
    }
  };

  const handleViewCOA = (strain: any) => {
    setQRStrain(strain);
    setShowQRModal(true);
    trackCOAView(strain.batch_id);
  };

  const StrainDetailModal = ({ strain }: { strain: any }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [strain.image_url, strain.image_url, strain.image_url];
    
    return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 text-risevia-black dark:text-gray-100">
      <DialogHeader>
        <DialogTitle className="text-2xl gradient-text">{strain.strain_name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="aspect-video bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-lg overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={strain.strain_name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
          />
          <div className="flex justify-center mt-2 space-x-2">
            {images.map((_, index) => (
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
            <p><span className="text-risevia-charcoal dark:text-gray-300">THCA Potency:</span> {getPotencyBadge(strain.thca_potency)}</p>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Volume:</span> {strain.volume} {getVolumeIndicator(strain.volume)}</p>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Category:</span> {strain.category}</p>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Batch ID:</span> {strain.batch_id}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-risevia-teal">Compliance Info</h4>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Expiration:</span> {strain.expiration_date}</p>
            <p><span className="text-risevia-charcoal dark:text-gray-300">Storage:</span> {strain.storage}</p>
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
              <WishlistButton
                item={{
                  id: strain.batch_id,
                  name: strain.strain_name,
                  price: 0,
                  image: strain.image_url,
                  category: strain.category,
                  thcContent: strain.thca_potency,
                  effects: []
                }}
                showLabel={true}
                className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
              />
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
            Showing {filteredAndSortedStrains.length} of {strainsData.length} strains
          </p>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredAndSortedStrains.map((strain, index) => (
            <motion.div
              key={strain.batch_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 overflow-hidden group">
                <div className="aspect-square bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 relative overflow-hidden">
                  <img
                    src={strain.image_url}
                    alt={strain.strain_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex items-center space-x-2">
                    <WishlistButton
                      item={{
                        id: strain.batch_id,
                        name: strain.strain_name,
                        price: 0, // Price not available in current data
                        image: strain.image_url,
                        category: strain.category,
                        thcContent: strain.thca_potency,
                        effects: []
                      }}
                      size="sm"
                      className="bg-black/50 hover:bg-black/70"
                    />
                    <Badge className="bg-risevia-teal text-white font-semibold">
                      {strain.thca_potency}%
                    </Badge>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="border-white text-white bg-black/50">
                      {strain.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-risevia-black dark:text-gray-100 text-lg">{strain.strain_name}</CardTitle>
                  <div className="flex justify-between text-sm text-risevia-charcoal dark:text-gray-300">
                    <span>Vol: {strain.volume}</span>
                    <span>Batch: {strain.batch_id}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-risevia-charcoal dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {strain.description}
                  </p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
                        onClick={() => setSelectedStrain(strain)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    {selectedStrain && <StrainDetailModal strain={selectedStrain} />}
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredAndSortedStrains.length === 0 && (
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

        {qrStrain && (
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            coaUrl={qrStrain.coa_url}
            batchId={qrStrain.batch_id}
            strainName={qrStrain.strain_name}
          />
        )}
      </div>
    </div>
  );
};
