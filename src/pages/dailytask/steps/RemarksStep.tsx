import { useState } from "react";
import { FiFileText } from "react-icons/fi";
import StepShell from "../StepShell";

// ── Data shape ────────────────────────────────────────────────────────────────
export interface RemarksData {
  remarks:    string;
  preparedBy: string;
}

// ── Prop types ────────────────────────────────────────────────────────────────
interface Props {
  totalSteps:   number;
  stepNumber:   number;
  initialData?: RemarksData;
  onNext:       (data: RemarksData) => void;
  onBack:       () => void;

}

const labelStyle: React.CSSProperties = {
  display:       "block",
  fontSize:      "11px",
  fontWeight:    700,
  color:         "#4a6d8c",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  marginBottom:  "8px",
};

const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "10px 14px",
  borderRadius: "10px",
  border:       "1.5px solid #4a6d8c",
  background:   "rgba(22,73,118,0.04)",
  color:        "#0a1f33",
  fontSize:     "13px",
  fontFamily:   "'DM Sans', sans-serif",
  outline:      "none",
  transition:   "all 0.2s ease",
};

// ── Component ─────────────────────────────────────────────────────────────────
const RemarksStep = ({ totalSteps, stepNumber, initialData, onNext, onBack }: Props) => {
  const [remarks,    setRemarks]    = useState(initialData?.remarks    ?? "");
  const [preparedBy, setPreparedBy] = useState(initialData?.preparedBy ?? "");
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!remarks.trim())    newErrors["remarks"]    = "Remarks are required";
    if (!preparedBy.trim()) newErrors["preparedBy"] = "Prepared By is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext({ remarks, preparedBy });
  };

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="General Remarks"
      Icon={FiFileText}
      onNext={handleNext}
      onBack={onBack}
    >
      {/* Remarks textarea */}
      <div>
        <label style={labelStyle}>Remarks</label>
        <textarea
          value={remarks}
          placeholder="Enter general remarks here..."
          rows={6}
          onChange={(e) => {
            setRemarks(e.target.value);
            if (errors["remarks"]) setErrors((prev) => ({ ...prev, remarks: "" }));
          }}
          style={{
            ...inputStyle,
            resize:     "vertical",
            lineHeight: "1.6",
            minHeight:  "140px",
            border:     errors["remarks"] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c",
          }}
          onFocus={(e) => {
            e.target.style.border    = "1.5px solid #164976";
            e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
          }}
          onBlur={(e) => {
            e.target.style.border    = errors["remarks"] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c";
            e.target.style.boxShadow = "none";
          }}
        />
        {errors["remarks"] && (
          <p className="text-xs text-red-400 font-medium mt-1">{errors["remarks"]}</p>
        )}
      </div>

      {/* Prepared By */}
      <div>
        <label style={labelStyle}>Prepared By</label>
        <input
          type="text"
          value={preparedBy}
          placeholder="Enter name and designation"
          onChange={(e) => {
            setPreparedBy(e.target.value);
            if (errors["preparedBy"]) setErrors((prev) => ({ ...prev, preparedBy: "" }));
          }}
          style={{
            ...inputStyle,
            border: errors["preparedBy"] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c",
          }}
          onFocus={(e) => {
            e.target.style.border    = "1.5px solid #164976";
            e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
          }}
          onBlur={(e) => {
            e.target.style.border    = errors["preparedBy"] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c";
            e.target.style.boxShadow = "none";
          }}
        />
        {errors["preparedBy"] && (
          <p className="text-xs text-red-400 font-medium mt-1">{errors["preparedBy"]}</p>
        )}
      </div>
    </StepShell>
  );
};

export default RemarksStep;
