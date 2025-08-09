import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';
import { WishlistButton } from '../components/wishlist/WishlistButton';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { SearchFilters } from '../components/SearchFilters';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';
import productsData from '../data/products.json';
import { productService } from '../services/productService';
import type { Product } from '../types/product';

interface FilterOptions {
  strainType?: string;
  thcaRange?: { min: number; max: number };
  effects?: string[];
  priceRange?: { min: number; max: number };
  category?: string;
  sortBy?: string;
}

export const ShopPage = () => {
  const [filter, setFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const dbProducts = await productService.getAll();
      if (dbProducts.length > 0) {
        setProducts(dbProducts);
      } else {
        setProducts(productsData.products as Product[]);
      }
    } catch {
      setProducts(productsData.products as Product[]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => setSearchTerm(term);
  const handleFilter = (filters: FilterOptions) => setFilter(filters.strainType || 'all');
  const handleSort = (sortOption: string) => setSortBy(sortOption);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.effects || []).some((effect: string) => effect.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = filter === 'all' ||
        (product.strain_type || product.strainType) === filter;

      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price': {
          const priceA = typeof a.prices === 'object' ? a.prices.gram : a.price || 0;
          const priceB = typeof b.prices === 'object' ? b.prices.gram : b.price || 0;
          return priceA - priceB;
        }
        case 'thca': {
          const thcaA = a.thca_percentage || a.thcaPercentage || 0;
          const thcaB = b.thca_percentage || b.thcaPercentage || 0;
          return thcaB - thcaA;
        }
        case 'popularity':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [products, filter, searchTerm, sortBy]);

  const handleProductClick = (product: Product) => {
    const modalProduct = {
      id: product.id || '',
      name: product.name,
      price: typeof product.prices === 'object' ? product.prices.gram : product.price || 0,
      images: product.images,
      strainType: product.strain_type || product.strainType || '',
      category: product.category,
      thcaPercentage: product.thca_percentage || product.thcaPercentage || 0,
      description: product.description || '',
      effects: product.effects || [],
      inventory: product.inventory || product.volume_available || 0
    };
    setSelectedProduct(modalProduct as Product);
    setShowModal(true);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform relative cursor-pointer"
      onClick={() => handleProductClick(product)}
    >
      <div className="relative">
        <img
          src={product.images?.[0] || `https://via.placeholder.com/400x300/4A5568/FFFFFF?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          loading="lazy"
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <div onClick={(e) => e.stopPropagation()}>
            <WishlistButton
              item={{
                id: product.id || '',
                name: product.name,
                price: typeof product.prices === 'object' ? product.prices.gram : product.price || 0,
                image: product.images?.[0] || `https://via.placeholder.com/400x300/4A5568/FFFFFF?text=${encodeURIComponent(product.name)}`,
                category: product.category,
                effects: product.effects || [],
              }}
              size="md"
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-risevia-black dark:text-gray-100">{product.name}</h3>
        <p className="text-risevia-charcoal dark:text-gray-400 text-sm mb-2 capitalize">{product.strain_type || product.strainType}</p>
        <p className="text-risevia-charcoal dark:text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-risevia-black dark:text-gray-100">
            ${typeof product.prices === 'object' ? product.prices.gram : product.price}
          </span>
          <Badge className="bg-risevia-teal text-white">
            {product.thca_percentage || product.thcaPercentage}% THCA
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {(product.effects || []).map((effect: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs border-risevia-purple text-risevia-purple">
              {effect}
            </Badge>
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart({
              productId: product.id || '',
              name: product.name,
              price: typeof product.prices === 'object' ? product.prices.gram : product.price || 0,
              image: product.images[0],
              category: product.category,
              strainType: product.strain_type || product.strainType || '',
              thcaPercentage: product.thca_percentage || product.thcaPercentage || 0
            });
            toast.success(`${product.name} added to cart!`, {
              description: `$${product.price} • ${product.thcaPercentage}% THCA`,
              duration: 3000,
            });
          }}
          className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white py-2 rounded hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 py-8">
      <SEOHead
        title="Shop Premium THCA Cannabis Products"
        description="Browse RiseViA's complete collection of lab-tested THCA cannabis strains. High-potency, federally compliant products with detailed information."
        canonical="https://risevia.com/shop"
      />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">Shop Premium THCA</h1>
          <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-2xl mx-auto">
            Discover our curated selection of high-potency THCA products. Lab-tested, federally compliant, and naturally elevated.
          </p>
        </motion.div>
        
        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SearchFilters
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
          />
        </motion.div>
        
        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-risevia-purple to-risevia-teal text-white shadow-lg'
                : 'bg-white text-risevia-charcoal hover:bg-gray-50 border border-gray-200'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilter('sativa')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'sativa'
                ? 'bg-gradient-to-r from-risevia-purple to-risevia-teal text-white shadow-lg'
                : 'bg-white text-risevia-charcoal hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Sativa ({products.filter(p => (p.strain_type || p.strainType) === 'sativa').length})
          </button>
          <button
            onClick={() => setFilter('indica')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'indica'
                ? 'bg-gradient-to-r from-risevia-purple to-risevia-teal text-white shadow-lg'
                : 'bg-white text-risevia-charcoal hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Indica ({products.filter(p => (p.strain_type || p.strainType) === 'indica').length})
          </button>
          <button
            onClick={() => setFilter('hybrid')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'hybrid'
                ? 'bg-gradient-to-r from-risevia-purple to-risevia-teal text-white shadow-lg'
                : 'bg-white text-risevia-charcoal hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Hybrid ({products.filter(p => (p.strain_type || p.strainType) === 'hybrid').length})
          </button>
        </motion.div>
        
        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-risevia-purple mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-risevia-charcoal dark:text-gray-300 text-lg">No products found for this category.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-risevia-purple to-risevia-teal text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              View All Products
            </button>
          </motion.div>
        )}
      </div>

      <ProductDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={selectedProduct ? {
          id: selectedProduct.id || '',
          name: selectedProduct.name,
          price: selectedProduct.price || 0,
          images: selectedProduct.images,
          strainType: selectedProduct.strainType || selectedProduct.strain_type || '',
          category: selectedProduct.category,
          thcaPercentage: selectedProduct.thcaPercentage || selectedProduct.thca_percentage || 0,
          description: selectedProduct.description,
          effects: selectedProduct.effects || [],
          inventory: selectedProduct.inventory || selectedProduct.volume_available || 0
        } : null}
      />
    </div>
  );
};