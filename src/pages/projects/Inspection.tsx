"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Search, ClipboardCheck, Calendar, User, Image as ImageIcon, X, AlertCircle, FileText, Database, CheckCircle2, Mail, Building, Printer, Save, Eye, Edit2, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Inspection {
  id: string;
  user_id: string;
  project_id: string;
  inspection_type: string;
  inspection_date: string;
  inspector_name: string;
  status: string;
  findings: string;
  recommendations: string;
  email?: string;
  client?: string;
  consultant?: string;
  project_name?: string;
  work_category?: string;
  contractor?: string;
  description?: string;
  zone?: string;
  location?: string;
  inspection_time?: string;
  intended_date?: string;
  intended_time?: string;
  reference_no?: string;
  tracking?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  project_name: string;
  contractor?: string;
  client?: string;
  consultant?: string;
}

interface InspectionImage {
  id: string;
  inspection_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

interface InspectionChecklist {
  id: string;
  inspection_id: string;
  work_category: string;
  checklist_data: {
    [key: string]: boolean;
  };
  created_at: string;
  updated_at: string;
}

export default function Inspection() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionImages, setInspectionImages] = useState<InspectionImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rwiSerialNo, setRwiSerialNo] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
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
    reference_no: '',
    tracking: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
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
  const [reinforcementChecklist, setReinforcementChecklist] = useState({
    correctGradeSizeNumberSpacing: false,
    correctLapAnchorageLength: false,
    adequateChairsSpacers: false,
    coverAsRequired: false,
    noMudOilLooseRust: false,
  });
  const [concreteChecklist, setConcreteChecklist] = useState({
    concreteGradeAccordingToSpecification: false,
    slumpTestCubeTaken: false,
    vibratorAtSite: false,
  });
  const [siteClearanceChecklist, setSiteClearanceChecklist] = useState({
    surveySettingOut: false,
    removalOfTreesBushes: false,
    removalOfDebris: false,
  });
  const [earthworkChecklist, setEarthworkChecklist] = useState({
    complianceToDrawing: false,
    settingOut: false,
    excavation: false,
    backfilling: false,
    compaction: false,
    fieldDensityTest: false,
    turfingHydroseeding: false,
    detentionPond: false,
    siltTrap: false,
    temporaryEarthDrain: false,
    asBuiltLevel: false,
  });
  const [roadWorkChecklist, setRoadWorkChecklist] = useState({
    complianceToDrawing: false,
    settingOut: false,
    excavation: false,
    backfilling: false,
    compaction: false,
    subbase: false,
    basecourse: false,
    binderCourse: false,
    surfaceCourse: false,
    kerb: false,
    channel: false,
    manhole: false,
    drainage: false,
    roadMarking: false,
    signBoard: false,
  });
  const [surfaceWaterDrainChecklist, setSurfaceWaterDrainChecklist] = useState({
    complianceToDrawing: false,
    settingOut: false,
    excavation: false,
    backfilling: false,
    compaction: false,
    drainConstruction: false,
    drainInvertLevel: false,
    drainCamber: false,
    drainFinish: false,
    drainJoints: false,
    drainTesting: false,
    drainProtection: false,
    drainManhole: false,
    drainChannel: false,
    drainGully: false,
    drainGrating: false,
    drainCatchpit: false,
    drainOutfall: false,
  });
  const [perimeterDrainAndApronChecklist, setPerimeterDrainAndApronChecklist] = useState({
    complianceToDrawing: false,
    settingOut: false,
    excavation: false,
    backfilling: false,
    compaction: false,
    drainConstruction: false,
    drainInvertLevel: false,
    drainCamber: false,
    drainFinish: false,
    drainJoints: false,
    drainTesting: false,
    apronConstruction: false,
    apronThickness: false,
    apronFinish: false,
    apronCamber: false,
    apronJoints: false,
    apronProtection: false,
    apronOutfall: false,
  });
  const [wasteWaterDrainChecklist, setWasteWaterDrainChecklist] = useState({
    complianceToDrawing: false,
    settingOut: false,
    excavation: false,
    backfilling: false,
    compaction: false,
    drainConstruction: false,
    drainInvertLevel: false,
    drainCamber: false,
    drainFinish: false,
    drainJoints: false,
    drainTesting: false,
    drainProtection: false,
    drainManhole: false,
    drainChannel: false,
    drainGully: false,
    drainGrating: false,
    drainCatchpit: false,
    drainOutfall: false,
  });
  const [pipeCulvertBoxCulvertChecklist, setPipeCulvertBoxCulvertChecklist] = useState({
    complianceToDrawing: false,
    settingOut: false,
    excavation: false,
    backfilling: false,
    compaction: false,
    pipeCulvertBedding: false,
    pipeCulvertJoints: false,
    pipeCulvertInvertLevel: false,
    pipeCulvertTesting: false,
    boxCulvertFormwork: false,
    boxCulvertReinforcement: false,
    boxCulvertConcrete: false,
    boxCulvertWaterproofing: false,
    boxCulvertBackfilling: false,
  });
  const [brickworkChecklist, setBrickworkChecklist] = useState({
    complianceToDrawing: false,
    settingOut: false,
    brickQuality: false,
    mortarMix: false,
    wallVerticality: false,
    wallStraightness: false,
    bedJoints: false,
    crossJoints: false,
    wallThickness: false,
    dampProofCourse: false,
    wallCleaning: false,
    wallCuring: false,
  });
  const [plasteringChecklist, setPlasteringChecklist] = useState({
    complianceToDrawing: false,
    settingOut: false,
    surfacePreparation: false,
    curing: false,
    thickness: false,
    verticality: false,
    straightness: false,
    surfaceFinish: false,
    corners: false,
    joints: false,
    protection: false,
  });
  const [signatures, setSignatures] = useState({
    inspectedBy: '',
    reviewedBy: '',
    approvedBy: '',
  });
  const [checklistLoading, setChecklistLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchInspections();
    generateRwiSerialNo();
    generateReferenceNo();
    generateTrackingNo();
  }, []);

  const generateRwiSerialNo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      const count = data?.length || 0;
      const year = new Date().getFullYear().toString().slice(-2);
      const serial = count + 1;
      const formattedSerial = serial.toString().padStart(2, '0');
      
      setRwiSerialNo(`URSB/KA-T/${year}/35-${formattedSerial}`);
    } catch (error) {
      console.error('Error generating RWI serial no:', error);
      const year = new Date().getFullYear().toString().slice(-2);
      setRwiSerialNo(`URSB/KA-T/${year}/35-01`);
    }
  };

  const generateReferenceNo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select('reference_no')
        .eq('user_id', user.id)
        .not('reference_no', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastRef = data[0].reference_no;
        const match = lastRef?.match(/REF-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      setReferenceNo(`REF-${nextNumber.toString().padStart(3, '0')}`);
    } catch (error) {
      console.error('Error generating reference no:', error);
      setReferenceNo('REF-001');
    }
  };

  const generateTrackingNo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select('tracking')
        .eq('user_id', user.id)
        .not('tracking', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastTrack = data[0].tracking;
        const match = lastTrack?.match(/TRK-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      setTrackingNo(`TRK-${nextNumber.toString().padStart(3, '0')}`);
    } catch (error) {
      console.error('Error generating tracking no:', error);
      setTrackingNo('TRK-001');
    }
  };

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('projects')
        .select('id, project_name, contractor, client, consultant')
        .eq('user_id', user.id);

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchInspections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inspections')
        .select('*, projects(project_name, client, consultant)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast.error('Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionImages = async (inspectionId: string) => {
    try {
      setImagesLoading(true);
      
      const { data, error } = await supabase
        .from('inspection_images')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching images:', error);
        setInspectionImages([]);
        toast.error('Failed to load images');
        return;
      }
      
      setInspectionImages(data || []);
    } catch (error) {
      console.error('Error:', error);
      setInspectionImages([]);
      toast.error('Error loading images');
    } finally {
      setImagesLoading(false);
    }
  };

  const fetchChecklist = async (inspectionId: string) => {
    try {
      setChecklistLoading(true);
      
      const { data, error } = await supabase
        .from('inspection_checklists')
        .select('*')
        .eq('inspection_id', inspectionId)
        .single();

      if (error) {
        console.error('Error fetching checklist:', error);
        return;
      }

      if (data) {
        if (data.work_category === 'PILING WORK') {
          setPilingChecklist(data.checklist_data as any);
        } else if (data.work_category === 'FOUNDATION FOOTING') {
          setFoundationChecklist(data.checklist_data as any);
        } else if (data.work_category === 'FORMWORK') {
          setFormworkChecklist(data.checklist_data as any);
        } else if (data.work_category === 'REINFORCEMENT WORK / BRC') {
          setReinforcementChecklist(data.checklist_data as any);
        } else if (data.work_category === 'CONCRETE WORK') {
          setConcreteChecklist(data.checklist_data as any);
        } else if (data.work_category === 'SITE CLEARANCE') {
          setSiteClearanceChecklist(data.checklist_data as any);
        } else if (data.work_category === 'EARTHWORK') {
          setEarthworkChecklist(data.checklist_data as any);
        } else if (data.work_category === 'ROAD WORK') {
          setRoadWorkChecklist(data.checklist_data as any);
        } else if (data.work_category === 'SURFACE WATER DRAIN') {
          setSurfaceWaterDrainChecklist(data.checklist_data as any);
        } else if (data.work_category === 'PERIMETER DRAIN AND APRON') {
          setPerimeterDrainAndApronChecklist(data.checklist_data as any);
        } else if (data.work_category === 'WASTE WATER DRAIN') {
          setWasteWaterDrainChecklist(data.checklist_data as any);
        } else if (data.work_category === 'PIPE CULVERT / BOX CULVERT') {
          setPipeCulvertBoxCulvertChecklist(data.checklist_data as any);
        } else if (data.work_category === 'BRICKWORK') {
          setBrickworkChecklist(data.checklist_data as any);
        } else if (data.work_category === 'PLASTERING') {
          setPlasteringChecklist(data.checklist_data as any);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setChecklistLoading(false);
    }
  };

  const saveChecklist = async (inspectionId: string, workCategory: string, checklistData: any) => {
    try {
      const { error } = await supabase
        .from('inspection_checklists')
        .upsert({
          inspection_id: inspectionId,
          work_category: workCategory,
          checklist_data: checklistData,
        });

      if (error) throw error;
      toast.success('Checklist saved successfully');
    } catch (error) {
      console.error('Error saving checklist:', error);
      toast.error('Failed to save checklist');
    }
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
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const inspectionData = {
        user_id: user.id,
        project_id: formData.project_id,
        inspection_type: formData.work_category,
        inspection_date: formData.inspection_date,
        inspector_name: formData.inspector_name,
        status: formData.status,
        findings: formData.findings,
        recommendations: formData.recommendations,
        email: formData.email,
        client: formData.client,
        consultant: formData.consultant,
        reference_no: formData.reference_no,
        tracking: formData.tracking,
      };

      let inspectionResult;
      
      if (editingId) {
        const { data, error } = await supabase
          .from('inspections')
          .update(inspectionData)
          .eq('id', editingId)
          .select()
          .single();
        
        if (error) throw error;
        inspectionResult = data;
        toast.success('Inspection updated successfully');
      } else {
        const { data, error } = await supabase
          .from('inspections')
          .insert([inspectionData])
          .select()
          .single();

        if (error) throw error;
        inspectionResult = data;
        toast.success('Inspection added successfully');
      }

      // Save checklist if any checklist data exists
      if (formData.work_category === 'PILING WORK' && Object.values(pilingChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'PILING WORK', pilingChecklist);
      } else if (formData.work_category === 'FOUNDATION FOOTING' && Object.values(foundationChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'FOUNDATION FOOTING', foundationChecklist);
      } else if (formData.work_category === 'FORMWORK' && Object.values(formworkChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'FORMWORK', formworkChecklist);
      } else if (formData.work_category === 'REINFORCEMENT WORK / BRC' && Object.values(reinforcementChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'REINFORCEMENT WORK / BRC', reinforcementChecklist);
      } else if (formData.work_category === 'CONCRETE WORK' && Object.values(concreteChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'CONCRETE WORK', concreteChecklist);
      } else if (formData.work_category === 'SITE CLEARANCE' && Object.values(siteClearanceChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'SITE CLEARANCE', siteClearanceChecklist);
      } else if (formData.work_category === 'EARTHWORK' && Object.values(earthworkChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'EARTHWORK', earthworkChecklist);
      } else if (formData.work_category === 'ROAD WORK' && Object.values(roadWorkChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'ROAD WORK', roadWorkChecklist);
      } else if (formData.work_category === 'SURFACE WATER DRAIN' && Object.values(surfaceWaterDrainChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'SURFACE WATER DRAIN', surfaceWaterDrainChecklist);
      } else if (formData.work_category === 'PERIMETER DRAIN AND APRON' && Object.values(perimeterDrainAndApronChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'PERIMETER DRAIN AND APRON', perimeterDrainAndApronChecklist);
      } else if (formData.work_category === 'WASTE WATER DRAIN' && Object.values(wasteWaterDrainChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'WASTE WATER DRAIN', wasteWaterDrainChecklist);
      } else if (formData.work_category === 'PIPE CULVERT / BOX CULVERT' && Object.values(pipeCulvertBoxCulvertChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'PIPE CULVERT / BOX CULVERT', pipeCulvertBoxCulvertChecklist);
      } else if (formData.work_category === 'BRICKWORK' && Object.values(brickworkChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'BRICKWORK', brickworkChecklist);
      } else if (formData.work_category === 'PLASTERING' && Object.values(plasteringChecklist).some(v => v)) {
        await saveChecklist(inspectionResult.id, 'PLASTERING', plasteringChecklist);
      }

      // Upload images if any
      if (selectedImages.length > 0) {
        let uploadedCount = 0;
        let failedCount = 0;

        for (const file of selectedImages) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('inspection_images')
            .upload(`${inspectionResult.id}/${fileName}`, file);

          if (uploadError) {
            failedCount++;
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('inspection_images')
            .getPublicUrl(uploadData.path);

          const { error: dbError } = await supabase
            .from('inspection_images')
            .insert([{
              inspection_id: inspectionResult.id,
              image_url: publicUrl,
              file_name: fileName,
            }]);

          if (dbError) {
            failedCount++;
          } else {
            uploadedCount++;
          }
        }

        if (uploadedCount > 0) {
          toast.success(`${uploadedCount} image(s) uploaded successfully`);
        }
        if (failedCount > 0) {
          toast.warning(`${failedCount} image(s) failed to upload`);
        }
      }

      setShowAddDialog(false);
      setShowEditDialog(false);
      setEditingId(null);
      generateRwiSerialNo();
      generateReferenceNo();
      generateTrackingNo();
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
        reference_no: '',
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
      setReinforcementChecklist({
        correctGradeSizeNumberSpacing: false,
        correctLapAnchorageLength: false,
        adequateChairsSpacers: false,
        coverAsRequired: false,
        noMudOilLooseRust: false,
      });
      setConcreteChecklist({
        concreteGradeAccordingToSpecification: false,
        slumpTestCubeTaken: false,
        vibratorAtSite: false,
      });
      setSiteClearanceChecklist({
        surveySettingOut: false,
        removalOfTreesBushes: false,
        removalOfDebris: false,
      });
      setEarthworkChecklist({
        complianceToDrawing: false,
        settingOut: false,
        excavation: false,
        backfilling: false,
        compaction: false,
        fieldDensityTest: false,
        turfingHydroseeding: false,
        detentionPond: false,
        siltTrap: false,
        temporaryEarthDrain: false,
        asBuiltLevel: false,
      });
      setRoadWorkChecklist({
        complianceToDrawing: false,
        settingOut: false,
        excavation: false,
        backfilling: false,
        compaction: false,
        subbase: false,
        basecourse: false,
        binderCourse: false,
        surfaceCourse: false,
        kerb: false,
        channel: false,
        manhole: false,
        drainage: false,
        roadMarking: false,
        signBoard: false,
      });
      setSurfaceWaterDrainChecklist({
        complianceToDrawing: false,
        settingOut: false,
        excavation: false,
        backfilling: false,
        compaction: false,
        drainConstruction: false,
        drainInvertLevel: false,
        drainCamber: false,
        drainFinish: false,
        drainJoints: false,
        drainTesting: false,
        drainProtection: false,
        drainManhole: false,
        drainChannel: false,
        drainGully: false,
        drainGrating: false,
        drainCatchpit: false,
        drainOutfall: false,
      });
      setPerimeterDrainAndApronChecklist({
        complianceToDrawing: false,
        settingOut: false,
        excavation: false,
        backfilling: false,
        compaction: false,
        drainConstruction: false,
        drainInvertLevel: false,
        drainCamber: false,
        drainFinish: false,
        drainJoints: false,
        drainTesting: false,
        apronConstruction: false,
        apronThickness: false,
        apronFinish: false,
        apronCamber: false,
        apronJoints: false,
        apronProtection: false,
        apronOutfall: false,
      });
      setWasteWaterDrainChecklist({
        complianceToDrawing: false,
        settingOut: false,
        excavation: false,
        backfilling: false,
        compaction: false,
        drainConstruction: false,
        drainInvertLevel: false,
        drainCamber: false,
        drainFinish: false,
        drainJoints: false,
        drainTesting: false,
        drainProtection: false,
        drainManhole: false,
        drainChannel: false,
        drainGully: false,
        drainGrating: false,
        drainCatchpit: false,
        drainOutfall: false,
      });
      setPipeCulvertBoxCulvertChecklist({
        complianceToDrawing: false,
        settingOut: false,
        excavation: false,
        backfilling: false,
        compaction: false,
        pipeCulvertBedding: false,
        pipeCulvertJoints: false,
        pipeCulvertInvertLevel: false,
        pipeCulvertTesting: false,
        boxCulvertFormwork: false,
        boxCulvertReinforcement: false,
        boxCulvertConcrete: false,
        boxCulvertWaterproofing: false,
        boxCulvertBackfilling: false,
      });
      setBrickworkChecklist({
        complianceToDrawing: false,
        settingOut: false,
        brickQuality: false,
        mortarMix: false,
        wallVerticality: false,
        wallStraightness: false,
        bedJoints: false,
        crossJoints: false,
        wallThickness: false,
        dampProofCourse: false,
        wallCleaning: false,
        wallCuring: false,
      });
      setPlasteringChecklist({
        complianceToDrawing: false,
        settingOut: false,
        surfacePreparation: false,
        curing: false,
        thickness: false,
        verticality: false,
        straightness: false,
        surfaceFinish: false,
        corners: false,
        joints: false,
        protection: false,
      });
      setSignatures({
        inspectedBy: '',
        reviewedBy: '',
        approvedBy: '',
      });
      fetchInspections();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save inspection');
    }
  };

  const handleViewDetails = async (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setInspectionImages([]);
    await fetchInspectionImages(inspection.id);
    await fetchChecklist(inspection.id);
    setShowDetailsDialog(true);
  };

  const handleEdit = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setFormData({
      project_id: inspection.project_id,
      work_category: inspection.inspection_type,
      contractor: inspection.contractor || '',
      description: inspection.description || '',
      zone: inspection.zone || '',
      location: inspection.location || '',
      inspection_date: inspection.inspection_date || '',
      inspection_time: inspection.inspection_time || '10:00',
      intended_date: inspection.intended_date || '',
      intended_time: inspection.intended_time || '10:00',
      inspector_name: inspection.inspector_name,
      email: inspection.email || '',
      client: inspection.client || '',
      consultant: inspection.consultant || '',
      status: inspection.status,
      findings: inspection.findings || '',
      recommendations: inspection.recommendations || '',
      reference_no: inspection.reference_no || '',
      tracking: inspection.tracking || '',
    });
    setEditingId(inspection.id);
    fetchChecklist(inspection.id);
    setShowEditDialog(true);
  };

  const handleUpdateStatus = async (inspectionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('inspections')
        .update({ status: newStatus })
        .eq('id', inspectionId);

      if (error) throw error;
      
      toast.success(`Status updated to ${newStatus}`);
      fetchInspections();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.inspection_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const handleConcreteChecklistChange = (key: keyof typeof concreteChecklist, value: boolean) => {
    setConcreteChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSiteClearanceChecklistChange = (key: keyof typeof siteClearanceChecklist, value: boolean) => {
    setSiteClearanceChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEarthworkChecklistChange = (key: keyof typeof earthworkChecklist, value: boolean) => {
    setEarthworkChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRoadWorkChecklistChange = (key: keyof typeof roadWorkChecklist, value: boolean) => {
    setRoadWorkChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSurfaceWaterDrainChecklistChange = (key: keyof typeof surfaceWaterDrainChecklist, value: boolean) => {
    setSurfaceWaterDrainChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePerimeterDrainAndApronChecklistChange = (key: keyof typeof perimeterDrainAndApronChecklist, value: boolean) => {
    setPerimeterDrainAndApronChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleWasteWaterDrainChecklistChange = (key: keyof typeof wasteWaterDrainChecklist, value: boolean) => {
    setWasteWaterDrainChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePipeCulvertBoxCulvertChecklistChange = (key: keyof typeof pipeCulvertBoxCulvertChecklist, value: boolean) => {
    setPipeCulvertBoxCulvertChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBrickworkChecklistChange = (key: keyof typeof brickworkChecklist, value: boolean) => {
    setBrickworkChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePlasteringChecklistChange = (key: keyof typeof plasteringChecklist, value: boolean) => {
    setPlasteringChecklist(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inspections</h1>
            <p className="text-slate-500 mt-1">Track and manage project inspections</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Inspection
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search inspections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-[180px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Add Inspection Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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

              {/* Request Section - Second Section */}
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

              {/* Piling Work Checklist - Third Section */}
              {formData.work_category === 'PILING WORK' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Piling Work Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="checkPositionOfPeg"
                        checked={pilingChecklist.checkPositionOfPeg}
                        onChange={(e) => handlePilingChecklistChange('checkPositionOfPeg', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="checkPositionOfPeg" className="text-sm">
                        Check Position Of Peg With Reference to Drawing.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="checkPilePitchedAccurately"
                        checked={pilingChecklist.checkPilePitchedAccurately}
                        onChange={(e) => handlePilingChecklistChange('checkPilePitchedAccurately', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="checkPilePitchedAccurately" className="text-sm">
                        Check Whether Pile Are Pitched Accurately As Per Drawing.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="checkVerticalityOfPiles"
                        checked={pilingChecklist.checkVerticalityOfPiles}
                        onChange={(e) => handlePilingChecklistChange('checkVerticalityOfPiles', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="checkVerticalityOfPiles" className="text-sm">
                        Check Verticality Of Piles Before Driving In.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="checkWeldingJoint"
                        checked={pilingChecklist.checkWeldingJoint}
                        onChange={(e) => handlePilingChecklistChange('checkWeldingJoint', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="checkWeldingJoint" className="text-sm">
                        Check For Welding Joint With Reference to Drawing.
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Foundation Footing Checklist - Third Section */}
              {formData.work_category === 'FOUNDATION FOOTING' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Foundation Footing Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="surveySettingOut"
                        checked={foundationChecklist.surveySettingOut}
                        onChange={(e) => handleFoundationChecklistChange('surveySettingOut', e.target.checked)}
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
                        checked={foundationChecklist.excavationLevel}
                        onChange={(e) => handleFoundationChecklistChange('excavationLevel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="excavationLevel" className="text-sm">
                        Excavation Level
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="hardcoreCrusherRun"
                        checked={foundationChecklist.hardcoreCrusherRun}
                        onChange={(e) => handleFoundationChecklistChange('hardcoreCrusherRun', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="hardcoreCrusherRun" className="text-sm">
                        Hardcore Crusher Run
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="verticalityCheck"
                        checked={foundationChecklist.verticalityCheck}
                        onChange={(e) => handleFoundationChecklistChange('verticalityCheck', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="verticalityCheck" className="text-sm">
                        Verticality Check
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="leanConcrete"
                        checked={foundationChecklist.leanConcrete}
                        onChange={(e) => handleFoundationChecklistChange('leanConcrete', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="leanConcrete" className="text-sm">
                        Lean Concrete
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Formwork Checklist - Third Section */}
              {formData.work_category === 'FORMWORK' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Formwork Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="dimensionLevelsVerticality"
                        checked={formworkChecklist.dimensionLevelsVerticality}
                        onChange={(e) => handleFormworkChecklistChange('dimensionLevelsVerticality', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="dimensionLevelsVerticality" className="text-sm">
                        Dimension Levels, Verticality.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="adequatelySupportedOfPropped"
                        checked={formworkChecklist.adequatelySupportedOfPropped}
                        onChange={(e) => handleFormworkChecklistChange('adequatelySupportedOfPropped', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="adequatelySupportedOfPropped" className="text-sm">
                        Adequately Supported of Propped.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="jointsTight"
                        checked={formworkChecklist.jointsTight}
                        onChange={(e) => handleFormworkChecklistChange('jointsTight', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="jointsTight" className="text-sm">
                        Joints Tight.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="surfaceOfFormsAcceptable"
                        checked={formworkChecklist.surfaceOfFormsAcceptable}
                        onChange={(e) => handleFormworkChecklistChange('surfaceOfFormsAcceptable', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="surfaceOfFormsAcceptable" className="text-sm">
                        Surface of Forms Acceptable.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="allSawdustAndRubbishRemoved"
                        checked={formworkChecklist.allSawdustAndRubbishRemoved}
                        onChange={(e) => handleFormworkChecklistChange('allSawdustAndRubbishRemoved', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="allSawdustAndRubbishRemoved" className="text-sm">
                        All Sawdust & Rubbish Removed.
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Reinforcement Work / BRC Checklist - Third Section */}
              {formData.work_category === 'REINFORCEMENT WORK / BRC' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Reinforcement Work / BRC Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="correctGradeSizeNumberSpacing"
                        checked={reinforcementChecklist.correctGradeSizeNumberSpacing}
                        onChange={(e) => handleReinforcementChecklistChange('correctGradeSizeNumberSpacing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="correctGradeSizeNumberSpacing" className="text-sm">
                        Correct Grade, Size, Number & Spacing.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="correctLapAnchorageLength"
                        checked={reinforcementChecklist.correctLapAnchorageLength}
                        onChange={(e) => handleReinforcementChecklistChange('correctLapAnchorageLength', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="correctLapAnchorageLength" className="text-sm">
                        Correct Lap / Anchorage Length.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="adequateChairsSpacers"
                        checked={reinforcementChecklist.adequateChairsSpacers}
                        onChange={(e) => handleReinforcementChecklistChange('adequateChairsSpacers', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="adequateChairsSpacers" className="text-sm">
                        Adequate Chairs, Spacers, etc.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="coverAsRequired"
                        checked={reinforcementChecklist.coverAsRequired}
                        onChange={(e) => handleReinforcementChecklistChange('coverAsRequired', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="coverAsRequired" className="text-sm">
                        Cover as Required.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="noMudOilLooseRust"
                        checked={reinforcementChecklist.noMudOilLooseRust}
                        onChange={(e) => handleReinforcementChecklistChange('noMudOilLooseRust', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="noMudOilLooseRust" className="text-sm">
                        No Mud, Oil, Loose Rust, etc.
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Concrete Work Checklist - Third Section */}
              {formData.work_category === 'CONCRETE WORK' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Concrete Work Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="concreteGradeAccordingToSpecification"
                        checked={concreteChecklist.concreteGradeAccordingToSpecification}
                        onChange={(e) => handleConcreteChecklistChange('concreteGradeAccordingToSpecification', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="concreteGradeAccordingToSpecification" className="text-sm">
                        Concrete Grade according to Specification.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="slumpTestCubeTaken"
                        checked={concreteChecklist.slumpTestCubeTaken}
                        onChange={(e) => handleConcreteChecklistChange('slumpTestCubeTaken', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="slumpTestCubeTaken" className="text-sm">
                        Slump Test / Cube Taken.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="vibratorAtSite"
                        checked={concreteChecklist.vibratorAtSite}
                        onChange={(e) => handleConcreteChecklistChange('vibratorAtSite', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="vibratorAtSite" className="text-sm">
                        Vibrator at Site.
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Site Clearance Checklist - Third Section */}
              {formData.work_category === 'SITE CLEARANCE' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Site Clearance Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="surveySettingOut"
                        checked={siteClearanceChecklist.surveySettingOut}
                        onChange={(e) => handleSiteClearanceChecklistChange('surveySettingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="surveySettingOut" className="text-sm">
                        Survey setting out as per Drawing.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="removalOfTreesBushes"
                        checked={siteClearanceChecklist.removalOfTreesBushes}
                        onChange={(e) => handleSiteClearanceChecklistChange('removalOfTreesBushes', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="removalOfTreesBushes" className="text-sm">
                        Removal of all trees, bushes, vegetation, rubbish and other obstruction.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="removalOfDebris"
                        checked={siteClearanceChecklist.removalOfDebris}
                        onChange={(e) => handleSiteClearanceChecklistChange('removalOfDebris', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="removalOfDebris" className="text-sm">
                        Removal or Dispose off existing debris from site.
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Earthwork Checklist - Third Section */}
              {formData.work_category === 'EARTHWORK' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Earthwork Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="complianceToDrawing"
                        checked={earthworkChecklist.complianceToDrawing}
                        onChange={(e) => handleEarthworkChecklistChange('complianceToDrawing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="complianceToDrawing" className="text-sm">
                        Compliance to the Drawing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="settingOut"
                        checked={earthworkChecklist.settingOut}
                        onChange={(e) => handleEarthworkChecklistChange('settingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="settingOut" className="text-sm">
                        Setting Out
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="excavation"
                        checked={earthworkChecklist.excavation}
                        onChange={(e) => handleEarthworkChecklistChange('excavation', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="excavation" className="text-sm">
                        Excavation
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="backfilling"
                        checked={earthworkChecklist.backfilling}
                        onChange={(e) => handleEarthworkChecklistChange('backfilling', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="backfilling" className="text-sm">
                        Backfilling
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="compaction"
                        checked={earthworkChecklist.compaction}
                        onChange={(e) => handleEarthworkChecklistChange('compaction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="compaction" className="text-sm">
                        Compaction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="fieldDensityTest"
                        checked={earthworkChecklist.fieldDensityTest}
                        onChange={(e) => handleEarthworkChecklistChange('fieldDensityTest', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="fieldDensityTest" className="text-sm">
                        Field Density Test (FDT)
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="turfingHydroseeding"
                        checked={earthworkChecklist.turfingHydroseeding}
                        onChange={(e) => handleEarthworkChecklistChange('turfingHydroseeding', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="turfingHydroseeding" className="text-sm">
                        Turfing / Hydroseeding
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="detentionPond"
                        checked={earthworkChecklist.detentionPond}
                        onChange={(e) => handleEarthworkChecklistChange('detentionPond', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="detentionPond" className="text-sm">
                        Detention Pond
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="siltTrap"
                        checked={earthworkChecklist.siltTrap}
                        onChange={(e) => handleEarthworkChecklistChange('siltTrap', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="siltTrap" className="text-sm">
                        Silt Trap
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="temporaryEarthDrain"
                        checked={earthworkChecklist.temporaryEarthDrain}
                        onChange={(e) => handleEarthworkChecklistChange('temporaryEarthDrain', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="temporaryEarthDrain" className="text-sm">
                        Temporary Earth Drain (TED) & Check Dam
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="asBuiltLevel"
                        checked={earthworkChecklist.asBuiltLevel}
                        onChange={(e) => handleEarthworkChecklistChange('asBuiltLevel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="asBuiltLevel" className="text-sm">
                        As built level
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Road Work Checklist - Third Section */}
              {formData.work_category === 'ROAD WORK' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Road Work Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="complianceToDrawing"
                        checked={roadWorkChecklist.complianceToDrawing}
                        onChange={(e) => handleRoadWorkChecklistChange('complianceToDrawing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="complianceToDrawing" className="text-sm">
                        Compliance to the Drawing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="settingOut"
                        checked={roadWorkChecklist.settingOut}
                        onChange={(e) => handleRoadWorkChecklistChange('settingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="settingOut" className="text-sm">
                        Setting Out
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="excavation"
                        checked={roadWorkChecklist.excavation}
                        onChange={(e) => handleRoadWorkChecklistChange('excavation', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="excavation" className="text-sm">
                        Excavation
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="backfilling"
                        checked={roadWorkChecklist.backfilling}
                        onChange={(e) => handleRoadWorkChecklistChange('backfilling', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="backfilling" className="text-sm">
                        Backfilling
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="compaction"
                        checked={roadWorkChecklist.compaction}
                        onChange={(e) => handleRoadWorkChecklistChange('compaction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="compaction" className="text-sm">
                        Compaction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="subbase"
                        checked={roadWorkChecklist.subbase}
                        onChange={(e) => handleRoadWorkChecklistChange('subbase', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="subbase" className="text-sm">
                        Subbase
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="basecourse"
                        checked={roadWorkChecklist.basecourse}
                        onChange={(e) => handleRoadWorkChecklistChange('basecourse', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="basecourse" className="text-sm">
                        Basecourse
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="binderCourse"
                        checked={roadWorkChecklist.binderCourse}
                        onChange={(e) => handleRoadWorkChecklistChange('binderCourse', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="binderCourse" className="text-sm">
                        Binder Course
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="surfaceCourse"
                        checked={roadWorkChecklist.surfaceCourse}
                        onChange={(e) => handleRoadWorkChecklistChange('surfaceCourse', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="surfaceCourse" className="text-sm">
                        Surface Course
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="kerb"
                        checked={roadWorkChecklist.kerb}
                        onChange={(e) => handleRoadWorkChecklistChange('kerb', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="kerb" className="text-sm">
                        Kerb
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="channel"
                        checked={roadWorkChecklist.channel}
                        onChange={(e) => handleRoadWorkChecklistChange('channel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="channel" className="text-sm">
                        Channel
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="manhole"
                        checked={roadWorkChecklist.manhole}
                        onChange={(e) => handleRoadWorkChecklistChange('manhole', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="manhole" className="text-sm">
                        Manhole
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainage"
                        checked={roadWorkChecklist.drainage}
                        onChange={(e) => handleRoadWorkChecklistChange('drainage', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainage" className="text-sm">
                        Drainage
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="roadMarking"
                        checked={roadWorkChecklist.roadMarking}
                        onChange={(e) => handleRoadWorkChecklistChange('roadMarking', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="roadMarking" className="text-sm">
                        Road Marking
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="signBoard"
                        checked={roadWorkChecklist.signBoard}
                        onChange={(e) => handleRoadWorkChecklistChange('signBoard', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="signBoard" className="text-sm">
                        Sign Board
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Surface Water Drain Checklist - Third Section */}
              {formData.work_category === 'SURFACE WATER DRAIN' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Surface Water Drain Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="complianceToDrawing"
                        checked={surfaceWaterDrainChecklist.complianceToDrawing}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('complianceToDrawing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="complianceToDrawing" className="text-sm">
                        Compliance to the Drawing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="settingOut"
                        checked={surfaceWaterDrainChecklist.settingOut}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('settingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="settingOut" className="text-sm">
                        Setting Out
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="excavation"
                        checked={surfaceWaterDrainChecklist.excavation}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('excavation', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="excavation" className="text-sm">
                        Excavation
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="backfilling"
                        checked={surfaceWaterDrainChecklist.backfilling}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('backfilling', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="backfilling" className="text-sm">
                        Backfilling
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="compaction"
                        checked={surfaceWaterDrainChecklist.compaction}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('compaction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="compaction" className="text-sm">
                        Compaction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainConstruction"
                        checked={surfaceWaterDrainChecklist.drainConstruction}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainConstruction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainConstruction" className="text-sm">
                        Drain Construction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainInvertLevel"
                        checked={surfaceWaterDrainChecklist.drainInvertLevel}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainInvertLevel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainInvertLevel" className="text-sm">
                        Drain Invert Level
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainCamber"
                        checked={surfaceWaterDrainChecklist.drainCamber}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainCamber', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainCamber" className="text-sm">
                        Drain Camber
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainFinish"
                        checked={surfaceWaterDrainChecklist.drainFinish}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainFinish', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainFinish" className="text-sm">
                        Drain Finish
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainJoints"
                        checked={surfaceWaterDrainChecklist.drainJoints}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainJoints', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainJoints" className="text-sm">
                        Drain Joints
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainTesting"
                        checked={surfaceWaterDrainChecklist.drainTesting}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainTesting', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainTesting" className="text-sm">
                        Drain Testing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainProtection"
                        checked={surfaceWaterDrainChecklist.drainProtection}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainProtection', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainProtection" className="text-sm">
                        Drain Protection
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainManhole"
                        checked={surfaceWaterDrainChecklist.drainManhole}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainManhole', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainManhole" className="text-sm">
                        Drain Manhole
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainChannel"
                        checked={surfaceWaterDrainChecklist.drainChannel}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainChannel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainChannel" className="text-sm">
                        Drain Channel
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainGully"
                        checked={surfaceWaterDrainChecklist.drainGully}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainGully', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainGully" className="text-sm">
                        Drain Gully
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainGrating"
                        checked={surfaceWaterDrainChecklist.drainGrating}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainGrating', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainGrating" className="text-sm">
                        Drain Grating
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainCatchpit"
                        checked={surfaceWaterDrainChecklist.drainCatchpit}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainCatchpit', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainCatchpit" className="text-sm">
                        Drain Catchpit
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainOutfall"
                        checked={surfaceWaterDrainChecklist.drainOutfall}
                        onChange={(e) => handleSurfaceWaterDrainChecklistChange('drainOutfall', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainOutfall" className="text-sm">
                        Drain Outfall
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Perimeter Drain and Apron Checklist - Third Section */}
              {formData.work_category === 'PERIMETER DRAIN AND APRON' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Perimeter Drain and Apron Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="complianceToDrawing"
                        checked={perimeterDrainAndApronChecklist.complianceToDrawing}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('complianceToDrawing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="complianceToDrawing" className="text-sm">
                        Compliance to the Drawing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="settingOut"
                        checked={perimeterDrainAndApronChecklist.settingOut}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('settingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="settingOut" className="text-sm">
                        Setting Out
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="excavation"
                        checked={perimeterDrainAndApronChecklist.excavation}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('excavation', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="excavation" className="text-sm">
                        Excavation
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="backfilling"
                        checked={perimeterDrainAndApronChecklist.backfilling}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('backfilling', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="backfilling" className="text-sm">
                        Backfilling
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="compaction"
                        checked={perimeterDrainAndApronChecklist.compaction}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('compaction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="compaction" className="text-sm">
                        Compaction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainConstruction"
                        checked={perimeterDrainAndApronChecklist.drainConstruction}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('drainConstruction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainConstruction" className="text-sm">
                        Drain Construction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainInvertLevel"
                        checked={perimeterDrainAndApronChecklist.drainInvertLevel}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('drainInvertLevel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainInvertLevel" className="text-sm">
                        Drain Invert Level
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainCamber"
                        checked={perimeterDrainAndApronChecklist.drainCamber}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('drainCamber', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainCamber" className="text-sm">
                        Drain Camber
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainFinish"
                        checked={perimeterDrainAndApronChecklist.drainFinish}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('drainFinish', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainFinish" className="text-sm">
                        Drain Finish
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainJoints"
                        checked={perimeterDrainAndApronChecklist.drainJoints}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('drainJoints', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainJoints" className="text-sm">
                        Drain Joints
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainTesting"
                        checked={perimeterDrainAndApronChecklist.drainTesting}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('drainTesting', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainTesting" className="text-sm">
                        Drain Testing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="apronConstruction"
                        checked={perimeterDrainAndApronChecklist.apronConstruction}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('apronConstruction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="apronConstruction" className="text-sm">
                        Apron Construction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="apronThickness"
                        checked={perimeterDrainAndApronChecklist.apronThickness}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('apronThickness', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="apronThickness" className="text-sm">
                        Apron Thickness
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="apronFinish"
                        checked={perimeterDrainAndApronChecklist.apronFinish}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('apronFinish', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="apronFinish" className="text-sm">
                        Apron Finish
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="apronCamber"
                        checked={perimeterDrainAndApronChecklist.apronCamber}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('apronCamber', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="apronCamber" className="text-sm">
                        Apron Camber
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="apronJoints"
                        checked={perimeterDrainAndApronChecklist.apronJoints}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('apronJoints', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="apronJoints" className="text-sm">
                        Apron Joints
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="apronProtection"
                        checked={perimeterDrainAndApronChecklist.apronProtection}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('apronProtection', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="apronProtection" className="text-sm">
                        Apron Protection
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="apronOutfall"
                        checked={perimeterDrainAndApronChecklist.apronOutfall}
                        onChange={(e) => handlePerimeterDrainAndApronChecklistChange('apronOutfall', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="apronOutfall" className="text-sm">
                        Apron Outfall
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Waste Water Drain Checklist - Third Section */}
              {formData.work_category === 'WASTE WATER DRAIN' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Waste Water Drain Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="complianceToDrawing"
                        checked={wasteWaterDrainChecklist.complianceToDrawing}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('complianceToDrawing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="complianceToDrawing" className="text-sm">
                        Compliance to the Drawing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="settingOut"
                        checked={wasteWaterDrainChecklist.settingOut}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('settingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="settingOut" className="text-sm">
                        Setting Out
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="excavation"
                        checked={wasteWaterDrainChecklist.excavation}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('excavation', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="excavation" className="text-sm">
                        Excavation
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="backfilling"
                        checked={wasteWaterDrainChecklist.backfilling}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('backfilling', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="backfilling" className="text-sm">
                        Backfilling
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="compaction"
                        checked={wasteWaterDrainChecklist.compaction}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('compaction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="compaction" className="text-sm">
                        Compaction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainConstruction"
                        checked={wasteWaterDrainChecklist.drainConstruction}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainConstruction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainConstruction" className="text-sm">
                        Drain Construction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainInvertLevel"
                        checked={wasteWaterDrainChecklist.drainInvertLevel}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainInvertLevel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainInvertLevel" className="text-sm">
                        Drain Invert Level
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainCamber"
                        checked={wasteWaterDrainChecklist.drainCamber}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainCamber', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainCamber" className="text-sm">
                        Drain Camber
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainFinish"
                        checked={wasteWaterDrainChecklist.drainFinish}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainFinish', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainFinish" className="text-sm">
                        Drain Finish
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainJoints"
                        checked={wasteWaterDrainChecklist.drainJoints}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainJoints', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainJoints" className="text-sm">
                        Drain Joints
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainTesting"
                        checked={wasteWaterDrainChecklist.drainTesting}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainTesting', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainTesting" className="text-sm">
                        Drain Testing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainProtection"
                        checked={wasteWaterDrainChecklist.drainProtection}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainProtection', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainProtection" className="text-sm">
                        Drain Protection
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainManhole"
                        checked={wasteWaterDrainChecklist.drainManhole}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainManhole', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainManhole" className="text-sm">
                        Drain Manhole
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainChannel"
                        checked={wasteWaterDrainChecklist.drainChannel}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainChannel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainChannel" className="text-sm">
                        Drain Channel
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainGully"
                        checked={wasteWaterDrainChecklist.drainGully}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainGully', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainGully" className="text-sm">
                        Drain Gully
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainGrating"
                        checked={wasteWaterDrainChecklist.drainGrating}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainGrating', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainGrating" className="text-sm">
                        Drain Grating
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainCatchpit"
                        checked={wasteWaterDrainChecklist.drainCatchpit}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainCatchpit', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainCatchpit" className="text-sm">
                        Drain Catchpit
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="drainOutfall"
                        checked={wasteWaterDrainChecklist.drainOutfall}
                        onChange={(e) => handleWasteWaterDrainChecklistChange('drainOutfall', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="drainOutfall" className="text-sm">
                        Drain Outfall
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Pipe Culvert / Box Culvert Checklist - Third Section */}
              {formData.work_category === 'PIPE CULVERT / BOX CULVERT' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Pipe Culvert / Box Culvert Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="complianceToDrawing"
                        checked={pipeCulvertBoxCulvertChecklist.complianceToDrawing}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('complianceToDrawing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="complianceToDrawing" className="text-sm">
                        Compliance to the Drawing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="settingOut"
                        checked={pipeCulvertBoxCulvertChecklist.settingOut}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('settingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="settingOut" className="text-sm">
                        Setting Out
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="excavation"
                        checked={pipeCulvertBoxCulvertChecklist.excavation}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('excavation', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="excavation" className="text-sm">
                        Excavation
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="backfilling"
                        checked={pipeCulvertBoxCulvertChecklist.backfilling}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('backfilling', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="backfilling" className="text-sm">
                        Backfilling
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="compaction"
                        checked={pipeCulvertBoxCulvertChecklist.compaction}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('compaction', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="compaction" className="text-sm">
                        Compaction
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="pipeCulvertBedding"
                        checked={pipeCulvertBoxCulvertChecklist.pipeCulvertBedding}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('pipeCulvertBedding', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="pipeCulvertBedding" className="text-sm">
                        Pipe Culvert Bedding
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="pipeCulvertJoints"
                        checked={pipeCulvertBoxCulvertChecklist.pipeCulvertJoints}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('pipeCulvertJoints', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="pipeCulvertJoints" className="text-sm">
                        Pipe Culvert Joints
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="pipeCulvertInvertLevel"
                        checked={pipeCulvertBoxCulvertChecklist.pipeCulvertInvertLevel}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('pipeCulvertInvertLevel', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="pipeCulvertInvertLevel" className="text-sm">
                        Pipe Culvert Invert Level
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="pipeCulvertTesting"
                        checked={pipeCulvertBoxCulvertChecklist.pipeCulvertTesting}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('pipeCulvertTesting', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="pipeCulvertTesting" className="text-sm">
                        Pipe Culvert Testing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="boxCulvertFormwork"
                        checked={pipeCulvertBoxCulvertChecklist.boxCulvertFormwork}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('boxCulvertFormwork', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="boxCulvertFormwork" className="text-sm">
                        Box Culvert Formwork
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="boxCulvertReinforcement"
                        checked={pipeCulvertBoxCulvertChecklist.boxCulvertReinforcement}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('boxCulvertReinforcement', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="boxCulvertReinforcement" className="text-sm">
                        Box Culvert Reinforcement
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="boxCulvertConcrete"
                        checked={pipeCulvertBoxCulvertChecklist.boxCulvertConcrete}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('boxCulvertConcrete', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="boxCulvertConcrete" className="text-sm">
                        Box Culvert Concrete
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="boxCulvertWaterproofing"
                        checked={pipeCulvertBoxCulvertChecklist.boxCulvertWaterproofing}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('boxCulvertWaterproofing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="boxCulvertWaterproofing" className="text-sm">
                        Box Culvert Waterproofing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="boxCulvertBackfilling"
                        checked={pipeCulvertBoxCulvertChecklist.boxCulvertBackfilling}
                        onChange={(e) => handlePipeCulvertBoxCulvertChecklistChange('boxCulvertBackfilling', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="boxCulvertBackfilling" className="text-sm">
                        Box Culvert Backfilling
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Brickwork Checklist - Third Section */}
              {formData.work_category === 'BRICKWORK' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Brickwork Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="complianceToDrawing"
                        checked={brickworkChecklist.complianceToDrawing}
                        onChange={(e) => handleBrickworkChecklistChange('complianceToDrawing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="complianceToDrawing" className="text-sm">
                        Compliance to the Drawing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="settingOut"
                        checked={brickworkChecklist.settingOut}
                        onChange={(e) => handleBrickworkChecklistChange('settingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="settingOut" className="text-sm">
                        Setting Out
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="brickQuality"
                        checked={brickworkChecklist.brickQuality}
                        onChange={(e) => handleBrickworkChecklistChange('brickQuality', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="brickQuality" className="text-sm">
                        Brick Quality
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="mortarMix"
                        checked={brickworkChecklist.mortarMix}
                        onChange={(e) => handleBrickworkChecklistChange('mortarMix', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="mortarMix" className="text-sm">
                        Mortar Mix
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="wallVerticality"
                        checked={brickworkChecklist.wallVerticality}
                        onChange={(e) => handleBrickworkChecklistChange('wallVerticality', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="wallVerticality" className="text-sm">
                        Wall Verticality
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="wallStraightness"
                        checked={brickworkChecklist.wallStraightness}
                        onChange={(e) => handleBrickworkChecklistChange('wallStraightness', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="wallStraightness" className="text-sm">
                        Wall Straightness
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="bedJoints"
                        checked={brickworkChecklist.bedJoints}
                        onChange={(e) => handleBrickworkChecklistChange('bedJoints', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="bedJoints" className="text-sm">
                        Bed Joints
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="crossJoints"
                        checked={brickworkChecklist.crossJoints}
                        onChange={(e) => handleBrickworkChecklistChange('crossJoints', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="crossJoints" className="text-sm">
                        Cross Joints
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="wallThickness"
                        checked={brickworkChecklist.wallThickness}
                        onChange={(e) => handleBrickworkChecklistChange('wallThickness', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="wallThickness" className="text-sm">
                        Wall Thickness
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="dampProofCourse"
                        checked={brickworkChecklist.dampProofCourse}
                        onChange={(e) => handleBrickworkChecklistChange('dampProofCourse', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="dampProofCourse" className="text-sm">
                        Damp Proof Course
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="wallCleaning"
                        checked={brickworkChecklist.wallCleaning}
                        onChange={(e) => handleBrickworkChecklistChange('wallCleaning', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="wallCleaning" className="text-sm">
                        Wall Cleaning
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="wallCuring"
                        checked={brickworkChecklist.wallCuring}
                        onChange={(e) => handleBrickworkChecklistChange('wallCuring', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="wallCuring" className="text-sm">
                        Wall Curing
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Plastering Checklist - Third Section */}
              {formData.work_category === 'PLASTERING' && (
                <div className="border-2 border-slate-900 p-4">
                  <h3 className="font-bold text-sm mb-3">Plastering Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="complianceToDrawing"
                        checked={plasteringChecklist.complianceToDrawing}
                        onChange={(e) => handlePlasteringChecklistChange('complianceToDrawing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="complianceToDrawing" className="text-sm">
                        Compliance to the Drawing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="settingOut"
                        checked={plasteringChecklist.settingOut}
                        onChange={(e) => handlePlasteringChecklistChange('settingOut', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="settingOut" className="text-sm">
                        Setting Out
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="surfacePreparation"
                        checked={plasteringChecklist.surfacePreparation}
                        onChange={(e) => handlePlasteringChecklistChange('surfacePreparation', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="surfacePreparation" className="text-sm">
                        Surface Preparation
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="curing"
                        checked={plasteringChecklist.curing}
                        onChange={(e) => handlePlasteringChecklistChange('curing', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="curing" className="text-sm">
                        Curing
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="thickness"
                        checked={plasteringChecklist.thickness}
                        onChange={(e) => handlePlasteringChecklistChange('thickness', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="thickness" className="text-sm">
                        Thickness
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="verticality"
                        checked={plasteringChecklist.verticality}
                        onChange={(e) => handlePlasteringChecklistChange('verticality', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="verticality" className="text-sm">
                        Verticality
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="straightness"
                        checked={plasteringChecklist.straightness}
                        onChange={(e) => handlePlasteringChecklistChange('straightness', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="straightness" className="text-sm">
                        Straightness
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="surfaceFinish"
                        checked={plasteringChecklist.surfaceFinish}
                        onChange={(e) => handlePlasteringChecklistChange('surfaceFinish', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="surfaceFinish" className="text-sm">
                        Surface Finish
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="corners"
                        checked={plasteringChecklist.corners}
                        onChange={(e) => handlePlasteringChecklistChange('corners', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="corners" className="text-sm">
                        Corners
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="joints"
                        checked={plasteringChecklist.joints}
                        onChange={(e) => handlePlasteringChecklistChange('joints', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="joints" className="text-sm">
                        Joints
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="protection"
                        checked={plasteringChecklist.protection}
                        onChange={(e) => handlePlasteringChecklistChange('protection', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="protection" className="text-sm">
                        Protection
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="border-2 border-slate-900 p-4">
                <h3 className="font-bold text-sm mb-3">Additional Information</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs">References</Label>
                    <Input
                      value={formData.reference_no || referenceNo}
                      onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
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
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                      >
                        <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Click to attach photos</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                    )}
                    <input
                      id="image-upload"
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
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {editingId ? 'Update Inspection' : 'Add Inspection'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-semibold">Inspection Details</DialogTitle>
              <DialogDescription>
                View the complete inspection request details and attached photos.
              </DialogDescription>
            </DialogHeader>
            {selectedInspection && (
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
                        value={selectedInspection.project_name || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
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
                      <Input
                        value={selectedInspection.inspection_type || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Contractor (Requestor)</Label>
                      <Input
                        value={selectedInspection.contractor || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Email</Label>
                      <Input
                        value={selectedInspection.email || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Client</Label>
                      <Input
                        value={selectedInspection.client || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Consultant</Label>
                      <Input
                        value={selectedInspection.consultant || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs">References</Label>
                      <Input
                        value={selectedInspection.reference_no || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Tracking</Label>
                      <Input
                        value={selectedInspection.tracking || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label className="text-xs">Description of Works</Label>
                    <Textarea
                      value={selectedInspection.description || 'N/A'}
                      className="text-sm bg-slate-50"
                      disabled
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Zone</Label>
                      <Input
                        value={selectedInspection.zone || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Location</Label>
                      <Input
                        value={selectedInspection.location || 'N/A'}
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
                        value={selectedInspection.inspector_name || 'N/A'}
                        className="text-sm bg-slate-50"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={selectedInspection.inspection_date || ''}
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
                          value={selectedInspection.inspection_date || ''}
                          className="text-sm flex-1 bg-slate-50"
                          disabled
                        />
                        <Input
                          type="time"
                          value={selectedInspection.inspection_time || '10:00'}
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
                          value={selectedInspection.intended_date || ''}
                          className="text-sm flex-1 bg-slate-50"
                          disabled
                        />
                        <Input
                          type="time"
                          value={selectedInspection.intended_time || '10:00'}
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
                      value={selectedInspection.findings || 'N/A'}
                      className="text-sm bg-slate-50"
                      disabled
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label className="text-xs">Recommendations</Label>
                    <Textarea
                      value={selectedInspection.recommendations || 'N/A'}
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
                    ) : inspectionImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {inspectionImages.map((image) => (
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
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Inspections List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredInspections.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ClipboardCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Inspections Yet</h3>
              <p className="text-slate-500 mb-6">Add your first inspection to get started</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Inspection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredInspections.map((inspection) => (
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
                          onClick={() => handleEdit(inspection)}
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleViewDetails(inspection)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <select
                          value={inspection.status}
                          onChange={(e) => handleUpdateStatus(inspection.id, e.target.value)}
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
                          onClick={handlePrint}
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
        )}
      </div>
    </DashboardLayout>
  );
}