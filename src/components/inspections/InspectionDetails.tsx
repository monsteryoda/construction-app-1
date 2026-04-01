"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Calendar, User, Mail, Building, Printer, Eye } from 'lucide-react';
import { Inspection, InspectionImage } from '@/pages/projects/Inspection';

interface InspectionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection | null;
  images: InspectionImage[];
  imagesLoading: boolean;
  rwiSerialNo: string;
  referenceNo: string;
  trackingNo: string;
}

export default function InspectionDetails({
  isOpen,
  onClose,
  inspection,
  images,
  imagesLoading,
  rwiSerialNo,
  referenceNo,
  trackingNo,
}: InspectionDetailsProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!inspection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">Inspection Details</DialogTitle>
          <DialogDescription>
            View the complete inspection request details and attached photos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Company Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h2 className="text-xl font-bold text-slate-900">UBBIM RESOURCES SDN BHD</h2>
          </div>

          {/* Part A Header */}
          <div className="border-2 border-slate-900 p-4">
            <h3 className="font-bold text-sm mb-3 text-center">PART A – REQUEST APPLICATION</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs">PROJECT</Label>
                <Input
                  value={inspection.project_name || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">RWI Serial No</Label>
                <Input
                  value={rwiSerialNo}
                  className="text-sm bg-slate-50 font-mono"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs">Work Category</Label>
                <Input
                  value={inspection.inspection_type || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Contractor (Requestor)</Label>
                <Input
                  value={inspection.contractor || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input
                  value={inspection.email || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs">Client</Label>
                <Input
                  value={inspection.client || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Consultant</Label>
                <Input
                  value={inspection.consultant || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs">References</Label>
                <Input
                  value={inspection.references || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tracking</Label>
                <Input
                  value={inspection.tracking || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label className="text-xs">Description of Works</Label>
              <Textarea
                value={inspection.description || 'N/A'}
                className="text-sm bg-slate-50"
                disabled
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Zone</Label>
                <Input
                  value={inspection.zone || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Location</Label>
                <Input
                  value={inspection.location || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Request Section */}
          <div className="border-2 border-slate-900 p-4">
            <h3 className="font-bold text-sm mb-3">Request</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs">Requested by</Label>
                <Input
                  value={inspection.inspector_name || 'N/A'}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={inspection.inspection_date || ''}
                  className="text-sm bg-slate-50"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Works Ready for Inspection on</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={inspection.inspection_date || ''}
                    className="text-sm flex-1 bg-slate-50"
                    disabled
                  />
                  <Input
                    type="time"
                    value={inspection.inspection_time || '10:00'}
                    className="text-sm w-24 bg-slate-50"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Works Intended to commence on</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={inspection.intended_date || ''}
                    className="text-sm flex-1 bg-slate-50"
                    disabled
                  />
                  <Input
                    type="time"
                    value={inspection.intended_time || '10:00'}
                    className="text-sm w-24 bg-slate-50"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-2 border-slate-900 p-4">
            <h3 className="font-bold text-sm mb-3">Additional Information</h3>
            
            <div className="space-y-2 mb-4">
              <Label className="text-xs">Findings</Label>
              <Textarea
                value={inspection.findings || 'N/A'}
                className="text-sm bg-slate-50"
                disabled
                rows={3}
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label className="text-xs">Recommendations</Label>
              <Textarea
                value={inspection.recommendations || 'N/A'}
                className="text-sm bg-slate-50"
                disabled
                rows={2}
              />
            </div>

            {/* Images Section */}
            <div className="space-y-2">
              <Label className="text-xs">Inspection Photos</Label>
              {imagesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-slate-500">Loading images...</p>
                </div>
              ) : images.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_url}
                        alt={image.file_name || 'Inspection photo'}
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p>No photos attached</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Close</Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}