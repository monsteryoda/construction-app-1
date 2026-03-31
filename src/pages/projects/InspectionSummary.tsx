import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface Inspection {
  status?: string;
  priority?: string;
  projects?: { project_name?: string };
  inspection_date?: string;
  inspector_name?: string;
}

interface InspectionSummaryProps {
  inspection: Inspection;
}

export default function InspectionSummary({ inspection }: InspectionSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'normal':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="w-5 h-5" />
          Inspection Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Status</span>
            <Badge className={getStatusColor(inspection.status || '')}>
              {inspection.status?.replace('_', ' ')?.toUpperCase() || 'PENDING'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Priority</span>
            <Badge className={getPriorityColor(inspection.priority || '')}>
              {inspection.priority?.toUpperCase() || 'NORMAL'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Project</span>
            <span className="text-sm font-medium text-slate-900">
              {inspection.projects?.project_name || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Inspection Date</span>
            <span className="text-sm font-medium text-slate-900">
              {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Inspector</span>
            <span className="text-sm font-medium text-slate-900">
              {inspection.inspector_name || 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}