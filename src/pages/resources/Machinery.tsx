import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Machinery {
  id: string;
  user_id: string;
  ref: string;
  no: string;
  plant_machinery: string;
  type: string;
  status: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export default function Machinery() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState<Machinery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Fetch machinery data from database
  useEffect(() => {
    fetchMachinery();
  }, []);

  const fetchMachinery = async () => {
    try {
      const { data, error } = await supabase
        .from('machinery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMachineryList(data || []);
    } catch (error) {
      console.error('Error fetching machinery:', error);
      toast.error('Failed to load machinery data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('machinery')
        .insert([{
          ref: formData.ref,
          no: formData.no,
          plant_machinery: formData.plantMachinery,
          type: formData.type,
          status: formData.status,
          location: formData.location,
        }]);

      if (error) throw error;

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
      fetchMachinery();
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  // Filter machinery based on search term
  const filteredMachinery = machineryList.filter(item =>
    item.plant_machinery.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  {filteredMachinery.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No equipment found. Add your first equipment!
                      </td>
                    </tr>
                  ) : (
                    filteredMachinery.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.no}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.ref}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                              <Hammer className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">{item.plant_machinery}</span>
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
                    ))
                  )}
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