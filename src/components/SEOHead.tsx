import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  noIndex?: boolean;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
}

export const SEOHead = ({ 
  title, 
  description, 
  noIndex = false, 
  canonical, 
  ogImage = '/risevia-logo.png',
  structuredData 
}: SEOHeadProps) => {
  useEffect(() => {
    document.title = title.includes('RiseViA') ? title : `${title} | RiseViA Premium THCA`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonical || window.location.href },
      { property: 'og:site_name', content: 'RiseViA' }
    ];

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`);
      if (element) {
        element.setAttribute('content', tag.content);
      } else {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        element.setAttribute('content', tag.content);
        document.head.appendChild(element);
      }
    });

    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage }
    ];

    twitterTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      if (element) {
        element.setAttribute('content', tag.content);
      } else {
        element = document.createElement('meta');
        element.setAttribute('name', tag.name);
        element.setAttribute('content', tag.content);
        document.head.appendChild(element);
      }
    });

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
    const keywords = 'THCA, cannabis education, hemp products, lab tested, premium cannabis, wellness, natural health, COA, certificates of analysis, legal cannabis, hemp flower, cannabis strains';
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }

    if (structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    if (title.includes('Home') || window.location.pathname === '/') {
      const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "RiseViA",
        "description": "Premium THCA cannabis products with lab-tested quality and compliance",
        "url": "https://risevia.com",
        "logo": "https://risevia.com/risevia-logo.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "support@risevia.com"
        },
        "sameAs": [
          "https://instagram.com/risevia",
          "https://twitter.com/risevia"
        ]
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(organizationData);
      document.head.appendChild(script);
    }
  }, [title, description, noIndex, canonical, ogImage, structuredData]);

  return null;
};
