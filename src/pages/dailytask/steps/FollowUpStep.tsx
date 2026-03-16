import { useState } from "react";
import { FiBell, FiPlus, FiTrash2 } from "react-icons/fi";
import StepShell from "../StepShell";

// ── Data shapes ───────────────────────────────────────────────────────────────
export interface FollowUpRow {
  id:          string;
  action:      string;
  responsible: string;
  deadline:    "N/A" | "1 month" | "3 months" | "6 months";
  isFixed:     boolean;
}

export interface FollowUpData {
  rows: FollowUpRow[];
}

// ── Default fixed rows ────────────────────────────────────────────────────────
const DEFAULT_ROWS: FollowUpRow[] = [
  { id: "f1", action: "Replenish stock",  responsible: "", deadline: "N/A", isFixed: true },
  { id: "f2", action: "Monitor coverage", responsible: "", deadline: "N/A", isFixed: true },
];

const newRow = (): FollowUpRow => ({
  id:          Math.random().toString(36).slice(2, 8),
  action:      "",
  responsible: "",
  deadline:    "N/A",
  isFixed:     false,
});

const DEADLINE_OPTIONS = ["N/A", "1 month", "3 months", "6 months"] as const;

const deadlineStyle = (d: string): { bg: string; color: string } => {
  if (d === "1 month")  return { bg: "rgba(220,38,38,0.10)", color: "#dc2626" };
  if (d === "3 months") return { bg: "rgba(234,88,12,0.10)", color: "#ea580c" };
  if (d === "6 months") return { bg: "rgba(22,163,74,0.10)", color: "#16a34a" };
  return                 { bg: "rgba(22,73,118,0.07)",       color: "#4a6d8c" };
};

// ── Prop types ────────────────────────────────────────────────────────────────
interface Props {
  totalSteps:   number;
  stepNumber:   number;
  initialData?: FollowUpData;
  onNext:       (data: FollowUpData) => void;
  onBack:       () => void;
}

// Scaled up cellInput
const cellInput: React.CSSProperties = {
  width:          "100%",
  padding:        "10px 14px",
  borderRadius:   "8px",
  border:         "1.5px solid #4a6d8c",
  background:     "rgba(22,73,118,0.04)",
  color:          "#0a1f33",
  fontSize:       "14px",
  fontFamily:     "'DM Sans', sans-serif",
  outline:        "none",
  transition:     "all 0.2s ease",
};

