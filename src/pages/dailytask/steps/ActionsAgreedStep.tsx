import { useState, useEffect } from "react";
import { FiCheckSquare, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import StepShell from "../StepShell";

// ── Data shapes ───────────────────────────────────────────────────────────────
export interface ActionRow {
  id: string;
  action: string;
  comment: string;
  isFixed: boolean;
}

export interface StaffAction {
  name: string;
  comment: string;
}

export interface ActionsAgreedData {
  rows: ActionRow[];
  staffActions: {
    asm: StaffAction;
    ase: StaffAction;
    csr: StaffAction;
  };
}

const newRow = (): ActionRow => ({
  id: Math.random().toString(36).slice(2, 8),
  action: "",
  comment: "",
  isFixed: false,
});

const DEFAULT_ROWS: ActionRow[] = [
  { id: "a1", action: "Increase sales focus", comment: "", isFixed: true },
  { id: "a2", action: "Expedite stock replenishment", comment: "", isFixed: true },
  { id: "a3", action: "Improve outlet coverage", comment: "", isFixed: true },
];

const DEFAULT_STAFF_ACTIONS = {
  asm: { name: "", comment: "" },
  ase: { name: "", comment: "" },
  csr: { name: "", comment: "" },
};

const cellInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "2px solid #4a6d8c",
  background: "rgba(22,73,118,0.04)",
  color: "#0a1f33",
  fontSize: "14px",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "all 0.2s ease",
};

interface StaffInputRowProps {
  label: string;
  role: 'asm' | 'ase' | 'csr';
  staffActions: ActionsAgreedData['staffActions'];
  onStaffChange: (role: 'asm' | 'ase' | 'csr', field: keyof StaffAction, value: string) => void;
}

const StaffInputRow = ({ label, role, staffActions, onStaffChange }: StaffInputRowProps) => (
  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
    <div style={{ width: "50px", fontWeight: 800, color: "#164976", fontSize: "13px" }}>{label}</div>
    <div style={{ flex: 1, minWidth: "150px" }}>
      <input
        type="text"
        placeholder={`${label} Name`}
        value={staffActions[role].name}
        onChange={(e) => onStaffChange(role, "name", e.target.value)}
        style={cellInput}
      />
    </div>
    <div style={{ flex: 2, minWidth: "250px" }}>
      <input
        type="text"
        placeholder="Specific Comments/Instructions"
        value={staffActions[role].comment}
        onChange={(e) => onStaffChange(role, "comment", e.target.value)}
        style={cellInput}
      />
    </div>
  </div>
);

interface Props {
  totalSteps: number;
  stepNumber: number;
  initialData?: ActionsAgreedData;
  visitDetails: { 
    userName?: string; 
    role?: string; 
    area?: string 
  };
  onNext: (data: ActionsAgreedData) => void;
  onBack: () => void;
}

const ActionsAgreedStep = ({ totalSteps, stepNumber, initialData, onNext, onBack }: Props) => {
  // ✅ FIXED: Initialize rows from localStorage with fallback
  const [rows, setRows] = useState<ActionRow[]>(() => {
    console.log("🎬 ActionsAgreed: Initializing rows...");
    console.log("   initialData:", initialData);
    
    // Priority 1: Use initialData from parent if it has content
    if (initialData?.rows && initialData.rows.length > 0) {
      const hasData = initialData.rows.some(row => row.comment);
      if (hasData) {
        console.log("✅ Using initialData rows from parent");
        return initialData.rows;
      }
    }
    
    // Priority 2: Load from localStorage
    try {
      const saved = localStorage.getItem("actionsAgreed");
      console.log("   localStorage actionsAgreed:", saved ? "FOUND" : "NOT FOUND");
      
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rows && Array.isArray(parsed.rows)) {
          const hasData = parsed.rows.some((row: ActionRow) => row.comment);
          if (hasData) {
            console.log("✅ Loaded rows from localStorage");
            return parsed.rows;
          }
        }
      }
    } catch (err) {
      console.error("❌ Failed to parse actionsAgreed:", err);
    }
    
    console.log("⚠️ Using DEFAULT_ROWS");
    return DEFAULT_ROWS;
  });

 // ✅ FIXED: Initialize staffActions from localStorage with fallback
