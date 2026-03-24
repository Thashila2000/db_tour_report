import { useState, useEffect } from "react";
import { FiAlertTriangle, FiPlus, FiTrash2 } from "react-icons/fi";
import StepShell from "../StepShell";

// ── Data shapes ───────────────────────────────────────────────────────────────
export interface IssueRow {
  id:          string;
  issueType:   string;
  description: string;
  security:    "N/A" | "Low" | "Medium" | "High";
  isFixed:     boolean;
}

export interface IssuesIdentifiedData {
  rows: IssueRow[];
}

// ── Default fixed rows ────────────────────────────────────────────────────────
const DEFAULT_ROWS: IssueRow[] = [
  { id: "i1", issueType: "Sales",             description: "", security: "N/A", isFixed: true },
  { id: "i2", issueType: "Stock",             description: "", security: "N/A", isFixed: true },
  { id: "i3", issueType: "Distribution",      description: "", security: "N/A", isFixed: true },
  { id: "i4", issueType: "Team / Discipline", description: "", security: "N/A", isFixed: true },
];

const newRow = (): IssueRow => ({
  id:          Math.random().toString(36).slice(2, 8),
  issueType:   "",
  description: "",
  security:    "N/A",
  isFixed:     false,
});

const SECURITY_OPTIONS = ["N/A", "Low", "Medium", "High"] as const;

const securityStyle = (s: string): { bg: string; color: string } => {
  if (s === "High")   return { bg: "rgba(22,163,74,0.10)",  color: "#16a34a" };
  if (s === "Medium") return { bg: "rgba(234,88,12,0.10)",  color: "#ea580c" };
  if (s === "Low")    return { bg: "rgba(220,38,38,0.10)",  color: "#dc2726" };
  return               { bg: "rgba(22,73,118,0.07)",        color: "#4a6d8c" };
};

// ── Prop types ────────────────────────────────────────────────────────────────
interface Props {
  totalSteps:   number;
  stepNumber:   number;
  initialData?: IssuesIdentifiedData;
  onNext:       (data: IssuesIdentifiedData) => void;
  onBack:       () => void;
}

// Updated cellInput with larger font and padding
const cellInput: React.CSSProperties = {
  width:         "100%",
  padding:       "10px 14px", 
  borderRadius:  "8px",
  border:        "2px solid #4a6d8c",
  background:    "rgba(22,73,118,0.04)",
  color:         "#0a1f33",
  fontSize:      "14px", 
  fontFamily:    "'DM Sans', sans-serif",
  outline:       "none",
  transition:    "all 0.2s ease",
};

