import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Manpower() {
  const workers = [
    { id: 1, name: 'John Smith', number: 'EMP-001', position: 'Site Manager', status: 'Active', location: 'Site A' },
    { id: 2, name: 'Maria Garcia', number: 'EMP-002', position: 'Foreman', status: 'Active', location: 'Site B' },
    { id: 3, name: 'David Chen', number: 'EMP-003', position: 'Electrician', status: 'On Leave', location: 'Site A' },
    { id: 4, name: 'Sarah Johnson', number: 'EMP-004', position: 'Plumber', status: 'Active', location: 'Site C' },
    { id: 5, name: 'Michael Brown', number: 'EMP-005', position: 'Carpenter', status: 'Active', location: 'Site B' },
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
                placeholder="Search workers by name, number, or position..."
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-slate-900">{worker.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{worker.number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{worker.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          worker.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {worker.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{worker.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}