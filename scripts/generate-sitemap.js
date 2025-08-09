import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const strainsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/strains.json'), 'utf8')
);

const baseUrl = 'https://risevia.com';
const currentDate = new Date().toISOString().split('T')[0];

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/shop', priority: '0.9', changefreq: 'daily' },
  { url: '/learn', priority: '0.8', changefreq: 'weekly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/lab-results', priority: '0.8', changefreq: 'weekly' },
  { url: '/shipping', priority: '0.6', changefreq: 'monthly' },
  { url: '/legal', priority: '0.5', changefreq: 'monthly' },
  { url: '/careers', priority: '0.5', changefreq: 'monthly' },
  { url: '/b2b', priority: '0.7', changefreq: 'weekly' }
];

const productPages = strainsData.map(strain => ({
  url: `/product/${strain.strain_name.toLowerCase().replace(/\s+/g, '-')}`,
  priority: '0.8',
  changefreq: 'weekly'
}));

function generateSitemap() {
  const allPages = [...staticPages, ...productPages];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  allPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Cannabis compliance
Disallow: /admin
Disallow: /api/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for responsible crawling
Crawl-delay: 1`;
}

function writeSitemapFiles() {
  const publicDir = path.join(__dirname, '../public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapContent = generateSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
  console.log('✅ Generated sitemap.xml');

  const robotsContent = generateRobotsTxt();
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent);
  console.log('✅ Generated robots.txt');

  console.log(`📊 Sitemap includes ${staticPages.length + productPages.length} URLs`);
  console.log(`🌿 ${productPages.length} product pages indexed`);
}

writeSitemapFiles();
