import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  selectedImageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ImagePreviewDialog({
  isOpen,
  onClose,
  images,
  selectedImageIndex,
  onPrevious,
  onNext,
}: ImagePreviewDialogProps) {
  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Inspection Photos</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              Image {selectedImageIndex + 1} of {images.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <img
            src={images[selectedImageIndex]}
            alt={`Inspection photo ${selectedImageIndex + 1}`}
            className="w-full h-auto rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between p-4 border-t bg-slate-50">
          <div className="flex gap-2">
            {selectedImageIndex > 0 && (
              <button
                onClick={onPrevious}
                className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
              >
                Previous
              </button>
            )}
            {selectedImageIndex < images.length - 1 && (
              <button
                onClick={onNext}
                className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}