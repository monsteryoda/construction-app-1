"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Image as ImageIcon, X } from 'lucide-react';
import { Schedule } from './ScheduleTypes';
import { deleteScheduleImage } from './ScheduleActions';

interface ScheduleCardProps {
  schedule: Schedule;
  onDeleteImage: (imageId: string) => Promise<void>;
}

export default function ScheduleCard({ schedule, onDeleteImage }: ScheduleCardProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'delayed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await onDeleteImage(imageId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{schedule.task_name}</h3>
                {schedule.projects?.project_name && (
                  <p className="text-sm text-blue-600">{schedule.projects.project_name}</p>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(schedule.status)}>
              {schedule.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {schedule.description && (
            <p className="text-slate-600 text-sm mb-4">{schedule.description}</p>
          )}

          {/* Display Schedule Images */}
          {schedule.images && schedule.images.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {schedule.images.length} image(s)
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {schedule.images.map((image, index) => (
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

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm font-bold text-slate-900">{schedule.progress}%</span>
            </div>
            <Progress value={schedule.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {schedule.start_date && (
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Start: {new Date(schedule.start_date).toLocaleDateString()}</span>
              </div>
            )}
            {schedule.end_date && (
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>End: {new Date(schedule.end_date).toLocaleDateString()}</span>
              </div>
            )}
            {schedule.dependencies && (
              <div className="col-span-2 flex items-center gap-2 text-slate-500">
                <span className="font-medium">Dependencies:</span>
                <span>{schedule.dependencies}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      {showImageDialog && schedule.images && schedule.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageDialog(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Schedule Images</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  Image {selectedImageIndex + 1} of {schedule.images.length}
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
                src={schedule.images[selectedImageIndex]?.image_url}
                alt={schedule.images[selectedImageIndex]?.file_name}
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
                {selectedImageIndex < schedule.images.length - 1 && (
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