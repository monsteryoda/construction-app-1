"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Image, X } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from './IssueTypes';

interface IssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issue: any, images: File[]) => Promise<void>;
  projects: Project[];
}

export default function IssueForm({ isOpen, onClose, onSubmit, projects }: IssueFormProps) {
  const [formData, setFormData] = useState({
    project_id: '',
    issue_title: '',
    description: '',
    issue_type: 'general',
    severity: 'medium',
    status: 'open',
    reported_by: '',
    assigned_to: '',
    reported_date: '',
    resolved_date: '',
    resolution_notes: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{name: string, size: number, type: string, preview: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const issueTypes = ['Safety', 'Quality', 'Schedule', 'Cost', 'Design', 'General'];
  const severities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    console.log('[IssueForm] Selected files:', files);
    
    const newImages: {name: string, size: number, type: string, preview: string}[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      console.log('[IssueForm] Processing file:', file.name, 'size:', file.size);
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          preview: reader.result as string,
        });
        validFiles.push(file);

        if (newImages.length === Array.from(files).length) {
          console.log('[IssueForm] Adding', validFiles.length, 'images');
          setSelectedImages(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...newImages]);
          toast.success(`${validFiles.length} image(s) selected`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    console.log('[IssueForm] Removing image at index:', index);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    console.log('[IssueForm] Submitting issue with', selectedImages.length, 'images');
    console.log('[IssueForm] Form data:', formData);
    console.log('[IssueForm] Selected images:', selectedImages);
    
    // Validate required fields
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.issue_title.trim()) {
      toast.error('Issue title is required');
      return;
    }

    if (selectedImages.length === 0) {
      toast.error('Please attach at least one image');
      return;
    }

    try {
      setUploading(true);
      console.log('[IssueForm] Calling onSubmit');
      await onSubmit(formData, selectedImages);
      
      // Reset form
      setFormData({
        project_id: '',
        issue_title: '',
        description: '',
        issue_type: 'general',
        severity: 'medium',
        status: 'open',
        reported_by: '',
        assigned_to: '',
        reported_date: '',
        resolved_date: '',
        resolution_notes: '',
      });
      setSelectedImages([]);
      setImagePreviews([]);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[IssueForm] Error:', error);
      toast.error('Failed to add issue');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setFormData({
          project_id: '',
          issue_title: '',
          description: '',
          issue_type: 'general',
          severity: 'medium',
          status: 'open',
          reported_by: '',
          assigned_to: '',
          reported_date: '',
          resolved_date: '',
          resolution_notes: '',
        });
        setSelectedImages([]);
        setImagePreviews([]);
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report New Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => handleSelectChange('project_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Issue Title *</Label>
            <Input
              name="issue_title"
              value={formData.issue_title}
              onChange={handleInputChange}
              placeholder="Enter issue title"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the issue in detail"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issue Type</Label>
              <Select
                value={formData.issue_type}
                onValueChange={(value) => handleSelectChange('issue_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => handleSelectChange('severity', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severities.map(sev => (
                    <SelectItem key={sev} value={sev.toLowerCase()}>
                      {sev}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(stat => (
                  <SelectItem key={stat} value={stat.toLowerCase().replace(' ', '_')}>
                    {stat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reported By</Label>
              <Input
                name="reported_by"
                value={formData.reported_by}
                onChange={handleInputChange}
                placeholder="Enter reporter name"
              />
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Input
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleInputChange}
                placeholder="Enter assignee name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reported Date</Label>
              <Input
                type="date"
                name="reported_date"
                value={formData.reported_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Resolved Date</Label>
              <Input
                type="date"
                name="resolved_date"
                value={formData.resolved_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Resolution Notes</Label>
            <Textarea
              name="resolution_notes"
              value={formData.resolution_notes}
              onChange={handleInputChange}
              placeholder="Enter resolution notes"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments (Images) *</Label>
            <div className="mt-2">
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-slate-500 mt-1 truncate">{image.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(image.size)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                >
                  <Image className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Click to upload images or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF up to 10MB each</p>
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
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
            {uploading ? 'Adding...' : 'Report Issue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}