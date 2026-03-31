import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Upload, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface InspectionPhotosProps {
  previewImages: string[];
  selectedImages: File[];
  uploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onAddMoreImages: () => void;
  onUploadImages: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function InspectionPhotos({
  previewImages,
  selectedImages,
  uploading,
  onFileSelect,
  onRemoveImage,
  onAddMoreImages,
  onUploadImages,
  fileInputRef,
}: InspectionPhotosProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="w-5 h-5" />
          Inspection Photos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {previewImages.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() => {
                    // Image preview logic can be added here
                  }}
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div
              onClick={onAddMoreImages}
              className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onAddMoreImages();
                }
              }}
            >
              <Plus className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Add More</p>
            </div>
          </div>
        ) : (
          <div
            onClick={onAddMoreImages}
            className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAddMoreImages();
              }
            }}
          >
            <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Click to attach photos</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFileSelect}
          className="hidden"
        />
        {uploading && (
          <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full inline-block"></span>
            Uploading images...
          </p>
        )}
        {previewImages.length > 0 && (
          <Button
            onClick={onUploadImages}
            disabled={uploading}
            className="mt-4 gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}