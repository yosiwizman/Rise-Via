import { useState, useEffect, useCallback } from 'react';
import { popupService } from '../services/popupService';
import type { Popup } from '../types/database';

export const usePopup = (currentPage: string = '/') => {
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);

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

    const cleanupFunctions: (() => void)[] = [];

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
          setTimeout(() => showPopup(popup), popup.trigger_delay);
          break;

        case 'timer': {
          const timer = setTimeout(() => showPopup(popup), popup.trigger_delay);
          cleanupFunctions.push(() => clearTimeout(timer));
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
          cleanupFunctions.push(() => window.removeEventListener('scroll', handleScroll));
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
          cleanupFunctions.push(() => document.removeEventListener('mouseleave', handleMouseLeave));
          break;
        }
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [popups, canShowPopups, showPopup]);

  const closePopup = useCallback(() => {
    setIsVisible(false);
    setActivePopup(null);
    
    document.body.style.overflow = '';
  }, []);

  return {
    activePopup,
    isVisible,
    closePopup,
    showPopup
  };
};
