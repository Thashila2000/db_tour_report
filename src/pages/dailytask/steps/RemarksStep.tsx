import { useState, useEffect } from "react";
import { FiFileText } from "react-icons/fi";
import StepShell from "../StepShell";
import axios from "axios";
import Swal from "sweetalert2";

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
  const [remarks, setRemarks] = useState(() => {
    if (initialData?.remarks) return initialData.remarks;
    try {
      const saved = localStorage.getItem("remarks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.remarks) return parsed.remarks;
      }
    } catch (err) {
      console.error("❌ Failed to parse remarks:", err);
    }
    return "";
  });

  const [preparedBy, setPreparedBy] = useState(() => {
    if (initialData?.preparedBy) return initialData.preparedBy;
    try {
      const saved = localStorage.getItem("remarks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.preparedBy) return parsed.preparedBy;
      }
    } catch (err) {
      console.error("❌ Failed to parse preparedBy:", err);
    }
    return "";
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (remarks.trim() || preparedBy.trim()) {
      const timer = setTimeout(() => {
        const payload = { remarks, preparedBy };
        localStorage.setItem("remarks", JSON.stringify(payload));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [remarks, preparedBy]);

  const getActualLocalTime = () => {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');
    const time = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join(':');
    return `${date} ${time}`;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!remarks.trim()) newErrors["remarks"] = "Remarks are required";
    if (!preparedBy.trim()) newErrors["preparedBy"] = "Prepared By is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Show Loading Overlay
    Swal.fire({
      title: 'Submitting Report',
      text: 'Please wait while we sync your data...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setSubmitting(true);

    try {
      const userStr = localStorage.getItem("user");
      const reportGroupId = localStorage.getItem("reportGroupId");

      if (!userStr || !reportGroupId) {
        Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Missing session data. Please restart the report.' });
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

      // 1. Data Retrieval
      const dbProfile = JSON.parse(localStorage.getItem("dbProfile") || "{}");
      const salesPerformance = JSON.parse(localStorage.getItem("salesPerformance") || "{}");
      const stockStatus = JSON.parse(localStorage.getItem("stockStatus") || "{}");
      const issues = JSON.parse(localStorage.getItem("issuesIdentified") || "{}");
      const actionsData = JSON.parse(localStorage.getItem("actionsAgreed") || "{}");
      const followUp = JSON.parse(localStorage.getItem("followUp") || "{}");
      const remarksData = withThread({ remarks, preparedBy });

      const actualLocalTime = getActualLocalTime();

      const staffObj = actionsData.staffActions || { asm: {}, ase: {}, csr: {} };
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
          createdAt: actualLocalTime,
          visitTime: actualLocalTime
        },
        visitDetails: {
          ...visitDetails,
          reportGroupId,
          accompaniedByImage: visitDetails?.accompaniedByImage || null
        },
        dbProfile: withThread({
          ...dbProfile,
          routeMapImage: dbProfile.routeMapImageBase64 || null,
          routePlanImage: dbProfile.routePlanImageBase64 || null,
        }),
        salesPerformance: withThread({ rows: salesPerformance.rows || [] }),
        stockStatus: {
          reportGroupId,
          userName,
          userRole: userRoleWithArea,
          items: (stockStatus.categories || [])
            .flatMap((cat: any) => {
              return (cat.items || [])
                .filter((item: any) => item.itemName && item.itemName.trim() !== "" && (item.stockLevel || item.systemStock))
                .map((item: any) => {
                  const stockLevel = parseFloat(item.stockLevel) || 0;
                  const systemStock = parseFloat(item.systemStock) || 0;
                  const varianceNum = stockLevel - systemStock;
                  const variance = varianceNum > 0 ? `+${varianceNum.toFixed(2)}` : varianceNum < 0 ? varianceNum.toFixed(2) : "+0.00";

                  return {
                    categoryName: cat.name,
                    categoryComment: cat.comment || "",
                    itemName: item.itemName,
                    stockLevel: item.stockLevel,
                    systemStock: item.systemStock,
                    variance: variance
                  };
                });
            })
        },
        issues: {
          reportGroupId, userName, userRole: userRoleWithArea,
          rows: (issues.rows || [])
            .filter((r: any) => r.description && r.description.trim() !== "")
            .map((r: any) => ({ ...r, reportGroupId, userName, userRole: userRoleWithArea }))
        },
        actions: {
          reportGroupId, userName, userRole: userRoleWithArea,
          rows: (actionsData.rows || [])
            .filter((r: any) => r.action && r.action.trim() !== "")
            .map((r: any) => ({ ...r, reportGroupId, userName, userRole: userRoleWithArea }))
        },
        staffActions: staffPayload,
        followUp: withThread(followUp),
        finalRemarks: remarksData,
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
      await postData("remarks", payloads.finalRemarks, "Remarks");

    // 4. Cleanup & Final Alert
if (results.failed.length === 0) {
  // 1. Define EVERY key used in your multi-step form
  const keysToClear = [
    "visitDetails", 
    "dbProfile", 
    "salesPerformance", 
    "stockStatus", 
    "issuesIdentified", 
    "actionsAgreed", 
    "followUp", 
    "remarks", 
    "reportGroupId", 
    "currentStepIndex",
    "distributorSearch" // Clear search text too if you store it
  ];

  // 2. Clear them all
  keysToClear.forEach(k => localStorage.removeItem(k));

  Swal.fire({
    icon: 'success',
    title: 'Report Synchronized!',
    text: 'Data submitted successfully.',
    confirmButtonText: 'OK',
    confirmButtonColor: '#164976',
  }).then(() => {
    
    // 3. Instead of reload, redirect to the root or step 1
     window.location.href = "/daily-task"; 
  });
}
    } catch (error) {
      console.error("💥 Critical Failure:", error);
      Swal.fire({ icon: 'error', title: 'Critical Failure', text: 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepShell stepNumber={stepNumber} totalSteps={totalSteps} title="General Remarks" Icon={FiFileText} onNext={handleSubmit} onBack={onBack}>
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
          style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6", minHeight: "140px", border: errors["remarks"] ? "2px solid #f87171" : "2.5px solid #4a6d8c" }}
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
          style={{ ...inputStyle, border: errors["preparedBy"] ? "2px solid #f87171" : "2.5px solid #4a6d8c" }}
          disabled={submitting}
        />
        {errors["preparedBy"] && <p style={{ color: "#f87171", fontSize: "11px", marginTop: "4px" }}>{errors["preparedBy"]}</p>}
      </div>
    </StepShell>
  );
};

export default RemarksStep;