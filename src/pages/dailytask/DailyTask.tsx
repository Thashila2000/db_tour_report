import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  FiMapPin, FiHome, FiBarChart2, FiPackage,
  FiAlertTriangle, FiCheckSquare,
  FiBell, FiFileText, FiCheck, FiClipboard,
} from "react-icons/fi";

// ── Step components ───────────────────────────────────────────────────────────
import VisitDetailsStep from "./steps/VisitDetailsStep";
import type { VisitDetailsData } from "./steps/VisitDetailsStep";
import DBProfileStep from "./steps/DBProfileStep";
import type { DBProfileData } from "./steps/DBProfileStep";
import SalesPerformanceStep from "./steps/SalesPerformanceStep";
import type { SalesPerformanceData } from "./steps/SalesPerformanceStep";
import StockStatusStep from "./steps/StockStatusStep";
import type { StockStatusData } from "./steps/StockStatusStep";
import IssuesIdentifiedStep from "./steps/IssuesIdentifiedStep";
import type { IssuesIdentifiedData } from "./steps/IssuesIdentifiedStep";
import ActionsAgreedStep from "./steps/ActionsAgreedStep";
import type { ActionsAgreedData } from "./steps/ActionsAgreedStep";
import FollowUpStep from "./steps/FollowUpStep";
import type { FollowUpData } from "./steps/FollowUpStep";
import RemarksStep from "./steps/RemarksStep";
import type { RemarksData } from "./steps/RemarksStep";

// ─────────────────────────────────────────────────────────────────────────────
// Stepper metadata
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Visit Details",     Icon: FiMapPin         },
  { label: "DB Profile",        Icon: FiHome           },
  { label: "Sales Snapshot",    Icon: FiBarChart2      },
  { label: "Stock Status",      Icon: FiPackage        },
  { label: "Issues Identified", Icon: FiAlertTriangle },
  { label: "Actions Agreed",    Icon: FiCheckSquare    },
  { label: "Follow Up",         Icon: FiBell           },
  { label: "Remarks",           Icon: FiFileText       },
];

const TOTAL = STEPS.length;

interface AllFormData {
  visitDetails?:     VisitDetailsData;
  dbProfile?:        DBProfileData;
  salesPerformance?: SalesPerformanceData;
  stockStatus?:      StockStatusData;
  issuesIdentified?: IssuesIdentifiedData;
  actionsAgreed?:    ActionsAgreedData;
  followUp?:         FollowUpData;
  remarks?:          RemarksData;
}

