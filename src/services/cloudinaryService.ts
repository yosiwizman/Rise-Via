interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export const cloudinaryService = {
  async uploadImage(file: File, folder: string = 'risevia/products'): Promise<CloudinaryUploadResponse> {
    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = (import.meta as any).env.VITE_CLOUDINARY_API_KEY;
    
    if (!cloudName || !apiKey) {
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_preset');
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    return response.json();
  },

  async generatePlaceholderImage(strainName: string, variant: number = 1): Promise<string> {
    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

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
  },

  async generateStrainImages(strainName: string): Promise<string[]> {
    const images: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const imageUrl = await this.generatePlaceholderImage(strainName, i);
      images.push(imageUrl);
    }
    return images;
  }
};
