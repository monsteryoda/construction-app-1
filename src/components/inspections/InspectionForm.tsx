"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Image as ImageIcon, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/pages/projects/Inspection';
import PilingChecklist from './PilingChecklist';
import FoundationChecklist from './FoundationChecklist';
import FormworkChecklist from './FormworkChecklist';

interface InspectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, images: File[]) => Promise<void>;
  onUpdate: (formData: any, images: File[], editingId: string) => Promise<void>;
  projects: Project[];
  rwiSerialNo: string;
  referenceNo: string;
  trackingNo: string;
  editingId: string | null;
}

export default function InspectionForm({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  projects,
  rwiSerialNo,
  referenceNo,
  trackingNo,
  editingId,
}: InspectionFormProps) {
  const [formData, setFormData] = useState({
    project_id: '',
    work_category: '',
    contractor: '',
    description: '',
    zone: '',
    location: '',
    inspection_date: '',
    inspection_time: '10:00',
    intended_date: '',
    intended_time: '10:00',
    inspector_name: '',
    email: '',
    client: '',
    consultant: '',
    status: 'pending',
    findings: '',
    recommendations: '',
    references: '',
    tracking: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [pilingChecklist, setPilingChecklist] = useState({
    checkPositionOfPeg: false,
    checkPilePitchedAccurately: false,
    checkVerticalityOfPiles: false,
    checkWeldingJoint: false,
  });
  const [foundationChecklist, setFoundationChecklist] = useState({
    surveySettingOut: false,
    excavationLevel: false,
    hardcoreCrusherRun: false,
    verticalityCheck: false,
    leanConcrete: false,
  });
  const [formworkChecklist, setFormworkChecklist] = useState({
    dimensionLevelsVerticality: false,
    adequatelySupportedOfPropped: false,
    jointsTight: false,
    surfaceOfFormsAcceptable: false,
    allSawdustAndRubbishRemoved: false,
  });
  const [signatures, setSignatures] = useState({
    inspectedBy: '',
    reviewedBy: '',
    approvedBy: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    let previewsLoaded = 0;
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        validPreviews.push(e.target?.result as string);
        previewsLoaded++;
        
        if (previewsLoaded === validFiles.length) {
          setSelectedImages(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...validPreviews]);
          toast.success(`Added ${validFiles.length} image(s)`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      contractor: project?.contractor || '',
      client: project?.client || '',
      consultant: project?.consultant || '',
    }));
  };

  const handleSubmit = async () => {
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.work_category) {
      toast.error('Please select work category');
      return;
    }

    if (!formData.inspection_date) {
      toast.error('Please select inspection date');
      return;
    }

    if (!formData.inspector_name) {
      toast.error('Please enter inspector name');
      return;
    }

    try {
      if (editingId) {
        await onUpdate(formData, selectedImages, editingId);
      } else {
        await onSubmit(formData, selectedImages);
      }

      setFormData({
        project_id: '',
        work_category: '',
        contractor: '',
        description: '',
        zone: '',
        location: '',
        inspection_date: '',
        inspection_time: '10:00',
        intended_date: '',
        intended_time: '10:00',
        inspector_name: '',
        email: '',
        client: '',
        consultant: '',
        status: 'pending',
        findings: '',
        recommendations: '',
        references: '',
        tracking: '',
      });
      setSelectedImages([]);
      setImagePreviews([]);
      setPilingChecklist({
        checkPositionOfPeg: false,
        checkPilePitchedAccurately: false,
        checkVerticalityOfPiles: false,
        checkWeldingJoint: false,
      });
      setFoundationChecklist({
        surveySettingOut: false,
        excavationLevel: false,
        hardcoreCrusherRun: false,
        verticalityCheck: false,
        leanConcrete: false,
      });
      setFormworkChecklist({
        dimensionLevelsVerticality: false,
        adequatelySupportedOfPropped: false,
        jointsTight: false,
        surfaceOfFormsAcceptable: false,
        allSawdustAndRubbishRemoved: false,
      });
      setSignatures({
        inspectedBy: '',
        reviewedBy: '',
        approvedBy: '',
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save inspection');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">REQUEST FOR WORK INSPECTION (RWI) FORM</DialogTitle>
          <DialogDescription>
            Fill in the inspection request form below to submit a work inspection request.
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
                <select
                  value={formData.project_id}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">RWI Serial No</Label>
                <Input
                  value={editingId ? 'N/A (Existing)' : rwiSerialNo}
                  className="text-sm bg-slate-50 font-mono"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs">Work Category</Label>
                <select
                  value={formData.work_category}
                  onChange={(e) => setFormData({ ...formData, work_category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select work category</option>
                  <option value="PILING WORK">PILING WORK</option>
                  <option value="FOUNDATION FOOTING">FOUNDATION FOOTING</option>
                  <option value="FORMWORK">FORMWORK</option>
                  <option value="REINFORCEMENT WORK / BRC">REINFORCEMENT WORK / BRC</option>
                  <option value="CONCRETE WORK">CONCRETE WORK</option>
                  <option value="SITE CLEARANCE">SITE CLEARANCE</option>
                  <option value="EARTHWORK">EARTHWORK</option>
                  <option value="ROAD WORK">ROAD WORK</option>
                  <option value="SURFACE WATER DRAIN">SURFACE WATER DRAIN</option>
                  <option value="PERIMETER DRAIN AND APRON">PERIMETER DRAIN AND APRON</option>
                  <option value="WASTE WATER DRAIN">WASTE WATER DRAIN</option>
                  <option value="PIPE CULVERT / BOX CULVERT">PIPE CULVERT / BOX CULVERT</option>
                  <option value="BRICKWORK">BRICKWORK</option>
                  <option value="PLASTERING">PLASTERING</option>
                  <option value="WALL AND FLOOR TILING">WALL AND FLOOR TILING</option>
                  <option value="DOOR AND WINDOW">DOOR AND WINDOW</option>
                  <option value="STRUCTURAL STEEL WORK">STRUCTURAL STEEL WORK</option>
                  <option value="ANCHOR BOLT WORK">ANCHOR BOLT WORK</option>
                  <option value="PAINTING WORK">PAINTING WORK</option>
                  <option value="ERECTION">ERECTION</option>
                  <option value="ROOFING WORK">ROOFING WORK</option>
                  <option value="GUTTER WORK">GUTTER WORK</option>
                  <option value="RAIN WATER DOWN PIPE WORK">RAIN WATER DOWN PIPE WORK</option>
                  <option value="INTERNAL SANITARY WORK">INTERNAL SANITARY WORK</option>
                  <option value="FIRE PROTECTION SERVICES">FIRE PROTECTION SERVICES</option>
                  <option value="ELECTRICAL SERVICES">ELECTRICAL SERVICES</option>
                  <option value="STRUCTURAL RECTIFICATION">STRUCTURAL RECTIFICATION</option>
                  <option value="HDPE MEMBRANE">HDPE MEMBRANE</option>
                  <option value="PERIMETER FENCING / HOARDING">PERIMETER FENCING / HOARDING</option>
                  <option value="FINAL CLEANING UP">FINAL CLEANING UP</option>
                  <option value="COLD WATER PIPING WORK">COLD WATER PIPING WORK</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Contractor (Requestor)</Label>
                <Input
                  value={formData.contractor}
                  onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                  className="text-sm"
                  placeholder="Contractor name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-sm pl-9"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs">Client</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="text-sm pl-9"
                    placeholder="Client name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Consultant</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={formData.consultant}
                    onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
                    className="text-sm pl-9"
                    placeholder="Consultant name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label className="text-xs">Description of Works</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the work to be inspected..."
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Zone</Label>
                <Input
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Zone"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Location"
                  className="text-sm"
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
                  value={formData.inspector_name}
                  onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                  placeholder="Inspector name"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={formData.inspection_date}
                  onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Works Ready for Inspection on</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                    className="text-sm flex-1"
                  />
                  <Input
                    type="time"
                    value={formData.inspection_time}
                    onChange={(e) => setFormData({ ...formData, inspection_time: e.target.value })}
                    className="text-sm w-24"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Works Intended to commence on</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formData.intended_date}
                    onChange={(e) => setFormData({ ...formData, intended_date: e.target.value })}
                    className="text-sm flex-1"
                  />
                  <Input
                    type="time"
                    value={formData.intended_time}
                    onChange={(e) => setFormData({ ...formData, intended_time: e.target.value })}
                    className="text-sm w-24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Sections */}
          {formData.work_category === 'PILING WORK' && (
            <PilingChecklist checklist={pilingChecklist} onChange={setPilingChecklist} />
          )}

          {formData.work_category === 'FOUNDATION FOOTING' && (
            <FoundationChecklist checklist={foundationChecklist} onChange={setFoundationChecklist} />
          )}

          {formData.work_category === 'FORMWORK' && (
            <FormworkChecklist checklist={formworkChecklist} onChange={setFormworkChecklist} />
          )}

          {/* Additional Information */}
          <div className="border-2 border-slate-900 p-4">
            <h3 className="font-bold text-sm mb-3">Additional Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs">References</Label>
                <Input
                  value={formData.references || referenceNo}
                  onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                  placeholder="Reference number"
                  className="text-sm bg-slate-50 font-mono"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tracking</Label>
                <Input
                  value={formData.tracking || trackingNo}
                  onChange={(e) => setFormData({ ...formData, tracking: e.target.value })}
                  placeholder="Tracking number"
                  className="text-sm bg-slate-50 font-mono"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label className="text-xs">Findings</Label>
              <Textarea
                value={formData.findings}
                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                placeholder="Enter inspection findings..."
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label className="text-xs">Recommendations</Label>
              <Textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Enter recommendations..."
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Attach Photos</Label>
              <div className="mt-2">
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                  >
                    <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Click to attach photos</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="border-2 border-slate-900 p-4">
            <h3 className="font-bold text-sm mb-3">Signatures</h3>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Inspected By */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">INSPECTED BY:</Label>
                <p className="text-xs text-slate-500">QA Executive / Assistant Site Manager</p>
                <div className="border-b border-slate-400 h-12"></div>
                <div className="space-y-1">
                  <Label className="text-xs">Signature</Label>
                  <Input
                    value={signatures.inspectedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, inspectedBy: e.target.value }))}
                    placeholder="Sign here"
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={signatures.inspectedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, inspectedBy: e.target.value }))}
                    placeholder="Full name"
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                    className="text-sm h-8"
                  />
                </div>
              </div>

              {/* Reviewed By */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">REVIEWED BY:</Label>
                <p className="text-xs text-slate-500">Client Project Manager / Engineer</p>
                <div className="border-b border-slate-400 h-12"></div>
                <div className="space-y-1">
                  <Label className="text-xs">Signature</Label>
                  <Input
                    value={signatures.reviewedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, reviewedBy: e.target.value }))}
                    placeholder="Sign here"
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={signatures.reviewedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, reviewedBy: e.target.value }))}
                    placeholder="Full name"
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                    className="text-sm h-8"
                  />
                </div>
              </div>

              {/* Approved By */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">APPROVED BY:</Label>
                <p className="text-xs text-slate-500">Consultant Engineer</p>
                <div className="border-b border-slate-400 h-12"></div>
                <div className="space-y-1">
                  <Label className="text-xs">Signature</Label>
                  <Input
                    value={signatures.approvedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, approvedBy: e.target.value }))}
                    placeholder="Sign here"
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={signatures.approvedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, approvedBy: e.target.value }))}
                    placeholder="Full name"
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company Stamp</Label>
                  <div className="border border-dashed border-slate-300 h-8 rounded flex items-center justify-center text-xs text-slate-400">
                    Stamp Area
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {editingId ? 'Update Inspection' : 'Add Inspection'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}