// ── Component ─────────────────────────────────────────────────────────────────
const IssuesIdentifiedStep = ({ totalSteps, stepNumber, initialData, onNext, onBack }: Props) => {
  // ✅ FIXED: Initialize from localStorage with fallback
  const [rows, setRows] = useState<IssueRow[]>(() => {
    console.log("🎬 IssuesIdentified: Initializing...");
    console.log("   initialData:", initialData);
    
    // Priority 1: Use initialData from parent if it has content
    if (initialData?.rows && initialData.rows.length > 0) {
      const hasData = initialData.rows.some(row => row.description);
      if (hasData) {
        console.log("✅ Using initialData from parent");
        return initialData.rows;
      }
    }
    
    // Priority 2: Load from localStorage
    try {
      const saved = localStorage.getItem("issuesIdentified");
      console.log("   localStorage issuesIdentified:", saved ? "FOUND" : "NOT FOUND");
      
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rows && Array.isArray(parsed.rows)) {
          const hasData = parsed.rows.some((row: IssueRow) => row.description);
          if (hasData) {
            console.log("✅ Loaded from localStorage");
            return parsed.rows;
          }
        }
      }
    } catch (err) {
      console.error("❌ Failed to parse issuesIdentified:", err);
    }
    
    console.log("⚠️ Using DEFAULT_ROWS");
    return DEFAULT_ROWS;
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ ADD: Auto-save to localStorage whenever rows change (debounced)
  useEffect(() => {
    // Only save if there's actual data entered
    const hasData = rows.some(row => row.description);
    
    if (hasData) {
      const timer = setTimeout(() => {
        const payload = { rows };
        
        // Add metadata (same as parent does)
        const visitDetails = JSON.parse(localStorage.getItem("visitDetails") || "{}");
        const reportGroupId = localStorage.getItem("reportGroupId");
        
        (payload as any).reportGroupId = reportGroupId;
        (payload as any).userName = visitDetails.userName || "Unknown";
        (payload as any).userRole = visitDetails.area || "";
        
        console.log("💾 Auto-saving issuesIdentified:", payload);
        localStorage.setItem("issuesIdentified", JSON.stringify(payload));
      }, 500); // Wait 500ms after last change

      return () => clearTimeout(timer); // Cancel if user keeps typing
    }
  }, [rows]);

  const handleChange = (id: string, field: keyof IssueRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    if (errors[`${id}-${field}`])
      setErrors((prev) => ({ ...prev, [`${id}-${field}`]: "" }));
  };

  const addRow    = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    rows.forEach((r) => {
      if (!r.issueType)   newErrors[`${r.id}-issueType`]   = "required";
      if (!r.description) newErrors[`${r.id}-description`] = "required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      console.log("📤 IssuesIdentified: Sending data to parent");
      onNext({ rows });
    }
  };

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Issues Identified"
      Icon={FiAlertTriangle}
      onNext={handleNext}
      onBack={onBack}
    >
      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: "14px", border: "2px solid #4a6d8c" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "650px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #164976, #1e6aad)" }}>
              {["Issue Type", "Description", "Security", ""].map((h, i) => (
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
              const typeErr = !!errors[`${row.id}-issueType`];
              const descErr = !!errors[`${row.id}-description`];
              const sc      = securityStyle(row.security);
              return (
                <tr key={row.id} style={{
                  background:   idx % 2 === 0 ? "#ffffff" : "rgba(22,73,118,0.03)",
                  borderBottom: "1px solid rgba(22,73,118,0.12)",
                }}>
                  {/* Issue Type */}
                  <td style={{ padding: "12px 14px" }}>
                    {row.isFixed ? (
                      <input
                        type="text"
                        value={row.issueType}
                        readOnly
                        style={{
                          ...cellInput,
                          border:     "1.5px solid transparent",
                          background: "rgba(22,73,118,0.06)",
                          color:      "#164976",
                          fontWeight: 700,
                          cursor:     "default",
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={row.issueType}
                        placeholder="Enter issue type"
                        onChange={(e) => handleChange(row.id, "issueType", e.target.value)}
                        style={{ ...cellInput, border: typeErr ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }}
                        onFocus={(e) => {
                          e.target.style.border    = "1.5px solid #164976";
                          e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                        }}
                        onBlur={(e) => {
                          e.target.style.border    = typeErr ? "1.5px solid #f87171" : "1.5px solid #4a6d8c";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    )}
                  </td>

                  {/* Description */}
                  <td style={{ padding: "12px 14px" }}>
                    <input
                      type="text"
                      value={row.description}
                      placeholder="Enter description"
                      onChange={(e) => handleChange(row.id, "description", e.target.value)}
                      style={{ ...cellInput, border: descErr ? "2px solid #f87171" : "2px solid #4a6d8c" }}
                      onFocus={(e) => {
                        e.target.style.border    = "2px solid #164976";
                        e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                      }}
                      onBlur={(e) => {
                        e.target.style.border    = descErr ? "2px solid #f87171" : "2px solid #4a6d8c";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </td>

                  {/* Security */}
                  <td style={{ padding: "12px 14px" }}>
                    <select
                      value={row.security}
                      onChange={(e) => handleChange(row.id, "security", e.target.value)}
                      style={{
                        width: "100%", 
                        padding: "10px 14px", 
                        borderRadius: "8px",
                        border: "2px solid #4a6d8c",
                        background: sc.bg, 
                        color: sc.color,
                        fontSize: "14px", 
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        outline: "none", 
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {SECURITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* Delete */}
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    {!row.isFixed ? (
                      <button
                        onClick={() => removeRow(row.id)}
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
        <p className="text-sm text-red-400 font-medium" style={{ marginTop: "8px" }}>
          Please fill in all required fields before proceeding.
        </p>
      )}

      {/* Add Issue */}
      <button
        onClick={addRow}
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
        <FiPlus size={16} /> Add Issue
      </button>
    </StepShell>
  );
};

export default IssuesIdentifiedStep;