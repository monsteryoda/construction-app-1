import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import ActivityCard from '@/components/activities/ActivityCard';
import ActivityForm from '@/components/activities/ActivityForm';
import { uploadImages, deleteRemark } from '@/components/activities/ActivityActions';
import { Activity, Project } from '@/components/activities/ActivityTypes';

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemarkDialog, setShowRemarkDialog] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [newRemark, setNewRemark] = useState('');

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

      console.log('[fetchActivities] Fetched activities:', data);

      const activitiesWithDetails = await Promise.all(
        (data || []).map(async (activity) => {
          const { data: images, error: imagesError } = await supabase
            .from('activity_images')
            .select('*')
            .eq('activity_id', activity.id);

          if (imagesError) {
            console.error(`[fetchActivities] Error fetching images for activity ${activity.id}:`, imagesError);
          }

          const { data: remarks, error: remarksError } = await supabase
            .from('activity_remarks')
            .select('*')
            .eq('activity_id', activity.id)
            .order('created_at', { ascending: false });

          if (remarksError) {
            console.error(`[fetchActivities] Error fetching remarks for activity ${activity.id}:`, remarksError);
          }

          console.log(`[fetchActivities] Activity ${activity.id} has ${images?.length || 0} images and ${remarks?.length || 0} remarks`);
          
          return { ...activity, images: images || [], remarks: remarks || [] };
        })
      );

      console.log('[fetchActivities] Final activities with details:', activitiesWithDetails);
      setActivities(activitiesWithDetails);
    } catch (error) {
      console.error('[fetchActivities] Error:', error);
      toast.error('Failed to fetch activities');
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

  const handleAddActivity = async (activity: any, images: File[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('[handleAddActivity] Creating activity with data:', activity);
      console.log('[handleAddActivity] Images to upload:', images.length);

      const { data: activityData, error: activityError } = await supabase
        .from('project_activities')
        .insert([{ user_id: user.id, ...activity }])
        .select()
        .single();

      if (activityError) {
        console.error('[handleAddActivity] Error creating activity:', activityError);
        throw activityError;
      }

      console.log('[handleAddActivity] Activity created:', activityData);

      if (images.length > 0 && activityData) {
        console.log('[handleAddActivity] Uploading images...');
        const uploadedCount = await uploadImages(activityData.id, user.id, images);
        console.log('[handleAddActivity] Uploaded count:', uploadedCount);
        toast.success(`${uploadedCount} image(s) uploaded successfully`);
      }

      toast.success('Activity added successfully');
      setShowAddDialog(false);
      fetchActivities();
    } catch (error) {
      console.error('[handleAddActivity] Error:', error);
      toast.error('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Activity deleted successfully');
      fetchActivities();
    } catch (error) {
      console.error('[handleDeleteActivity] Error:', error);
      toast.error('Failed to delete activity');
    }
  };

  const handleAddRemark = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!newRemark.trim()) {
        toast.error('Please enter a remark');
        return;
      }

      const { error } = await supabase
        .from('activity_remarks')
        .insert([{ activity_id: selectedActivityId, remark: newRemark, created_by: user.id }]);

      if (error) throw error;

      toast.success('Remark added successfully');
      setShowRemarkDialog(false);
      setNewRemark('');
      fetchActivities();
    } catch (error) {
      console.error('Error adding remark:', error);
      toast.error('Failed to add remark');
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
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        </div>

        <ActivityForm
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddActivity}
          projects={projects}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : activities.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Activities Yet</h3>
              <p className="text-slate-500 mb-6">Add your first project activity to get started</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Activity
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onAddRemark={(id) => {
                  setSelectedActivityId(id);
                  setShowRemarkDialog(true);
                }}
                onDeleteRemark={deleteRemark}
                onDeleteActivity={handleDeleteActivity}
              />
            ))}
          </div>
        )}

        <Dialog open={showRemarkDialog} onOpenChange={setShowRemarkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Remark</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Remark</Label>
                <textarea
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  placeholder="Enter remark..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRemarkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRemark}>Add Remark</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}