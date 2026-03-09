import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, ClipboardList, Calendar, User, Image as ImageIcon, Upload, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ActivityImage {
  id: string;
  activity_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

interface Activity {
  id: string;
  project_id: string;
  activity_name: string;
  description: string;
  activity_date: string;
  status: string;
  priority: string;
  assigned_to: string;
  images?: ActivityImage[];
}

interface Project {
  id: string;
  project_name: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newActivity, setNewActivity] = useState({
    project_id: '',
    activity_name: '',
    description: '',
    activity_date: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchActivities();
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

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('project_activities')
        .select('*, projects(project_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch images for each activity
      const activitiesWithImages = await Promise.all(
        (data || []).map(async (activity) => {
          const { data: images } = await supabase
            .from('activity_images')
            .select('*')
            .eq('activity_id', activity.id);
          return { ...activity, images: images || [] };
        })
      );

      setActivities(activitiesWithImages);
    } catch (error) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (activityId: string, userId: string) => {
    const uploadedImages: { image_url: string; file_name: string }[] = [];

    for (const file of selectedImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${activityId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('activity-images')
        .getPublicUrl(fileName);

      uploadedImages.push({ image_url: publicUrl, file_name: file.name });
    }

    // Save image records to database
    if (uploadedImages.length > 0) {
      const { error } = await supabase.from('activity_images').insert(
        uploadedImages.map((img) => ({
          activity_id: activityId,
          image_url: img.image_url,
          file_name: img.file_name,
        }))
      );

      if (error) {
        console.error('Error saving image records:', error);
      }
    }

    return uploadedImages.length;
  };

  const handleAddActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First create the activity
      const { data: activityData, error: activityError } = await supabase
        .from('project_activities')
        .insert([
          {
            user_id: user.id,
            ...newActivity,
          },
        ])
        .select()
        .single();

      if (activityError) throw activityError;

      // Then upload images if any
      if (selectedImages.length > 0 && activityData) {
        setUploading(true);
        const uploadedCount = await uploadImages(activityData.id, user.id);
        toast.success(`${uploadedCount} image(s) uploaded successfully`);
      }

      toast.success('Activity added successfully');
      setShowAddDialog(false);
      
      // Reset form
      setNewActivity({
        project_id: '',
        activity_name: '',
        description: '',
        activity_date: '',
        status: 'pending',
        priority: 'medium',
        assigned_to: '',
      });
      
      // Clear images
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);
      setUploading(false);
      
      fetchActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
      setUploading(false);
    }
  };

  const deleteActivityImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // userId/filename

      // Delete from storage
      await supabase.storage.from('activity-images').remove([fileName]);

      // Delete from database
      await supabase.from('activity_images').delete().eq('id', imageId);

      toast.success('Image deleted');
      fetchActivities();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Project Activities</h1>
            <p className="text-slate-500 mt-1">Manage and track project activities</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select
                    value={newActivity.project_id}
                    onValueChange={(value) => setNewActivity({ ...newActivity, project_id: value })}
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
                  <Label>Activity Name *</Label>
                  <Input
                    value={newActivity.activity_name}
                    onChange={(e) => setNewActivity({ ...newActivity, activity_name: e.target.value })}
                    placeholder="Enter activity name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Enter activity description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newActivity.activity_date}
                      onChange={(e) => setNewActivity({ ...newActivity, activity_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newActivity.status}
                      onValueChange={(value) => setNewActivity({ ...newActivity, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newActivity.priority}
                      onValueChange={(value) => setNewActivity({ ...newActivity, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newActivity.assigned_to}
                      onValueChange={(value) => setNewActivity({ ...newActivity, assigned_to: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Attach Images</Label>
                  <div className="mt-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-1" />
                      <p className="text-sm text-slate-500">Click to upload images</p>
                      <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB each</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-600 mb-2">
                        {imagePreviews.length} image(s) selected:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeSelectedImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              type="button"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddActivity} disabled={uploading}>
                  {uploading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Uploading...
                    </>
                  ) : (
                    'Add Activity'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : activities.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Activities Yet</h3>
              <p className="text-slate-500 mb-6">Add your first project activity</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900">{activity.activity_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      {(activity as any).projects?.project_name && (
                        <p className="text-sm text-blue-600 mb-2">{(activity as any).projects.project_name}</p>
                      )}
                      <p className="text-slate-600 text-sm mb-4">{activity.description}</p>
                      
                      {/* Display Activity Images */}
                      {activity.images && activity.images.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {activity.images.length} image(s)
                          </p>
                          <div className="grid grid-cols-6 gap-2">
                            {activity.images.map((image) => (
                              <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                <img
                                  src={image.image_url}
                                  alt={image.file_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <button
                                  onClick={() => deleteActivityImage(image.id, image.image_url)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        {activity.activity_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(activity.activity_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {activity.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{activity.assigned_to}</span>
                          </div>
                        )}
                        <span className={`font-medium ${getPriorityColor(activity.priority)}`}>
                          {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)} Priority
                        </span>
                      </div>
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