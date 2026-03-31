import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, X } from 'lucide-react';

interface Remark {
  id: string;
  remark: string;
  created_by: string;
  created_at: string;
}

interface InspectionRemarksProps {
  remarksList: Remark[];
  onAddRemark: () => void;
  onDeleteRemark: (remarkId: string) => Promise<void>;
  formatRemarkDate: (dateString: string) => string;
}

export default function InspectionRemarks({
  remarksList,
  onAddRemark,
  onDeleteRemark,
  formatRemarkDate,
}: InspectionRemarksProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5" />
          Remarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              {remarksList?.length || 0} remark(s)
            </span>
          </div>
          <Button onClick={onAddRemark} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Remark
          </Button>
        </div>

        {remarksList && remarksList.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {remarksList.map((remark) => (
              <div key={remark.id} className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-700">{remark.remark}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">
                    {formatRemarkDate(remark.created_at)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRemark(remark.id)}
                    className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No remarks yet</p>
        )}
      </CardContent>
    </Card>
  );
}