// ── Component ─────────────────────────────────────────────────────────────────
const FollowUpStep = ({ totalSteps, stepNumber, initialData, onNext, onBack }: Props) => {
  const [rows, setRows]     = useState<FollowUpRow[]>(initialData?.rows ?? DEFAULT_ROWS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (id: string, field: keyof FollowUpRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    if (errors[`${id}-${field}`])
      setErrors((prev) => ({ ...prev, [`${id}-${field}`]: "" }));
  };

  const addRow    = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    rows.forEach((r) => {
      if (!r.action)      newErrors[`${r.id}-action`]      = "required";
      if (!r.responsible) newErrors[`${r.id}-responsible`] = "required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      // ✅ We pass the rows exactly as they are. 
      // Your parent component should map these to match the FollowUpRequest DTO
      onNext({ rows });
    }
  };

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Follow-Up Required"
      Icon={FiBell}
      onNext={handleNext}
      onBack={onBack}
    >
      {/* Table Container */}
      <div style={{ overflowX: "auto", borderRadius: "14px", border: "2px solid #4a6d8c" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #164976, #1e6aad)" }}>
              {["Action", "Responsible", "Deadline", ""].map((h, i) => (
                <th key={i} style={{
                  padding: "16px 14px", 
                  textAlign: "left", 
                  fontSize: "13px", 
                  fontWeight: 700, 
                  color: "white", 
                  letterSpacing: "0.06em",
                  textTransform: "uppercase", 
                  whiteSpace: "nowrap",
                  width: i === 3 ? "60px" : "auto",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const actionErr = !!errors[`${row.id}-action`];
              const respErr   = !!errors[`${row.id}-responsible`];
              const ds        = deadlineStyle(row.deadline);
              return (
                <tr key={row.id} style={{
                  background:    idx % 2 === 0 ? "#ffffff" : "rgba(22,73,118,0.03)",
                  borderBottom: "1px solid rgba(22,73,118,0.12)",
                }}>

                  {/* Action Column */}
                  <td style={{ padding: "12px 14px" }}>
                    {row.isFixed ? (
                      <input
                        type="text"
                        value={row.action}
                        readOnly
                        style={{
                          ...cellInput,
                          border: "2px solid transparent",
                          background: "rgba(22,73,118,0.06)",
                          color: "#164976", 
                          fontWeight: 700, 
                          cursor: "default",
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={row.action}
                        placeholder="Enter action"
                        onChange={(e) => handleChange(row.id, "action", e.target.value)}
                        style={{ ...cellInput, border: actionErr ? "2px solid #f87171" : "2px solid #4a6d8c" }}
                        onFocus={(e) => {
                          e.target.style.border    = "2px solid #164976";
                          e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                        }}
                        onBlur={(e) => {
                          e.target.style.border    = actionErr ? "2px solid #f87171" : "2px solid #4a6d8c";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    )}
                  </td>

                  {/* Responsible Column */}
                  <td style={{ padding: "12px 14px" }}>
                    <input
                      type="text"
                      value={row.responsible}
                      placeholder="Enter responsible person"
                      onChange={(e) => handleChange(row.id, "responsible", e.target.value)}
                      style={{ ...cellInput, border: respErr ? "2px solid #f87171" : "2px solid #4a6d8c" }}
                      onFocus={(e) => {
                        e.target.style.border    = "2px solid #164976";
                        e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                      }}
                      onBlur={(e) => {
                        e.target.style.border    = respErr ? "2px solid #f87171" : "2px solid #4a6d8c";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </td>

                  {/* Deadline Column */}
                  <td style={{ padding: "12px 14px" }}>
                    <select
                      value={row.deadline}
                      onChange={(e) => handleChange(row.id, "deadline", e.target.value)}
                      style={{
                        width: "100%", 
                        padding: "10px 14px", 
                        borderRadius: "8px",
                        border: "2px solid #4a6d8c",
                        background: ds.bg, 
                        color: ds.color,
                        fontSize: "14px",
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        outline: "none", 
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {DEADLINE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* Delete Column */}
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    {!row.isFixed ? (
                      <button
                        onClick={() => removeRow(row.id)}
                        type="button"
                        title="Remove"
                        style={{
                          width: "36px", 
                          height: "36px", 
                          borderRadius: "10px",
                          border: "none", 
                          background: "rgba(220,38,38,0.08)",
                          color: "#dc2626", 
                          cursor: "pointer",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.18)"
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)"
                        }
                      >
                        <FiTrash2 size={16} />
                      </button>
                    ) : <span />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {Object.keys(errors).length > 0 && (
        <p style={{ color: "#dc2626", fontSize: "14px", fontWeight: 500, marginTop: "8px" }}>
          Please fill in all required fields before proceeding.
        </p>
      )}

      {/* Add Follow-Up Button */}
      <button
        onClick={addRow}
        type="button"
        style={{
          display: "flex", 
          alignItems: "center", 
          gap: "10px",
          padding: "12px 24px",
          borderRadius: "12px",
          border: "1.5px dashed #4a6d8c", 
          background: "rgba(22,73,118,0.03)",
          color: "#164976", 
          fontSize: "15px",
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", 
          cursor: "pointer",
          transition: "all 0.2s ease", 
          alignSelf: "flex-start",
          marginTop: "10px"
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background  = "rgba(22,73,118,0.08)";
          (e.currentTarget as HTMLElement).style.borderColor = "#164976";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background  = "rgba(22,73,118,0.03)";
          (e.currentTarget as HTMLElement).style.borderColor = "#4a6d8c";
        }}
      >
        <FiPlus size={16} /> Add Follow-Up
      </button>
    </StepShell>
  );
};

export default FollowUpStep;