const DailyTask = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState<AllFormData>({});
  
 
const [loggedInUser] = useState<any>(() => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // ── Helper: Inject Metadata & Report ID ─────────────────────────────────────
  const wrapWithMetadata = (data: any) => {
    const visitDetails = JSON.parse(localStorage.getItem("visitDetails") || "{}");
    const reportGroupId = localStorage.getItem("reportGroupId");

    return {
      ...data,
      reportGroupId: reportGroupId,
      userName: loggedInUser?.name || "Unknown User",
      userRole: `${loggedInUser?.role || "ASM"} ${visitDetails.area ?? ""}`,
    };
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goNext = (key: keyof AllFormData, data: any) => {
    setAllData((prev) => ({ ...prev, [key]: data }));
    if (currentStep < TOTAL) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const progressPct = ((currentStep - 1) / (TOTAL - 1)) * 100;

  // ✅ Top-Level Safety: If no user, show error instead of broken form
  if (!loggedInUser) {
    return (
      <div style={{ padding: "50px", textAlign: "center", color: "#164976" }}>
        <h2>Access Denied</h2>
        <p>Please log in to continue.</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Global Styles ────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        * { box-sizing: border-box;}

        .dtr-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #f8fafd;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top:-25px
        }

        .dtr-card {
         width: 100%;
         padding: 2rem 3rem;
        }
        .dtr-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(22,73,118,0.08);
          color: #164976;
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 10px;
        }

        .dtr-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 800;
          color: #0c2340;
          line-height: 1.2;
          margin: 0 0 0.3rem 0;
        }

        .dtr-subtitle {
          font-size: 13px;
          color: #6e90b0;
          margin: 0 0 2rem 0;
        }

        .stepper-wrapper {
          margin-bottom: 2.5rem;
          overflow-x: auto;
          padding: 16px 6px 10px;
        }
        .stepper-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          min-width: 640px;
          position: relative;
        }
        .stepper-track {
          position: absolute;
          top: 19px;
          left: 19px;
          right: 19px;
          height: 3px;
          background: rgba(22,73,118,0.10);
          border-radius: 10px;
          overflow: hidden;
        }
        .stepper-fill {
          height: 100%;
          background: linear-gradient(90deg, #164976, #2e81c3);
          border-radius: 10px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 60px;
          max-width: 80px;
          position: relative;
        }
        .step-bubble {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          overflow: visible;
          transition: box-shadow 0.3s ease;
          cursor: default;
          margin-top: 3px;
        }
        .step-bubble.done     { background: #164976; color: #fff; box-shadow: 0 4px 12px rgba(22,73,118,0.28); }
        .step-bubble.active   { background: linear-gradient(135deg,#164976,#1e6aad); color:#fff; box-shadow: 0 0 0 5px rgba(22,73,118,0.14), 0 6px 18px rgba(22,73,118,0.32); }
        .step-bubble.upcoming { background: #f5f8fc; color: #94a9be; border: 2px solid #d4e2ef; }
        .step-label { font-size: 10px; text-align: center; line-height: 1.3; font-weight: 500; max-width: 72px; margin-top: 8px; }
        .step-label.done,
        .step-label.active   { color: #164976; font-weight: 600; }
        .step-label.upcoming { color: #94a9be; }

        .form-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0c2340;
          margin: 0 0 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .form-section-title::before {
          content: '';
          display: inline-block;
          width: 4px; height: 20px;
          background: linear-gradient(180deg, #164976, #2e81c3);
          border-radius: 4px;
          flex-shrink: 0;
        }
        .form-rows   { display: flex; flex-direction: column; gap: 1rem; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .step-counter {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(22,73,118,0.07);
          color: #164976;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 1rem;
        }

        .btn-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.8rem; }
        .btn-secondary {
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: 1.5px solid rgba(22,73,118,0.20);
          background: #fff;
          color: #164976;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover { background: rgba(22,73,118,0.04); border-color: #164976; }
        .btn-primary {
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          border: none;
          background: linear-gradient(135deg, #164976, #1e6aad);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(22,73,118,0.28);
          transition: all 0.2s ease;
        }
        .btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,73,118,0.38); }
        .btn-primary:active { transform: translateY(0); }

        @media (max-width: 540px) {
          .form-grid-2 { grid-template-columns: 1fr; }
          .dtr-card    { padding: 1.25rem; }
        }

        .stepper-wrapper::-webkit-scrollbar       { height: 4px; }
        .stepper-wrapper::-webkit-scrollbar-track { background: transparent; }
        .stepper-wrapper::-webkit-scrollbar-thumb { background: rgba(22,73,118,0.18); border-radius: 10px; }
      `}</style>

      <div className="dtr-root">
        <div className="dtr-card">
          <div className="dtr-header-badge">
            <FiClipboard size={12} /> DB Visit Report
          </div>
          <h1 className="dtr-title">Daily Task Report</h1>
          <p className="dtr-subtitle">Track your distributor visits and performance reviews</p>

          {/* ── Stepper ──────────────────────────────────────────────────── */}
          <div className="stepper-wrapper">
            <div className="stepper-inner">
              <div className="stepper-track">
                <div className="stepper-fill" style={{ width: `${progressPct}%` }} />
              </div>
              {STEPS.map(({ label, Icon }, i) => {
                const n = i + 1;
                const state = n < currentStep ? "done" : n === currentStep ? "active" : "upcoming";
                return (
                  <div key={i} className="step-item">
                    <motion.div
                      className={`step-bubble ${state}`}
                      onClick={() => goToStep(n)}
                      style={{ cursor: "pointer" }}
                      animate={{ scale: state === "active" ? 1.18 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {state === "done" ? <FiCheck size={15} strokeWidth={3} /> : <Icon size={15} />}
                    </motion.div>
                    <span className={`step-label ${state}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Step Content ───────────────────────────────────────────── */}
          <div style={{ position: "relative" }}>
            
            {/* Step 1: Visit Details (The Generator) */}
            <div style={{ display: currentStep === 1 ? "block" : "none" }}>
              {loggedInUser && (
                <VisitDetailsStep 
                  totalSteps={TOTAL} 
                  stepNumber={1} 
                  initialData={allData.visitDetails} 
                  onNext={(data) => {
                    // ✅ Generate Unique Report ID once here
                    const reportGroupId = `RPT-${data.dbCode}-${Date.now()}`;
                    localStorage.setItem("reportGroupId", reportGroupId);

                    const payload = { ...data, reportGroupId };
                    localStorage.setItem("visitDetails", JSON.stringify(payload));
                    goNext("visitDetails", payload);
                  }}
                  onBack={goBack}
                  username={loggedInUser.name}  
                  role={loggedInUser.role}       
                  roleValue=""                   
                />
              )}
            </div>

            {/* Step 2: DB Profile */}
            <div style={{ display: currentStep === 2 ? "block" : "none" }}>
              {loggedInUser && (
                <DBProfileStep
                  totalSteps={TOTAL}
                  stepNumber={2}
                  initialData={allData.dbProfile}
                  username={loggedInUser.name}
                  onNext={(data) => {
                    const payload = wrapWithMetadata(data);
                    // Add legacy specific key for DB Profile
                    payload.createdByName = loggedInUser.name;
                    localStorage.setItem("dbProfile", JSON.stringify(payload));
                    goNext("dbProfile", payload);
                  }}
                  onBack={goBack}
                />
              )}
            </div>

            {/* Step 3: Sales Performance */}
            <div style={{ display: currentStep === 3 ? "block" : "none" }}>
              {loggedInUser && (
                <SalesPerformanceStep
                  totalSteps={TOTAL}
                  stepNumber={3}
                  initialData={allData.salesPerformance}
                  onNext={(data) => {
                    const payload = wrapWithMetadata(data);
                    localStorage.setItem("salesPerformance", JSON.stringify(payload));
                    goNext("salesPerformance", payload);
                  }}
                  onBack={goBack}
                />
              )}
            </div>

            {/* Step 4: Stock Status */}
            <div style={{ display: currentStep === 4 ? "block" : "none" }}>
              <StockStatusStep
                totalSteps={TOTAL}
                stepNumber={4}
                initialData={allData.stockStatus}
                onNext={(data) => {
                  const payload = wrapWithMetadata(data);
                  localStorage.setItem("stockStatus", JSON.stringify(payload));
                  goNext("stockStatus", payload);
                }}
                onBack={goBack}
              />
            </div>

            {/* Step 5: Issues Identified */}
            <div style={{ display: currentStep === 5 ? "block" : "none" }}>
              <IssuesIdentifiedStep
                totalSteps={TOTAL}
                stepNumber={5}
                initialData={allData.issuesIdentified}
                onNext={(data) => {
                  const payload = wrapWithMetadata(data);
                  localStorage.setItem("issuesIdentified", JSON.stringify(payload));
                  goNext("issuesIdentified", payload);
                }}
                onBack={goBack}
              />
            </div>

            {/* Step 6: Actions Agreed */}
            <div style={{ display: currentStep === 6 ? "block" : "none" }}>
              <ActionsAgreedStep
                totalSteps={TOTAL}
                stepNumber={6}
                initialData={allData.actionsAgreed}
                onNext={(data) => {
                  const payload = wrapWithMetadata(data);
                  localStorage.setItem("actionsAgreed", JSON.stringify(payload));
                  goNext("actionsAgreed", payload);
                }}
                onBack={goBack}
                visitDetails={JSON.parse(localStorage.getItem("visitDetails") || "{}")}  
              />
            </div>

            {/* Step 7: Follow-Up */}
            <div style={{ display: currentStep === 7 ? "block" : "none" }}>
              <FollowUpStep
                totalSteps={TOTAL}
                stepNumber={7}
                initialData={allData.followUp}
                onNext={(data) => {
                  // FollowUp mapping to DTO
                  const baseData = {
                    rows: data.rows.map((r: any) => ({
                      action: r.action,
                      responsible: r.responsible,
                      deadline: r.deadline
                    }))
                  };
                  const payload = wrapWithMetadata(baseData);
                  localStorage.setItem("followUp", JSON.stringify(payload));
                  goNext("followUp", payload);
                }}
                onBack={goBack}
              />
            </div>

            {/* Step 8: Remarks */}
            <div style={{ display: currentStep === 8 ? "block" : "none" }}>
              <RemarksStep
                totalSteps={TOTAL}
                stepNumber={8}
                initialData={allData.remarks}
                onNext={(data) => {
                  const payload = wrapWithMetadata(data);
                  localStorage.setItem("remarks", JSON.stringify(payload));
                  goNext("remarks", payload);
                }}
                onBack={goBack}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyTask;