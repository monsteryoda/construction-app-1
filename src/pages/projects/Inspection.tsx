"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Search, ClipboardCheck, Calendar, User, Image as ImageIcon, X, AlertCircle, Mail, Building, Printer, Save, Eye, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import InspectionForm from '@/components/inspections/InspectionForm';
import InspectionList from '@/components/inspections/InspectionList';
import InspectionDetails from '@/components/inspections/InspectionDetails';

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
  email?: string;
  client?: string;
  consultant?: string;
  project_name?: string;
  work_category?: string;
  contractor?: string;
  description?: string;
  zone?: string;
  location?: string;
  inspection_time?: string;
  intended_date?: string;
  intended_time?: string;
  references?: string;
  tracking?: string;
  created_at: string;
  updated_at: string;
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
  const [rwiSerialNo, setRwiSerialNo] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [trackingNo, setTrackingNo] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchInspections();
    generateRwiSerialNo();
    generateReferenceNo();
    generateTrackingNo();
  }, []);

  const generateRwiSerialNo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      const count = data?.length || 0;
      const year = new Date().getFullYear().toString().slice(-2);
      const serial = count + 1;
      const formattedSerial = serial.toString().padStart(2, '0');
      
      setRwiSerialNo(`URSB/KA-T/${year}/35-${formattedSerial}`);
    } catch (error) {
      console.error('Error generating RWI serial no:', error);
      const year = new Date().getFullYear().toString().slice(-2);
      setRwiSerialNo(`URSB/KA-T/${year}/35-01`);
    }
  };

  const generateReferenceNo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select('references')
        .eq('user_id', user.id)
        .not('references', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastRef = data[0].references;
        const match = lastRef?.match(/REF-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      setReferenceNo(`REF-${nextNumber.toString().padStart(3, '0')}`);
    } catch (error) {
      console.error('Error generating reference no:', error);
      setReferenceNo('REF-001');
    }
  };

  const generateTrackingNo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select('tracking')
        .eq('user_id', user.id)
        .not('tracking', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastTrack = data[0].tracking;
        const match = lastTrack?.match(/TRK-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      setTrackingNo(`TRK-${nextNumber.toString().padStart(3, '0')}`);
    } catch (error) {
      console.error('Error generating tracking no:', error);
      setTrackingNo('TRK-001');
    }
  };

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
        .select('*, projects(project_name, client, consultant)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      setImagesLoading(true);
      
      const { data, error } = await supabase
        .from('inspection_images')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching images:', error);
        setInspectionImages([]);
        toast.error('Failed to load images');
        return;
      }
      
      setInspectionImages(data || []);
    } catch (error) {
      console.error('Error:', error);
      setInspectionImages([]);
      toast.error('Error loading images');
    } finally {
      setImagesLoading(false);
    }
  };

  const handleAddInspection = async (formData: any, images: File[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const inspectionData = {
        user_id: user.id,
        project_id: formData.project_id,
        inspection_type: formData.work_category,
        inspection_date: formData.inspection_date,
        inspector_name: formData.inspector_name,
        status: formData.status,
        findings: formData.findings,
        recommendations: formData.recommendations,
        email: formData.email,
        client: formData.client,
        consultant: formData.consultant,
        references: formData.references,
        tracking: formData.tracking,
      };

      const { data, error } = await supabase
        .from('inspections')
        .insert([inspectionData])
        .select()
        .single();

      if (error) throw error;

      // Upload images if any
      if (images.length > 0) {
        let uploadedCount = 0;
        let failedCount = 0;

        for (const file of images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('inspection_images')
            .upload(`${data.id}/${fileName}`, file);

          if (uploadError) {
            failedCount++;
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('inspection_images')
            .getPublicUrl(uploadData.path);

          const { error: dbError } = await supabase
            .from('inspection_images')
            .insert([{
              inspection_id: data.id,
              image_url: publicUrl,
              file_name: fileName,
            }]);

          if (dbError) {
            failedCount++;
          } else {
            uploadedCount++;
          }
        }

        if (uploadedCount > 0) {
          toast.success(`${uploadedCount} image(s) uploaded successfully`);
        }
        if (failedCount > 0) {
          toast.warning(`${failedCount} image(s) failed to upload`);
        }
      }

      toast.success('Inspection added successfully');
      setShowAddDialog(false);
      generateRwiSerialNo();
      generateReferenceNo();
      generateTrackingNo();
      fetchInspections();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save inspection');
    }
  };

  const handleUpdateInspection = async (formData: any, images: File[], editingId: string) => {
    try {
      const inspectionData = {
        project_id: formData.project_id,
        inspection_type: formData.work_category,
        inspection_date: formData.inspection_date,
        inspector_name: formData.inspector_name,
        status: formData.status,
        findings: formData.findings,
        recommendations: formData.recommendations,
        email: formData.email,
        client: formData.client,
        consultant: formData.consultant,
        references: formData.references,
        tracking: formData.tracking,
      };

      const { data, error } = await supabase
        .from('inspections')
        .update(inspectionData)
        .eq('id', editingId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Inspection updated successfully');
      setShowAddDialog(false);
      generateRwiSerialNo();
      generateReferenceNo();
      generateTrackingNo();
      fetchInspections();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update inspection');
    }
  };

  const handleViewDetails = async (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setInspectionImages([]);
    await fetchInspectionImages(inspection.id);
    setShowDetailsDialog(true);
  };

  const handleUpdateStatus = async (inspectionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('inspections')
        .update({ status: newStatus })
        .eq('id', inspectionId);

      if (error) throw error;
      
      toast.success(`Status updated to ${newStatus}`);
      fetchInspections();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.inspection_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.email?.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inspections</h1>
            <p className="text-slate-500 mt-1">Track and manage project inspections</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Inspection
            </Button>
          </div>
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

        {/* Inspection List */}
        <InspectionList
          inspections={filteredInspections}
          loading={loading}
          onViewDetails={handleViewDetails}
          onUpdateStatus={handleUpdateStatus}
          onPrint={handlePrint}
          getStatusColor={getStatusColor}
        />

        {/* Add/Edit Inspection Dialog */}
        <InspectionForm
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddInspection}
          onUpdate={handleUpdateInspection}
          projects={projects}
          rwiSerialNo={rwiSerialNo}
          referenceNo={referenceNo}
          trackingNo={trackingNo}
          editingId={null}
        />

        {/* View Details Dialog */}
        <InspectionDetails
          isOpen={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
          inspection={selectedInspection}
          images={inspectionImages}
          imagesLoading={imagesLoading}
          rwiSerialNo={rwiSerialNo}
          referenceNo={referenceNo}
          trackingNo={trackingNo}
        />
      </div>
    </DashboardLayout>
  );
}