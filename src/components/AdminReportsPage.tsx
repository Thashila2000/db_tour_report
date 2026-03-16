import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FiCalendar, FiDownload, FiFileText, FiLayers, FiChevronDown, 
  FiMapPin, FiRefreshCw, FiX, FiActivity, FiEye, FiArrowLeft, FiAlertCircle
} from "react-icons/fi";

// Import your existing modals
import ReportModal from "./DTaskModal"; 
import FieldVisitReport from "./FieldVisitReport"; 

export default function AdminReportsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  
  
  const queryParams = new URLSearchParams(location.search);
  const regionFromUrl = queryParams.get("region") || "";

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [reportType, setReportType] = useState("FIELD_VISIT"); 
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const [previewData, setPreviewData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeModalType, setActiveModalType] = useState<"DAILY_TASK" | "FIELD_VISIT" | null>(null);

  const BASE_URL = "http://localhost:8080";
  const today = new Date().toISOString().split("T")[0];

  const fetchReports = async () => {
    if (!regionFromUrl) return;
    setLoading(true);
    try {
      const endpoint = reportType === "DAILY_TASK" 
        ? "/api/reports/daily-tasks" 
        : "/api/reports/field-visits";
        
      const response = await axios.get(`${BASE_URL}${endpoint}`, { 
        params: { 
          region: regionFromUrl,
          date: selectedDate ? selectedDate.replace(/-/g, ".") : null 
        } 
      });
      
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDate, reportType, regionFromUrl]);


  // Helper functions to satisfy ReportModalProps
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString.replace(/\./g, '-')); // Handle potential dot format
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    // Check if it already contains a time or needs parsing
    return timeString.includes(':') ? timeString : "N/A"; 
  };

  const handlePreview = async (reportGroupId: string, type: "DAILY_TASK" | "FIELD_VISIT") => {
    setModalLoading(true);
    setShowModal(true);
    setActiveModalType(type);
    setPreviewData(null); // Reset preview data to avoid showing old content
    
    try {
      if (type === "FIELD_VISIT") {
        const res = await axios.get(`${BASE_URL}/api/reports/field-visit-details/${reportGroupId}`);
        setPreviewData(res.data);
      } else {
        // 1. Get the main summary (Mandatory)
        const summaryRes = await axios.get(`${BASE_URL}/api/reports/full-summary/${reportGroupId}`);
        let finalData = { ...summaryRes.data };

        // 2. Fetch the "missing" pieces (Optional/Resilient to 500 errors)
        const [remarksRes, staffRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/api/remarks/${reportGroupId}`),
          axios.get(`${BASE_URL}/api/action-staff/bulk/${reportGroupId}`)
        ]);

        if (remarksRes.status === 'fulfilled') {
          const rData = remarksRes.value.data;
          finalData.finalRemarks = Array.isArray(rData) ? rData[0] : rData;
        }

        if (staffRes.status === 'fulfilled') {
          finalData.staffActions = staffRes.value.data;
        }
        
        setPreviewData(finalData);
      }
    } catch (err) {
      console.error("Admin Preview Error (likely 500 in backend):", err);
      // Even if backend fails, we stop the loader so user isn't stuck
      alert("Error loading report details. Please check server logs.");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDownload = (reportGroupId: string) => {
    window.open(`${BASE_URL}/api/reports/export-pdf/${reportGroupId}`, "_blank");
  };

  return (
    <div className="admin-page-container" style={pageWrapper}>
      
      <div className="top-header" style={topHeader}>
        <div style={headerLeft}>
          <button onClick={() => navigate(-1)} style={backBtn}>
            <FiArrowLeft size={18} />
          </button>
          <div style={logoBox}>
            <FiFileText size={24} strokeWidth={2.5} />
          </div>
          <div style={headerText}>
            <h1 style={mainTitle}>{regionFromUrl}</h1>
            <p style={mainSubtitle}>Regional Overview</p>
          </div>
        </div>
        <div className="admin-badge-hide" style={adminBadge}>
          <div style={adminIcon}><FiActivity size={20} /></div>
          <div style={adminInfo}>
             <div style={adminNameText}>Administrator</div>
             <div style={adminRoleText}>{regionFromUrl} Access</div>
          </div>
        </div>
      </div>

      <div className="controls-panel" style={controlsPanel}>
        <div className="controls-stack" style={controlsLeft}>
          <div style={filterGroup}>
            <label style={filterLabel}><FiLayers size={14} /> <span>Report Type</span></label>
            <div style={selectContainer}>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={selectField}>
                <option value="FIELD_VISIT">Field Visit</option>
                <option value="DAILY_TASK">Daily Task</option>
              </select>
              <FiChevronDown style={selectArrow} size={16} />
            </div>
          </div>

          <div style={filterGroup}>
            <label style={filterLabel}><FiCalendar size={14} /> <span>Date Filter</span></label>
            <div style={dateContainer}>
              <input 
                type="date" 
                value={selectedDate} 
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)} 
                style={dateField} 
              />
              {selectedDate && (
                <button onClick={() => setSelectedDate("")} style={clearButton}>
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="controls-right">
          <button onClick={fetchReports} style={refreshButton} disabled={loading}>
            <FiRefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div style={mainContent}>
        <div style={listContainer}>
          {loading ? (
            <div style={loadingState}><div style={spinner} /><p style={loadingText}>Loading data...</p></div>
          ) : reports.length === 0 ? (
            <div style={emptyState}>
              <FiAlertCircle size={48} color="#cbd5e1" />
              <h3 style={emptyTitle}>No Records Found</h3>
              <p style={emptyText}>No reports for {regionFromUrl} on this date.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div 
                key={report.reportGroupId} 
                className="report-card"
                style={{
                    ...reportCard,
                    borderColor: hoveredCard === report.reportGroupId ? '#164976' : '#e2e8f0',
                    transform: hoveredCard === report.reportGroupId ? 'translateX(5px)' : 'none'
                }}
                onMouseEnter={() => setHoveredCard(report.reportGroupId)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="card-inner" style={cardContent}>
                  <div style={cardLeft}>
                    <div className="card-icon-hide" style={iconCircle}>
                      {reportType === "FIELD_VISIT" ? <FiMapPin size={18} color="#164976" /> : <FiActivity size={18} color="#164976" />}
                    </div>
                    <div style={cardInfo}>
                      <h3 style={territoryName}>{report.territoryName || "General Territory"}</h3>
                      <div style={cardMetaRow}>
                        <span style={userTag}>
                          <FiCalendar size={10} style={{marginRight: '4px'}}/>
                          {report.visitTime ? report.visitTime.split(' ')[0] : 'N/A'}
                        </span>
                        <span style={{
                          ...locationTag,
                          background: (reportType === "DAILY_TASK" && !report.dbName) ? "#fee2e2" : "#e2e8f0",
                          color: (reportType === "DAILY_TASK" && !report.dbName) ? "#ef4444" : "#475569"
                        }}>
                          {reportType === "DAILY_TASK" 
                            ? (report.dbName || "No Distributor") 
                            : (report.area || report.region || "General Area")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={actionButtonsGroup}>
                    <button 
                      style={previewButton} 
                      onClick={() => handlePreview(report.reportGroupId, reportType as any)}
                    >
                      <FiEye size={16} /> <span>View</span>
                    </button>
                    {reportType === "DAILY_TASK" && (
                      <button 
                        style={downloadButton} 
                        onClick={() => handleDownload(report.reportGroupId)}
                      >
                        <FiDownload size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && activeModalType === "DAILY_TASK" && (
        <ReportModal 
          showModal={showModal} 
          modalLoading={modalLoading} 
          previewData={previewData} 
          onClose={() => setShowModal(false)} 
          onDownload={handleDownload} 
          formatTime={formatTime}
          formatDate={formatDate}
        />
      )}
      {showModal && activeModalType === "FIELD_VISIT" && (
        <FieldVisitReport 
          showModal={showModal} 
          modalLoading={modalLoading} 
          previewData={previewData} 
          onClose={() => setShowModal(false)} 
        />
      )}

      <style>{`
        /* @import MUST be at the very top */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .admin-page-container { padding: 12px !important; }
          .controls-panel { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
          .controls-stack { flex-direction: column !important; width: 100% !important; gap: 12px !important; }
          .admin-badge-hide { display: none !important; }
          .card-inner { flex-direction: column; align-items: flex-start !important; gap: 12px; }
          .card-icon-hide { display: none !important; }
          .action-buttons-group { width: 100%; justify-content: flex-end; border-top: 1px solid #f1f5f9; padding-top: 10px; }
        }
      `}</style>
    </div>
  );
}

// ==================== STYLES ====================
const pageWrapper: React.CSSProperties = { minHeight: '100vh', background: '#f8fafc', padding: '24px', fontFamily: "'Inter', sans-serif" };
const topHeader: React.CSSProperties = { 
  background: 'white', 
  borderRadius: '16px', 
  padding: '20px 24px', 
  marginBottom: '20px', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  
  // --- VISIBILITY UPDATES ---
  // Thick, high-contrast border
  border: '2px solid #cbd5e1', 
  
  // Stronger shadow to complement the thick border
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
};
const headerLeft: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '16px' };
const backBtn: React.CSSProperties = { background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' };
const logoBox: React.CSSProperties = { width: '48px', height: '48px', background: '#164976', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' };
const headerText: React.CSSProperties = { flex: 1 };
const mainTitle: React.CSSProperties = { margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' };
const mainSubtitle: React.CSSProperties = { margin: 0, fontSize: '13px', color: '#64748b' };
const adminBadge: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '8px 14px', borderRadius: '12px' };
const adminIcon: React.CSSProperties = { color: '#164976' };
const adminInfo: React.CSSProperties = { textAlign: 'right' };
const adminNameText: React.CSSProperties = { fontSize: '13px', fontWeight: 700 };
const adminRoleText: React.CSSProperties = { fontSize: '11px', color: '#64748b' };
const controlsPanel: React.CSSProperties = { 
  background: 'white', 
  borderRadius: '16px', 
  padding: '16px 24px', 
  marginBottom: '20px', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'flex-end', 
  flexWrap: 'wrap',
  // THICKER BORDER
  border: '2px solid #cbd5e1' 
};
const controlsLeft: React.CSSProperties = { display: 'flex', gap: '16px' };
const filterGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' };
const filterLabel: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' };
const selectContainer: React.CSSProperties = { position: 'relative' };
const selectField: React.CSSProperties = { 
  width: '100%', 
  padding: '10px 12px', 
  borderRadius: '8px', 
  // THICKER & DARKER BORDER
  border: '2px solid #cbd5e1', 
  appearance: 'none', 
  fontWeight: 600, 
  fontSize: '14px', 
  cursor: 'pointer', 
  backgroundColor: 'white' 
};
const selectArrow: React.CSSProperties = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' };
const dateContainer: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center' };
const dateField: React.CSSProperties = { 
  width: '100%', 
  padding: '10px 12px', 
  borderRadius: '8px', 
  // THICKER & DARKER BORDER
  border: '2px solid #cbd5e1', 
  fontWeight: 600, 
  fontSize: '14px', 
  backgroundColor: 'white' 
};
const clearButton: React.CSSProperties = { marginLeft: '10px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '6px', padding: '6px', display: 'flex', alignItems: 'center' };
const refreshButton: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#164976', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' };
const mainContent: React.CSSProperties = { 
  background: 'white', 
  borderRadius: '16px', 
  padding: '24px', 
  minHeight: '400px',
  // THICKER BORDER
  border: '2px solid #cbd5e1' 
};
const listContainer: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '16px' // Increased gap slightly for the thicker border look
};

const reportCard: React.CSSProperties = { 
  // Very light blue tint for the background
  background: '#f0f9ff', 
  
  borderRadius: '12px', 
  padding: '16px', 
  
  // Thick Dark Blue Border
  border: '2.5px solid #164976', 
  
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
  cursor: 'default',
  
  // Subtle shadow with a blue tint to match
  boxShadow: '0 4px 6px -1px rgba(22, 73, 118, 0.08)' 
};
const cardContent: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const cardLeft: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 };
const iconCircle: React.CSSProperties = { width: '44px', height: '44px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const cardInfo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 };
const territoryName: React.CSSProperties = { margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' };
const cardMetaRow: React.CSSProperties = { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' };
const locationTag: React.CSSProperties = { fontSize: '10px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', color: '#475569', fontWeight: 700 };
const userTag: React.CSSProperties = { fontSize: '10px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#164976', fontWeight: 700, display: 'flex', alignItems: 'center' };
const actionButtonsGroup: React.CSSProperties = { display: 'flex', gap: '8px', flexShrink: 0, position: 'relative', zIndex: 10 };
const previewButton: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '6px', 
  padding: '8px 16px', 
  borderRadius: '8px', 
  // THICKER BORDER ON BUTTON
  border: '2px solid #164976', 
  background: 'white', 
  fontWeight: 700, 
  cursor: 'pointer', 
  fontSize: '13px', 
  color: '#164976' 
};
const downloadButton: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '8px', background: '#164976', color: 'white', border: 'none', cursor: 'pointer' };
const loadingState: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' };
const spinner: React.CSSProperties = { width: '36px', height: '36px', border: '4px solid #f1f5f9', borderTop: '4px solid #164976', borderRadius: '50%', animation: 'spin 1s linear infinite' };
const loadingText: React.CSSProperties = { marginTop: '16px', fontSize: '14px', color: '#64748b' };
const emptyState: React.CSSProperties = { textAlign: 'center', padding: '60px 20px' };
const emptyTitle: React.CSSProperties = { margin: '16px 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#475569' };
const emptyText: React.CSSProperties = { fontSize: '14px', color: '#94a3b8' };