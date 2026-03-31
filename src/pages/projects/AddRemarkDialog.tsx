import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface AddRemarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newRemark: string;
  onRemarkChange: (remark: string) => void;
  onAddRemark: () => Promise<void>;
}

export default function AddRemarkDialog({
  isOpen,
  onClose,
  newRemark,
  onRemarkChange,
  onAddRemark,
}: AddRemarkDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Remark
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Remark</Label>
            <Textarea
              value={newRemark}
              onChange={(e) => onRemarkChange(e.target.value)}
              placeholder="Enter remark..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onAddRemark}>Add Remark</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}