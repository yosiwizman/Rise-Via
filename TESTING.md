# Testing Guide for Product Import & Inventory System

## Prerequisites

1. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Fill in your actual values:
   # - VITE_SUPABASE_URL
   # - VITE_SUPABASE_ANON_KEY  
   # - VITE_SUPABASE_SERVICE_KEY
   # - VITE_CLOUDINARY_CLOUD_NAME
   # - VITE_CLOUDINARY_API_KEY
   # - VITE_CLOUDINARY_API_SECRET
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Testing Steps

### 1. Build Verification
```bash
npm run build
npm run lint
```

### 2. Import Cannabis Strains
```bash
npm run import-strains
```
Expected: 81 strains imported to database with complete data structure

### 3. Generate Placeholder Images
```bash
npm run generate-images
```
Expected: 3 placeholder images generated per strain via Cloudinary

### 4. Test Development Server
```bash
npm run dev
```

### 5. Manual Testing Checklist

#### Shop Page (/shop)
- [ ] Products load from database (or fallback to JSON)
- [ ] Search functionality works
- [ ] Filter by strain type (Indica/Sativa/Hybrid)
- [ ] Sort by name, price, THCA%, popularity
- [ ] Product cards display correctly
- [ ] Add to cart functionality
- [ ] Wishlist functionality

#### Admin - Product Manager (/admin)
- [ ] Products list loads
- [ ] Search and filter products
- [ ] Bulk actions (delete, status change, price adjustment)
- [ ] Quick edit functionality
- [ ] Export to CSV
- [ ] Add/Edit product modal

#### Admin - Inventory Manager (/admin)
- [ ] Inventory overview cards
- [ ] Low stock alerts (< 10 units)
- [ ] Inventory adjustment modal
- [ ] Stock level updates
- [ ] Inventory history view
- [ ] Real-time data refresh

### 6. Database Verification

Check that these tables exist and have data:
- `products` (81 records)
- `inventory_logs` (adjustment history)
- `inventory_alerts` (low stock notifications)

### 7. Error Scenarios

Test these edge cases:
- [ ] Database connection failure (should fallback to JSON)
- [ ] Cloudinary upload failure (should use placeholder URLs)
- [ ] Invalid inventory adjustments
- [ ] Search with no results
- [ ] Filter combinations

## Success Criteria

✅ All 81 strains imported with complete data structure
✅ Placeholder images generated for all strains
✅ Inventory tracking with real-time updates
✅ Low stock alerts trigger at < 10 units
✅ Search and filters work correctly
✅ Admin can manage inventory through interface
✅ No build or lint errors
✅ Responsive design on mobile/tablet

## Troubleshooting

### Common Issues

1. **Import Script Fails**
   - Check Supabase service key is correct
   - Verify database connection
   - Check strains.json file exists

2. **Images Don't Generate**
   - Verify Cloudinary credentials
   - Check API rate limits
   - Ensure upload preset exists

3. **Components Don't Load**
   - Check for TypeScript errors
   - Verify all imports are correct
   - Check console for runtime errors

4. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Review Supabase dashboard for errors
