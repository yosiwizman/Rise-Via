import { SEOHead } from '../components/SEOHead';

export const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-risevia-dark to-risevia-darker pt-24 pb-16">
      <SEOHead
        title="Shipping Information - RiseViA"
        description="Fast and discreet shipping for RiseViA THCA products. Free shipping on orders over $100."
        canonical="https://risevia.com/shipping"
      />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Shipping Information</h1>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
          <h2 className="text-2xl text-white mb-4">Fast & Discreet Shipping</h2>
          <ul className="text-gray-200 mb-4 space-y-2">
            <li>• Orders processed within 24-48 hours</li>
            <li>• Discreet packaging for privacy</li>
            <li>• Free shipping on orders over $100</li>
            <li>• Tracking provided for all orders</li>
            <li>• Signature required for orders over $200</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
