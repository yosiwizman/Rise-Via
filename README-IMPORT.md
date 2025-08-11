# Product Import and Inventory Management System

This document provides instructions for using the new product import and inventory management system for Rise-Via.

## Overview

The system includes:
- Import script for 81 cannabis strains
- Database-driven inventory management
- Real-time stock tracking and alerts
- Advanced search and filtering
- Cloudinary image generation
- Comprehensive admin interface

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=prjHlRPNH0gFs1WGB3jcTdLTE-w
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_KEY=your_service_key
```

### 2. Database Setup

The system will automatically create the necessary database tables:
- `products` - Main product data
- `inventory_logs` - Track inventory changes
- `inventory_alerts` - Low stock and other alerts

## Usage

### Import Strains

To import the 81 cannabis strains into your database:

```bash
npm run import-strains
```

This will:
- Create database tables if they don't exist
- Import 81 strains with complete data structure
- Generate sample IDs, batch IDs, and pricing
- Distribute strain types: 24 Indica, 18 Sativa, 39 Hybrid

### Generate Images

To generate placeholder images for all strains:

```bash
npm run generate-images
```

This will:
- Generate 3 placeholder images per strain
- Upload images to Cloudinary
- Update product records with image URLs

### Admin Interface

Access the admin interface at `/admin` to:
- Manage product inventory
- View low stock alerts
- Track inventory changes
- Adjust stock levels
- Monitor reorder suggestions

### Search and Filtering

The enhanced shop page includes:
- Search by name, description, or effects
- Filter by strain type (Indica/Sativa/Hybrid)
- Filter by THCA percentage range
- Filter by effects and flavors
- Sort by name, price, THCA %, or popularity

## Data Structure

### Product Schema

```typescript
interface Product {
  id: string;
  sample_id: string;
  name: string;
  slug: string;
  category: string;
  strain_type: 'indica' | 'sativa' | 'hybrid';
  thca_percentage: number;
  batch_id: string;
  volume_available: number;
  description: string;
  effects: string[];
  flavors: string[];
  prices: {
    gram: number;
    eighth: number;
    quarter: number;
    half: number;
    ounce: number;
  };
  images: string[];
  featured: boolean;
  status: 'active' | 'inactive' | 'out_of_stock';
}
```

### Inventory Features

- **Real-time tracking**: Stock levels update immediately
- **Low stock alerts**: Automatic alerts when inventory < 10 units
- **Batch tracking**: Track products by batch ID
- **Inventory logs**: Complete audit trail of all changes
- **Reserve stock**: Prevent overselling with cart reservations

## API Services

### ProductService

```typescript
// Get all products
const products = await productService.getAll();

// Update inventory
await productService.updateInventory(productId, newCount, reason, userId);

// Search products
const results = await productService.search(searchTerm, filters);

// Get inventory logs
const logs = await productService.getInventoryLogs(productId);
```

### CloudinaryService

```typescript
// Generate placeholder images
const images = await cloudinaryService.generateStrainImages(strainName);

// Upload custom image
const result = await cloudinaryService.uploadImage(file, folder);
```

## Troubleshooting

### Import Issues

If the import script fails:
1. Check Supabase credentials
2. Verify database permissions
3. Check console for specific errors

### Image Generation Issues

If image generation fails:
1. Verify Cloudinary credentials
2. Check upload preset configuration
3. Ensure sufficient API quota

### Database Connection Issues

If database operations fail:
1. Check Supabase URL and keys
2. Verify network connectivity
3. Check service key permissions

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Import strains to database
npm run import-strains

# Generate placeholder images
npm run generate-images
```

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

## Deployment Notes

1. **Environment Variables**: Ensure all required environment variables are set in production
2. **Database Migration**: Run import script in production environment
3. **Image Generation**: Generate images after strain import
4. **Monitoring**: Set up alerts for low stock notifications
5. **Backup**: Regular database backups recommended for inventory data

## Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure database tables are created properly
4. Check Cloudinary configuration and quotas
