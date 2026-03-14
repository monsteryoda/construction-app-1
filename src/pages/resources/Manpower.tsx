import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Manpower() {
  const workers = [
    { id: 1, name: 'John Smith', role: 'Site Manager', status: 'Active', location: 'Site A' },
    { id: 2, name: 'Maria Garcia', role: 'Foreman', status: 'Active', location: 'Site B' },
    { id: 3, name: 'David Chen', role: 'Electrician', status: 'On Leave', location: 'Site A' },
    { id: 4, name: 'Sarah Johnson', role: 'Plumber', status: 'Active', location: 'Site C' },
    { id: 5, name: 'Michael Brown', role: 'Carpenter', status: 'Active', location: 'Site B' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manpower</h1>
              <p className="text-slate-500">Manage your construction workforce</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Worker
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search workers by name or role..."
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200">
              {workers.map((worker) => (
                <div key={worker.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{worker.name}</h3>
                        <p className="text-sm text-slate-500">{worker.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        worker.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {worker.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{worker.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}