export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
};

export const trackPageView = (pageName: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'G-RISEVIA2024', {
      page_title: pageName,
      page_location: window.location.href
    });
  }
};

export const trackUserEngagement = (action: string, category: string, label?: string) => {
  trackEvent('user_engagement', {
    event_category: category,
    event_label: label,
    custom_parameter_1: action
  });
};

declare global {
  function gtag(...args: any[]): void;
}
