import { useEffect } from 'react';

interface Product {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  strainType: string;
  thcaPercentage: string;
  batchNumber: string;
  labResultsUrl?: string;
}

interface ProductSEOProps {
  product: Product;
  canonical?: string;
}

export const ProductSEO = ({ product, canonical }: ProductSEOProps) => {
  useEffect(() => {
    document.title = `${product.name} - Premium THCA Cannabis | RiseViA`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = `${product.name} - ${product.strainType} strain with ${product.thcaPercentage}% THCA. ${product.description && typeof product.description === 'string' ? product.description.substring(0, 120) : ''}...`;
    
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    const ogTags = [
      { property: 'og:title', content: `${product.name} - Premium THCA Cannabis` },
      { property: 'og:description', content: description },
      { property: 'og:image', content: product.image },
      { property: 'og:type', content: 'product' },
      { property: 'og:url', content: canonical || window.location.href },
      { property: 'product:price:amount', content: product.price.toString() },
      { property: 'product:price:currency', content: 'USD' }
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
      { name: 'twitter:card', content: 'product' },
      { name: 'twitter:title', content: `${product.name} - Premium THCA Cannabis` },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: product.image }
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

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "category": product.category,
      "brand": {
        "@type": "Brand",
        "name": "RiseViA"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "RiseViA"
        }
      },
      "image": product.image,
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Strain Type",
          "value": product.strainType
        },
        {
          "@type": "PropertyValue",
          "name": "THCA Percentage",
          "value": product.thcaPercentage + "%"
        },
        {
          "@type": "PropertyValue",
          "name": "Batch Number",
          "value": product.batchNumber
        }
      ]
    };

    if (product.labResultsUrl) {
      (structuredData as typeof structuredData & { certifications: Array<{ "@type": string; name: string; url: string }> }).certifications = [{
        "@type": "Certification",
        "name": "Certificate of Analysis",
        "url": product.labResultsUrl
      }];
    }

    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (linkCanonical) {
        linkCanonical.setAttribute('href', canonical);
      } else {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        linkCanonical.setAttribute('href', canonical);
        document.head.appendChild(linkCanonical);
      }
    }
  }, [product, canonical]);

  return null;
};
