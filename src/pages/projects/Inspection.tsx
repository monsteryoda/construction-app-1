import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Project } from '@/components/deliveries/DeliveryTypes';

export default function Inspection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    project_id: '',
    inspection_type: '',
    inspection_date: '',
    work_category: '',
    zone: '',
    location: '',
    inspection_time: '',
    intended_date: '',
    intended_time: '',
    site_manager: '',
    safety_officer: '',
    quality_control: '',
    remarks: '',
    priority: 'normal',
  });
  const [pilingChecklist, setPilingChecklist] = useState({
    surveySettingOut: false,
    excavationLevel: false,
    reinforcement: false,
    concreteGrade: false,
    concretePouring: false,
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
  const [reinforcementChecklist, setReinforcementChecklist] = useState({
    barSizeAndSpacing: false,
    lapLengthAndPosition: false,
    coverBlockersAndSupports: false,
    fixingSecurely: false,
    barCleanAndFreeFromDebris: false,
  });
  const [signatures, setSignatures] = useState({
    inspectedBy: '',
    reviewedBy: '',
    approvedBy: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMoreImages = () => {
    fileInputRef.current?.click();
  };

  const handlePilingChecklistChange = (key: keyof typeof pilingChecklist, value: boolean) => {
    setPilingChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFoundationChecklistChange = (key: keyof typeof foundationChecklist, value: boolean) => {
    setFoundationChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFormworkChecklistChange = (key: keyof typeof formworkChecklist, value: boolean) => {
    setFormworkChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReinforcementChecklistChange = (key: keyof typeof reinforcementChecklist, value: boolean) => {
    setReinforcementChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.inspection_type) {
      toast.error('Please select inspection type');
      return;
    }

    if (!formData.inspection_date) {
      toast.error('Please select inspection date');
      return;
    }

    if (!formData.work_category) {
      toast.error('Please select work category');
      return;
    }

    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Insert inspection record
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert([{
          user_id: user.id,
          ...formData,
        }])
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // Upload images if any
      if (selectedImages.length > 0 && inspection) {
        for (const image of selectedImages) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${inspection.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('inspection_images')
            .upload(filePath, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('inspection_images')
            .getPublicUrl(filePath);

          await supabase
            .from('inspection_images')
            .insert({
              inspection_id: inspection.id,
              image_url: publicUrl,
              file_name: image.name,
            });
        }
      }

      toast.success('Inspection submitted successfully');
      
      // Reset form
      setFormData({
        project_id: '',
        inspection_type: '',
        inspection_date: '',
        work_category: '',
        zone: '',
        location: '',
        inspection_time: '',
        intended_date: '',
        intended_time: '',
        site_manager: '',
        safety_officer: '',
        quality_control: '',
        remarks: '',
        priority: 'normal',
      });
      setPilingChecklist({
        surveySettingOut: false,
        excavationLevel: false,
        reinforcement: false,
        concreteGrade: false,
        concretePouring: false,
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
      setReinforcementChecklist({
        barSizeAndSpacing: false,
        lapLengthAndPosition: false,
        coverBlockersAndSupports: false,
        fixingSecurely: false,
        barCleanAndFreeFromDebris: false,
      });
      setSignatures({
        inspectedBy: '',
        reviewedBy: '',
        approvedBy: '',
      });
      setSelectedImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting inspection:', error);
      toast.error('Failed to submit inspection');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Inspection</h1>
          <p className="text-slate-500">Submit construction inspection reports</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <select
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Details */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspection_type">Inspection Type *</Label>
                  <select
                    id="inspection_type"
                    name="inspection_type"
                    value={formData.inspection_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="Piling Work">Piling Work</option>
                    <option value="FOUNDATION FOOTING">FOUNDATION FOOTING</option>
                    <option value="FORMWORK">FORMWORK</option>
                    <option value="REINFORCEMENT WORK / BRC">REINFORCEMENT WORK / BRC</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspection_date">Inspection Date *</Label>
                  <Input
                    id="inspection_date"
                    name="inspection_date"
                    type="date"
                    value={formData.inspection_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_category">Work Category *</Label>
                  <select
                    id="work_category"
                    name="work_category"
                    value={formData.work_category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Piling Work">Piling Work</option>
                    <option value="FOUNDATION FOOTING">FOUNDATION FOOTING</option>
                    <option value="FORMWORK">FORMWORK</option>
                    <option value="REINFORCEMENT WORK / BRC">REINFORCEMENT WORK / BRC</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Input
                    id="zone"
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    placeholder="Enter zone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspection_time">Inspection Time</Label>
                  <Input
                    id="inspection_time"
                    name="inspection_time"
                    type="time"
                    value={formData.inspection_time}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intended_date">Intended Date</Label>
                  <Input
                    id="intended_date"
                    name="intended_date"
                    type="date"
                    value={formData.intended_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intended_time">Intended Time</Label>
                  <Input
                    id="intended_time"
                    name="intended_time"
                    type="time"
                    value={formData.intended_time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_manager">Site Manager</Label>
                  <Input
                    id="site_manager"
                    name="site_manager"
                    value={formData.site_manager}
                    onChange={handleInputChange}
                    placeholder="Enter site manager name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="safety_officer">Safety Officer</Label>
                  <Input
                    id="safety_officer"
                    name="safety_officer"
                    value={formData.safety_officer}
                    onChange={handleInputChange}
                    placeholder="Enter safety officer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality_control">Quality Control</Label>
                  <Input
                    id="quality_control"
                    name="quality_control"
                    value={formData.quality_control}
                    onChange={handleInputChange}
                    placeholder="Enter QC name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Enter any remarks"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Piling Work Checklist */}
          {formData.work_category === 'Piling Work' && (
            <Card>
              <CardHeader>
                <CardTitle>Piling Work Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="surveySettingOut"
                      checked={pilingChecklist.surveySettingOut}
                      onChange={(e) => handlePilingChecklistChange('surveySettingOut', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="surveySettingOut" className="text-sm">
                      Survey Setting Out With Reference To Drawing.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="excavationLevel"
                      checked={pilingChecklist.excavationLevel}
                      onChange={(e) => handlePilingChecklistChange('excavationLevel', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="excavationLevel" className="text-sm">
                      Excavation Level
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="reinforcement"
                      checked={pilingChecklist.reinforcement}
                      onChange={(e) => handlePilingChecklistChange('reinforcement', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="reinforcement" className="text-sm">
                      Reinforcement
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="concreteGrade"
                      checked={pilingChecklist.concreteGrade}
                      onChange={(e) => handlePilingChecklistChange('concreteGrade', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="concreteGrade" className="text-sm">
                      Concrete Grade
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="concretePouring"
                      checked={pilingChecklist.concretePouring}
                      onChange={(e) => handlePilingChecklistChange('concretePouring', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="concretePouring" className="text-sm">
                      Concrete Pouring
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Foundation Footing Checklist */}
          {formData.work_category === 'FOUNDATION FOOTING' && (
            <Card>
              <CardHeader>
                <CardTitle>Foundation Footing Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="foundationSurveySettingOut"
                      checked={foundationChecklist.surveySettingOut}
                      onChange={(e) => handleFoundationChecklistChange('surveySettingOut', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="foundationSurveySettingOut" className="text-sm">
                      Survey Setting Out With Reference To Drawing.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="foundationExcavationLevel"
                      checked={foundationChecklist.excavationLevel}
                      onChange={(e) => handleFoundationChecklistChange('excavationLevel', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="foundationExcavationLevel" className="text-sm">
                      Excavation Level
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="foundationHardcoreCrusherRun"
                      checked={foundationChecklist.hardcoreCrusherRun}
                      onChange={(e) => handleFoundationChecklistChange('hardcoreCrusherRun', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="foundationHardcoreCrusherRun" className="text-sm">
                      Hardcore Crusher Run
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="foundationVerticalityCheck"
                      checked={foundationChecklist.verticalityCheck}
                      onChange={(e) => handleFoundationChecklistChange('verticalityCheck', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="foundationVerticalityCheck" className="text-sm">
                      Verticality Check
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="foundationLeanConcrete"
                      checked={foundationChecklist.leanConcrete}
                      onChange={(e) => handleFoundationChecklistChange('leanConcrete', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="foundationLeanConcrete" className="text-sm">
                      Lean Concrete
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formwork Checklist */}
          {formData.work_category === 'FORMWORK' && (
            <Card>
              <CardHeader>
                <CardTitle>Formwork Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="formworkDimensionLevelsVerticality"
                      checked={formworkChecklist.dimensionLevelsVerticality}
                      onChange={(e) => handleFormworkChecklistChange('dimensionLevelsVerticality', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="formworkDimensionLevelsVerticality" className="text-sm">
                      Dimension Levels, Verticality.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="formworkAdequatelySupportedOfPropped"
                      checked={formworkChecklist.adequatelySupportedOfPropped}
                      onChange={(e) => handleFormworkChecklistChange('adequatelySupportedOfPropped', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="formworkAdequatelySupportedOfPropped" className="text-sm">
                      Adequately Supported of Propped.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="formworkJointsTight"
                      checked={formworkChecklist.jointsTight}
                      onChange={(e) => handleFormworkChecklistChange('jointsTight', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="formworkJointsTight" className="text-sm">
                      Joints Tight.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="formworkSurfaceOfFormsAcceptable"
                      checked={formworkChecklist.surfaceOfFormsAcceptable}
                      onChange={(e) => handleFormworkChecklistChange('surfaceOfFormsAcceptable', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="formworkSurfaceOfFormsAcceptable" className="text-sm">
                      Surface of Forms Acceptable.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="formworkAllSawdustAndRubbishRemoved"
                      checked={formworkChecklist.allSawdustAndRubbishRemoved}
                      onChange={(e) => handleFormworkChecklistChange('allSawdustAndRubbishRemoved', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="formworkAllSawdustAndRubbishRemoved" className="text-sm">
                      All Sawdust & Rubbish Removed.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reinforcement Work / BRC Checklist */}
          {formData.work_category === 'REINFORCEMENT WORK / BRC' && (
            <Card>
              <CardHeader>
                <CardTitle>Reinforcement Work / BRC Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="reinforcementBarSizeAndSpacing"
                      checked={reinforcementChecklist.barSizeAndSpacing}
                      onChange={(e) => handleReinforcementChecklistChange('barSizeAndSpacing', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="reinforcementBarSizeAndSpacing" className="text-sm">
                      Bar Size and Spacing.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="reinforcementLapLengthAndPosition"
                      checked={reinforcementChecklist.lapLengthAndPosition}
                      onChange={(e) => handleReinforcementChecklistChange('lapLengthAndPosition', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="reinforcementLapLengthAndPosition" className="text-sm">
                      Lap Length and Position.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="reinforcementCoverBlockersAndSupports"
                      checked={reinforcementChecklist.coverBlockersAndSupports}
                      onChange={(e) => handleReinforcementChecklistChange('coverBlockersAndSupports', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="reinforcementCoverBlockersAndSupports" className="text-sm">
                      Cover Blockers and Supports.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="reinforcementFixingSecurely"
                      checked={reinforcementChecklist.fixingSecurely}
                      onChange={(e) => handleReinforcementChecklistChange('fixingSecurely', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="reinforcementFixingSecurely" className="text-sm">
                      Fixing Securely.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="reinforcementBarCleanAndFreeFromDebris"
                      checked={reinforcementChecklist.barCleanAndFreeFromDebris}
                      onChange={(e) => handleReinforcementChecklistChange('barCleanAndFreeFromDebris', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="reinforcementBarCleanAndFreeFromDebris" className="text-sm">
                      Bar Clean and Free from Debris.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signatures Section */}
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectedBy">Inspected By</Label>
                  <Input
                    id="inspectedBy"
                    value={signatures.inspectedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, inspectedBy: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewedBy">Reviewed By</Label>
                  <Input
                    id="reviewedBy"
                    value={signatures.reviewedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, reviewedBy: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvedBy">Approved By</Label>
                  <Input
                    id="approvedBy"
                    value={signatures.approvedBy}
                    onChange={(e) => setSignatures(prev => ({ ...prev, approvedBy: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attach Images */}
          <Card>
            <CardHeader>
              <CardTitle>Attach Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <Upload className="w-12 h-12 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Click to attach images</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
                    <p className="text-xs text-slate-400 mt-1">You can select multiple images at once</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full inline-block"></span>
                    Uploading images...
                  </p>
                )}
                {imagePreviews.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMoreImages}
                    className="w-full mt-3 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add More Images
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={uploading} className="w-full md:w-auto">
              {uploading ? 'Submitting...' : 'Submit Inspection'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}