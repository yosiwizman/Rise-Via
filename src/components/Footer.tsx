import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

export const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', action: () => navigate('/') },
      { label: 'Careers', action: () => navigate('/careers') }
    ],
    products: [
      { label: 'Shop All Strains', action: () => navigate('/shop') },
      { label: 'Lab Results', action: () => navigate('/lab-results') },
      { label: 'Batch Information', action: () => navigate('/shop') }
    ],
    support: [
      { label: 'Contact Us', action: () => navigate('/contact') },
      { label: 'FAQ', action: () => navigate('/learn') },
      { label: 'Shipping Info', action: () => navigate('/shipping') }
    ],
    legal: [
      { label: 'Privacy Policy', action: () => navigate('/legal') },
      { label: 'Terms of Service', action: () => navigate('/legal') },
      { label: 'Compliance', action: () => navigate('/legal') },
      { label: 'State Restrictions', action: () => navigate('/legal') }
    ]
  };

  return (
    <footer className="bg-risevia-light-gray border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold gradient-text">RiseViA</h3>
              <p className="text-risevia-charcoal dark:text-gray-300 text-sm leading-relaxed">
                Wellness, Naturally Elevated. Premium THCA products crafted with care, 
                lab-tested for purity, and delivered with compliance in mind.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple">
                  <Twitter className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="space-y-4"
            >
              <h4 className="text-risevia-black dark:text-gray-100 font-semibold capitalize">{category}</h4>
              <ul className="space-y-2">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={link.action}
                      className="text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple text-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <Separator className="my-8 bg-gray-200" />

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center space-x-3 text-risevia-charcoal dark:text-gray-300">
            <Mail className="w-5 h-5 text-risevia-teal" />
            <span className="text-sm">support@risevia.com</span>
          </div>
          <div className="flex items-center space-x-3 text-risevia-charcoal dark:text-gray-300">
            <Phone className="w-5 h-5 text-risevia-teal" />
            <span className="text-sm">1-800-RISEVIA</span>
          </div>
          <div className="flex items-center space-x-3 text-risevia-charcoal dark:text-gray-300">
            <MapPin className="w-5 h-5 text-risevia-teal" />
            <span className="text-sm">Licensed Cannabis Facility</span>
          </div>
        </div>

        <Separator className="my-8 bg-gray-200" />

        {/* Legal Disclaimers */}
        <div className="space-y-4 text-xs text-risevia-charcoal/70">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="compliance-warning p-3 rounded-lg">
              <p className="text-white font-semibold mb-1">⚠️ Important Notice</p>
              <p>This product has not been evaluated by the FDA. Not for use by minors, pregnant or nursing women.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-risevia-black dark:text-gray-100 font-semibold mb-1">🔬 Lab Tested</p>
              <p className="text-risevia-charcoal dark:text-gray-300">All products are third-party lab tested for potency, pesticides, and heavy metals.</p>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <p>© {currentYear} RiseViA Cannabis. All rights reserved.</p>
            <p className="mt-1">
              Licensed cannabis retailer. Products contain less than 0.3% Delta-9 THC. 
              THCA converts to THC when heated. Keep out of reach of children and pets.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
