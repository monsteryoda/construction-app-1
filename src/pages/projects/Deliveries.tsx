import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import DeliveryCard from '@/components/deliveries/DeliveryCard';
import DeliveryForm from '@/components/deliveries/DeliveryForm';
import { uploadImages, deleteDeliveryImage } from '@/components/deliveries/DeliveryActions';
import { Delivery, Project } from '@/components/deliveries/DeliveryTypes';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('');
  const [newRemark, setNewRemark] = useState('');

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

      // Fetch images for each delivery
      const deliveriesWithImages = await Promise.all(
        (data || []).map(async (delivery) => {
          const { data: images } = await supabase
            .from('delivery_images')
            .select('*')
            .eq('delivery_id', delivery.id);
          return { ...delivery, images: images || [] };
        })
      );

      setDeliveries(deliveriesWithImages);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async (delivery: any, images: File[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First create the delivery
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('project_deliveries')
        .insert([{
          user_id: user.id,
          ...delivery,
          quantity: parseInt(delivery.quantity) || 0,
        }])
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // Then upload images if any
      if (images.length > 0 && deliveryData) {
        const uploadedCount = await uploadImages(deliveryData.id, user.id, images);
        toast.success(`${uploadedCount} image(s) uploaded successfully`);
      }

      toast.success('Delivery added successfully');
      setShowAddDialog(false);
      
      // Reset form
      setNewRemark('');
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to add delivery');
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
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Delivery
          </Button>
        </div>

        <DeliveryForm
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddDelivery}
          projects={projects}
        />

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
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Delivery
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {deliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onDeleteImage={deleteDeliveryImage}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}