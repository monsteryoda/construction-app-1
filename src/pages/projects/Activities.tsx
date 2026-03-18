"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/components/activities/ActivityTypes';
import ActivityCard from '@/components/activities/ActivityCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemarkDialog, setShowRemarkDialog] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const [newActivity, setNewActivity] = useState({
    project_id: '',
    activity_name: '',
    description: '',
    activity_date: '',
    end_date: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: ''
  });

  const [newRemark, setNewRemark] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_activities')
        .select(`
          *,
          projects (
            project_name
          ),
          activity_images (
            id,
            image_url,
            file_name
          ),
          activity_remarks (
            id,
            remark,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const activitiesWithImages = data.map(activity => ({
        ...activity,
        images: activity.activity_images || [],
        remarks: activity.activity_remarks || []
      }));

      setActivities(activitiesWithImages);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch activities',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('project_activities')
        .insert([{
          ...newActivity,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Activity created successfully'
      });

      setShowAddDialog(false);
      setNewActivity({
        project_id: '',
        activity_name: '',
        description: '',
        activity_date: '',
        end_date: '',
        status: 'pending',
        priority: 'medium',
        assigned_to: ''
      });
      fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to create activity',
        variant: 'destructive'
      });
    }
  };

  const handleAddRemark = (activityId: string) => {
    setSelectedActivityId(activityId);
    setShowRemarkDialog(true);
    setNewRemark('');
  };

  const handleDeleteRemark = async (remarkId: string) => {
    try {
      const { error } = await supabase
        .from('activity_remarks')
        .delete()
        .eq('id', remarkId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Remark deleted successfully'
      });

      fetchActivities();
    } catch (error) {
      console.error('Error deleting remark:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete remark',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('project_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Activity deleted successfully'
      });

      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete activity',
        variant: 'destructive'
      });
    }
  };

  const handleSaveRemark = async () => {
    if (!selectedActivityId || !newRemark.trim()) return;

    try {
      const { error } = await supabase
        .from('activity_remarks')
        .insert([{
          activity_id: selectedActivityId,
          remark: newRemark,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Remark added successfully'
      });

      setShowRemarkDialog(false);
      setNewRemark('');
      setSelectedActivityId(null);
      fetchActivities();
    } catch (error) {
      console.error('Error adding remark:', error);
      toast({
        title: 'Error',
        description: 'Failed to add remark',
        variant: 'destructive'
      });
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.activity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No activities found
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onAddRemark={handleAddRemark}
              onDeleteRemark={handleDeleteRemark}
              onDeleteActivity={handleDeleteActivity}
            />
          ))
        )}
      </div>

      {/* Add Activity Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Activity</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project</label>
                  <select
                    value={newActivity.project_id}
                    onChange={(e) => setNewActivity({ ...newActivity, project_id: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select Project</option>
                    <option value="1">Project 1</option>
                    <option value="2">Project 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Activity Name</label>
                  <Input
                    value={newActivity.activity_name}
                    onChange={(e) => setNewActivity({ ...newActivity, activity_name: e.target.value })}
                    placeholder="Enter activity name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={newActivity.activity_date}
                      onChange={(e) => setNewActivity({ ...newActivity, activity_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="date"
                      value={newActivity.end_date}
                      onChange={(e) => setNewActivity({ ...newActivity, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={newActivity.status}
                      onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={newActivity.priority}
                      onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                  <Input
                    value={newActivity.assigned_to}
                    onChange={(e) => setNewActivity({ ...newActivity, assigned_to: e.target.value })}
                    placeholder="Enter assigned person"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleAddActivity} className="flex-1">
                  Create Activity
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Remark Dialog */}
      {showRemarkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Remark</h2>
              
              <Textarea
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter remark..."
                rows={4}
                className="mb-4"
              />

              <div className="flex gap-2">
                <Button onClick={handleSaveRemark} className="flex-1">
                  Save Remark
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRemarkDialog(false);
                    setNewRemark('');
                    setSelectedActivityId(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}