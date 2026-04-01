"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon, FileText } from 'lucide-react';
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
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    newFiles.forEach(file => {
      if (!file.type.startsWith('application/') && !file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid file type`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    let previewsLoaded = 0;
    validFiles.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          validPreviews.push(e.target?.result as string);
          previewsLoaded++;
          
          if (previewsLoaded === validFiles.length) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
            setFilePreviews(prev => [...prev, ...validPreviews]);
            toast.success(`Added ${validFiles.length} file(s)`);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        setFilePreviews(prev => [...prev, ...validPreviews]);
        toast.success(`Added ${validFiles.length} file(s)`);
      }
    });
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.document_name) {
      toast.error('Please enter document name');
      return;
    }

    if (!formData.document_type) {
      toast.error('Please select document type');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Please attach at least one file');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, selectedFiles);
      
      setFormData({
        project_id: '',
        document_name: '',
        document_type: '',
        description: '',
      });
      setSelectedFiles([]);
      setFilePreviews([]);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
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
        });
        setSelectedFiles([]);
        setFilePreviews([]);
      }
      onClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">Add Document</DialogTitle>
          <DialogDescription>
            Create a new document and attach multiple files
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm">Project</Label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            <Label className="text-sm">Document Name</Label>
            <Input
              value={formData.document_name}
              onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
              placeholder="Enter document name"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Document Type</Label>
            <select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select document type</option>
              <option value="Drawing">Drawing</option>
              <option value="Contract">Contract</option>
              <option value="Photo">Photo</option>
              <option value="Report">Report</option>
              <option value="Invoice">Invoice</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter document description"
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Attach Files (Multiple files allowed)</Label>
            <div className="mt-2">
              {filePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {selectedFiles[index]?.type.startsWith('image/') ? (
                        <img
                          src={preview}
                          alt={`File ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveFile(index)}
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
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                >
                  <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Click to attach files</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, DOC up to 10MB each</p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {selectedFiles.length > 0 && (
              <p className="text-xs text-slate-500">
                {selectedFiles.length} file(s) selected - {((selectedFiles.reduce((acc, file) => acc + file.size, 0)) / (1024 * 1024)).toFixed(2)} MB total
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}