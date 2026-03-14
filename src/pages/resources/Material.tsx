import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import MaterialModal from '@/components/MaterialModal';

export default function Material() {
  const [materials, setMaterials] = useState([
    { id: 1, no: '001', type: 'Building Materials', description: 'Cement', quantity: '500 bags', deliveryOrderRef: 'DO-2024-001', status: 'In Stock', location: 'Warehouse A' },
    { id: 2, no: '002', type: 'Building Materials', description: 'Steel Bars', quantity: '2000 kg', deliveryOrderRef: 'DO-2024-002', status: 'Low Stock', location: 'Warehouse B' },
    { id: 3, no: '003', type: 'Aggregates', description: 'Sand', quantity: '50 tons', deliveryOrderRef: 'DO-2024-003', status: 'In Stock', location: 'Site A' },
    { id: 4, no: '004', type: 'Building Materials', description: 'Bricks', quantity: '10000 pcs', deliveryOrderRef: 'DO-2024-004', status: 'In Stock', location: 'Warehouse A' },
    { id: 5, no: '005', type: 'Ready Mix', description: 'Concrete Mix', quantity: '20 m³', deliveryOrderRef: 'DO-2024-005', status: 'Low Stock', location: 'Site B' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMaterial = (material: any) => {
    const newMaterial = {
      id: materials.length + 1,
      ...material,
    };
    setMaterials([...materials, newMaterial]);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Material</h1>
              <p className="text-slate-500">Manage construction materials and inventory</p>
            </div>
            <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type/Materials Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Delivery Order Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {materials.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.no}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Box className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{item.description}</p>
                            <p className="text-xs text-slate-500">{item.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.quantity}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.deliveryOrderRef}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
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

        <MaterialModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddMaterial}
        />
      </div>
    </DashboardLayout>
  );
}