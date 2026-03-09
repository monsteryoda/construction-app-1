import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ClipboardList, Package, Calendar, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    activities: 0,
    deliveries: 0,
    schedules: 0,
    documents: 0,
    issues: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { count: projects },
        { count: activities },
        { count: deliveries },
        { count: schedules },
        { count: documents },
        { count: issues },
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('project_activities').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('project_deliveries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('project_schedules').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('project_documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('project_issues').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setStats({
        projects: projects || 0,
        activities: activities || 0,
        deliveries: deliveries || 0,
        schedules: schedules || 0,
        documents: documents || 0,
        issues: issues || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Projects', value: stats.projects, icon: Building2, color: 'bg-blue-500' },
    { title: 'Activities', value: stats.activities, icon: ClipboardList, color: 'bg-green-500' },
    { title: 'Deliveries', value: stats.deliveries, icon: Package, color: 'bg-orange-500' },
    { title: 'Schedules', value: stats.schedules, icon: Calendar, color: 'bg-purple-500' },
    { title: 'Documents', value: stats.documents, icon: FileText, color: 'bg-cyan-500' },
    { title: 'Issues', value: stats.issues, icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your construction projects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-sm">No recent activity to display.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-sm">No upcoming deliveries.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}