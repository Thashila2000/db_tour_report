// ─────────────────────────────────────────────────────────────────────────────
// steps/DBProfileStep.tsx  — Step 2 of 9
// Captures DB profile details: owner, coverage, route strength, sales team,
// vehicles, log book, territory map, route plan, financials, and store info.
//
// Accepts `initialData` from the parent so inputs are restored
// when the user navigates back to this step.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { FiHome, FiUpload } from "react-icons/fi";
import InputField from "../InputField";
import StepShell from "../StepShell";

// ── Form data shape ───────────────────────────────────────────────────────────
export interface DBProfileData {
  dbOwnerContact:        string;
  coverageArea:          string;
  routeStrength:         string;
  salesTeam:             string;
  vehicleAvailability:   string;
  logBookUpdate:         string;
  territoryRouteMap:     "yes" | "no" | "";
  routeMapImage:         File | null;
  routePlan:             "yes" | "no" | "";
  routePlanImage:        File | null;
  creditBillCount:       string;
  creditBillTotal:       string;
  chequeCount:           string;
  chequeTotal:           string;
  cashTotal:             string;
  storeLength:           string;
  storeWidth:            string;
  storeCondition:        string;
  marketReturnCondition: string;
  tableCount:            string;
  chairCount:            string;
  storeComments:         string;
}

// ── Default empty state ───────────────────────────────────────────────────────
const EMPTY: DBProfileData = {
  dbOwnerContact:        "",
  coverageArea:          "",
  routeStrength:         "",
  salesTeam:             "",
  vehicleAvailability:   "",
  logBookUpdate:         "",
  territoryRouteMap:     "",
  routeMapImage:         null,
  routePlan:             "",
  routePlanImage:        null,
  creditBillCount:       "",
  creditBillTotal:       "",
  chequeCount:           "",
  chequeTotal:           "",
  cashTotal:             "",
  storeLength:           "",
  storeWidth:            "",
  storeCondition:        "",
  marketReturnCondition: "",
  tableCount:            "",
  chairCount:            "",
  storeComments:         "",
};

// ── Prop types ────────────────────────────────────────────────────────────────
interface Props {
  totalSteps:   number;
  stepNumber:   number;
  initialData?: DBProfileData;                   // Restored data when stepping back
  onNext:       (data: DBProfileData) => void;
  onBack:       () => void;
}

// ── RadioField — styled yes/no radio group ────────────────────────────────────
const RadioField = ({
  label,
  value,
  onChange,
  error,
}: {
  label:    string;
  value:    string;
  onChange: (val: "yes" | "no") => void;
  error?:   string;
}) => (
  <div className="flex flex-col gap-2">
    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a6d8c" }}>
      {label}
    </span>
    <div style={{ display: "flex", gap: "1.5rem" }}>
      {(["yes", "no"] as const).map((option) => (
        <label
          key={option}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        "8px",
            cursor:     "pointer",
            fontSize:   "13px",
            fontWeight: value === option ? 600 : 400,
            color:      value === option ? "#164976" : "#6e90b0",
          }}
        >
          <div
            onClick={() => onChange(option)}
            style={{
              width:          "18px",
              height:         "18px",
              borderRadius:   "50%",
              border:         value === option ? "2px solid #164976" : "2px solid #4a6d8c",
              background:     value === option ? "#164976" : "#f5f8fc",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              transition:     "all 0.2s ease",
              flexShrink:     0,
            }}
          >
            {value === option && (
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />
            )}
          </div>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </label>
      ))}
    </div>
    {/* Inline error */}
    {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
  </div>
);

// ── FileUploadField — styled dashed file input ────────────────────────────────
const FileUploadField = ({
  label,
  name,
  onChange,
  fileName,
}: {
  label:    string;
  name:     string;
  onChange: (file: File | null) => void;
  fileName: string;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a6d8c" }}>
      {label}
    </span>
    <label
      htmlFor={name}
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "10px",
        padding:      "12px",
        borderRadius: "12px",
        border:       "1.5px dashed #4a6d8c",
        background:   "rgba(22,73,118,0.03)",
        cursor:       "pointer",
        fontSize:     "13px",
        color:        fileName ? "#164976" : "#94a9be",
        transition:   "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#164976";        (e.currentTarget as HTMLElement).style.background  = "rgba(22,73,118,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#4a6d8c";
        (e.currentTarget as HTMLElement).style.background  = "rgba(22,73,118,0.03)";
      }}
    >
      <FiUpload size={15} style={{ color: "#164976", flexShrink: 0 }} />
      {fileName || "Click to upload image"}
      <input
        id={name}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  </div>
);