const [staffActions, setStaffActions] = useState<ActionsAgreedData['staffActions']>(() => {
  console.log("🎬 ActionsAgreed: Initializing staffActions...");
  
  // Priority 1: Use initialData from parent if it has content
  if (initialData?.staffActions) {
    const hasData = 
      initialData.staffActions.asm.name || initialData.staffActions.asm.comment ||
      initialData.staffActions.ase.name || initialData.staffActions.ase.comment ||
      initialData.staffActions.csr.name || initialData.staffActions.csr.comment;
    
    if (hasData) {
      console.log("✅ Using initialData staffActions from parent");
      return initialData.staffActions;
    }
  }
  
  // Priority 2: Load from localStorage
  try {
    const saved = localStorage.getItem("actionsAgreed");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.staffActions) {
        const hasData = 
          parsed.staffActions.asm?.name || parsed.staffActions.asm?.comment ||
          parsed.staffActions.ase?.name || parsed.staffActions.ase?.comment ||
          parsed.staffActions.csr?.name || parsed.staffActions.csr?.comment;
        
        if (hasData) {
          console.log("✅ Loaded staffActions from localStorage");
          return parsed.staffActions;
        }
      }
    }
  } catch (err) {
    console.error("❌ Failed to parse staffActions:", err);
  }
  
  console.log("⚠️ Using DEFAULT_STAFF_ACTIONS");
  return DEFAULT_STAFF_ACTIONS;
});

  // ✅ ADD: Auto-save to localStorage whenever data changes (debounced)
  useEffect(() => {
    // Only save if there's actual data entered
    const hasRowData = rows.some(row => row.comment);
    const hasStaffData = 
      staffActions.asm.name || staffActions.asm.comment ||
      staffActions.ase.name || staffActions.ase.comment ||
      staffActions.csr.name || staffActions.csr.comment;
    
    if (hasRowData || hasStaffData) {
      const timer = setTimeout(() => {
        const payload = { rows, staffActions };
        
        // Add metadata (same as parent does)
        const visitDetails = JSON.parse(localStorage.getItem("visitDetails") || "{}");
        const reportGroupId = localStorage.getItem("reportGroupId");
        
        (payload as any).reportGroupId = reportGroupId;
        (payload as any).userName = visitDetails.userName || "Unknown";
        (payload as any).userRole = visitDetails.area || "";
        
        console.log("💾 Auto-saving actionsAgreed:", payload);
        localStorage.setItem("actionsAgreed", JSON.stringify(payload));
      }, 500); // Wait 500ms after last change

      return () => clearTimeout(timer); // Cancel if user keeps typing
    }
  }, [rows, staffActions]);

  const handleChange = (id: string, field: keyof ActionRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleStaffChange = (role: 'asm' | 'ase' | 'csr', field: keyof StaffAction, value: string) => {
    setStaffActions(prev => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };

  const addRow = () => setRows(prev => [...prev, newRow()]);
  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));

  const handleNext = () => {
    console.log("📤 ActionsAgreed: Sending data to parent");
    const data: ActionsAgreedData = { rows, staffActions };
    onNext(data);
  };

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Actions Agreed"
      Icon={FiCheckSquare}
      onNext={handleNext}
      onBack={onBack}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#164976", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiCheckSquare size={18} /> Actions Agreed with DB
        </h3>
        <div style={{ overflowX: "auto", borderRadius: "14px", border: "2px solid #4a6d8c" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #164976, #1e6aad)" }}>
                <th style={{ padding: "16px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "white", textTransform: "uppercase" }}>Action</th>
                <th style={{ padding: "16px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "white", textTransform: "uppercase" }}>Comments</th>
                <th style={{ padding: "16px 14px", textAlign: "center" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} style={{ background: idx % 2 === 0 ? "#ffffff" : "rgba(22,73,118,0.02)", borderBottom: "1px solid rgba(22,73,118,0.08)" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <input
                      type="text"
                      value={row.action}
                      readOnly={row.isFixed}
                      placeholder="Enter action"
                      onChange={(e) => handleChange(row.id, "action", e.target.value)}
                      style={{ ...cellInput, ...(row.isFixed ? { background: "rgba(22,73,118,0.06)", fontWeight: 600, border: "2px solid transparent" } : {}) }}
                    />
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <input
                      type="text"
                      value={row.comment}
                      placeholder="Enter specific comments..."
                      onChange={(e) => handleChange(row.id, "comment", e.target.value)}
                      style={cellInput}
                    />
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    {!row.isFixed && (
                      <button onClick={() => removeRow(row.id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addRow} style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", border: "1px dashed #4a6d8c", background: "white", color: "#164976", fontWeight: 700, cursor: "pointer" }}>
          <FiPlus size={16} /> Add Action 
        </button>
      </div>

      <hr style={{ margin: "2.5rem 0", border: "0", borderTop: "2px dashed rgba(22,73,118,0.15)" }} />

      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#164976", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiUsers size={18} /> Actions Agreed with Staff
        </h3>
        <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", border: "2px solid #4a6d8c" }}>
          <StaffInputRow label="ASM" role="asm" staffActions={staffActions} onStaffChange={handleStaffChange} />
          <StaffInputRow label="ASE" role="ase" staffActions={staffActions} onStaffChange={handleStaffChange} />
          <StaffInputRow label="CSR" role="csr" staffActions={staffActions} onStaffChange={handleStaffChange} />
        </div>
      </div>
    </StepShell>
  );
};

export default ActionsAgreedStep;