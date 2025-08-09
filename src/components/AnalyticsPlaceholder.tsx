import React, { useEffect } from 'react';
import { PerformanceMonitor } from '../utils/performance';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export const useAnalytics = () => {
  const trackEvent = (eventData: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', eventData.action, {
        event_category: eventData.category,
        event_label: eventData.label,
        value: eventData.value,
        custom_parameter_1: 'cannabis_ecommerce',
        privacy_mode: true
      });
    }

    if (typeof window !== 'undefined' && (window as typeof window & { plausible?: (...args: unknown[]) => void }).plausible) {
      (window as typeof window & { plausible: (...args: unknown[]) => void }).plausible(eventData.action, {
        props: {
          category: eventData.category,
          label: eventData.label,
          value: eventData.value
        }
      });
    }

    console.log('Analytics Event:', eventData);
  };

  const trackPageView = (page: string) => {
    if (typeof window !== 'undefined' && (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page,
        privacy_mode: true
      });
    }

    if (typeof window !== 'undefined' && (window as typeof window & { plausible?: (...args: unknown[]) => void }).plausible) {
      (window as typeof window & { plausible: (...args: unknown[]) => void }).plausible('pageview', { u: window.location.href });
    }
  };

  const trackPerformance = () => {
    const metrics = PerformanceMonitor.getMetrics();
    trackEvent({
      event: 'performance_metrics',
      category: 'Performance',
      action: 'core_web_vitals',
      label: 'performance_report',
      value: Math.round(metrics.largestContentfulPaint || 0)
    });
  };

  const trackCartAction = (action: string, productName?: string, value?: number) => {
    trackEvent({
      event: 'ecommerce',
      category: 'Cart',
      action: action,
      label: productName,
      value: value
    });
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
    trackPageView,
    trackPerformance,
    trackAgeGateAcceptance,
    trackStateBlock,
    trackProductView,
    trackCOAView,
    trackCartAction
  };
};

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    PerformanceMonitor.init();

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(gaScript);

    const gaConfigScript = document.createElement('script');
    gaConfigScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID', {
        privacy_mode: true,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_flags: 'SameSite=None;Secure'
      });
    `;
    document.head.appendChild(gaConfigScript);

    const plausibleScript = document.createElement('script');
    plausibleScript.defer = true;
    plausibleScript.setAttribute('data-domain', 'risevia.com');
    plausibleScript.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(plausibleScript);

    window.addEventListener('load', () => {
      setTimeout(() => {
        PerformanceMonitor.reportMetrics();
      }, 3000);
    });

    return () => {
      document.head.removeChild(gaScript);
      document.head.removeChild(gaConfigScript);
      document.head.removeChild(plausibleScript);
    };
  }, []);

  return <>{children}</>;
};
