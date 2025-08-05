import { useEffect, useState } from 'react';

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsVisible(true);
      setProgress(10);
      const timer1 = setTimeout(() => setProgress(50), 100);
      const timer2 = setTimeout(() => setProgress(100), 500);
      const timer3 = setTimeout(() => {
        setProgress(0);
        setIsVisible(false);
      }, 600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    };

    const observer = new MutationObserver(() => {
      handleRouteChange();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  if (!isVisible || progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-risevia-purple to-risevia-teal transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
