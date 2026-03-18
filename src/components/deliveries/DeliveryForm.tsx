"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from './DeliveryTypes';

interface DeliveryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (delivery: any, images: File[]) => Promise<void>;
  projects: Project[];
}

export default function DeliveryForm({ isOpen, onClose, onSubmit, projects }: DeliveryFormProps) {
  const [formData, setFormData] = useState({
    project_id: '',
    delivery_item: '',
    delivery_date: '',
    expected_date: '',
    status: 'pending',
    quantity: '',
    unit: '',
    supplier: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    // Validate files
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    // Create previews for all valid files
    let previewsLoaded = 0;
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        validPreviews.push(e.target?.result as string);
        previewsLoaded++;
        
        if (previewsLoaded === validFiles.length) {
          setSelectedImages(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...validPreviews]);
          toast.success(`Added ${validFiles.length} image(s)`);
        }
      };
      reader.readAsDataURL(file);
    });

    // Clear the input so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMoreImages = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.delivery_item.trim()) {
      toast.error('Delivery item is required');
      return;
    }

    try {
      setUploading(true);
      await onSubmit(formData, selectedImages);
      
      // Reset form
      setFormData({
        project_id: '',
        delivery_item: '',
        delivery_date: '',
        expected_date: '',
        status: 'pending',
        quantity: '',
        unit: '',
        supplier: '',
      });
      setSelectedImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting delivery:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setFormData({
          project_id: '',
          delivery_item: '',
          delivery_date: '',
          expected_date: '',
          status: 'pending',
          quantity: '',
          unit: '',
          supplier: '',
        });
        setSelectedImages([]);
        setImagePreviews([]);
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Delivery</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Project *</Label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Delivery Item *</Label>
            <Input
              name="delivery_item"
              value={formData.delivery_item}
              onChange={handleInputChange}
              placeholder="Enter delivery item name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expected Date</Label>
              <Input
                type="date"
                name="expected_date"
                value={formData.expected_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Delivery Date</Label>
              <Input
                type="date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="e.g., pieces, kg, tons"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label>Attach Images</Label>
            <div className="mt-2">
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-12 h-12 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Click to attach images</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
                  <p className="text-xs text-slate-400 mt-1">You can select multiple images at once</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full inline-block"></span>
                  Uploading images...
                </p>
              )}
              {imagePreviews.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMoreImages}
                  className="w-full mt-3 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add More Images
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Adding...' : 'Add Delivery'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}