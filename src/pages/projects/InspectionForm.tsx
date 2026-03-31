import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck } from 'lucide-react';

interface Inspection {
  inspection_type?: string;
  inspection_date?: string;
  inspector_name?: string;
  priority?: string;
  work_category?: string;
  contractor?: string;
  zone?: string;
  location?: string;
  findings?: string;
  recommendations?: string;
}

interface InspectionFormProps {
  inspection: Inspection;
  onInspectionChange: (inspection: Inspection) => void;
}

export default function InspectionForm({ inspection, onInspectionChange }: InspectionFormProps) {
  const handleChange = (field: keyof Inspection, value: string) => {
    onInspectionChange({ ...inspection, [field]: value });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="w-5 h-5" />
          Inspection Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Inspection Type</Label>
            <Input
              value={inspection.inspection_type || ''}
              onChange={(e) => handleChange('inspection_type', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Inspection Date</Label>
            <Input
              type="date"
              value={inspection.inspection_date || ''}
              onChange={(e) => handleChange('inspection_date', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Inspector Name</Label>
            <Input
              value={inspection.inspector_name || ''}
              onChange={(e) => handleChange('inspector_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={inspection.priority}
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Work Category</Label>
            <Input
              value={inspection.work_category || ''}
              onChange={(e) => handleChange('work_category', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Contractor</Label>
            <Input
              value={inspection.contractor || ''}
              onChange={(e) => handleChange('contractor', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Zone</Label>
            <Input
              value={inspection.zone || ''}
              onChange={(e) => handleChange('zone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={inspection.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Findings</Label>
          <Textarea
            value={inspection.findings || ''}
            onChange={(e) => handleChange('findings', e.target.value)}
            placeholder="Enter inspection findings..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Recommendations</Label>
          <Textarea
            value={inspection.recommendations || ''}
            onChange={(e) => handleChange('recommendations', e.target.value)}
            placeholder="Enter recommendations..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}