// ── TextAreaField — styled resizable textarea ─────────────────────────────────
const TextAreaField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
}: {
  label:       string;
  name:        string;
  placeholder: string;
  value:       string;
  onChange:    (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={name}
      className="text-xs font-semibold uppercase tracking-widest"
      style={{ color: "#4a6d8c" }}
    >
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={3}
      style={{
        width:        "100%",
        padding:      "12px",
        borderRadius: "12px",
        border:       "1.5px solid #4a6d8c",
        background:   "rgba(22,73,118,0.04)",
        color:        "#0f2d4a",
        fontSize:     "13px",
        fontFamily:   "'DM Sans', sans-serif",
        outline:      "none",
        resize:       "vertical",
        transition:   "all 0.2s ease",
      }}
      onFocus={(e) => {
        e.target.style.border     = "1.5px solid #164976";
        e.target.style.background = "rgba(22,73,118,0.07)";
        e.target.style.boxShadow  = "0 0 0 3px rgba(22,73,118,0.10)";
      }}
      onBlur={(e) => {
        e.target.style.border     = "1.5px solid #4a6d8c";
        e.target.style.background = "rgba(22,73,118,0.04)";
        e.target.style.boxShadow  = "none";
      }}
    />
  </div>
);

// ── SectionDivider — sub-section heading ─────────────────────────────────────
const SectionDivider = ({ title }: { title: string }) => (
  <div
    style={{
      display:       "flex",
      alignItems:    "center",
      gap:           "10px",
      margin:        "1.5rem 0 1rem",
      paddingBottom: "8px",
      borderBottom:  "1.5px solid rgba(22,73,118,0.10)",
    }}
  >
    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "#164976" }}>
      {title}
    </span>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const DBProfileStep = ({ totalSteps, stepNumber, initialData, onNext, onBack }: Props) => {
  // Seed from initialData if the user stepped back, otherwise use empty defaults
  const [formData, setFormData] = useState<DBProfileData>(initialData ?? EMPTY);

  // Per-field validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof DBProfileData, string>>>({});

  // ── Handlers ─────────────────────────────────────────────────────────────────

  // Generic text / textarea input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof DBProfileData]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Radio yes/no handler — also clears the paired image when "no" is chosen
  const handleRadio = (field: "territoryRouteMap" | "routePlan", val: "yes" | "no") => {
    if (field === "territoryRouteMap") {
      setFormData((p) => ({ ...p, territoryRouteMap: val, routeMapImage: val === "no" ? null : p.routeMapImage }));
    } else {
      setFormData((p) => ({ ...p, routePlan: val, routePlanImage: val === "no" ? null : p.routePlanImage }));
    }
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  // File upload handler
  const handleFile = (field: "routeMapImage" | "routePlanImage", file: File | null) => {
    setFormData({ ...formData, [field]: file });
  };

  // Validate all required fields
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DBProfileData, string>> = {};
    const required: [keyof DBProfileData, string][] = [
      ["dbOwnerContact",       "DB Owner / Contact"],
      ["coverageArea",         "Coverage Area"],
      ["routeStrength",        "Route Strength"],
      ["salesTeam",            "Sales Team"],
      ["vehicleAvailability",  "Vehicle Availability"],
      ["logBookUpdate",        "Log Book Update"],
      ["territoryRouteMap",    "Territory Route Map"],
      ["routePlan",            "Route Plan"],
      ["creditBillCount",      "Credit Bill Count"],
      ["creditBillTotal",      "Credit Bill Total"],
      ["chequeCount",          "Cheque Count"],
      ["chequeTotal",          "Cheque Total"],
      ["cashTotal",            "Cash Total"],
      ["storeLength",          "Store Length"],
      ["storeWidth",           "Store Width"],
      ["storeCondition",       "Store Condition"],
      ["marketReturnCondition","Market Return Condition"],
      ["tableCount",           "Table Count"],
      ["chairCount",           "Chair Count"],
    ];
    required.forEach(([key, label]) => {
      if (!formData[key]) newErrors[key] = `${label} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Pass data up if valid
  const handleNext = () => {
    if (validate()) onNext(formData);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="DB Profile"
      Icon={FiHome}
      onNext={handleNext}
      onBack={onBack}
    >
      {/* DB Owner & Coverage Area — side by side */}
      <div className="form-grid-2">
        <InputField
          label="DB Owner / Contact"
          name="dbOwnerContact"
          placeholder="e.g. Mr. Perera – 077-1234567"
          value={formData.dbOwnerContact}
          onChange={handleChange}
          error={errors.dbOwnerContact}
        />
        <InputField
          label="Coverage Area"
          name="coverageArea"
          placeholder="e.g. Colombo South"
          value={formData.coverageArea}
          onChange={handleChange}
          error={errors.coverageArea}
        />
      </div>

      {/* Route Strength & Sales Team — side by side */}
      <div className="form-grid-2">
        <InputField
          label="Route Strength"
          name="routeStrength"
          placeholder="e.g. 5 routes"
          value={formData.routeStrength}
          onChange={handleChange}
          error={errors.routeStrength}
        />
        <InputField
          label="Sales Team Attached"
          name="salesTeam"
          placeholder="e.g. 8 reps"
          value={formData.salesTeam}
          onChange={handleChange}
          error={errors.salesTeam}
        />
      </div>

      {/* Vehicle Availability & Log Book — side by side */}
      <div className="form-grid-2">
        <InputField
          label="Vehicle Availability"
          name="vehicleAvailability"
          placeholder="e.g. 3 trucks available"
          value={formData.vehicleAvailability}
          onChange={handleChange}
          error={errors.vehicleAvailability}
        />
        <InputField
          label="Log Book Update"
          name="logBookUpdate"
          placeholder="e.g. Up to date"
          value={formData.logBookUpdate}
          onChange={handleChange}
          error={errors.logBookUpdate}
        />
      </div>

      {/* Territory Route Map — radio + conditional upload */}
      <RadioField
        label="Territory Route Map"
        value={formData.territoryRouteMap}
        onChange={(val) => handleRadio("territoryRouteMap", val)}
        error={errors.territoryRouteMap}
      />
      {formData.territoryRouteMap === "yes" && (
        <FileUploadField
          label="Upload Route Map Image"
          name="routeMapImage"
          fileName={formData.routeMapImage?.name ?? ""}
          onChange={(file) => handleFile("routeMapImage", file)}
        />
      )}

      {/* Route Plan — radio + conditional upload */}
      <RadioField
        label="Route Plan"
        value={formData.routePlan}
        onChange={(val) => handleRadio("routePlan", val)}
        error={errors.routePlan}
      />
      {formData.routePlan === "yes" && (
        <FileUploadField
          label="Upload Route Plan Image"
          name="routePlanImage"
          fileName={formData.routePlanImage?.name ?? ""}
          onChange={(file) => handleFile("routePlanImage", file)}
        />
      )}

      {/* Credit Bill — count & total side by side */}
      <div className="form-grid-2">
        <InputField
          label="Credit Bill — No. of Bills"
          name="creditBillCount"
          placeholder="e.g. 12"
          value={formData.creditBillCount}
          onChange={handleChange}
          error={errors.creditBillCount}
        />
        <InputField
          label="Credit Bill — Total Amount"
          name="creditBillTotal"
          placeholder="e.g. 250,000"
          value={formData.creditBillTotal}
          onChange={handleChange}
          error={errors.creditBillTotal}
        />
      </div>

      {/* Cheque in Hand — count & total side by side */}
      <div className="form-grid-2">
        <InputField
          label="Cheque in Hand — No. of Cheques"
          name="chequeCount"
          placeholder="e.g. 4"
          value={formData.chequeCount}
          onChange={handleChange}
          error={errors.chequeCount}
        />
        <InputField
          label="Cheque in Hand — Total Amount"
          name="chequeTotal"
          placeholder="e.g. 180,000"
          value={formData.chequeTotal}
          onChange={handleChange}
          error={errors.chequeTotal}
        />
      </div>

      {/* Cash in Hand */}
      <InputField
        label="Cash in Hand — Total Amount"
        name="cashTotal"
        placeholder="e.g. 45,000"
        value={formData.cashTotal}
        onChange={handleChange}
        error={errors.cashTotal}
      />

      {/* Sub-section: 1.1 Stores */}
      <SectionDivider title="1.1 Stores" />

      {/* Store Capacity — length & width side by side */}
      <div className="form-grid-2">
        <InputField
          label="Store Length (ft)"
          name="storeLength"
          placeholder="e.g. 40"
          value={formData.storeLength}
          onChange={handleChange}
          error={errors.storeLength}
        />
        <InputField
          label="Store Width (ft)"
          name="storeWidth"
          placeholder="e.g. 20"
          value={formData.storeWidth}
          onChange={handleChange}
          error={errors.storeWidth}
        />
      </div>

      {/* Store Condition */}
      <InputField
        label="Condition"
        name="storeCondition"
        placeholder="e.g. Good / Needs improvement"
        value={formData.storeCondition}
        onChange={handleChange}
        error={errors.storeCondition}
      />

      {/* Market Return Condition */}
      <InputField
        label="Market Return Condition"
        name="marketReturnCondition"
        placeholder="e.g. Segregated and labelled"
        value={formData.marketReturnCondition}
        onChange={handleChange}
        error={errors.marketReturnCondition}
      />

      {/* Office Facility — table & chair count side by side */}
      <div className="form-grid-2">
        <InputField
          label="Table Count"
          name="tableCount"
          placeholder="e.g. 2"
          value={formData.tableCount}
          onChange={handleChange}
          error={errors.tableCount}
        />
        <InputField
          label="Chair Count"
          name="chairCount"
          placeholder="e.g. 6"
          value={formData.chairCount}
          onChange={handleChange}
          error={errors.chairCount}
        />
      </div>

      {/* Store Comments — textarea */}
      <TextAreaField
        label="Comments"
        name="storeComments"
        placeholder="Enter any additional comments about the store"
        value={formData.storeComments}
        onChange={handleChange}
      />
    </StepShell>
  );
};

export default DBProfileStep;
