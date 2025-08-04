import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  noIndex?: boolean;
  canonical?: string;
}

export const SEOHead = ({ title, description, noIndex = false, canonical }: SEOHeadProps) => {
  useEffect(() => {
    document.title = `RiseViA Premium THCA | ${title}`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    if (noIndex) {
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.setAttribute('content', 'noindex, nofollow');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);
      }
    }

    if (canonical) {
      const linkCanonical = document.querySelector('link[rel="canonical"]');
      if (linkCanonical) {
        linkCanonical.setAttribute('href', canonical);
      } else {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonical;
        document.head.appendChild(link);
      }
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'THCA, cannabis education, hemp products, lab tested, premium cannabis, wellness, natural health');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'THCA, cannabis education, hemp products, lab tested, premium cannabis, wellness, natural health';
      document.head.appendChild(meta);
    }
  }, [title, description, noIndex, canonical]);

  return null;
};
