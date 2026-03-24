import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FiCalendar, FiDownload, FiFileText, 
  FiLayers, FiChevronDown, FiMapPin, FiRefreshCw, 
  FiX, FiClock, FiTrendingUp, FiAlertCircle, FiEye, FiActivity
} from "react-icons/fi";

// Import both Modals
import ReportModal from "./DTaskModal"; 
import FieldVisitReport from "./FieldVisitReport"; 

// --- Interfaces ---
interface ReportSummary {
  reportGroupId: string;
  visitTime: string; 
  dbName: string;
  dbCode: string;
  region: string;
  area: string;
  territoryName: string; 
  userName: string;
}

export default function ReportsPage() {
  // --- State Management ---
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { name: parsed.name || "Unknown User", role: parsed.role || "User" };
      } catch (e) { return { name: "Guest", role: "N/A" }; }
    }
    return { name: "Guest", role: "N/A" };
  });

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [reportType, setReportType] = useState("FIELD_VISIT"); 
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Modal States
  const [previewData, setPreviewData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeModalType, setActiveModalType] = useState<"DAILY_TASK" | "FIELD_VISIT" | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const BASE_URL = "http://localhost:8080";

  // --- Effects ---
  useEffect(() => {
    if (user.name !== "Guest") {
      fetchReports();
    }
  }, [selectedDate, reportType, user.name]);

  // ✅ UPDATED: Fetching Logic to strictly match month-to-date defaults
  const fetchReports = async () => {
    setLoading(true);
    const params: any = { userName: user.name };

    if (selectedDate) {
      // User specifically picked one day
      params.date = selectedDate; 
    } else {
      // DEFAULT: Current month range (1st of current month to Today)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const dayToday = String(now.getDate()).padStart(2, '0');
      
      params.startDate = `${year}-${month}-01`;
      params.endDate = `${year}-${month}-${dayToday}`;
    }

    try {
      const endpoint = reportType === "DAILY_TASK" 
        ? "/api/reports/daily-tasks" 
        : "/api/reports/field-visits";
          
      const response = await axios.get(`${BASE_URL}${endpoint}`, { params });
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (reportGroupId: string, type: "DAILY_TASK" | "FIELD_VISIT") => {
    setModalLoading(true);
    setShowModal(true);
    setActiveModalType(type);
    
    try {
      if (type === "FIELD_VISIT") {
        const res = await axios.get(`${BASE_URL}/api/reports/field-visit-details/${reportGroupId}`);
        setPreviewData(res.data);
      } else {
        const summaryRes = await axios.get(`${BASE_URL}/api/reports/full-summary/${reportGroupId}`);
        let finalData = { ...summaryRes.data };

        const [remarksRes, staffRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/api/remarks/${reportGroupId}`),
          axios.get(`${BASE_URL}/api/action-staff/bulk/${reportGroupId}`)
        ]);

        if (remarksRes.status === 'fulfilled') finalData.finalRemarks = remarksRes.value.data;
        if (staffRes.status === 'fulfilled') finalData.staffActions = staffRes.value.data;
        
        setPreviewData(finalData);
      }
    } catch (err) {
      console.error("Critical Preview Error:", err);
      alert("Failed to load report details.");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDownload = (reportGroupId: string) => {
    const url = `${BASE_URL}/api/reports/export-pdf/${reportGroupId}`;
    window.open(url, "_blank");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPreviewData(null);
    setActiveModalType(null);
  };

  const getDateRangeLabel = () => {
    if (!selectedDate) {
      const now = new Date();
      const monthName = now.toLocaleString('default', { month: 'long' });
      return `${monthName} 1st - ${now.getDate()}${getOrdinal(now.getDate())}`;
    }
    return new Date(selectedDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const formatTime = (visitTime: string) => {
    if (!visitTime) return "N/A";
    try {
      const parts = visitTime.split(' ');
      const timePart = parts[1] ? parts[1].replace('.', ':') : ''; 
      if (timePart) return timePart;
      const date = new Date(visitTime);
      return !isNaN(date.getTime()) 
        ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) 
        : visitTime;
    } catch (e) { return visitTime; }
  };

  const formatDate = (visitTime: string) => {
    if (!visitTime) return "N/A";
    const dateMatch = visitTime.match(/(\d{4})[.-](\d{2})[.-](\d{2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      return `${year}.${month}.${day}`;
    }
    try {
      const date = new Date(visitTime);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-CA').replace(/-/g, '.');
      }
    } catch (e) {}
    return visitTime.split(' ')[0] || visitTime;
  };

  return (
    <div style={pageWrapper}>
      
      {/* ==================== TOP HEADER ==================== */}
      <div style={topHeader}>
        <div style={headerLeft}>
          <div style={logoBox}>
            <FiFileText size={24} strokeWidth={2.5} />
          </div>
          <div style={headerText}>
            <h1 style={mainTitle}>Reports Dashboard</h1>
            <p style={mainSubtitle}>Manage and review field execution data</p>
          </div>
        </div>
        <div style={userBadge}>
          <div style={userIcon}><FiActivity size={20} /></div>
          <div style={userInfo}>
             <div style={userNameText}>{user.name}</div>
             <div style={userRoleText}>{user.role}</div>
          </div>
        </div>
      </div>

      {/* ==================== CONTROLS PANEL ==================== */}
      <div style={controlsPanel}>
        <div style={controlsLeft}>
          <div style={filterGroup}>
            <label style={filterLabel}>
              <FiLayers size={14} strokeWidth={2.5} />
              <span>Report Type</span>
            </label>
            <div style={selectContainer}>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)} 
                style={selectField}
              >
                <option value="FIELD_VISIT">Field Visit</option>
                <option value="DAILY_TASK">Daily Task</option>
              </select>
              <FiChevronDown style={selectArrow} size={16} />
            </div>
          </div>

          <div style={filterGroup}>
            <label style={filterLabel}>
              <FiCalendar size={14} strokeWidth={2.5} />
              <span>Date Filter</span>
            </label>
            <div style={dateContainer}>
              <input 
                type="date" 
                value={selectedDate} 
                max={today} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                style={dateField}
              />
              {selectedDate && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedDate("");
                  }} 
                  style={clearButton}
                  type="button"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={controlsRight}>
          <button 
            onClick={fetchReports} 
            style={{...refreshButton, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            <FiRefreshCw 
              size={16} 
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} 
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <div style={statsContainer}>
        <div style={statCard}>
          <div style={statIconWrapper('#3b82f6')}>
            <FiFileText size={20} color="#3b82f6" />
          </div>
          <div style={statContent}>
            <div style={statValue}>{reports.length}</div>
            <div style={statLabel}>Total Reports</div>
          </div>
        </div>

        <div style={statCard}>
          <div style={statIconWrapper('#10b981')}>
            <FiClock size={20} color="#10b981" />
          </div>
          <div style={statContent}>
            <div style={statValue}>{getDateRangeLabel()}</div>
            <div style={statLabel}>Reporting Period</div>
          </div>
        </div>

        <div style={statCard}>
          <div style={statIconWrapper('#8b5cf6')}>
            <FiTrendingUp size={20} color="#8b5cf6" />
          </div>
          <div style={statContent}>
            <div style={statValue}>{reportType === "FIELD_VISIT" ? "Visits" : "Tasks"}</div>
            <div style={statLabel}>Current Category</div>
          </div>
        </div>
      </div>

      {/* ==================== REPORTS LIST ==================== */}
      <div style={mainContent}>
        <div style={contentHeader}>
          <h2 style={contentTitle}>
            {loading ? "Syncing..." : `${reports.length} ${reportType.replace('_', ' ')} Reports`}
          </h2>
        </div>

        <div style={listContainer}>
          {loading ? (
            <div style={loadingState}>
              <div style={spinner} />
              <p style={loadingText}>Connecting to server...</p>
            </div>
          ) : reports.length === 0 ? (
            <div style={emptyState}>
              <FiAlertCircle size={48} color="#cbd5e1" />
              <h3 style={emptyTitle}>No Records Found</h3>
              <p style={emptyText}>Try changing the date or report type.</p>
            </div>
          ) : (
            reports.map((report) => {
              const isFieldVisit = reportType === "FIELD_VISIT";
              const displayName = isFieldVisit 
                ? (report.territoryName || report.dbName || "General Report")
                : (report.territoryName || "Unassigned Territory");

              return (
                <div 
                  key={report.reportGroupId} 
                  style={{
                    ...reportCard,
                    borderColor: hoveredCard === report.reportGroupId ? '#164976' : '#e2e8f0',
                    transform: hoveredCard === report.reportGroupId ? 'translateX(5px)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredCard(report.reportGroupId)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={cardContent}>
                    <div style={cardLeft}>
                      <div style={iconCircle}>
                        {isFieldVisit ? <FiMapPin size={18} color="#164976" /> : <FiActivity size={18} color="#164976" />}
                      </div>
                      <div style={cardInfo}>
                        <h3 style={territoryName}>{displayName}</h3>
                        <div style={cardMetaRow}>
                          <span style={dateTime}>
                            <FiClock size={12}/> {formatDate(report.visitTime)}
                          </span>
                          <span style={locationTag}>
                             {report.area || report.region}
                          </span>
                          <span style={userTag}>
                            {isFieldVisit ? "Market Execution" : "Daily Task"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={actionButtonsGroup}>
                      <button 
                        style={previewButton} 
                        onClick={() => handlePreview(report.reportGroupId, reportType as "DAILY_TASK" | "FIELD_VISIT")}
                      >
                        <FiEye size={16} /> <span>View</span>
                      </button>
                      {!isFieldVisit && (
                        <button style={downloadButton} onClick={() => handleDownload(report.reportGroupId)}>
                          <FiDownload size={16} /> <span>PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==================== CONDITIONAL MODALS ==================== */}
      {activeModalType === "DAILY_TASK" && (
        <ReportModal
          showModal={showModal}
          modalLoading={modalLoading}
          previewData={previewData}
          onClose={handleCloseModal}
          formatTime={formatTime} 
          formatDate={formatDate}
          onDownload={handleDownload} 
        />
      )}

      {activeModalType === "FIELD_VISIT" && (
        <FieldVisitReport
          showModal={showModal}
          modalLoading={modalLoading}
          previewData={previewData}
          onClose={handleCloseModal}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

// ... (All style objects from your original code are preserved below)
const pageWrapper: React.CSSProperties = { minHeight: '100vh', background: '#f8fafc', padding: '24px', fontFamily: "'Inter', sans-serif" };
const topHeader: React.CSSProperties = { background: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerLeft: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '16px' };
const logoBox: React.CSSProperties = { width: '48px', height: '48px', background: '#164976', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' };
const headerText: React.CSSProperties = { flex: 1 };
const mainTitle: React.CSSProperties = { margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' };
const mainSubtitle: React.CSSProperties = { margin: 0, fontSize: '13px', color: '#64748b' };
const userBadge: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '8px 14px', borderRadius: '12px' };
const userIcon: React.CSSProperties = { color: '#164976' };
const userInfo: React.CSSProperties = { textAlign: 'right' };
const userNameText: React.CSSProperties = { fontSize: '13px', fontWeight: 700 };
const userRoleText: React.CSSProperties = { fontSize: '11px', color: '#64748b' };
const controlsPanel: React.CSSProperties = { background: 'white', borderRadius: '16px', padding: '16px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' };
const controlsLeft: React.CSSProperties = { display: 'flex', gap: '16px' };
const controlsRight: React.CSSProperties = { display: 'flex' };
const filterGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px', width: '220px' };
const filterLabel: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' };
const selectContainer: React.CSSProperties = { position: 'relative' };
const selectField: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', appearance: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', backgroundColor: 'white' };
const selectArrow: React.CSSProperties = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' };
const dateContainer: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center' };
const dateField: React.CSSProperties = { width: '100%', padding: '10px 12px', paddingRight: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '14px', backgroundColor: 'white' };
const clearButton: React.CSSProperties = { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 0 };
const refreshButton: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#164976', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' };
const statsContainer: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' };
const statCard: React.CSSProperties = { background: 'white', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' };
const statIconWrapper = (color: string): React.CSSProperties => ({ width: '40px', height: '40px', background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const statContent: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
const statValue: React.CSSProperties = { fontSize: '16px', fontWeight: 800 };
const statLabel: React.CSSProperties = { fontSize: '11px', color: '#64748b' };
const mainContent: React.CSSProperties = { background: 'white', borderRadius: '16px', padding: '24px', minHeight: '400px' };
const contentHeader: React.CSSProperties = { marginBottom: '20px' };
const contentTitle: React.CSSProperties = { fontSize: '18px', fontWeight: 800, margin: 0, color: '#1e293b' };
const listContainer: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const reportCard: React.CSSProperties = { background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' };
const cardContent: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const cardLeft: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 };
const iconCircle: React.CSSProperties = { width: '44px', height: '44px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const cardInfo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 };
const territoryName: React.CSSProperties = { margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' };
const cardMetaRow: React.CSSProperties = { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' };
const dateTime: React.CSSProperties = { fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 };
const locationTag: React.CSSProperties = { fontSize: '10px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', color: '#475569', fontWeight: 700 };
const userTag: React.CSSProperties = { fontSize: '10px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#164976', fontWeight: 700 };
const actionButtonsGroup: React.CSSProperties = { display: 'flex', gap: '8px', flexShrink: 0 };
const previewButton: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s', color: '#164976' };
const downloadButton: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#164976', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' };
const loadingState: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' };
const spinner: React.CSSProperties = { width: '36px', height: '36px', border: '4px solid #f1f5f9', borderTop: '4px solid #164976', borderRadius: '50%', animation: 'spin 1s linear infinite' };
const loadingText: React.CSSProperties = { marginTop: '16px', fontSize: '14px', color: '#64748b' };
const emptyState: React.CSSProperties = { textAlign: 'center', padding: '60px 20px' };
const emptyTitle: React.CSSProperties = { margin: '16px 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#475569' };
const emptyText: React.CSSProperties = { fontSize: '14px', color: '#94a3b8' };