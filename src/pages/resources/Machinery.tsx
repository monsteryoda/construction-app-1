import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Machinery() {
  const equipment = [
    { id: 1, name: 'Excavator CAT 320', type: 'Heavy Equipment', status: 'In Use', location: 'Site A' },
    { id: 2, name: 'Cranes 50T', type: 'Heavy Equipment', status: 'Maintenance', location: 'Workshop' },
    { id: 3, name: 'Concrete Mixer', type: 'Mixing', status: 'In Use', location: 'Site B' },
    { id: 4, name: 'Bulldozer D6', type: 'Heavy Equipment', status: 'Available', location: 'Site C' },
    { id: 5, name: 'Generator 200kW', type: 'Power', status: 'In Use', location: 'Site A' },
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
            <div className="divide-y divide-slate-200">
              {equipment.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Hammer className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'Maintenance' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{item.location}</p>
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