import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, ClipboardList, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

interface Activity {
  id: string;
  project_id: string;
  activity_name: string;
  description: string;
  activity_date: string;
  status: string;
  priority: string;
  assigned_to: string;
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
      setActivities(data || []);
    } catch (error) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('project_activities').insert([
        {
          user_id: user.id,
          ...newActivity,
        },
      ]);

      if (error) throw error;
      toast.success('Activity added successfully');
      setShowAddDialog(false);
      setNewActivity({
        project_id: '',
        activity_name: '',
        description: '',
        activity_date: '',
        status: 'pending',
        priority: 'medium',
        assigned_to: '',
      });
      fetchActivities();
    } catch (error) {
      toast.error('Failed to add activity');
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
            <DialogContent className="max-w-lg">
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
                    <Label>Assigned To</Label>
                    <Input
                      value={newActivity.assigned_to}
                      onChange={(e) => setNewActivity({ ...newActivity, assigned_to: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddActivity}>Add Activity</Button>
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