import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAppStore } from '../store';

export const CartDrawer = () => {
  const { 
    cartOpen, 
    cartItems, 
    cartTotal,
    toggleCart, 
    updateQuantity, 
    removeFromCart,
  } = useAppStore();

  const subtotal = cartTotal;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = () => {
    console.log('Checkout initiated with total:', total);
    alert(`Checkout functionality coming soon! Total: $${total.toFixed(2)}`);
  };

  return (
    <Sheet open={cartOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-lg bg-white dark:bg-risevia-charcoal">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-risevia-black dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              Shopping Cart
            </SheetTitle>
            <Badge variant="secondary" className="bg-risevia-teal text-white">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-risevia-black dark:text-white mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Add some premium THCA strains to get started
              </p>
              <Button
                onClick={toggleCart}
                className="bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 p-4 bg-gray-50 dark:bg-risevia-black/50 rounded-lg"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-risevia-black dark:text-white truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <span>{item.category}</span>
                          <Badge className="bg-risevia-teal text-white text-xs">
                            {item.thcaContent}% THCA
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-risevia-purple">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Separator className="my-4" />

              {/* Cart Summary */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-risevia-purple">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold py-3"
                  >
                    Checkout - ${total.toFixed(2)}
                  </Button>
                  
                  <Button
                    onClick={toggleCart}
                    variant="outline"
                    className="w-full border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
                  >
                    Continue Shopping
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>🔒 Secure checkout • 21+ only • Lab tested products</p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
