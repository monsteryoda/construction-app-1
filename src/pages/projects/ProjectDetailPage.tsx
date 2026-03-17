import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, Upload, ImageIcon, Calendar, FileText, Users, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  project_name: string;
  contract_number: string;
  client: string;
  consultant: string;
  contractor: string;
  contract_period: number;
  date_of_commence: string;
  date_of_completion: string;
  defect_liability_period: number;
  project_image_url: string;
  status: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    project_name: '',
    contract_number: '',
    client: '',
    consultant: '',
    contractor: '',
    contract_period: '',
    date_of_commence: '',
    date_of_completion: '',
    defect_liability_period: '',
    project_image_url: '',
  });

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProject(data);
        setFormData({
          project_name: data.project_name || '',
          contract_number: data.contract_number || '',
          client: data.client || '',
          consultant: data.consultant || '',
          contractor: data.contractor || '',
          contract_period: data.contract_period?.toString() || '',
          date_of_commence: data.date_of_commence || '',
          date_of_completion: data.date_of_completion || '',
          defect_liability_period: data.defect_liability_period?.toString() || '',
          project_image_url: data.project_image_url || '',
        });
        setPreviewImage(data.project_image_url || null);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, project_image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, project_image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...formData,
          contract_period: parseInt(formData.contract_period) || 0,
          defect_liability_period: parseInt(formData.defect_liability_period) || 0,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Project updated successfully');
      setProject(prev => prev ? { ...prev, ...formData } : null);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
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

  if (!project) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button onClick={() => navigate('/projects')} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12">
            <p className="text-slate-500">Project not found</p>
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
              <h1 className="text-3xl font-bold text-slate-900">Project Details</h1>
              <p className="text-slate-500 mt-1">Manage your construction project information</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Image Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="w-5 h-5" />
                Project Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  {previewImage ? (
                    <>
                      <img
                        src={previewImage}
                        alt="Project preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        type="button"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">No image available</p>
                    </div>
                  )}
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-16 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-500">Upload Image</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full inline-block"></span>
                    Uploading...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Information Section */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_name">Project Name *</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_number">Contract Number</Label>
                  <Input
                    id="contract_number"
                    value={formData.contract_number}
                    onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultant">Consultant</Label>
                  <Input
                    id="consultant"
                    value={formData.consultant}
                    onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractor">Contractor</Label>
                  <Input
                    id="contractor"
                    value={formData.contractor}
                    onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_period">Contract Period (months)</Label>
                  <Input
                    id="contract_period"
                    type="number"
                    value={formData.contract_period}
                    onChange={(e) => setFormData({ ...formData, contract_period: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_commence">Date of Commencement</Label>
                  <Input
                    id="date_of_commence"
                    type="date"
                    value={formData.date_of_commence}
                    onChange={(e) => setFormData({ ...formData, date_of_commence: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_completion">Date of Completion</Label>
                  <Input
                    id="date_of_completion"
                    type="date"
                    value={formData.date_of_completion}
                    onChange={(e) => setFormData({ ...formData, date_of_completion: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="defect_liability_period">Defect Liability Period (months)</Label>
                  <Input
                    id="defect_liability_period"
                    type="number"
                    value={formData.defect_liability_period}
                    onChange={(e) => setFormData({ ...formData, defect_liability_period: e.target.value })}
                    placeholder="e.g., 12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Summary Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5" />
              Project Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Status</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Contract Period</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{project.contract_period} months</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {project.date_of_commence ? new Date(project.date_of_commence).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Completion</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {project.date_of_completion ? new Date(project.date_of_completion).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}