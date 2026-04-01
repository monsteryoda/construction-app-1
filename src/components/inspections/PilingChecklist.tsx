"use client";

import { Label } from '@/components/ui/label';

interface PilingChecklistProps {
  checklist: {
    checkPositionOfPeg: boolean;
    checkPilePitchedAccurately: boolean;
    checkVerticalityOfPiles: boolean;
    checkWeldingJoint: boolean;
  };
  onChange: (checklist: any) => void;
}

export default function PilingChecklist({ checklist, onChange }: PilingChecklistProps) {
  const handleChange = (key: keyof typeof checklist, value: boolean) => {
    onChange({
      ...checklist,
      [key]: value,
    });
  };

  return (
    <div className="border-2 border-slate-900 p-4">
      <h3 className="font-bold text-sm mb-3">Piling Work Checklist</h3>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="checkPositionOfPeg"
            checked={checklist.checkPositionOfPeg}
            onChange={(e) => handleChange('checkPositionOfPeg', e.target.checked)}
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
            checked={checklist.checkPilePitchedAccurately}
            onChange={(e) => handleChange('checkPilePitchedAccurately', e.target.checked)}
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
            checked={checklist.checkVerticalityOfPiles}
            onChange={(e) => handleChange('checkVerticalityOfPiles', e.target.checked)}
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
            checked={checklist.checkWeldingJoint}
            onChange={(e) => handleChange('checkWeldingJoint', e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="checkWeldingJoint" className="text-sm">
            Check For Welding Joint With Reference to Drawing.
          </Label>
        </div>
      </div>
    </div>
  );
}