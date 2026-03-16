import { Calendar, User, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Remark } from './ActivityTypes';
import { deleteActivityImage } from './ActivityActions';

interface ActivityCardProps {
  activity: any;
  onAddRemark: (activityId: string) => void;
  onDeleteRemark: (remarkId: string) => void;
}

export default function ActivityCard({ activity, onAddRemark, onDeleteRemark }: ActivityCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg text-slate-900">{activity.activity_name}</h3>
              <Badge className={getStatusColor(activity.status)}>
                {activity.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            {(activity as any).projects?.project_name && (
              <p className="text-sm text-blue-600 mb-2">{(activity as any).projects.project_name}</p>
            )}
            <p className="text-slate-600 text-sm mb-4">{activity.description}</p>
            
            {/* Display Activity Images - Prominent Display */}
            {activity.images && activity.images.length > 0 && (
              <ActivityImages images={activity.images} />
            )}

            {/* Display Remarks */}
            {activity.remarks && activity.remarks.length > 0 && (
              <ActivityRemarks remarks={activity.remarks} onDeleteRemark={onDeleteRemark} />
            )}

            <ActivityDetails activity={activity} getPriorityColor={getPriorityColor} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddRemark(activity.id)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Add Remark
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityImages({ images }: { images: any[] }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-5 h-5 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">
          {images.length} image{images.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image) => (
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
              onClick={() => deleteActivityImage(image.id, image.image_url)}
              className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              title="Delete image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityRemarks({ remarks, onDeleteRemark }: { remarks: Remark[]; onDeleteRemark: (id: string) => void }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">
          {remarks.length} remark{remarks.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {remarks.map((remark) => (
          <div key={remark.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700">{remark.remark}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">
                {new Date(remark.created_at).toLocaleDateString()} • {new Date(remark.created_at).toLocaleTimeString()}
              </p>
              <button
                onClick={() => onDeleteRemark(remark.id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityDetails({ activity, getPriorityColor }: { activity: any; getPriorityColor: (p: string) => string }) {
  return (
    <div className="flex items-center gap-6 text-sm text-slate-500">
      {activity.activity_date && (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(activity.activity_date).toLocaleDateString()}</span>
        </div>
      )}
      {activity.end_date && (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>End: {new Date(activity.end_date).toLocaleDateString()}</span>
        </div>
      )}
      {activity.assigned_to && (
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{activity.assigned_to}</span>
        </div>
      )}
      <span className={`font-medium ${getPriorityColor(activity.priority)}`}>
        {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)} Priority
      </span>
    </div>
  );
}