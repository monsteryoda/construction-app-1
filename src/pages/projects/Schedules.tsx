import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import ScheduleCard from '@/components/schedules/ScheduleCard';
import ScheduleForm from '@/components/schedules/ScheduleForm';
import { uploadImages, deleteScheduleImage } from '@/components/schedules/ScheduleActions';
import { Schedule, Project } from '@/components/schedules/ScheduleTypes';

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

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

  const handleAddSchedule = async (schedule: any, images: File[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First create the schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('project_schedules')
        .insert([{
          user_id: user.id,
          ...schedule,
          progress: parseInt(schedule.progress) || 0,
        }])
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Then upload images if any
      if (images.length > 0 && scheduleData) {
        const uploadedCount = await uploadImages(scheduleData.id, user.id, images);
        toast.success(`${uploadedCount} image(s) uploaded successfully`);
      }

      toast.success('Schedule added successfully');
      setShowAddDialog(false);
      
      // Reset form
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to add schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      // Get all images for this schedule
      const { data: images, error: fetchError } = await supabase
        .from('schedule_images')
        .select('image_url')
        .eq('schedule_id', scheduleId);

      if (fetchError) throw fetchError;

      // Delete images from storage
      if (images && images.length > 0) {
        for (const image of images) {
          if (image.image_url) {
            const filePath = image.image_url.split('/storage/v1/object/public/schedule_images/')[1];
            if (filePath) {
              await supabase.storage
                .from('schedule_images')
                .remove([filePath]);
            }
          }
        }
      }

      // Delete images from database
      await supabase
        .from('schedule_images')
        .delete()
        .eq('schedule_id', scheduleId);

      // Delete schedule
      const { error: deleteError } = await supabase
        .from('project_schedules')
        .delete()
        .eq('id', scheduleId);

      if (deleteError) throw deleteError;

      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
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
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Schedule
          </Button>
        </div>

        <ScheduleForm
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddSchedule}
          projects={projects}
        />

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
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onDeleteImage={deleteScheduleImage}
                onDelete={() => handleDeleteSchedule(schedule.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}