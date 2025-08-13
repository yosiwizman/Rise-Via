import { useState, useEffect, useCallback, useRef } from 'react';
import { popupService } from '../services/popupService';
import type { Popup } from '../types/database';

export const usePopup = (currentPage: string = '/') => {
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  const isAgeVerified = localStorage.getItem('ageVerified') === 'true';
  const userState = localStorage.getItem('userState');
  
  const canShowPopups = isAgeVerified && userState !== 'restricted';

  useEffect(() => {
    if (!canShowPopups) return;

    const loadPopups = async () => {
      try {
        const data = await popupService.getActivePopups(currentPage);
        setPopups(data);
      } catch (error) {
        console.error('Failed to load popups:', error);
      }
    };

    loadPopups();
  }, [canShowPopups, currentPage]);

  const showPopup = useCallback((popup: Popup) => {
    const sessionKey = `popup_${popup.id}_session`;
    const dayKey = `popup_${popup.id}_day`;
    
    if (popup.display_frequency === 'once_per_session' && sessionStorage.getItem(sessionKey)) {
      return;
    }
    if (popup.display_frequency === 'once_per_day') {
      const lastShown = localStorage.getItem(dayKey);
      if (lastShown) {
        const lastShownDate = new Date(lastShown);
        const today = new Date();
        if (lastShownDate.toDateString() === today.toDateString()) {
          return;
        }
      }
    }
    
    setActivePopup(popup);
    setIsVisible(true);
    
    if (popup.display_frequency === 'once_per_session') {
      sessionStorage.setItem(sessionKey, 'true');
    } else if (popup.display_frequency === 'once_per_day') {
      localStorage.setItem(dayKey, new Date().toISOString());
    }
    
    document.body.style.overflow = 'hidden';
  }, []);

  useEffect(() => {
    if (!canShowPopups || popups.length === 0) return;

    // Clear previous cleanup functions
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];

    popups.forEach(popup => {
      const sessionKey = `popup_${popup.id}_session`;
      const dayKey = `popup_${popup.id}_day`;
      
      let canShow = true;
      if (popup.display_frequency === 'once_per_session') {
        canShow = !sessionStorage.getItem(sessionKey);
      } else if (popup.display_frequency === 'once_per_day') {
        const lastShown = localStorage.getItem(dayKey);
        if (lastShown) {
          const lastShownDate = new Date(lastShown);
          const today = new Date();
          canShow = lastShownDate.toDateString() !== today.toDateString();
        }
      }

      if (!canShow) return;

      switch (popup.trigger_type) {
        case 'page_load':
          const pageLoadTimer = setTimeout(() => showPopup(popup), popup.trigger_delay);
          cleanupFunctionsRef.current.push(() => clearTimeout(pageLoadTimer));
          break;

        case 'timer': {
          const timer = setTimeout(() => showPopup(popup), popup.trigger_delay);
          cleanupFunctionsRef.current.push(() => clearTimeout(timer));
          break;
        }

        case 'scroll': {
          const handleScroll = () => {
            const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercentage >= 50) {
              showPopup(popup);
              window.removeEventListener('scroll', handleScroll);
            }
          };
          window.addEventListener('scroll', handleScroll, { passive: true });
          cleanupFunctionsRef.current.push(() => window.removeEventListener('scroll', handleScroll));
          break;
        }

        case 'exit_intent': {
          const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
              showPopup(popup);
              document.removeEventListener('mouseleave', handleMouseLeave);
            }
          };
          document.addEventListener('mouseleave', handleMouseLeave);
          cleanupFunctionsRef.current.push(() => document.removeEventListener('mouseleave', handleMouseLeave));
          break;
        }
      }
    });

    // Cleanup function for this effect
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, [popups, canShowPopups]); // Removed showPopup from dependencies to prevent infinite loop

  const closePopup = useCallback(() => {
    setIsVisible(false);
    setActivePopup(null);
    
    // Reset body overflow
    document.body.style.overflow = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    };
  }, []);

  return {
    activePopup,
    isVisible,
    closePopup,
    showPopup
  };
};
