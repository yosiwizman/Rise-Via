import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  noIndex?: boolean;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
}

export const SEOHead = ({ title, description, noIndex = false, canonical, image, type = 'website', keywords }: SEOHeadProps) => {
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
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywords;
        document.head.appendChild(meta);
      }
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `RiseViA Premium THCA | ${title}`);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = `RiseViA Premium THCA | ${title}`;
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = description;
      document.head.appendChild(meta);
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) {
      ogType.setAttribute('content', type);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      meta.content = type;
      document.head.appendChild(meta);
    }

    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', image);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.content = image;
        document.head.appendChild(meta);
      }
    } else {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', '/og-image.jpg');
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.content = '/og-image.jpg';
        document.head.appendChild(meta);
      }
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    const currentUrl = canonical || window.location.href;
    if (ogUrl) {
      ogUrl.setAttribute('content', currentUrl);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      meta.content = currentUrl;
      document.head.appendChild(meta);
    }
  }, [title, description, noIndex, canonical, image, type, keywords]);

  return null;
};
