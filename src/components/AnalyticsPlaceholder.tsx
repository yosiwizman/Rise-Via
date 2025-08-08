import React, { useEffect } from 'react';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export const useAnalytics = () => {
  const trackEvent = (eventData: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (...args: unknown[]) => void }).gtag('event', eventData.action, {
        event_category: eventData.category,
        event_label: eventData.label,
        value: eventData.value,
        custom_parameter_1: 'cannabis_ecommerce',
        privacy_mode: true
      });
    } else {
      console.log('Analytics Event:', eventData);
    }
  };

  const trackAgeGateAcceptance = () => {
    trackEvent({
      event: 'age_verification',
      category: 'Compliance',
      action: 'age_gate_accepted',
      label: 'user_verified_21_plus'
    });
  };

  const trackStateBlock = (state: string) => {
    trackEvent({
      event: 'state_restriction',
      category: 'Compliance',
      action: 'state_blocked',
      label: state
    });
  };

  const trackProductView = (strainName: string, thcaPercentage: string) => {
    trackEvent({
      event: 'product_view',
      category: 'Products',
      action: 'strain_viewed',
      label: strainName,
      value: parseFloat(thcaPercentage)
    });
  };

  const trackCOAView = (batchId: string) => {
    trackEvent({
      event: 'compliance_action',
      category: 'Lab_Results',
      action: 'coa_viewed',
      label: batchId
    });
  };

  return {
    trackEvent,
    trackAgeGateAcceptance,
    trackStateBlock,
    trackProductView,
    trackCOAView
  };
};

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);

    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID', {
        privacy_mode: true,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    `;
    document.head.appendChild(configScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(configScript);
    };
  }, []);

  return <>{children}</>;
};
