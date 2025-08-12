import { useState, useEffect, useCallback } from 'react';
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

  const closePopup = () => {
    setActivePopup(null);
    setTimeout(() => {
      const nextPopup = popupQueue.find(p => p.id !== activePopup?.id);
      if (nextPopup) {
        triggerPopup(nextPopup);
      }
    }, 2000);
  };

  if (!activePopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-risevia-black">{activePopup.title}</h3>
            <Button variant="ghost" size="sm" onClick={closePopup}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {activePopup.image_url && (
            <img 
              src={activePopup.image_url} 
              alt={activePopup.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <div 
            className="text-risevia-charcoal leading-relaxed"
            dangerouslySetInnerHTML={{ __html: activePopup.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
