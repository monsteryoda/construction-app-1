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
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

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
            created_at,
            created_by
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedActivities = data?.map(activity => ({
        ...activity,
        images: activity.activity_images || [],
        remarks: activity.activity_remarks || []
      })) || [];

      setActivities(formattedActivities);
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
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Activity created successfully'
      });

      setShowAddForm(false);
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
    const remark = prompt('Enter remark:');
    if (!remark) return;

    supabase
      .from('activity_remarks')
      .insert([{
        activity_id: activityId,
        remark,
        created_by: user?.id
      }])
      .then(() => fetchActivities())
      .catch(err => console.error('Error adding remark:', err));
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

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.activity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? 'Cancel' : 'Add Activity'}
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Project ID"
              value={newActivity.project_id}
              onChange={(e) => setNewActivity({ ...newActivity, project_id: e.target.value })}
            />
            <Input
              placeholder="Activity Name"
              value={newActivity.activity_name}
              onChange={(e) => setNewActivity({ ...newActivity, activity_name: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              className="md:col-span-2"
            />
            <Input
              type="date"
              placeholder="Activity Date"
              value={newActivity.activity_date}
              onChange={(e) => setNewActivity({ ...newActivity, activity_date: e.target.value })}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={newActivity.end_date}
              onChange={(e) => setNewActivity({ ...newActivity, end_date: e.target.value })}
            />
            <select
              value={newActivity.status}
              onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <select
              value={newActivity.priority}
              onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <Input
              placeholder="Assigned To"
              value={newActivity.assigned_to}
              onChange={(e) => setNewActivity({ ...newActivity, assigned_to: e.target.value })}
            />
          </div>
          <Button onClick={handleAddActivity} className="mt-4">
            Create Activity
          </Button>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded flex items-center gap-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No activities found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onAddRemark={handleAddRemark}
              onDeleteRemark={handleDeleteRemark}
              onDeleteActivity={handleDeleteActivity}
            />
          ))}
        </div>
      )}
    </div>
  );
}