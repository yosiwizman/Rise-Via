import { useEffect } from 'react';

export const MobileOptimizations = () => {
  useEffect(() => {
    const addTouchOptimizations = () => {
      const style = document.createElement('style');
      style.textContent = `
        @media (max-width: 768px) {
          .touch-optimized {
            min-height: 44px;
            min-width: 44px;
          }
          
          .swipe-gallery {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          
          .swipe-gallery > * {
            scroll-snap-align: start;
          }
          
          .bottom-sheet {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-radius: 16px 16px 0 0;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
            transform: translateY(100%);
            transition: transform 0.3s ease-out;
          }
          
          .bottom-sheet.open {
            transform: translateY(0);
          }
          
          .pull-to-refresh {
            overscroll-behavior-y: contain;
          }
        }
        
        @media (hover: none) and (pointer: coarse) {
          .hover\\:scale-105:hover {
            transform: scale(1.02);
          }
          
          .hover\\:shadow-lg:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
        }
      `;
      document.head.appendChild(style);
    };

    const addHapticFeedback = () => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        });
      });
    };

    const addPWAPrompt = () => {
      let deferredPrompt: any;
      
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installBanner = document.createElement('div');
        installBanner.className = 'fixed bottom-4 left-4 right-4 bg-gradient-to-r from-risevia-purple to-risevia-teal text-white p-4 rounded-lg shadow-lg z-50';
        installBanner.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">Install Rise-Via App</h3>
              <p class="text-sm opacity-90">Get the full experience</p>
            </div>
            <div class="flex space-x-2">
              <button id="install-dismiss" class="px-3 py-1 text-sm border border-white/30 rounded">Later</button>
              <button id="install-app" class="px-3 py-1 text-sm bg-white text-risevia-purple rounded font-medium">Install</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(installBanner);
        
        document.getElementById('install-app')?.addEventListener('click', () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            installBanner.remove();
          });
        });
        
        document.getElementById('install-dismiss')?.addEventListener('click', () => {
          installBanner.remove();
        });
      });
    };

    addTouchOptimizations();
    addHapticFeedback();
    addPWAPrompt();
  }, []);

  return null;
};
