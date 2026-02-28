// ─────────────────────────────────────────────────────────────────────────────
// steps/VisitDetailsStep.tsx  — Step 1 of 9
// Captures the core visit metadata: date, region, area, DB info,
// who visited, who accompanied, and the type of visit.
//
// Accepts `initialData` from the parent so inputs are restored
// when the user navigates back to this step.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { FiMapPin } from "react-icons/fi";
import InputField from "../InputField";
import StepShell from "../StepShell";

// ── Form data shape ───────────────────────────────────────────────────────────
export interface VisitDetailsData {
  date:          string;
  region:        string;
  area:          string;
  dbName:        string;
  dbCode:        string;
  visitedBy:     string;
  accompaniedBy: string;
  visitType:     string;
}

// ── Default empty state ───────────────────────────────────────────────────────
const EMPTY: VisitDetailsData = {
  date:          "",
  region:        "",
  area:          "",
  dbName:        "",
  dbCode:        "",
  visitedBy:     "",
  accompaniedBy: "",
  visitType:     "",
};

// ── Prop types ────────────────────────────────────────────────────────────────
interface Props {
  totalSteps:   number;
  stepNumber:   number;
  initialData?: VisitDetailsData;                    // Restored data when stepping back
  onNext:       (data: VisitDetailsData) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
const VisitDetailsStep = ({ totalSteps, stepNumber, initialData, onNext }: Props) => {
  // Seed state from initialData if available, otherwise use empty defaults
  const [formData, setFormData] = useState<VisitDetailsData>(
    initialData ?? EMPTY
  );

  // Per-field validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof VisitDetailsData, string>>>({});

  // Update field value and clear its error on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof VisitDetailsData]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Validate all required fields; return true if no errors
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VisitDetailsData, string>> = {};
    const required: [keyof VisitDetailsData, string][] = [
      ["date",          "Date"],
      ["region",        "Region"],
      ["area",          "Area"],
      ["dbName",        "DB Name"],
      ["dbCode",        "DB Code"],
      ["visitedBy",     "Visited By"],
      ["accompaniedBy", "Accompanied By"],
      ["visitType",     "Visit Type"],
    ];
    required.forEach(([key, label]) => {
      if (!formData[key]) newErrors[key] = `${label} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Run validation; if clean, pass data up to parent
  const handleNext = () => {
    if (validate()) onNext(formData);
  };

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Visit Details"
      Icon={FiMapPin}
      onNext={handleNext}
      // No onBack on step 1
    >
      {/* Date of visit */}
      <InputField
        label="Date of Visit"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
      />

      {/* Region & Area — side by side */}
      <div className="form-grid-2">
        <InputField
          label="Region"
          name="region"
          placeholder="e.g. East"
          value={formData.region}
          onChange={handleChange}
          error={errors.region}
        />
        <InputField
          label="Area"
          name="area"
          placeholder="e.g. Batticaloa"
          value={formData.area}
          onChange={handleChange}
          error={errors.area}
        />
      </div>

      {/* DB Name & DB Code — side by side */}
      <div className="form-grid-2">
        <InputField
          label="DB Name"
          name="dbName"
          placeholder="e.g. ABC Distributors"
          value={formData.dbName}
          onChange={handleChange}
          error={errors.dbName}
        />
        <InputField
          label="DB Code"
          name="dbCode"
          placeholder="e.g. DB-014"
          value={formData.dbCode}
          onChange={handleChange}
          error={errors.dbCode}
        />
      </div>

      {/* Visited By */}
      <InputField
        label="Visited By"
        name="visitedBy"
        placeholder="e.g. ASM – Colombo South"
        value={formData.visitedBy}
        onChange={handleChange}
        error={errors.visitedBy}
      />

      {/* Accompanied By */}
      <InputField
        label="Accompanied By"
        name="accompaniedBy"
        placeholder="e.g. Sales Rep – Route 03"
        value={formData.accompaniedBy}
        onChange={handleChange}
        error={errors.accompaniedBy}
      />

      {/* Visit Type */}
      <InputField
        label="Visit Type"
        name="visitType"
        placeholder="e.g. Routine Performance & Stock Review"
        value={formData.visitType}
        onChange={handleChange}
        error={errors.visitType}
      />
    </StepShell>
  );
};

export default VisitDetailsStep;
