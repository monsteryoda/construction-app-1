"use client";

import { Label } from '@/components/ui/label';

interface FormworkChecklistProps {
  checklist: {
    dimensionLevelsVerticality: boolean;
    adequatelySupportedOfPropped: boolean;
    jointsTight: boolean;
    surfaceOfFormsAcceptable: boolean;
    allSawdustAndRubbishRemoved: boolean;
  };
  onChange: (checklist: any) => void;
}

export default function FormworkChecklist({ checklist, onChange }: FormworkChecklistProps) {
  const handleChange = (key: keyof typeof checklist, value: boolean) => {
    onChange({
      ...checklist,
      [key]: value,
    });
  };

  return (
    <div className="border-2 border-slate-900 p-4">
      <h3 className="font-bold text-sm mb-3">Formwork Checklist</h3>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="dimensionLevelsVerticality"
            checked={checklist.dimensionLevelsVerticality}
            onChange={(e) => handleChange('dimensionLevelsVerticality', e.target.checked)}
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
            checked={checklist.adequatelySupportedOfPropped}
            onChange={(e) => handleChange('adequatelySupportedOfPropped', e.target.checked)}
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
            checked={checklist.jointsTight}
            onChange={(e) => handleChange('jointsTight', e.target.checked)}
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
            checked={checklist.surfaceOfFormsAcceptable}
            onChange={(e) => handleChange('surfaceOfFormsAcceptable', e.target.checked)}
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
            checked={checklist.allSawdustAndRubbishRemoved}
            onChange={(e) => handleChange('allSawdustAndRubbishRemoved', e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="allSawdustAndRubbishRemoved" className="text-sm">
            All Sawdust & Rubbish Removed.
          </Label>
        </div>
      </div>
    </div>
  );
}