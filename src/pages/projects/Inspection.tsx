import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import InspectionForm from './InspectionForm';
import InspectionSummary from './InspectionSummary';
import InspectionPhotos from './InspectionPhotos';
import InspectionRemarks from './InspectionRemarks';
import AddRemarkDialog from './AddRemarkDialog';
import ImagePreviewDialog from './ImagePreviewDialog';

interface Project {
  id: string;
  project_name: string;
}

interface InspectionImage {
  id: string;
  inspection_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

interface Remark {
  id: string;
  remark: string;
  created_by: string;
  created_at: string;
}

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
  created_at: string;
  updated_at: string;
  work_category?: string;
  contractor?: string;
  description?: string;
  zone?: string;
  location?: string;
  inspection_time?: string;
  intended_date?: string;
  intended_time?: string;
  site_manager?: string;
  safety_officer?: string;
  quality_control?: string;
  remarks?: string;
  next_inspection_date?: string;
  priority?: string;
  main_image_url?: string;
  main_image_file_name?: string;
  images?: InspectionImage[];
  remarks_list?: Remark[];
  projects?: Project;
}

export default function Inspection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showRemarkDialog, setShowRemarkDialog] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchInspection(id);
    }
    fetchProjects();
  }, [id]);

  useEffect(() => {
    setNewRemark('');
  }, [id]);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('projects')
        .select('id, project_name')
        .eq('user_id', user.id);

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchInspection = async (inspectionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          *,
          projects (
            id,
            project_name
          ),
          inspection_images (
            id,
            image_url,
            file_name,
            created_at
          ),
          activity_remarks (
            id,
            remark,
            created_by,
            created_at
          )
        `)
        .eq('id', inspectionId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setInspection({
          ...data,
          images: data.inspection_images || [],
          remarks_list: data.activity_remarks || [],
        });
      }
    } catch (error) {
      console.error('Error fetching inspection:', error);
      toast.error('Failed to load inspection details');
    } finally {
      setLoading(false);
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
          setPreviewImages(prev => [...prev, ...validPreviews]);
          toast.success(`Added ${validFiles.length} image(s)`);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMoreImages = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('inspections')
        .update({
          findings: inspection?.findings || '',
          recommendations: inspection?.recommendations || '',
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Inspection updated successfully');
    } catch (error) {
      console.error('Error saving inspection:', error);
      toast.error('Failed to save inspection');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim() || !id) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('activity_remarks')
        .insert([{
          activity_id: id,
          remark: newRemark.trim(),
          created_by: user.id,
        }]);

      if (error) throw error;

      toast.success('Remark added successfully');
      setShowRemarkDialog(false);
      setNewRemark('');
      fetchInspection(id);
    } catch (error) {
      console.error('Error adding remark:', error);
      toast.error('Failed to add remark');
    }
  };

  const handleDeleteRemark = async (remarkId: string) => {
    try {
      const { error } = await supabase
        .from('activity_remarks')
        .delete()
        .eq('id', remarkId);

      if (error) throw error;

      toast.success('Remark deleted successfully');
      fetchInspection(id);
    } catch (error) {
      console.error('Error deleting remark:', error);
      toast.error('Failed to delete remark');
    }
  };

  const handleUploadImages = async () => {
    if (!id || selectedImages.length === 0) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      for (const image of selectedImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/inspections/${id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('inspection_images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('inspection_images')
          .getPublicUrl(filePath);

        await supabase
          .from('inspection_images')
          .insert({
            inspection_id: id,
            image_url: publicUrl,
            file_name: image.name,
          });
      }

      toast.success(`${selectedImages.length} image(s) uploaded successfully`);
      setSelectedImages([]);
      setPreviewImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchInspection(id);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const formatRemarkDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!inspection) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button onClick={() => navigate('/projects')} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12">
            <p className="text-slate-500">Inspection not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/projects')} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Inspection Details</h1>
              <p className="text-slate-500 mt-1">View and manage inspection information</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InspectionForm
            inspection={inspection}
            onInspectionChange={setInspection}
          />
          <InspectionSummary inspection={inspection} />
        </div>

        <InspectionPhotos
          previewImages={previewImages}
          selectedImages={selectedImages}
          uploading={uploading}
          onFileSelect={handleFileSelect}
          onRemoveImage={handleRemoveImage}
          onAddMoreImages={handleAddMoreImages}
          onUploadImages={handleUploadImages}
          fileInputRef={fileInputRef}
        />

        <InspectionRemarks
          remarksList={inspection.remarks_list || []}
          onAddRemark={() => setShowRemarkDialog(true)}
          onDeleteRemark={handleDeleteRemark}
          formatRemarkDate={formatRemarkDate}
        />

        <AddRemarkDialog
          isOpen={showRemarkDialog}
          onClose={() => setShowRemarkDialog(false)}
          newRemark={newRemark}
          onRemarkChange={setNewRemark}
          onAddRemark={handleAddRemark}
        />

        <ImagePreviewDialog
          isOpen={showImageDialog}
          onClose={() => setShowImageDialog(false)}
          images={previewImages}
          selectedImageIndex={selectedImageIndex}
          onPrevious={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}
          onNext={() => setSelectedImageIndex(prev => Math.min(previewImages.length - 1, prev + 1))}
        />
      </div>
    </DashboardLayout>
  );
}