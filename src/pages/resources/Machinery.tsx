import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Machinery() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ref: '',
    plantMachinery: '',
    type: '',
    status: 'Available',
    location: '',
    no: '',
  });

  const equipmentTypes = [
    'Heavy Equipment',
    'Mixing',
    'Power',
    'Transport',
    'Tools',
    'Other',
  ];

  const equipmentStatus = [
    'Available',
    'In Use',
    'Maintenance',
    'Out of Service',
  ];

  const equipment = [
    { id: 1, ref: 'REF-001', plantMachinery: 'Excavator CAT 320', type: 'Heavy Equipment', status: 'In Use', location: 'Site A', no: '001' },
    { id: 2, ref: 'REF-002', plantMachinery: 'Cranes 50T', type: 'Heavy Equipment', status: 'Maintenance', location: 'Workshop', no: '002' },
    { id: 3, ref: 'REF-003', plantMachinery: 'Concrete Mixer', type: 'Mixing', status: 'In Use', location: 'Site B', no: '003' },
    { id: 4, ref: 'REF-004', plantMachinery: 'Bulldozer D6', type: 'Heavy Equipment', status: 'Available', location: 'Site C', no: '004' },
    { id: 5, ref: 'REF-005', plantMachinery: 'Generator 200kW', type: 'Power', status: 'In Use', location: 'Site A', no: '005' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Equipment data:', formData);
      toast.success('Equipment added successfully!');
      setShowAddModal(false);
      setFormData({
        ref: '',
        plantMachinery: '',
        type: '',
        status: 'Available',
        location: '',
        no: '',
      });
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Machinery</h1>
              <p className="text-slate-500">Manage construction equipment and machinery</p>
            </div>
            <Button className="gap-2" onClick={() => setShowAddModal(true)}>
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

        {/* Add Equipment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add Equipment</h2>
                    <p className="text-slate-500">Add new machinery or equipment to your inventory</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Reference Number */}
                    <div className="space-y-2">
                      <Label htmlFor="ref">Reference Number *</Label>
                      <Input
                        id="ref"
                        placeholder="REF-001"
                        value={formData.ref}
                        onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                        required
                      />
                    </div>

                    {/* Equipment Number */}
                    <div className="space-y-2">
                      <Label htmlFor="no">Equipment Number *</Label>
                      <Input
                        id="no"
                        placeholder="001"
                        value={formData.no}
                        onChange={(e) => setFormData({ ...formData, no: e.target.value })}
                        required
                      />
                    </div>

                    {/* Plant & Machinery Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="plantMachinery">Plant & Machinery Name *</Label>
                      <Input
                        id="plantMachinery"
                        placeholder="e.g., Excavator CAT 320"
                        value={formData.plantMachinery}
                        onChange={(e) => setFormData({ ...formData, plantMachinery: e.target.value })}
                        required
                      />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentStatus.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Site A, Workshop"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={loading}>
                      <Hammer className="w-4 h-4" />
                      {loading ? 'Adding...' : 'Add Equipment'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}