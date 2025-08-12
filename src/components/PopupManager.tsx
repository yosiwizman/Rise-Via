import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { popupService } from '../services/popupService';
import type { Popup } from '../types/database';

interface PopupManagerProps {
  currentPage: string;
}

export const PopupManager = ({ currentPage }: PopupManagerProps) => {
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [popupQueue, setPopupQueue] = useState<Popup[]>([]);
  const [displayedPopups, setDisplayedPopups] = useState<Set<string>>(new Set());
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const loadPopups = useCallback(async () => {
    const popups = await popupService.getActivePopups(currentPage);
    const filteredPopups = popups.filter(popup => {
      const key = `${popup.id}_${currentPage}`;
      const sessionKey = `popup_${popup.id}_session`;
      const dayKey = `popup_${popup.id}_day`;
      
      if (popup.display_frequency === 'once_per_session') {
        return !sessionStorage.getItem(sessionKey);
      } else if (popup.display_frequency === 'once_per_day') {
        const lastShown = localStorage.getItem(dayKey);
        if (lastShown) {
          const lastShownDate = new Date(lastShown);
          const today = new Date();
          if (lastShownDate.toDateString() === today.toDateString()) {
            return false;
          }
        }
      }
      
      return !displayedPopups.has(key);
    });
    
    setPopupQueue(filteredPopups);
  }, [currentPage, displayedPopups]);

  const triggerPopup = useCallback((popup: Popup) => {
    if (activePopup) return;
    
    const key = `${popup.id}_${currentPage}`;
    const sessionKey = `popup_${popup.id}_session`;
    const dayKey = `popup_${popup.id}_day`;
    
    setActivePopup(popup);
    setDisplayedPopups(prev => new Set([...prev, key]));
    
    if (popup.display_frequency === 'once_per_session') {
      sessionStorage.setItem(sessionKey, 'true');
    } else if (popup.display_frequency === 'once_per_day') {
      localStorage.setItem(dayKey, new Date().toISOString());
    }
  }, [activePopup, currentPage]);

  useEffect(() => {
    const timerPopups = popupQueue.filter(p => p.trigger_type === 'timer');
    if (timerPopups.length === 0) return;
    
    const popup = timerPopups[0];
    const timer = setTimeout(() => {
      triggerPopup(popup);
    }, popup.trigger_delay);
    
    return () => clearTimeout(timer);
  }, [popupQueue, triggerPopup]);

  useEffect(() => {
    const pageLoadPopups = popupQueue.filter(p => p.trigger_type === 'page_load');
    if (pageLoadPopups.length > 0) {
      const popup = pageLoadPopups[0];
      setTimeout(() => triggerPopup(popup), popup.trigger_delay);
    }
  }, [popupQueue, triggerPopup]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentTriggered) {
        const exitPopups = popupQueue.filter(p => p.trigger_type === 'exit_intent');
        if (exitPopups.length > 0) {
          setExitIntentTriggered(true);
          triggerPopup(exitPopups[0]);
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [popupQueue, triggerPopup, exitIntentTriggered]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50) {
        const scrollPopups = popupQueue.filter(p => p.trigger_type === 'scroll');
        if (scrollPopups.length > 0) {
          triggerPopup(scrollPopups[0]);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popupQueue, triggerPopup]);

  useEffect(() => {
    loadPopups();
  }, [loadPopups]);

  const closePopup = useCallback(() => {
    setActivePopup(null);
    document.body.style.overflow = '';
    previousFocusRef.current?.focus();
    
    setTimeout(() => {
      const nextPopup = popupQueue.find(p => p.id !== activePopup?.id);
      if (nextPopup) {
        triggerPopup(nextPopup);
      }
    }, 2000);
  }, [activePopup, popupQueue, triggerPopup]);

  useEffect(() => {
    if (!activePopup) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    
    modalRef.current?.focus();
    
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopup();
      }
      
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePopup, closePopup]);

  if (!activePopup) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closePopup}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card 
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          tabIndex={-1}
          className="w-full max-w-md max-h-[80vh] overflow-y-auto"
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 id="popup-title" className="text-xl font-bold text-risevia-black">{activePopup.title}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closePopup}
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {activePopup.image_url && (
              <img 
                src={activePopup.image_url} 
                alt=""
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div 
              className="text-risevia-charcoal leading-relaxed prose prose-sm"
              dangerouslySetInnerHTML={{ __html: activePopup.content }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
