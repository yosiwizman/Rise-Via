import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { ChatBot } from './ChatBot';
import { motion } from 'framer-motion';

export const FloatingChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 left-6 z-[9998]"
      >
        <Button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-risevia-purple to-risevia-teal shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {isChatOpen && <ChatBot />}
    </>
  );
};
