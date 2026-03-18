"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Delivery, Project } from '@/components/deliveries/DeliveryTypes';
import DeliveryCard from '@/components/deliveries/DeliveryCard';
import DeliveryForm from '@/components/deliveries/DeliveryForm';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch deliveries with project info
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('project_deliveries')
        .select(`
          *,
          projects (
            id,
            project_name
          )
        `)
        .order('created_at', { ascending: false });

      if (deliveriesError) throw deliveriesError;
      setDeliveries(deliveriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async (deliveryData: any, images: File[]) => {
    try {
      // Insert delivery record
      const { data: delivery, error: deliveryError } = await supabase
        .from('project_deliveries')
        .insert({
          ...deliveryData,
          status: deliveryData.status || 'pending',
        })
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // Upload images if any
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${delivery.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('delivery_images')
            .upload(filePath, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('delivery_images')
            .getPublicUrl(filePath);

          // Save image reference to database
          await supabase
            .from('delivery_images')
            .insert({
              delivery_id: delivery.id,
              image_url: publicUrl,
              file_name: image.name,
            });
        }
      }

      toast.success('Delivery added successfully');
      setFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding delivery:', error);
      toast.error('Failed to add delivery');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      // Get image data
      const { data: imageData, error: fetchError } = await supabase
        .from('delivery_images')
        .select('image_url, file_name')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (imageData?.image_url) {
        const filePath = imageData.image_url.split('/storage/v1/object/public/delivery_images/')[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('delivery_images')
            .remove([filePath]);

          if (storageError) throw storageError;
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('delivery_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      toast.success('Image deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleDeleteDelivery = async (deliveryId: string) => {
    try {
      // Get all images for this delivery
      const { data: images, error: fetchError } = await supabase
        .from('delivery_images')
        .select('image_url')
        .eq('delivery_id', deliveryId);

      if (fetchError) throw fetchError;

      // Delete images from storage
      if (images && images.length > 0) {
        for (const image of images) {
          if (image.image_url) {
            const filePath = image.image_url.split('/storage/v1/object/public/delivery_images/')[1];
            if (filePath) {
              await supabase.storage
                .from('delivery_images')
                .remove([filePath]);
            }
          }
        }
      }

      // Delete images from database
      await supabase
        .from('delivery_images')
        .delete()
        .eq('delivery_id', deliveryId);

      // Delete delivery
      const { error: deleteError } = await supabase
        .from('project_deliveries')
        .delete()
        .eq('id', deliveryId);

      if (deleteError) throw deleteError;

      toast.success('Delivery deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting delivery:', error);
      toast.error('Failed to delete delivery');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Deliveries</h1>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Delivery
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveries.map(delivery => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            onDeleteImage={handleDeleteImage}
            onDelete={handleDeleteDelivery}
          />
        ))}
      </div>

      {deliveries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No deliveries found. Add your first delivery!</p>
        </div>
      )}

      <DeliveryForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddDelivery}
        projects={projects}
      />
    </div>
  );
}