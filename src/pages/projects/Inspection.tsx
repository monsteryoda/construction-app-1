import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, Upload, ImageIcon, Calendar, FileText, Users, Clock, AlertCircle, CheckCircle2, MessageSquare, X, Eye, Download, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>('');
  const [newRemark, setNewRemark] = useState('');
  const [remarkAdded, setRemarkAdded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchInspection(id);
    }
    fetchProjects();
  }, [id]);

  useEffect(() => {
    setNewRemark('');
    setRemarkAdded(false);
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

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('inspection_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Image deleted successfully');
      fetchInspection(id);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'normal':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
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
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardCheck className="w-5 h-5" />
                Inspection Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Inspection Type</Label>
                  <Input
                    value={inspection.inspection_type || ''}
                    onChange={(e) => setInspection({ ...inspection, inspection_type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inspection Date</Label>
                  <Input
                    type="date"
                    value={inspection.inspection_date || ''}
                    onChange={(e) => setInspection({ ...inspection, inspection_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Inspector Name</Label>
                  <Input
                    value={inspection.inspector_name || ''}
                    onChange={(e) => setInspection({ ...inspection, inspector_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={inspection.priority}
                    onValueChange={(value) => setInspection({ ...inspection, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Category</Label>
                  <Input
                    value={inspection.work_category || ''}
                    onChange={(e) => setInspection({ ...inspection, work_category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contractor</Label>
                  <Input
                    value={inspection.contractor || ''}
                    onChange={(e) => setInspection({ ...inspection, contractor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Input
                    value={inspection.zone || ''}
                    onChange={(e) => setInspection({ ...inspection, zone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={inspection.location || ''}
                    onChange={(e) => setInspection({ ...inspection, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Findings</Label>
                <Textarea
                  value={inspection.findings || ''}
                  onChange={(e) => setInspection({ ...inspection, findings: e.target.value })}
                  placeholder="Enter inspection findings..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Recommendations</Label>
                <Textarea
                  value={inspection.recommendations || ''}
                  onChange={(e) => setInspection({ ...inspection, recommendations: e.target.value })}
                  placeholder="Enter recommendations..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5" />
                Inspection Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status?.replace('_', ' ')?.toUpperCase() || 'PENDING'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Priority</span>
                  <Badge className={getPriorityColor(inspection.priority)}>
                    {inspection.priority?.toUpperCase() || 'NORMAL'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Project</span>
                  <span className="text-sm font-medium text-slate-900">
                    {inspection.projects?.project_name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Inspection Date</span>
                  <span className="text-sm font-medium text-slate-900">
                    {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Inspector</span>
                  <span className="text-sm font-medium text-slate-900">
                    {inspection.inspector_name || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="w-5 h-5" />
              Inspection Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setShowImageDialog(true);
                      }}
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={handleAddMoreImages}
                  className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAddMoreImages();
                    }
                  }}
                >
                  <Plus className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Add More</p>
                </div>
              </div>
            ) : (
              <div
                onClick={handleAddMoreImages}
                className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAddMoreImages();
                  }
                }}
              >
                <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Click to attach photos</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploading && (
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full inline-block"></span>
                Uploading images...
              </p>
            )}
            {previewImages.length > 0 && (
              <Button
                onClick={handleUploadImages}
                disabled={uploading}
                className="mt-4 gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              Remarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {inspection.remarks_list?.length || 0} remark(s)
                </span>
              </div>
              <Button
                onClick={() => {
                  setSelectedInspectionId(id);
                  setShowRemarkDialog(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Remark
              </Button>
            </div>

            {inspection.remarks_list && inspection.remarks_list.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inspection.remarks_list.map((remark) => (
                  <div key={remark.id} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700">{remark.remark}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">
                        {formatRemarkDate(remark.created_at)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRemark(remark.id)}
                        className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No remarks yet</p>
            )}
          </CardContent>
        </Card>

        {showRemarkDialog && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRemarkDialog(false)}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Add Remark</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRemarkDialog(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Remark</Label>
                    <Textarea
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      placeholder="Enter remark..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRemarkDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddRemark}>Add Remark</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showImageDialog && (previewImages.length > 0 || inspection.images?.length > 0) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageDialog(false)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Inspection Photos</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    Image {selectedImageIndex + 1} of {previewImages.length}
                  </span>
                  <button
                    onClick={() => setShowImageDialog(false)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <img
                  src={previewImages[selectedImageIndex]}
                  alt={`Inspection photo ${selectedImageIndex + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between p-4 border-t bg-slate-50">
                <div className="flex gap-2">
                  {selectedImageIndex > 0 && (
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev - 1)}
                      className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
                    >
                      Previous
                    </button>
                  )}
                  {selectedImageIndex < previewImages.length - 1 && (
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev + 1)}
                      className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}