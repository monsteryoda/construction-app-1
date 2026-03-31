"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Search, Filter, ClipboardCheck, Calendar, User, Image as ImageIcon, X, CheckCircle, AlertCircle, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Inspection {
  id: string;
  user_id: string;
  project_id: string;
  inspection_type: string;
  inspection_date: string;
  inspector_name: string;
  status: string;
  findings: string;
  recommendations: string;
  images?: any[];
  project_name?: string;
  work_category?: string;
  contractor?: string;
  description?: string;
  zone?: string;
  location?: string;
  inspection_time?: string;
  intended_date?: string;
  intended_time?: string;
}

interface Project {
  id: string;
  project_name: string;
  contractor?: string;
  client?: string;
  consultant?: string;
}

interface InspectionImage {
  id: string;
  inspection_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

export default function Inspection() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionImages, setInspectionImages] = useState<InspectionImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    project_id: '',
    work_category: '',
    contractor: '',
    description: '',
    zone: '',
    location: '',
    inspection_date: '',
    inspection_time: '10:00',
    intended_date: '',
    intended_time: '10:00',
    inspector_name: '',
    status: 'pending',
    findings: '',
    recommendations: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchInspections();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('projects')
        .select('id, project_name, contractor, client, consultant')
        .eq('user_id', user.id);

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchInspections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select('*, projects(project_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('[fetchInspections] Total inspections:', data?.length);
      setInspections(data || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast.error('Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionImages = async (inspectionId: string) => {
    try {
      console.log('[fetchInspectionImages] Starting fetch for inspection:', inspectionId);
      setImagesLoading(true);
      
      // First, let's check if the inspection exists
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .select('id, user_id')
        .eq('id', inspectionId)
        .single();

      if (inspectionError) {
        console.error('[fetchInspectionImages] Inspection not found:', inspectionError);
        setInspectionImages([]);
        toast.error('Inspection not found');
        return;
      }

      console.log('[fetchInspectionImages] Inspection found:', inspectionData);

      // Now fetch images
      const { data, error } = await supabase
        .from('inspection_images')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[fetchInspectionImages] Error fetching images:', error);
        console.error('[fetchInspectionImages] Error details:', JSON.stringify(error, null, 2));
        setInspectionImages([]);
        toast.error('Failed to load images');
        return;
      }
      
      console.log('[fetchInspectionImages] Fetched images:', data);
      console.log('[fetchInspectionImages] Image count:', data?.length);
      
      if (data && data.length > 0) {
        console.log('[fetchInspectionImages] First image:', data[0]);
        console.log('[fetchInspectionImages] First image URL:', data[0].image_url?.substring(0, 100) + '...');
      }
      
      setInspectionImages(data || []);
    } catch (error) {
      console.error('[fetchInspectionImages] Error:', error);
      setInspectionImages([]);
      toast.error('Error loading images');
    } finally {
      setImagesLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
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
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.work_category) {
      toast.error('Please select work category');
      return;
    }

    if (!formData.inspection_date) {
      toast.error('Please select inspection date');
      return;
    }

    if (!formData.inspector_name) {
      toast.error('Please enter inspector name');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('[handleSubmit] Creating inspection...');
      const { data: inspectionData, error: insertError } = await supabase
        .from('inspections')
        .insert([{
          user_id: user.id,
          project_id: formData.project_id,
          inspection_type: formData.work_category,
          inspection_date: formData.inspection_date,
          inspector_name: formData.inspector_name,
          status: formData.status,
          findings: formData.findings,
          recommendations: formData.recommendations,
        }])
        .select()
        .single();

      if (insertError) {
        console.error('[handleSubmit] Error creating inspection:', insertError);
        throw insertError;
      }

      console.log('[handleSubmit] Inspection created:', inspectionData.id);

      // Upload images if any
      if (selectedImages.length > 0) {
        console.log('[handleSubmit] Uploading', selectedImages.length, 'images...');
        let uploadedCount = 0;
        let failedCount = 0;

        for (const file of selectedImages) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          
          console.log('[handleSubmit] Uploading file:', fileName);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('inspection_images')
            .upload(`${inspectionData.id}/${fileName}`, file);

          if (uploadError) {
            console.error('[handleSubmit] Image upload error:', uploadError);
            failedCount++;
            continue;
          }

          console.log('[handleSubmit] File uploaded:', uploadData.path);
          
          const { data: { publicUrl } } = supabase.storage
            .from('inspection_images')
            .getPublicUrl(uploadData.path);

          console.log('[handleSubmit] Public URL:', publicUrl);

          const { error: dbError } = await supabase
            .from('inspection_images')
            .insert([{
              inspection_id: inspectionData.id,
              image_url: publicUrl,
              file_name: fileName,
            }]);

          if (dbError) {
            console.error('[handleSubmit] Error saving image to DB:', dbError);
            failedCount++;
          } else {
            console.log('[handleSubmit] Image saved to DB');
            uploadedCount++;
          }
        }

        if (uploadedCount > 0) {
          toast.success(`${uploadedCount} image(s) uploaded successfully`);
        }
        if (failedCount > 0) {
          toast.warning(`${failedCount} image(s) failed to upload`);
        }
      } else {
        toast.success('Inspection added successfully');
      }

      setShowAddDialog(false);
      setFormData({
        project_id: '',
        work_category: '',
        contractor: '',
        description: '',
        zone: '',
        location: '',
        inspection_date: '',
        inspection_time: '10:00',
        intended_date: '',
        intended_time: '10:00',
        inspector_name: '',
        status: 'pending',
        findings: '',
        recommendations: '',
      });
      setSelectedImages([]);
      setImagePreviews([]);
      fetchInspections();
    } catch (error) {
      console.error('[handleSubmit] Error:', error);
      toast.error('Failed to add inspection');
    }
  };

  const handleViewDetails = async (inspection: Inspection) => {
    console.log('[handleViewDetails] Opening details for inspection:', inspection.id);
    setSelectedInspection(inspection);
    setInspectionImages([]); // Clear previous images
    await fetchInspectionImages(inspection.id);
    setShowDetailsDialog(true);
  };

  const handleRefreshImages = async () => {
    if (!selectedInspection?.id) return;
    
    console.log('[handleRefreshImages] Refreshing images for inspection:', selectedInspection.id);
    await fetchInspectionImages(selectedInspection.id);
    toast.success('Images refreshed');
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.inspection_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      contractor: project?.contractor || '',
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inspections</h1>
            <p className="text-slate-500 mt-1">Track and manage project inspections</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Inspection
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search inspections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-[180px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Add Inspection Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-semibold">REQUEST FOR WORK INSPECTION (RWI) FORM</DialogTitle>
              <DialogDescription>
                Fill in the inspection request form below to submit a work inspection request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Company Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-xl font-bold text-slate-900">UBBIM RESOURCES SDN BHD</h2>
              </div>

              {/* Part A Header */}
              <div className="border-2 border-slate-900 p-4">
                <h3 className="font-bold text-sm mb-3 text-center">PART A – REQUEST APPLICATION</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs">PROJECT</Label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => handleProjectSelect(e.target.value)}
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
                    <Label className="text-xs">RWI Serial No</Label>
                    <Input
                      placeholder="URSB/KA-T/25/35-51"
                      className="text-sm"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Work Category</Label>
                    <select
                      value={formData.work_category}
                      onChange={(e) => setFormData({ ...formData, work_category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select work category</option>
                      <option value="FIRE FIGHTING WORK">FIRE FIGHTING WORK</option>
                      <option value="ELECTRICAL WORK">ELECTRICAL WORK</option>
                      <option value="PLUMBING WORK">PLUMBING WORK</option>
                      <option value="STRUCTURAL WORK">STRUCTURAL WORK</option>
                      <option value="MECHANICAL WORK">MECHANICAL WORK</option>
                      <option value="ARCHITECTURAL WORK">ARCHITECTURAL WORK</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Contractor (Requestor)</Label>
                    <Input
                      value={formData.contractor}
                      onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                      className="text-sm"
                      placeholder="Contractor name"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label className="text-xs">Description of Works</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the work to be inspected..."
                    rows={3}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Zone</Label>
                    <Input
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      placeholder="Zone"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Request Section */}
              <div className="border-2 border-slate-900 p-4">
                <h3 className="font-bold text-sm mb-3">Request</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Requested by</Label>
                    <Input
                      value={formData.inspector_name}
                      onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                      placeholder="Inspector name"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={formData.inspection_date}
                      onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Works Ready for Inspection on</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={formData.inspection_date}
                        onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                        className="text-sm flex-1"
                      />
                      <Input
                        type="time"
                        value={formData.inspection_time}
                        onChange={(e) => setFormData({ ...formData, inspection_time: e.target.value })}
                        className="text-sm w-24"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Works Intended to commence on</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={formData.intended_date}
                        onChange={(e) => setFormData({ ...formData, intended_date: e.target.value })}
                        className="text-sm flex-1"
                      />
                      <Input
                        type="time"
                        value={formData.intended_time}
                        onChange={(e) => setFormData({ ...formData, intended_time: e.target.value })}
                        className="text-sm w-24"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-2 border-slate-900 p-4">
                <h3 className="font-bold text-sm mb-3">Additional Information</h3>
                
                <div className="space-y-2 mb-4">
                  <Label className="text-xs">Findings</Label>
                  <Textarea
                    value={formData.findings}
                    onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                    placeholder="Enter inspection findings..."
                    rows={3}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <Label className="text-xs">Recommendations</Label>
                  <Textarea
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    placeholder="Enter recommendations..."
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Attach Photos</Label>
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
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                      >
                        <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Click to attach photos</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Inspection</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-semibold">Inspection Details</DialogTitle>
              <DialogDescription>
                View the complete inspection request details and attached photos.
              </DialogDescription>
            </DialogHeader>
            {selectedInspection && (
              <div className="space-y-6 py-4">
                {/* Company Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">UBBIM RESOURCES SDN BHD</h2>
                </div>

                {/* Part A Header */}
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3 text-center">PART A – REQUEST APPLICATION</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs">PROJECT</Label>
                      <Input
                        value={selectedInspection.project_name || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">RWI Serial No</Label>
                      <Input
                        placeholder="URSB/KA-T/25/35-51"
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Work Category</Label>
                      <Input
                        value={selectedInspection.inspection_type || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Contractor (Requestor)</Label>
                      <Input
                        value={selectedInspection.contractor || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label className="text-xs">Description of Works</Label>
                    <Textarea
                      value={selectedInspection.description || 'N/A'}
                      className="text-sm bg-slate-50"
                      disabled
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Zone</Label>
                      <Input
                        value={selectedInspection.zone || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Location</Label>
                      <Input
                        value={selectedInspection.location || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Request Section */}
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Request</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Requested by</Label>
                      <Input
                        value={selectedInspection.inspector_name || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={selectedInspection.inspection_date || ''}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Works Ready for Inspection on</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={selectedInspection.inspection_date || ''}
                          className="text-sm flex-1 bg-slate-50"
                          disabled
                        />
                        <Input
                          type="time"
                          value={selectedInspection.inspection_time || '10:00'}
                          className="text-sm w-24 bg-slate-50"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Works Intended to commence on</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={selectedInspection.intended_date || ''}
                          className="text-sm flex-1 bg-slate-50"
                          disabled
                        />
                        <Input
                          type="time"
                          value={selectedInspection.intended_time || '10:00'}
                          className="text-sm w-24 bg-slate-50"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Additional Information</h3>
                  
                  <div className="space-y-2 mb-4">
                    <Label className="text-xs">Findings</Label>
                    <Textarea
                      value={selectedInspection.findings || 'N/A'}
                      className="text-sm bg-slate-50"
                      disabled
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label className="text-xs">Recommendations</Label>
                    <Textarea
                      value={selectedInspection.recommendations || 'N/A'}
                      className="text-sm bg-slate-50"
                      disabled
                      rows={2}
                    />
                  </div>

                  {/* Images Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Inspection Photos</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshImages}
                        disabled={imagesLoading}
                        className="gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${imagesLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                    {imagesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-slate-500">Loading images...</p>
                      </div>
                    ) : inspectionImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {inspectionImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.image_url}
                              alt={image.file_name || 'Inspection photo'}
                              className="w-full h-48 object-cover rounded-lg border border-slate-200"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p>No photos attached</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Inspections List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredInspections.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ClipboardCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Inspections Yet</h3>
              <p className="text-slate-500 mb-6">Add your first inspection to get started</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Inspection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredInspections.map((inspection) => (
              <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{inspection.inspection_type}</h3>
                        <Badge className={getStatusColor(inspection.status)}>
                          {inspection.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-500 mb-3">
                        {inspection.project_name || 'No project'}
                      </p>
                      
                      {inspection.findings && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {inspection.findings}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        {inspection.inspector_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{inspection.inspector_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleViewDetails(inspection)}
                      >
                        <FileText className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}