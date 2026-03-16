import { useState } from "react";
import { FiBarChart2 } from "react-icons/fi";
import StepShell from "../StepShell";

// ── Single row data shape ─────────────────────────────────────────────────────
export interface SalesRow {
  id:          string;
  category:    string;
  mtdTarget:   string;
  mtdAchieved: string;
}

export interface SalesPerformanceData {
  rows: SalesRow[];
}

const DEFAULT_ROWS: SalesRow[] = [
  { id: "1", category: "Biscuits",   mtdTarget: "", mtdAchieved: "" },
  { id: "2", category: "Wafers",     mtdTarget: "", mtdAchieved: "" },
  { id: "3", category: "Chocolates", mtdTarget: "", mtdAchieved: "" },
  { id: "4", category: "Snacks",     mtdTarget: "", mtdAchieved: "" },
  { id: "5", category: "Crackers",   mtdTarget: "", mtdAchieved: "" },
  { id: "6", category: "Gem",        mtdTarget: "", mtdAchieved: "" },
];

interface Props {
  totalSteps:   number;
  stepNumber:   number;
  initialData?: SalesPerformanceData;
  onNext:       (data: SalesPerformanceData) => void;
  onBack:       () => void;
  onChange?:    (data: SalesPerformanceData) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const calcVariance = (target: string, achieved: string): string => {
  const t = parseFloat(target);
  const a = parseFloat(achieved);
  if (isNaN(t) || isNaN(a) || t === 0) return "";
  const v = a - t;
  return (v >= 0 ? "+" : "") + v.toFixed(2) + " t";
};

const calcRemarks = (target: string, achieved: string): { label: string; color: string } => {
  const t = parseFloat(target);
  const a = parseFloat(achieved);
  if (isNaN(t) || isNaN(a) || t === 0) return { label: "", color: "#4a6d8c" };

  const pct = (a / t) * 100;

  if (pct >= 100) return { label: "🎯 Over Target",                  color: "#15803d" };
  if (pct >= 95)  return { label: "✅ On Track",                     color: "#16a34a" };
  if (pct >= 85)  return { label: "🔶 Slightly Below Target",        color: "#d97706" };
  if (pct >= 70)  return { label: "⚠️ Needs Attention",              color: "#ea580c" };
                  return { label: "🔴 Critical — Far Below Target",   color: "#dc2626" };
};

// Scaled up cell style
const cellInputStyle = (readOnly = false): React.CSSProperties => ({
  width:         "100%",
  padding:       "10px 14px", // Scaled up
  borderRadius:  "8px",
  border:        `2px solid ${readOnly ? "transparent" : "#4a6d8c"}`,   
  background:    readOnly ? "rgba(22,73,118,0.06)" : "rgba(22,73,118,0.04)",
  color:         readOnly ? "#4a6d8c" : "#0a1f33",
  fontSize:      "14px", // Increased from 12px
  fontFamily:    "'DM Sans', sans-serif",
  outline:       "none",
  fontWeight:    readOnly ? 700 : 500,
  cursor:        readOnly ? "default" : "text",
  transition:    "all 0.2s ease",
});

const SalesPerformanceStep = ({ totalSteps, stepNumber, initialData, onNext, onBack, onChange }: Props) => {
  const [rows, setRows] = useState<SalesRow[]>(initialData?.rows ?? DEFAULT_ROWS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRowChange = (id: string, field: keyof SalesRow, value: string) => {
    setRows((prev) => {
      const updated = prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      );
      onChange?.({ rows: updated });
      return updated;
    });
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    rows.forEach((row) => {
      if (!row.category)    newErrors[row.id] = "Category is required";
      else if (!row.mtdTarget)   newErrors[row.id] = "MTD Target is required";
      else if (!row.mtdAchieved) newErrors[row.id] = "MTD Achievement is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext({ rows });
  };

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Sales Performance Snapshot"
      Icon={FiBarChart2}
      onNext={handleNext}
      onBack={onBack}
    >
      {/* Table wrapper */}
      <div style={{ overflowX: "auto", borderRadius: "14px", border: "2px solid #4a6d8c" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #164976, #1e6aad)" }}>
              {["Category", "MTD Target (t)", "MTD Achievement (t)", "Variance (t)", "Status Remarks"].map(
                (h, i) => (
                  <th key={i} style={{
                    padding: "16px 14px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const variance = calcVariance(row.mtdTarget, row.mtdAchieved);
              const remarks  = calcRemarks(row.mtdTarget, row.mtdAchieved);
              const hasError = !!errors[row.id];

              return (
                <tr key={row.id} style={{
                  background:   index % 2 === 0 ? "#ffffff" : "rgba(22,73,118,0.03)",
                  borderBottom: "1px solid rgba(22,73,118,0.12)",
                }}>
                  {/* Category */}
                  <td style={{ padding: "12px 14px" }}>
                    <input
                      type="text"
                      value={row.category}
                      onChange={(e) => handleRowChange(row.id, "category", e.target.value)}
                      style={{
                        ...cellInputStyle(),
                        border: hasError && !row.category ? "2px solid #f87171" : "2px solid #4a6d8c",
                      }}
                    />
                  </td>

                  {/* Target */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={row.mtdTarget}
                        placeholder="0.00"
                        onChange={(e) => handleRowChange(row.id, "mtdTarget", e.target.value)}
                        style={{
                          ...cellInputStyle(),
                          paddingRight: "35px",
                          border: hasError && !row.mtdTarget ? "2px solid #f87171" : "2px solid #4a6d8c",
                        }}
                      />
                      <span style={{
                        position: "absolute", right: "12px", top: "50%",
                        transform: "translateY(-50%)", fontSize: "12px",
                        color: "#4a6d8c", fontWeight: 700, pointerEvents: "none",
                      }}>t</span>
                    </div>
                  </td>

                  {/* Achievement */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={row.mtdAchieved}
                        placeholder="0.00"
                        onChange={(e) => handleRowChange(row.id, "mtdAchieved", e.target.value)}
                        style={{
                          ...cellInputStyle(),
                          paddingRight: "35px",
                          border: hasError && !row.mtdAchieved ? "2px solid #f87171" : "2px solid #4a6d8c",
                        }}
                      />
                      <span style={{
                        position: "absolute", right: "12px", top: "50%",
                        transform: "translateY(-50%)", fontSize: "12px",
                        color: "#4a6d8c", fontWeight: 700, pointerEvents: "none",
                      }}>t</span>
                    </div>
                  </td>

                  {/* Variance (Read Only) */}
                  <td style={{ padding: "12px 14px" }}>
                    <input
                      type="text"
                      value={variance}
                      readOnly
                      placeholder="--"
                      style={{
                        ...cellInputStyle(true),
                        color: variance.startsWith("+") ? "#15803d" : variance.startsWith("-") ? "#dc2626" : "#4a6d8c",
                      }}
                    />
                  </td>

                  {/* Remarks (Read Only) */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{
                      ...cellInputStyle(true),
                      background: "transparent",
                      color: remarks.color,
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {remarks.label || "--"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {Object.values(errors).some(Boolean) && (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <p className="text-sm text-red-400 font-bold">Please correct the following rows:</p>
          {rows.map((row) =>
            errors[row.id] ? (
              <p key={row.id} className="text-sm text-red-400 font-medium">
                • {row.category || "Empty Category"}: {errors[row.id]}
              </p>
            ) : null
          )}
        </div>
      )}
    </StepShell>
  );
};

export default SalesPerformanceStep;