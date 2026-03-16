import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ClipboardList, Package, Calendar, AlertCircle, FileText } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

export default function Dashboard() {
  const { projects, loading, error } = useProjects();

  const stats = [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length.toString(), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending Activities', value: '8', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Deliveries Due', value: '5', icon: Package, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Open Issues', value: '3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">Loading projects...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">Error loading projects: {error.message}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's an overview of your projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest construction projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No projects found. Create your first project!</p>
                  </div>
                ) : (
                  projects.slice(0, 4).map((project) => (
                    <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{project.project_name}</h3>
                        <p className="text-sm text-slate-500">{project.client || 'No client'} • {project.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">85%</p>
                        <p className="text-xs text-slate-500">Complete</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: FileText, label: 'New Project', color: 'bg-blue-500' },
                  { icon: ClipboardList, label: 'Add Activity', color: 'bg-amber-500' },
                  { icon: Package, label: 'Schedule Delivery', color: 'bg-green-500' },
                  { icon: AlertCircle, label: 'Report Issue', color: 'bg-red-500' },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}