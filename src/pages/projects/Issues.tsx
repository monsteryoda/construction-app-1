import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, AlertCircle, Calendar, User, Flag, MessageSquare, Image, X } from 'lucide-react';
import { toast } from 'sonner';

interface Issue {
  id: string;
  project_id: string;
  issue_title: string;
  description: string;
  issue_type: string;
  severity: string;
  status: string;
  reported_by: string;
  assigned_to: string;
  reported_date: string;
  resolved_date: string;
  resolution_notes: string;
}

interface Project {
  id: string;
  project_name: string;
}

interface ImageAttachment {
  file: File;
  id: string;
  uploaded: boolean;
  url?: string;
  preview: string;
}

const issueTypes = ['Safety', 'Quality', 'Schedule', 'Cost', 'Design', 'General'];
const severities = ['Critical', 'High', 'Medium', 'Low'];
const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIssue, setNewIssue] = useState({
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
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
    fetchIssues();
  }, []);

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

  const fetchIssues = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('project_issues')
        .select('*, projects(project_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageAttachment[] = Array.from(files).map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      uploaded: false,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image && !image.uploaded) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const uploadedUrls: string[] = [];
    setIsUploading(true);

    for (const image of images) {
      if (image.uploaded && image.url) {
        uploadedUrls.push(image.url);
        continue;
      }

      const fileExt = image.file.name.split('.').pop();
      const filePath = `${user.id}/issues/${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(filePath, image.file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Failed to upload ${image.file.name}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('issue-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrlData.publicUrl);
      
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, uploaded: true, url: publicUrlData.publicUrl } : img
        )
      );
    }

    setIsUploading(false);
    return uploadedUrls;
  };

  const handleAddIssue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload images if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }

      const { data: issueData, error } = await supabase
        .from('project_issues')
        .insert([
          {
            user_id: user.id,
            ...newIssue,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Save image URLs to issue_images table if images were uploaded
      if (imageUrls.length > 0 && issueData) {
        const imageRecords = imageUrls.map((url) => ({
          issue_id: issueData.id,
          image_url: url,
          file_name: images.find((img) => img.url === url)?.file.name || 'image',
        }));

        const { error: imageError } = await supabase
          .from('issue_images')
          .insert(imageRecords);

        if (imageError) {
          console.error('Error saving image records:', imageError);
        }
      }

      toast.success('Issue added successfully');
      setShowAddDialog(false);
      setNewIssue({
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
      // Clean up preview URLs
      images.forEach((img) => {
        if (!img.uploaded) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setImages([]);
      fetchIssues();
    } catch (error) {
      toast.error('Failed to add issue');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'safety':
        return <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Flag className="w-5 h-5 text-red-600" /></div>;
      case 'quality':
        return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><AlertCircle className="w-5 h-5 text-blue-600" /></div>;
      default:
        return <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><MessageSquare className="w-5 h-5 text-slate-600" /></div>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Project Issues</h1>
            <p className="text-slate-500 mt-1">Track and resolve project issues</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report New Issue</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select
                    value={newIssue.project_id}
                    onValueChange={(value) => setNewIssue({ ...newIssue, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
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
                    value={newIssue.issue_title}
                    onChange={(e) => setNewIssue({ ...newIssue, issue_title: e.target.value })}
                    placeholder="Enter issue title"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                    placeholder="Describe the issue in detail"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issue Type</Label>
                  <Select
                    value={newIssue.issue_type}
                    onValueChange={(value) => setNewIssue({ ...newIssue, issue_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypes.map((type) => (
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
                    value={newIssue.severity}
                    onValueChange={(value) => setNewIssue({ ...newIssue, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severities.map((sev) => (
                        <SelectItem key={sev} value={sev.toLowerCase()}>
                          {sev}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newIssue.status}
                    onValueChange={(value) => setNewIssue({ ...newIssue, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((stat) => (
                        <SelectItem key={stat} value={stat.toLowerCase().replace(' ', '_')}>
                          {stat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reported By</Label>
                  <Input
                    value={newIssue.reported_by}
                    onChange={(e) => setNewIssue({ ...newIssue, reported_by: e.target.value })}
                    placeholder="Enter reporter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Input
                    value={newIssue.assigned_to}
                    onChange={(e) => setNewIssue({ ...newIssue, assigned_to: e.target.value })}
                    placeholder="Enter assignee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reported Date</Label>
                  <Input
                    type="date"
                    value={newIssue.reported_date}
                    onChange={(e) => setNewIssue({ ...newIssue, reported_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resolved Date</Label>
                  <Input
                    type="date"
                    value={newIssue.resolved_date}
                    onChange={(e) => setNewIssue({ ...newIssue, resolved_date: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Resolution Notes</Label>
                  <Textarea
                    value={newIssue.resolution_notes}
                    onChange={(e) => setNewIssue({ ...newIssue, resolution_notes: e.target.value })}
                    placeholder="Enter resolution notes"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="col-span-2 space-y-2">
                  <Label>Attachments (Images)</Label>
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload images or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF up to 10MB</p>
                  </div>
                  
                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-xs text-slate-500 mt-1 truncate">{image.file.name}</p>
                          <p className="text-xs text-slate-400">{formatFileSize(image.file.size)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddIssue} disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Report Issue'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : issues.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Issues Reported</h3>
              <p className="text-slate-500 mb-6">All projects are running smoothly</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-md transition-shadow border-l-4 border-l-slate-200" style={{ borderLeftColor: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'high' ? '#f97316' : issue.severity === 'medium' ? '#eab308' : '#22c55e' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {getTypeIcon(issue.issue_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{issue.issue_title}</h3>
                          {(issue as any).projects?.project_name && (
                            <p className="text-sm text-blue-600">{(issue as any).projects.project_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {issue.issue_type}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm mb-4">{issue.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        {issue.reported_by && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Reported by: {issue.reported_by}</span>
                          </div>
                        )}
                        {issue.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Assigned to: {issue.assigned_to}</span>
                          </div>
                        )}
                        {issue.reported_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(issue.reported_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {issue.resolution_notes && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Resolution: </span>
                            {issue.resolution_notes}
                          </p>
                        </div>
                      )}
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