import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', action: () => onNavigate('home') },
      { label: 'Our Story', action: () => onNavigate('home') },
      { label: 'Careers', action: () => {} },
      { label: 'Press', action: () => {} }
    ],
    products: [
      { label: 'Shop All Strains', action: () => onNavigate('shop') },
      { label: 'Lab Results', action: () => onNavigate('legal') },
      { label: 'Batch Information', action: () => onNavigate('shop') },
      { label: 'Storage Guide', action: () => onNavigate('learn') }
    ],
    support: [
      { label: 'Contact Us', action: () => onNavigate('contact') },
      { label: 'FAQ', action: () => onNavigate('learn') },
      { label: 'Shipping Info', action: () => onNavigate('legal') },
      { label: 'Returns', action: () => onNavigate('legal') }
    ],
    legal: [
      { label: 'Privacy Policy', action: () => onNavigate('legal') },
      { label: 'Terms of Service', action: () => onNavigate('legal') },
      { label: 'Compliance', action: () => onNavigate('legal') },
      { label: 'State Restrictions', action: () => onNavigate('legal') }
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
              <p className="text-risevia-charcoal text-sm leading-relaxed">
                Wellness, Naturally Elevated. Premium THCA products crafted with care, 
                lab-tested for purity, and delivered with compliance in mind.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-risevia-charcoal hover:text-risevia-purple">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-risevia-charcoal hover:text-risevia-purple">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-risevia-charcoal hover:text-risevia-purple">
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
              <h4 className="text-risevia-black font-semibold capitalize">{category}</h4>
              <ul className="space-y-2">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={link.action}
                      className="text-risevia-charcoal hover:text-risevia-purple text-sm transition-colors"
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
          <div className="flex items-center space-x-3 text-risevia-charcoal">
            <Mail className="w-5 h-5 text-risevia-teal" />
            <span className="text-sm">support@risevia.com</span>
          </div>
          <div className="flex items-center space-x-3 text-risevia-charcoal">
            <Phone className="w-5 h-5 text-risevia-teal" />
            <span className="text-sm">1-800-RISEVIA</span>
          </div>
          <div className="flex items-center space-x-3 text-risevia-charcoal">
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
              <p className="text-risevia-black font-semibold mb-1">🔬 Lab Tested</p>
              <p className="text-risevia-charcoal">All products are third-party lab tested for potency, pesticides, and heavy metals.</p>
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
