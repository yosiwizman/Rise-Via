import { neon } from '@neondatabase/serverless';

const neonUrl = process.env.DATABASE_URL;
const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!neonUrl) {
  console.error('Missing Neon database configuration');
  process.exit(1);
}

if (!cloudName) {
  console.error('Missing Cloudinary configuration');
  process.exit(1);
}

const sql = neon(neonUrl);

const generatePlaceholderImage = async (strainName, variant = 1) => {
  const encodedName = encodeURIComponent(`${strainName} - ${variant}`);
  const placeholderUrl = `https://via.placeholder.com/400x300/4A5568/FFFFFF?text=${encodedName}`;
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: placeholderUrl,
        upload_preset: 'unsigned_preset',
        public_id: `strains/${strainName.toLowerCase().replace(/ /g, '-')}-${variant}`,
        folder: 'risevia/products'
      })
    });

    if (!response.ok) {
      console.warn(`Failed to upload placeholder for ${strainName}, using direct URL`);
      return placeholderUrl;
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.warn(`Error generating placeholder for ${strainName}:`, error);
    return placeholderUrl;
  }
};

const generateStrainImages = async (strainName) => {
  const images = [];
  for (let i = 1; i <= 3; i++) {
    const imageUrl = await generatePlaceholderImage(strainName, i);
    images.push(imageUrl);
  }
  return images;
};

const generateImagesForAllStrains = async () => {
  try {
    console.log('🖼️  Starting image generation for all strains...');
    
    const products = await sql`
      SELECT id, name 
      FROM products 
      WHERE status = 'active'
    `;
    
    if (!products) {
      console.error('Error fetching products from Neon database');
      return;
    }
    
    console.log(`📦 Found ${products.length} products to generate images for`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`🎨 Generating images for "${product.name}" (${i + 1}/${products.length})`);
      
      try {
        const images = await generateStrainImages(product.name);
        
        await sql`
          UPDATE products 
          SET images = ${JSON.stringify(images)}
          WHERE id = ${product.id}
        `;
        
        console.log(`✅ Generated ${images.length} images for ${product.name}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error generating images for ${product.name}:`, error);
      }
    }
    
    console.log('🎉 Image generation completed!');
    
  } catch (error) {
    console.error('❌ Image generation failed:', error);
    process.exit(1);
  }
};

generateImagesForAllStrains();
