import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Building2, Calendar, FileText, ImageIcon, Upload, X, ArrowRight } from 'lucide-react';
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

// Separate component for project image to handle loading states
function ProjectImage({ imageUrl, projectName }: { imageUrl: string | null; projectName: string }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!imageUrl || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <ImageIcon className="w-16 h-16 text-slate-400 mb-2" />
        <span className="text-sm text-slate-500">No image available</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={projectName}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => {
          console.error('Image failed to load:', imageUrl);
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [newProject, setNewProject] = useState({
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
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[handleFileSelect] File selected:', file.name, file.size);

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const base64 = await fileToBase64(file);
      setPreviewImage(base64);
      setNewProject(prev => ({ ...prev, project_image_url: base64 }));
      toast.success('Image selected successfully');
    } catch (error) {
      console.error('[handleFileSelect] Error converting image:', error);
      toast.error('Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setNewProject(prev => ({ ...prev, project_image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddProject = async () => {
    // Validate required fields
    if (!newProject.project_name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error, data: insertData } = await supabase.from('projects').insert([
        {
          user_id: user.id,
          ...newProject,
          contract_period: parseInt(newProject.contract_period) || 0,
          defect_liability_period: parseInt(newProject.defect_liability_period) || 0,
        },
      ]).select();

      if (error) {
        throw error;
      }

      toast.success('Project added successfully');
      setShowAddDialog(false);
      setPreviewImage(null);
      setNewProject({
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
      fetchProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Failed to add project');
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/inspection/${projectId}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
            <p className="text-slate-500 mt-1">Manage your construction projects</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Project Name *</Label>
                  <Input
                    value={newProject.project_name}
                    onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contract Number</Label>
                  <Input
                    value={newProject.contract_number}
                    onChange={(e) => setNewProject({ ...newProject, contract_number: e.target.value })}
                    placeholder="Enter contract number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input
                    value={newProject.client}
                    onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                    placeholder="Enter client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Consultant</Label>
                  <Input
                    value={newProject.consultant}
                    onChange={(e) => setNewProject({ ...newProject, consultant: e.target.value })}
                    placeholder="Enter consultant name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contractor</Label>
                  <Input
                    value={newProject.contractor}
                    onChange={(e) => setNewProject({ ...newProject, contractor: e.target.value })}
                    placeholder="Enter contractor name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contract Period (months)</Label>
                  <Input
                    type="number"
                    value={newProject.contract_period}
                    onChange={(e) => setNewProject({ ...newProject, contract_period: e.target.value })}
                    placeholder="Enter contract period"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Commencement</Label>
                  <Input
                    type="date"
                    value={newProject.date_of_commence}
                    onChange={(e) => setNewProject({ ...newProject, date_of_commence: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Completion</Label>
                  <Input
                    type="date"
                    value={newProject.date_of_completion}
                    onChange={(e) => setNewProject({ ...newProject, date_of_completion: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Defect Liability Period (months)</Label>
                  <Input
                    type="number"
                    value={newProject.defect_liability_period}
                    onChange={(e) => setNewProject({ ...newProject, defect_liability_period: e.target.value })}
                    placeholder="Enter defect liability period"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Project Image</Label>
                  <div className="mt-2">
                    {previewImage || newProject.project_image_url ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={previewImage || newProject.project_image_url}
                          alt="Project preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                      >
                        <Upload className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Click to upload project image</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
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
                        Processing image...
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProject}>Add Project</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Projects Yet</h3>
              <p className="text-slate-500 mb-6">Start by adding your first construction project</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 relative bg-slate-100">
                  <ProjectImage 
                    imageUrl={project.project_image_url} 
                    projectName={project.project_name} 
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-slate-900">{project.project_name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="w-4 h-4" />
                    <span>Contract: {project.contract_number || 'N/A'}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="text-slate-500">Client: </span>
                    <span className="text-slate-900">{project.client || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{project.date_of_commence ? new Date(project.date_of_commence).toLocaleDateString() : 'No start date'}</span>
                    </div>
                    <Button variant="ghost" className="gap-1 text-slate-600" onClick={() => handleViewProject(project.id)}>
                      View <ArrowRight className="w-4 h-4" />
                    </Button>
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