import { useState } from "react";
import { FiFileText, FiCheckCircle, FiPlus } from "react-icons/fi";
import StepShell from "../StepShell";
import axios from "axios";

export interface RemarksData {
  remarks: string;
  preparedBy: string;
}

interface Props {
  totalSteps: number;
  stepNumber: number;
  initialData?: RemarksData;
  onNext: (data: RemarksData) => void;
  onBack: () => void;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#4a6d8c",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1.5px solid #4a6d8c",
  background: "rgba(22,73,118,0.04)",
  color: "#0a1f33",
  fontSize: "13px",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "all 0.2s ease",
};

const RemarksStep = ({ totalSteps, stepNumber, initialData, onBack }: Props) => {
  const [remarks, setRemarks] = useState(initialData?.remarks ?? "");
  const [preparedBy, setPreparedBy] = useState(initialData?.preparedBy ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [summary, setSummary] = useState<string[]>([]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!remarks.trim()) newErrors["remarks"] = "Remarks are required";
    if (!preparedBy.trim()) newErrors["preparedBy"] = "Prepared By is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      const userStr = localStorage.getItem("user");
      const reportGroupId = localStorage.getItem("reportGroupId");
      
      if (!userStr || !reportGroupId) {
        alert("❌ Missing Session Data. Please restart the report.");
        setSubmitting(false);
        return;
      }

      const loggedInUser = JSON.parse(userStr);
      const userName = loggedInUser.name || "Unknown"; 
      const userRole = loggedInUser.role || "";

      const visitDetailsStr = localStorage.getItem("visitDetails");
      const visitDetails = visitDetailsStr ? JSON.parse(visitDetailsStr) : null;
      const userRoleWithArea = visitDetails 
        ? `${userRole} ${visitDetails.area ?? ""}`.trim()
        : userRole;

      const withThread = (data: any) => ({
        ...data,
        reportGroupId,
        userName,
        userRole: userRoleWithArea,
      });

      // 1. Data Retrieval from Local Storage
      const dbProfile = JSON.parse(localStorage.getItem("dbProfile") || "{}");
      const salesPerformance = JSON.parse(localStorage.getItem("salesPerformance") || "{}");
      const stockStatus = JSON.parse(localStorage.getItem("stockStatus") || "{}");
      const issues = JSON.parse(localStorage.getItem("issuesIdentified") || "{}");
      const actionsData = JSON.parse(localStorage.getItem("actionsAgreed") || "{}"); 
      const followUp = JSON.parse(localStorage.getItem("followUp") || "{}");
      
      // ALIGNMENT: We label this as 'finalRemarks' to match the Preview Modal state key
      const remarksData = withThread({ remarks, preparedBy });

      const staffObj = actionsData.staffActions || { asm: {}, ase: {}, csr: {}};
      const staffPayload = [
        { position: "ASM", name: staffObj.asm?.name?.trim() || "", comment: staffObj.asm?.comment?.trim() || "" },
        { position: "ASE", name: staffObj.ase?.name?.trim() || "", comment: staffObj.ase?.comment?.trim() || "" },
        { position: "CSR", name: staffObj.csr?.name?.trim() || "", comment: staffObj.csr?.comment?.trim() || "" }
      ]
      .filter(item => item.name !== "" || item.comment !== "")
      .map(item => ({ ...item, reportGroupId, userName }));

      // 2. Prepare Final Payloads
      const payloads = {
        masterReport: {
          reportGroupId,
          userName,
          dbName: visitDetails?.dbName || "Unknown Hub",
          dbCode: visitDetails?.dbCode || "N/A",
          region: visitDetails?.region || "Unknown Region",
          area: visitDetails?.area || "Unknown Area",
          territoryName: visitDetails?.territoryName || "Unknown Territory",
          visitTime: new Date().toISOString().replace('T', ' ').split('.')[0].replace(/-/g, '.')
        },
        visitDetails: { ...visitDetails, reportGroupId },
        dbProfile: withThread({
          ...dbProfile,
          routeMapImage: dbProfile.routeMapImageBase64 || null,
          routePlanImage: dbProfile.routePlanImageBase64 || null,
        }),
        salesPerformance: withThread({ rows: salesPerformance.rows || [] }),
        stockStatus: {
          reportGroupId, userName, userRole: userRoleWithArea,
          categories: (stockStatus.categories || [])
            .filter((cat: any) => cat.items && cat.items.length > 0)
            .map((cat: any) => ({
              ...cat,
              reportGroupId,
              items: (cat.items || []).map((item: any) => ({ ...item, reportGroupId, categoryName: cat.name, userName, userRole: userRoleWithArea }))
            }))
        },
        issues: {
          reportGroupId, userName, userRole: userRoleWithArea,
          rows: (issues.rows || []).filter((r: any) => r.description.trim() !== "").map((r: any) => ({ ...r, reportGroupId, userName, userRole: userRoleWithArea }))
        },
        actions: {
          reportGroupId, userName, userRole: userRoleWithArea,
          rows: (actionsData.rows || []).filter((r: any) => r.action?.trim() !== "").map((r: any) => ({ ...r, reportGroupId, userName, userRole: userRoleWithArea }))
        },
        staffActions: staffPayload, 
        followUp: withThread(followUp),
        finalRemarks: remarksData, // Renamed from 'remarks'
      };

      const results = { successful: [] as string[], failed: [] as string[] };

      const postData = async (endpoint: string, data: any, label: string) => {
        try {
          await axios.post(`http://localhost:8080/api/${endpoint}`, data);
          results.successful.push(label);
        } catch (err: any) {
          console.error(`❌ ${label} failed:`, err.response?.data || err.message);
          results.failed.push(label);
        }
      };

      // 3. Execution Sequence
      await postData("reports/save-visit", payloads.masterReport, "Main Report Table");
      await postData("visit-details", payloads.visitDetails, "Visit Details");
      await postData("db-profile", payloads.dbProfile, "DB Profile");
      await postData("sales-performance", payloads.salesPerformance, "Sales Performance");
      await postData("stock-status", payloads.stockStatus, "Stock Status");
      await postData("issues", payloads.issues, "Issues Identified");
      await postData("actions", payloads.actions, "Actions Agreed");
      
      if (payloads.staffActions.length > 0) {
        await postData("action-staff/bulk", payloads.staffActions, "Staff Actions");
      }

      await postData("follow-up", payloads.followUp, "Follow Up");
      
      // CRITICAL FIX: Ensure endpoint matches your Backend controller mapping
      await postData("remarks", payloads.finalRemarks, "Remarks");

      // 4. Cleanup
      if (results.failed.length === 0) {
        setSummary(results.successful);
        ["visitDetails", "dbProfile", "salesPerformance", "stockStatus", "issuesIdentified", "actionsAgreed", "followUp", "remarks", "reportGroupId"].forEach(k => localStorage.removeItem(k));
        setIsSuccess(true);
      } else {
        alert(`❌ Submission Partial: ${results.failed.join(", ")}`);
      }

    } catch (error) {
      console.error("💥 Critical Failure:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#f8fafd', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ textAlign: 'center', padding: '40px 24px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', maxWidth: '450px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <FiCheckCircle style={{ color: '#10b981', fontSize: '40px' }} />
          </div>
          <h2 style={{ color: '#111827', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Report Synchronized!</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>All sections have been saved successfully.</p>
          <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
            {summary.map((item, idx) => (
              <div key={idx} style={{ fontSize: '13px', color: '#334155', padding: '4px 0', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', marginRight: '12px' }} /> {item}
              </div>
            ))}
          </div>
          <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '14px', background: '#164976', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
            <FiPlus /> Create New Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <StepShell stepNumber={stepNumber} totalSteps={totalSteps} title="General Remarks" Icon={FiFileText} onNext={handleSubmit} onBack={onBack}>
      {submitting && (
        <div style={{ padding: "1.2rem", backgroundColor: "#dbeafe", border: "2px solid #3b82f6", borderRadius: "10px", marginBottom: "1.5rem", textAlign: "center" }}>
          <div style={{ color: "#1e40af", fontWeight: 700, fontSize: "14px", marginBottom: "0.5rem" }}>🔄 Syncing report forms to database...</div>
          <div style={{ color: "#3b82f6", fontSize: "12px" }}>Please wait...</div>
        </div>
      )}
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
          style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6", minHeight: "140px", border: errors["remarks"] ? "2px solid #f87171" : "2px solid #4a6d8c" }}
          disabled={submitting}
        />
        {errors["remarks"] && <p style={{ color: "#f87171", fontSize: "11px", marginTop: "4px" }}>{errors["remarks"]}</p>}
      </div>
      <div style={{ marginTop: "20px" }}>
        <label style={labelStyle}>Prepared By</label>
        <input
          type="text"
          value={preparedBy}
          placeholder="Enter name"
          onChange={(e) => {
            setPreparedBy(e.target.value);
            if (errors["preparedBy"]) setErrors((prev) => ({ ...prev, preparedBy: "" }));
          }}
          style={{ ...inputStyle, border: errors["preparedBy"] ? "2px solid #f87171" : "2px solid #4a6d8c" }}
          disabled={submitting}
        />
        {errors["preparedBy"] && <p style={{ color: "#f87171", fontSize: "11px", marginTop: "4px" }}>{errors["preparedBy"]}</p>}
      </div>
    </StepShell>
  );
};

export default RemarksStep;