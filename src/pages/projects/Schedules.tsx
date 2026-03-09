import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Calendar, CheckCircle, Image as ImageIcon, Upload, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleImage {
  id: string;
  schedule_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

interface Schedule {
  id: string;
  project_id: string;
  task_name: string;
  description: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  dependencies: string;
  images?: ScheduleImage[];
}

interface Project {
  id: string;
  project_name: string;
}

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSchedule, setNewSchedule] = useState({
    project_id: '',
    task_name: '',
    description: '',
    start_date: '',
    end_date: '',
    progress: '0',
    status: 'not_started',
    dependencies: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchSchedules();
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

  const fetchSchedules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('project_schedules')
        .select('*, projects(project_name)')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Fetch images for each schedule
      const schedulesWithImages = await Promise.all(
        (data || []).map(async (schedule) => {
          const { data: images } = await supabase
            .from('schedule_images')
            .select('*')
            .eq('schedule_id', schedule.id);
          return { ...schedule, images: images || [] };
        })
      );

      setSchedules(schedulesWithImages);
    } catch (error) {
      toast.error('Failed to fetch schedules');
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

  const uploadImages = async (scheduleId: string, userId: string) => {
    const uploadedImages: { image_url: string; file_name: string }[] = [];

    for (const file of selectedImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${scheduleId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('schedule-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('schedule-images')
        .getPublicUrl(fileName);

      uploadedImages.push({ image_url: publicUrl, file_name: file.name });
    }

    // Save image records to database
    if (uploadedImages.length > 0) {
      const { error } = await supabase.from('schedule_images').insert(
        uploadedImages.map((img) => ({
          schedule_id: scheduleId,
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

  const deleteScheduleImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // userId/filename

      // Delete from storage
      await supabase.storage.from('schedule-images').remove([fileName]);

      // Delete from database
      await supabase.from('schedule_images').delete().eq('id', imageId);

      toast.success('Image deleted');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleAddSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First create the schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('project_schedules')
        .insert([
          {
            user_id: user.id,
            ...newSchedule,
            progress: parseInt(newSchedule.progress) || 0,
          },
        ])
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Then upload images if any
      if (selectedImages.length > 0 && scheduleData) {
        setUploading(true);
        const uploadedCount = await uploadImages(scheduleData.id, user.id);
        toast.success(`${uploadedCount} image(s) uploaded successfully`);
      }

      toast.success('Schedule added successfully');
      setShowAddDialog(false);
      
      // Reset form
      setNewSchedule({
        project_id: '',
        task_name: '',
        description: '',
        start_date: '',
        end_date: '',
        progress: '0',
        status: 'not_started',
        dependencies: '',
      });
      
      // Clear images
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);
      setUploading(false);
      
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to add schedule');
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'not_started':
        return 'bg-slate-100 text-slate-700';
      case 'delayed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Project Schedules</h1>
            <p className="text-slate-500 mt-1">Manage project timelines and schedules</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Schedule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select
                    value={newSchedule.project_id}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, project_id: value })}
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
                  <Label>Task Name *</Label>
                  <Input
                    value={newSchedule.task_name}
                    onChange={(e) => setNewSchedule({ ...newSchedule, task_name: e.target.value })}
                    placeholder="Enter task name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                    placeholder="Enter task description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newSchedule.start_date}
                      onChange={(e) => setNewSchedule({ ...newSchedule, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newSchedule.end_date}
                      onChange={(e) => setNewSchedule({ ...newSchedule, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Progress (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newSchedule.progress}
                      onChange={(e) => setNewSchedule({ ...newSchedule, progress: e.target.value })}
                      placeholder="0-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newSchedule.status}
                      onValueChange={(value) => setNewSchedule({ ...newSchedule, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dependencies</Label>
                  <Input
                    value={newSchedule.dependencies}
                    onChange={(e) => setNewSchedule({ ...newSchedule, dependencies: e.target.value })}
                    placeholder="Enter task dependencies"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Images</Label>
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
                <Button onClick={handleAddSchedule} disabled={uploading}>
                  {uploading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Uploading...
                    </>
                  ) : (
                    'Add Schedule'
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
        ) : schedules.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Schedules Yet</h3>
              <p className="text-slate-500 mb-6">Add your first project schedule</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900">{schedule.task_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                          {schedule.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      {(schedule as any).projects?.project_name && (
                        <p className="text-sm text-blue-600">{(schedule as any).projects.project_name}</p>
                      )}
                      <p className="text-slate-600 text-sm">{schedule.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-slate-900">{schedule.progress}%</span>
                    </div>
                  </div>
                  
                  <Progress value={schedule.progress} className="mb-4" />
                  
                  {/* Display Schedule Images */}
                  {schedule.images && schedule.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {schedule.images.length} image(s)
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {schedule.images.map((image) => (
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
                              onClick={() => deleteScheduleImage(image.id, image.image_url)}
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

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {schedule.start_date ? new Date(schedule.start_date).toLocaleDateString() : 'N/A'} 
                        {' - '}
                        {schedule.end_date ? new Date(schedule.end_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {schedule.dependencies && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Dependencies:</span>
                        <span>{schedule.dependencies}</span>
                      </div>
                    )}
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