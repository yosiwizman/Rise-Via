export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  uploadPreset: 'risevia_products'
};

export const uploadToCloudinary = async (file: File, folder: string = 'products') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', folder);
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  
  return response.json();
};

export const uploadVideoToCloudinary = async (file: File, folder: string = 'products/videos') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', folder);
  formData.append('resource_type', 'video');
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Video upload failed: ${response.statusText}`);
  }
  
  return response.json();
};
