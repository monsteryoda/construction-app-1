"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  projects: any[];
}

export default function InspectionModal({ isOpen, onClose, onSubmit, projects }: InspectionModalProps) {
  const [formData, setFormData] = useState({
    project_id: '',
    inspection_type: '',
    inspection_date: '',
    work_category: '',
    zone: '',
    location: '',
    inspection_time: '',
    intended_date: '',
    intended_time: '',
    site_manager: '',
    safety_officer: '',
    quality_control: '',
    remarks: '',
    priority: 'normal',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inspection Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <select
                  id="project_id"
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
                <Label htmlFor="inspection_type">Inspection Type *</Label>
                <select
                  id="inspection_type"
                  name="inspection_type"
                  value={formData.inspection_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="Piling Work">Piling Work</option>
                  <option value="FOUNDATION FOOTING">FOUNDATION FOOTING</option>
                  <option value="FORMWORK">FORMWORK</option>
                  <option value="REINFORCEMENT WORK / BRC">REINFORCEMENT WORK / BRC</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspection_date">Inspection Date *</Label>
                <Input
                  id="inspection_date"
                  name="inspection_date"
                  type="date"
                  value={formData.inspection_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_category">Work Category *</Label>
                <select
                  id="work_category"
                  name="work_category"
                  value={formData.work_category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Piling Work">Piling Work</option>
                  <option value="FOUNDATION FOOTING">FOUNDATION FOOTING</option>
                  <option value="FORMWORK">FORMWORK</option>
                  <option value="REINFORCEMENT WORK / BRC">REINFORCEMENT WORK / BRC</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  placeholder="Enter zone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspection_time">Inspection Time</Label>
                <Input
                  id="inspection_time"
                  name="inspection_time"
                  type="time"
                  value={formData.inspection_time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intended_date">Intended Date</Label>
                <Input
                  id="intended_date"
                  name="intended_date"
                  type="date"
                  value={formData.intended_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intended_time">Intended Time</Label>
                <Input
                  id="intended_time"
                  name="intended_time"
                  type="time"
                  value={formData.intended_time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_manager">Site Manager</Label>
                <Input
                  id="site_manager"
                  name="site_manager"
                  value={formData.site_manager}
                  onChange={handleInputChange}
                  placeholder="Enter site manager name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safety_officer">Safety Officer</Label>
                <Input
                  id="safety_officer"
                  name="safety_officer"
                  value={formData.safety_officer}
                  onChange={handleInputChange}
                  placeholder="Enter safety officer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality_control">Quality Control</Label>
                <Input
                  id="quality_control"
                  name="quality_control"
                  value={formData.quality_control}
                  onChange={handleInputChange}
                  placeholder="Enter QC name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Enter any remarks"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}