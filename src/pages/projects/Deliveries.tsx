import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Package, Calendar, Truck, User } from 'lucide-react';
import { toast } from 'sonner';

interface Delivery {
  id: string;
  project_id: string;
  delivery_item: string;
  description: string;
  delivery_date: string;
  expected_date: string;
  status: string;
  quantity: number;
  unit: string;
  supplier: string;
}

interface Project {
  id: string;
  project_name: string;
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDelivery, setNewDelivery] = useState({
    project_id: '',
    delivery_item: '',
    description: '',
    delivery_date: '',
    expected_date: '',
    status: 'pending',
    quantity: '',
    unit: '',
    supplier: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchDeliveries();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('projects')
        .select('id, project_name')
        .eq('user_id', user.id);

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('project_deliveries')
        .select('*, projects(project_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('project_deliveries').insert([
        {
          user_id: user.id,
          ...newDelivery,
          quantity: parseInt(newDelivery.quantity) || 0,
        },
      ]);

      if (error) throw error;
      toast.success('Delivery added successfully');
      setShowAddDialog(false);
      setNewDelivery({
        project_id: '',
        delivery_item: '',
        description: '',
        delivery_date: '',
        expected_date: '',
        status: 'pending',
        quantity: '',
        unit: '',
        supplier: '',
      });
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to add delivery');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'in_transit':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'delayed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Project Deliveries</h1>
            <p className="text-slate-500 mt-1">Track and manage project deliveries</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Delivery
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Delivery</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select
                    value={newDelivery.project_id}
                    onValueChange={(value) => setNewDelivery({ ...newDelivery, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Item *</Label>
                  <Input
                    value={newDelivery.delivery_item}
                    onChange={(e) => setNewDelivery({ ...newDelivery, delivery_item: e.target.value })}
                    placeholder="Enter item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newDelivery.description}
                    onChange={(e) => setNewDelivery({ ...newDelivery, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expected Date</Label>
                    <Input
                      type="date"
                      value={newDelivery.expected_date}
                      onChange={(e) => setNewDelivery({ ...newDelivery, expected_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Date</Label>
                    <Input
                      type="date"
                      value={newDelivery.delivery_date}
                      onChange={(e) => setNewDelivery({ ...newDelivery, delivery_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newDelivery.status}
                    onValueChange={(value) => setNewDelivery({ ...newDelivery, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newDelivery.quantity}
                      onChange={(e) => setNewDelivery({ ...newDelivery, quantity: e.target.value })}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={newDelivery.unit}
                      onChange={(e) => setNewDelivery({ ...newDelivery, unit: e.target.value })}
                      placeholder="e.g., pieces, kg, tons"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Input
                    value={newDelivery.supplier}
                    onChange={(e) => setNewDelivery({ ...newDelivery, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDelivery}>Add Delivery</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Deliveries Yet</h3>
              <p className="text-slate-500 mb-6">Add your first project delivery</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Delivery
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{delivery.delivery_item}</h3>
                        {(delivery as any).projects?.project_name && (
                          <p className="text-sm text-blue-600">{(delivery as any).projects.project_name}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{delivery.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Truck className="w-4 h-4" />
                      <span>{delivery.supplier || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-medium">Qty:</span>
                      <span>{delivery.quantity} {delivery.unit}</span>
                    </div>
                    {delivery.expected_date && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>Expected: {new Date(delivery.expected_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {delivery.delivery_date && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>Delivered: {new Date(delivery.delivery_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}