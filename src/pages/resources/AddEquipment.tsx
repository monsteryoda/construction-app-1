import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AddEquipment() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically save to Supabase
      // For now, we'll show a success message
      console.log('Equipment data:', formData);
      
      toast.success('Equipment added successfully!');
      navigate('/resources/machinery');
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
          <Button variant="ghost" onClick={() => navigate('/resources/machinery')} className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Machinery
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add Equipment</h1>
            <p className="text-slate-500">Add new machinery or equipment to your inventory</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="w-5 h-5" />
              Equipment Details
            </CardTitle>
            <CardDescription>Fill in the details below to add new equipment</CardDescription>
          </CardHeader>
          <CardContent>
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
                <Button type="button" variant="outline" onClick={() => navigate('/resources/machinery')}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2" disabled={loading}>
                  <Save className="w-4 h-4" />
                  {loading ? 'Adding...' : 'Add Equipment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}