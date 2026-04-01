"use client";

import { Label } from '@/components/ui/label';

interface FoundationChecklistProps {
  checklist: {
    surveySettingOut: boolean;
    excavationLevel: boolean;
    hardcoreCrusherRun: boolean;
    verticalityCheck: boolean;
    leanConcrete: boolean;
  };
  onChange: (checklist: any) => void;
}

export default function FoundationChecklist({ checklist, onChange }: FoundationChecklistProps) {
  const handleChange = (key: keyof typeof checklist, value: boolean) => {
    onChange({
      ...checklist,
      [key]: value,
    });
  };

  return (
    <div className="border-2 border-slate-900 p-4">
      <h3 className="font-bold text-sm mb-3">Foundation Footing Checklist</h3>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="surveySettingOut"
            checked={checklist.surveySettingOut}
            onChange={(e) => handleChange('surveySettingOut', e.target.checked)}
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
            checked={checklist.excavationLevel}
            onChange={(e) => handleChange('excavationLevel', e.target.checked)}
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
            checked={checklist.hardcoreCrusherRun}
            onChange={(e) => handleChange('hardcoreCrusherRun', e.target.checked)}
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
            checked={checklist.verticalityCheck}
            onChange={(e) => handleChange('verticalityCheck', e.target.checked)}
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
            checked={checklist.leanConcrete}
            onChange={(e) => handleChange('leanConcrete', e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="leanConcrete" className="text-sm">
            Lean Concrete
          </Label>
        </div>
      </div>
    </div>
  );
}