"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, Truck, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { Delivery } from './DeliveryTypes';
import { deleteDeliveryImage } from './DeliveryActions';

interface DeliveryCardProps {
  delivery: Delivery;
  onDeleteImage: (imageId: string) => Promise<void>;
  onDelete: (deliveryId: string) => Promise<void>;
}

export default function DeliveryCard({ delivery, onDeleteImage, onDelete }: DeliveryCardProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'in_transit':
        return 'bg-blue-100 text-blue-700';
      case 'delayed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await onDeleteImage(imageId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleDeleteDelivery = async () => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      try {
        await onDelete(delivery.id);
      } catch (error) {
        console.error('Error deleting delivery:', error);
      }
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{delivery.delivery_item}</h3>
                {delivery.projects?.project_name && (
                  <p className="text-sm text-blue-600">{delivery.projects.project_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(delivery.status)}>
                {delivery.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <button
                onClick={handleDeleteDelivery}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Delete delivery"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {delivery.description && (
            <p className="text-slate-600 text-sm mb-4">{delivery.description}</p>
          )}

          {/* Display Delivery Images */}
          {delivery.images && delivery.images.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {delivery.images.length} image(s)
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {delivery.images.map((image, index) => (
                  <div key={image.id} className="relative group flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setShowImageDialog(true);
                      }}
                      className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-500 transition-all"
                    >
                      <img
                        src={image.image_url}
                        alt={image.file_name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete image"
                    >
                      <X className="w-3 h-3" />
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

      {/* Image Preview Dialog */}
      {showImageDialog && delivery.images && delivery.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageDialog(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Delivery Images</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  Image {selectedImageIndex + 1} of {delivery.images.length}
                </span>
                <button
                  onClick={() => setShowImageDialog(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <img
                src={delivery.images[selectedImageIndex]?.image_url}
                alt={delivery.images[selectedImageIndex]?.file_name}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between p-4 border-t bg-slate-50">
              <div className="flex gap-2">
                {selectedImageIndex > 0 && (
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev - 1)}
                    className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
                  >
                    Previous
                  </button>
                )}
                {selectedImageIndex < delivery.images.length - 1 && (
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev + 1)}
                    className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}