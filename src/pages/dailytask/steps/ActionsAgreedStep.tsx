import { useState } from "react";
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

// ✅ FIX: Move StaffInputRow OUTSIDE the main component to prevent focus loss
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
  visitDetails: { userName: string; role: string; area: string };
  onNext: (data: ActionsAgreedData) => void;
  onBack: () => void;
}

const ActionsAgreedStep = ({ totalSteps, stepNumber, initialData, onNext, onBack }: Props) => {
  const [rows, setRows] = useState<ActionRow[]>(initialData?.rows ?? DEFAULT_ROWS);
  const [staffActions, setStaffActions] = useState(initialData?.staffActions ?? {
    asm: { name: "", comment: "" },
    ase: { name: "", comment: "" },
    csr: { name: "", comment: "" },
  });

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
    const data: ActionsAgreedData = { rows, staffActions };
    localStorage.setItem("actionsAgreed", JSON.stringify(data));
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
          {/* Use the external component and pass props */}
          <StaffInputRow label="ASM" role="asm" staffActions={staffActions} onStaffChange={handleStaffChange} />
          <StaffInputRow label="ASE" role="ase" staffActions={staffActions} onStaffChange={handleStaffChange} />
          <StaffInputRow label="CSR" role="csr" staffActions={staffActions} onStaffChange={handleStaffChange} />
        </div>
      </div>
    </StepShell>
  );
};

export default ActionsAgreedStep;