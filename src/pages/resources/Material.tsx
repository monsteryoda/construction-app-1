import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Material() {
  const materials = [
    { id: 1, name: 'Cement', category: 'Building Materials', quantity: '500 bags', status: 'In Stock', location: 'Warehouse A' },
    { id: 2, name: 'Steel Bars', category: 'Building Materials', quantity: '2000 kg', status: 'Low Stock', location: 'Warehouse B' },
    { id: 3, name: 'Sand', category: 'Aggregates', quantity: '50 tons', status: 'In Stock', location: 'Site A' },
    { id: 4, name: 'Bricks', category: 'Building Materials', quantity: '10000 pcs', status: 'In Stock', location: 'Warehouse A' },
    { id: 5, name: 'Concrete Mix', category: 'Ready Mix', quantity: '20 m³', status: 'Low Stock', location: 'Site B' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Material</h1>
              <p className="text-slate-500">Manage construction materials and inventory</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Material
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search materials by name or category..."
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200">
              {materials.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Box className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                      <p className="text-sm font-medium text-slate-900 mt-1">{item.quantity}</p>
                      <p className="text-xs text-slate-500">{item.location}</p>
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