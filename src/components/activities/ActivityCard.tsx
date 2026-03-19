"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { Activity } from './ActivityTypes';
import { deleteRemark } from './ActivityActions';

interface ActivityCardProps {
  activity: Activity;
  onAddRemark: (id: string) => void;
  onDeleteRemark: (remarkId: string) => Promise<void>;
  onDeleteActivity?: (id: string) => Promise<void>;
}

export default function ActivityCard({ activity, onAddRemark, onDeleteRemark, onDeleteActivity }: ActivityCardProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleDeleteRemark = async (remarkId: string) => {
    try {
      await onDeleteRemark(remarkId);
    } catch (error) {
      console.error('Error deleting remark:', error);
    }
  };

  const handleDeleteActivity = async () => {
    if (!onDeleteActivity) return;
    
    if (window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      try {
        await onDeleteActivity(activity.id);
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-900">{activity.activity_name}</h3>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-500 mb-3">
                {activity.projects?.project_name || 'No project'}
              </p>
              
              {activity.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {activity.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Date:</span>
                  <span>{activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                {activity.end_date && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">End:</span>
                    <span>{new Date(activity.end_date).toLocaleDateString()}</span>
                  </div>
                )}
                {activity.assigned_to && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Assigned:</span>
                    <span>{activity.assigned_to}</span>
                  </div>
                )}
                {activity.progress !== undefined && activity.progress !== null && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Progress:</span>
                    <span>{activity.progress}%</span>
                  </div>
                )}
              </div>

              {/* Images Section */}
              {activity.images && activity.images.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {activity.images.length} image(s)
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {activity.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setShowImageDialog(true);
                        }}
                        className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        <img
                          src={image.image_url}
                          alt={`Activity image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks Section */}
              {activity.remarks && activity.remarks.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {activity.remarks.length} remark(s)
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {activity.remarks.map((remark) => (
                      <div key={remark.id} className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm text-slate-700">{remark.remark}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            {new Date(remark.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRemark(remark.id)}
                            className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddRemark(activity.id)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Remark
              </Button>
              
              {onDeleteActivity && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteActivity}
                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      {showImageDialog && activity.images && activity.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageDialog(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Activity Images</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageDialog(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <img
                src={activity.images[selectedImageIndex]?.image_url}
                alt={`Activity image ${selectedImageIndex + 1}`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between p-4 border-t bg-slate-50">
              <span className="text-sm text-slate-500">
                Image {selectedImageIndex + 1} of {activity.images.length}
              </span>
              <div className="flex gap-2">
                {selectedImageIndex > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImageIndex(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                )}
                {selectedImageIndex < activity.images.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImageIndex(prev => prev + 1)}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}