import React, { useState, useCallback } from 'react';
import { Upload, X, Image, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { uploadToCloudinary, uploadVideoToCloudinary } from '../../lib/cloudinary';

interface ProductMediaManagerProps {
  onMediaUploaded?: (urls: string[]) => void;
  initialImages?: string[];
  initialHoverImage?: string;
  initialVideo?: string;
}

export const ProductMediaManager: React.FC<ProductMediaManagerProps> = ({
  onMediaUploaded,
  initialImages = [],
  initialHoverImage,
  initialVideo
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages);
  const [hoverImage, setHoverImage] = useState<string | undefined>(initialHoverImage);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(initialVideo);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    
    try {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      
      const imagePromises = imageFiles.map(file => uploadToCloudinary(file, 'products'));
      const videoPromises = videoFiles.map(file => uploadVideoToCloudinary(file, 'products/videos'));
      
      const [imageResults, videoResults] = await Promise.all([
        Promise.all(imagePromises),
        Promise.all(videoPromises)
      ]);
      
      const imageUrls = imageResults.map(result => result.secure_url);
      const videoUrls = videoResults.map(result => result.secure_url);
      
      if (imageUrls.length > 0) {
        const newImages = [...uploadedImages, ...imageUrls].slice(0, 3);
        setUploadedImages(newImages);
      }
      
      if (videoUrls.length > 0 && !videoUrl) {
        setVideoUrl(videoUrls[0]);
      }
      
      const allUrls = [...imageUrls, ...videoUrls];
      onMediaUploaded?.(allUrls);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [uploadedImages, videoUrl, onMediaUploaded]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  }, [handleFiles]);

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const setAsHoverImage = (url: string) => {
    setHoverImage(url);
  };

  const removeVideo = () => {
    setVideoUrl(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Product Media Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-risevia-purple bg-purple-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Product Media</h3>
          <p className="text-gray-600 mb-4">
            Drag and drop images/videos or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports: Up to 3 images + 1 hover image + 1 video per product
          </p>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            className="hidden"
            id="media-upload"
          />
          <Button 
            onClick={() => document.getElementById('media-upload')?.click()}
            className="bg-gradient-to-r from-risevia-purple to-risevia-teal"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
        
        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Product Images ({uploadedImages.length}/3)
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Product image ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs"
                      onClick={() => setAsHoverImage(url)}
                    >
                      Set Hover
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-6 h-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  {hoverImage === url && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                      Hover
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {hoverImage && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Hover Effect Image</h4>
            <div className="relative inline-block">
              <img 
                src={hoverImage} 
                alt="Hover effect"
                className="w-24 h-24 object-cover rounded border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                onClick={() => setHoverImage(undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Product Video
            </h4>
            <div className="relative inline-block">
              <video 
                src={videoUrl} 
                className="w-48 h-32 object-cover rounded border"
                controls
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                onClick={removeVideo}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
