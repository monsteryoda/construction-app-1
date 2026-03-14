import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Machinery() {
  const equipment = [
    { id: 1, ref: 'REF-001', plantMachinery: 'Excavator CAT 320', type: 'Heavy Equipment', status: 'In Use', location: 'Site A', no: '001' },
    { id: 2, ref: 'REF-002', plantMachinery: 'Cranes 50T', type: 'Heavy Equipment', status: 'Maintenance', location: 'Workshop', no: '002' },
    { id: 3, ref: 'REF-003', plantMachinery: 'Concrete Mixer', type: 'Mixing', status: 'In Use', location: 'Site B', no: '003' },
    { id: 4, ref: 'REF-004', plantMachinery: 'Bulldozer D6', type: 'Heavy Equipment', status: 'Available', location: 'Site C', no: '004' },
    { id: 5, ref: 'REF-005', plantMachinery: 'Generator 200kW', type: 'Power', status: 'In Use', location: 'Site A', no: '005' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Machinery</h1>
              <p className="text-slate-500">Manage construction equipment and machinery</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Equipment
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search equipment by name or type..."
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plant & Machinery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {equipment.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.no}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.ref}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Hammer className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{item.plantMachinery}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.type}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'Maintenance' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.location}</td>
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