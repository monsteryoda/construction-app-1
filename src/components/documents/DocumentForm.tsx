"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, X, FileText, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from './DocumentTypes';

interface DocumentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (document: any, files: File[]) => Promise<void>;
  projects: Project[];
}

export default function DocumentForm({ isOpen, onClose, onSubmit, projects }: DocumentFormProps) {
  const [formData, setFormData] = useState({
    project_id: '',
    document_name: '',
    document_type: '',
    description: '',
    version: '1.0',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{name: string, size: number, type: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    'Contract',
    'Drawing',
    'Specification',
    'Report',
    'Permit',
    'Invoice',
    'Certificate',
    'Photo',
    'Other',
  ];

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
    const validPreviews: {name: string, size: number, type: string}[] = [];

    newFiles.forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 50MB limit`);
        return;
      }

      validFiles.push(file);
      validPreviews.push({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setFilePreviews(prev => [...prev, ...validPreviews]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAttachMoreFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.document_name.trim()) {
      toast.error('Document name is required');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Please attach at least one file');
      return;
    }

    try {
      setUploading(true);
      await onSubmit(formData, selectedFiles);
      
      // Reset form
      setFormData({
        project_id: '',
        document_name: '',
        document_type: '',
        description: '',
        version: '1.0',
      });
      setSelectedFiles([]);
      setFilePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting document:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setFormData({
          project_id: '',
          document_name: '',
          document_type: '',
          description: '',
          version: '1.0',
        });
        setSelectedFiles([]);
        setFilePreviews([]);
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
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
            <Label>Document Name *</Label>
            <Input
              name="document_name"
              value={formData.document_name}
              onChange={handleInputChange}
              placeholder="Enter document name"
            />
          </div>

          <div className="space-y-2">
            <Label>Document Type</Label>
            <select
              name="document_type"
              value={formData.document_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              {documentTypes.map(type => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Version</Label>
            <Input
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              placeholder="e.g., 1.0"
            />
          </div>

          <div className="space-y-2">
            <Label>Attach Files *</Label>
            <div className="mt-2">
              {filePreviews.length > 0 ? (
                <div className="space-y-2">
                  {filePreviews.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAttachMoreFiles}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Attach More Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 flex-col gap-2"
                  >
                    <Paperclip className="w-8 h-8 text-slate-400" />
                    <span className="text-sm text-slate-500">Click to attach files</span>
                    <span className="text-xs text-slate-400">PDF, DOC, XLS, JPG, PNG up to 50MB each</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              )}
              {uploading && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full inline-block"></span>
                  Uploading files...
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
            {uploading ? 'Adding...' : 'Add Document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}