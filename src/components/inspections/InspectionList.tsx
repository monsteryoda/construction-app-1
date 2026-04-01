"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Mail, Printer, Edit2, Eye } from 'lucide-react';
import { Inspection } from '@/pages/projects/Inspection';

interface InspectionListProps {
  inspections: Inspection[];
  loading: boolean;
  onViewDetails: (inspection: Inspection) => void;
  onUpdateStatus: (inspectionId: string, newStatus: string) => Promise<void>;
  onPrint: () => void;
  getStatusColor: (status: string) => string;
}

export default function InspectionList({
  inspections,
  loading,
  onViewDetails,
  onUpdateStatus,
  onPrint,
  getStatusColor,
}: InspectionListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <ClipboardCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Inspections Yet</h3>
          <p className="text-slate-500 mb-6">Add your first inspection to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {inspections.map((inspection) => (
        <Card key={inspection.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{inspection.inspection_type}</h3>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-500 mb-3">
                  {inspection.project_name || 'No project'}
                </p>
                
                {inspection.findings && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {inspection.findings}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {inspection.inspector_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{inspection.inspector_name}</span>
                    </div>
                  )}
                  {inspection.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{inspection.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => onViewDetails(inspection)}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={inspection.status}
                    onChange={(e) => onUpdateStatus(inspection.id, e.target.value)}
                    className="px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={onPrint}
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}