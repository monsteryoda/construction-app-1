"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from './ActivityTypes';

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: any, images: File[]) => Promise<void>;
  projects: Project[];
}

export default function ActivityForm({ isOpen, onClose, onSubmit, projects }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    project_id: '',
    activity_name: '',
    description: '',
    activity_date: '',
    end_date: '',
    status: 'pending',
    assigned_to: '',
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

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        validPreviews.push(e.target?.result as string);
        if (validPreviews.length === validFiles.length) {
          setSelectedImages(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...validPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.activity_name.trim()) {
      toast.error('Activity name is required');
      return;
    }

    if (!formData.activity_date) {
      toast.error('Activity date is required');
      return;
    }

    try {
      setUploading(true);
      await onSubmit(formData, selectedImages);
      
      // Reset form
      setFormData({
        project_id: '',
        activity_name: '',
        description: '',
        activity_date: '',
        end_date: '',
        status: 'pending',
        assigned_to: '',
      });
      setSelectedImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setFormData({
          project_id: '',
          activity_name: '',
          description: '',
          activity_date: '',
          end_date: '',
          status: 'pending',
          assigned_to: '',
        });
        setSelectedImages([]);
        setImagePreviews([]);
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
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
            <Label>Activity Name *</Label>
            <Input
              name="activity_name"
              value={formData.activity_name}
              onChange={handleInputChange}
              placeholder="Enter activity name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter activity description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Activity Date *</Label>
              <Input
                type="date"
                name="activity_date"
                value={formData.activity_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select assigned person</option>
                <option value="John Doe">John Doe</option>
                <option value="Jane Smith">Jane Smith</option>
                <option value="Mike Johnson">Mike Johnson</option>
                <option value="Sarah Williams">Sarah Williams</option>
                <option value="David Brown">David Brown</option>
                <option value="Emily Davis">Emily Davis</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
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
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Adding...' : 'Add Activity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}