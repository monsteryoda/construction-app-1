import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Package, Calendar, Truck, Image as ImageIcon, Upload, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryImage {
  id: string;
  delivery_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

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
  images?: DeliveryImage[];
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
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (deliveryId: string, userId: string) => {
    const uploadedImages: { image_url: string; file_name: string }[] = [];

    for (const file of selectedImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${deliveryId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('delivery-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('delivery-images')
        .getPublicUrl(fileName);

      uploadedImages.push({ image_url: publicUrl, file_name: file.name });
    }

    // Save image records to database
    if (uploadedImages.length > 0) {
      const { error } = await supabase.from('delivery_images').insert(
        uploadedImages.map((img) => ({
          delivery_id: deliveryId,
          image_url: img.image_url,
          file_name: img.file_name,
        }))
      );

      if (error) {
        console.error('Error saving image records:', error);
      }
    }

    return uploadedImages.length;
  };

  const deleteDeliveryImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // userId/filename

      // Delete from storage
      await supabase.storage.from('delivery-images').remove([fileName]);

      // Delete from database
      await supabase.from('delivery_images').delete().eq('id', imageId);

      toast.success('Image deleted');
      fetchDeliveries();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleAddDelivery = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First create the delivery
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('project_deliveries')
        .insert([
          {
            user_id: user.id,
            ...newDelivery,
            quantity: parseInt(newDelivery.quantity) || 0,
          },
        ])
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // Then upload images if any
      if (selectedImages.length > 0 && deliveryData) {
        setUploading(true);
        const uploadedCount = await uploadImages(deliveryData.id, user.id);
        toast.success(`${uploadedCount} image(s) uploaded successfully`);
      }

      toast.success('Delivery added successfully');
      setShowAddDialog(false);
      
      // Reset form
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
      
      // Clear images
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);
      setUploading(false);
      
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to add delivery');
      setUploading(false);
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="mt-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-1" />
                      <p className="text-sm text-slate-500">Click to upload images</p>
                      <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB each</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-600 mb-2">
                        {imagePreviews.length} image(s) selected:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeSelectedImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              type="button"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDelivery} disabled={uploading}>
                  {uploading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Uploading...
                    </>
                  ) : (
                    'Add Delivery'
                  )}
                </Button>
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
                  
                  {/* Display Delivery Images */}
                  {delivery.images && delivery.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {delivery.images.length} image(s)
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {delivery.images.map((image) => (
                          <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                            <img
                              src={image.image_url}
                              alt={image.file_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <button
                              onClick={() => deleteDeliveryImage(image.id, image.image_url)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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