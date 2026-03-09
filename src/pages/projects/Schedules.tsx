import { useEffect, useState } from 'react';
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
import { Plus, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
      setSchedules(data || []);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('project_schedules').insert([
        {
          user_id: user.id,
          ...newSchedule,
          progress: parseInt(newSchedule.progress) || 0,
        },
      ]);

      if (error) throw error;
      toast.success('Schedule added successfully');
      setShowAddDialog(false);
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
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to add schedule');
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
            <DialogContent className="max-w-lg">
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
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSchedule}>Add Schedule</Button>
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