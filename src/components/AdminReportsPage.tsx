import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FiCalendar, FiDownload, FiFileText, FiLayers, FiChevronDown, 
  FiRefreshCw, FiX, FiActivity, FiEye, FiArrowLeft, FiAlertCircle, FiClock
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
  
  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentYearMonth = now.toISOString().slice(0, 7); 

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
          date: selectedDate || null,
          month: !selectedDate ? currentYearMonth : null 
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString.replace(/\./g, '-'));
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    return timeString.includes(':') ? timeString : "N/A"; 
  };

  const handlePreview = async (reportGroupId: string, type: "DAILY_TASK" | "FIELD_VISIT") => {
    setModalLoading(true);
    setShowModal(true);
    setActiveModalType(type);
    setPreviewData(null);
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
        if (remarksRes.status === 'fulfilled') finalData.finalRemarks = Array.isArray(remarksRes.value.data) ? remarksRes.value.data[0] : remarksRes.value.data;
        if (staffRes.status === 'fulfilled') finalData.staffActions = staffRes.value.data;
        setPreviewData(finalData);
      }
    } catch (err) {
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
      
      <div className="admin-header" style={headerGradient}>
        <div className="header-left" style={headerLeftContent}>
          <button onClick={() => navigate(-1)} style={backBtnGradient}>
            <FiArrowLeft size={18} />
          </button>
          <div style={logoIconBox}>
            <FiFileText size={22} />
          </div>
          <div>
            <h1 className="header-title" style={titleWhite}>{regionFromUrl}</h1>
            <p className="header-subtitle" style={subtitleWhite}>
              Regional Feed <FiActivity size={12} style={{margin: '0 6px'}} /> {reportType.replace('_', ' ')}
            </p>
          </div>
        </div>
        
      <div className="header-right header-right-mobile-fix" style={headerRightContent}>
  <div style={pillBadge}>
    <span style={pillLabel}>RECORDS</span>
    <span style={pillValue}>{reports.length}</span>
  </div>
  <button onClick={fetchReports} className="refresh-btn" style={refreshBtnWhite} disabled={loading}>
    <FiRefreshCw size={16} className={loading ? "spin" : ""} />
    <span>Refresh</span>
  </button>
</div>
      </div>

      <div className="filter-bar" style={filterBar}>
        <div className="filter-group" style={filterGroup}>
          <div style={inputContainer}>
            <FiLayers size={14} color="#164976" />
            <div style={selectWrapper}>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={selectReset}>
                <option value="FIELD_VISIT">Field Visit Reports</option>
                <option value="DAILY_TASK">Daily Task Reports</option>
              </select>
              <FiChevronDown size={14} color="#94a3b8" style={chevronPosition} />
            </div>
          </div>

          <div className="filter-divider" style={dividerVertical} />

          <div style={inputContainer}>
            <FiCalendar size={14} color="#164976" />
            <input 
              type="date" 
              value={selectedDate} 
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)} 
              style={dateReset} 
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate("")} style={clearBtnMinimal}><FiX size={14} /></button>
            )}
          </div>
        </div>

        <div className="time-indicator" style={timeIndicator}>
           <FiClock size={14} />
           <span>{selectedDate ? formatDate(selectedDate) : `Month: ${currentMonthName}`}</span>
        </div>
      </div>

      <div style={listArea}>
        {loading ? (
          <div style={loadingCenter}><div className="loader-modern" /><p>Updating feed...</p></div>
        ) : reports.length === 0 ? (
          <div style={emptyContainer}>
            <FiAlertCircle size={48} color="#e2e8f0" />
            <h3>No Records Found</h3>
            <p>No reports found for this period.</p>
          </div>
        ) : (
          <div style={listStack}>
            <div className="table-header" style={tableHeaderLabels}>
              <div style={{width: '8px', marginRight: '20px'}} />
              <div style={{flex: 2}}>TERRITORY</div>
              
             
            </div>

            {reports.map((report) => {
              const themeColor = reportType === 'FIELD_VISIT' ? '#164976' : '#1e6aad';
              const isHovered = hoveredCard === report.reportGroupId;

              return (
                <div 
                  key={report.reportGroupId} 
                  className="list-row"
                  style={{
                    ...listRow,
                    backgroundColor: isHovered ? '#f0f7ff' : 'white',
                    borderColor: isHovered ? '#164976' : '#f1f5f9',
                    transform: isHovered ? 'translateX(6px)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredCard(report.reportGroupId)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={statusDot(themeColor)} className="mobile-hide-dot" />
                  
                  <div className="row-territory" style={{ flex: 2 }}>
                    <div style={rowMainTitle} className="mobile-title-style">{report.territoryName || "Unassigned"}</div>
                  </div>
                  
                  <div className="mobile-meta-row">
                    <div className="row-date" style={rowDate}>
                      {report.visitTime ? report.visitTime.split(' ')[0] : 'N/A'}
                    </div>
                    
                    <div className="row-user" style={{ flex: 1 }}>
                      <span style={userLabel} className="mobile-badge-style">
                        {reportType === "DAILY_TASK" ? (report.dbName || "Direct") : (report.userName || "Staff")}
                      </span>
                    </div>
                    
                    <div className="row-actions" style={rowActionGroup}>
                      <button style={btnView} onClick={() => handlePreview(report.reportGroupId, reportType as any)} className="mobile-action-btn">
                        <FiEye size={14} /> <span className="btn-text">View</span>
                      </button>
                      {reportType === "DAILY_TASK" && (
                        <button style={btnDownload} onClick={() => handleDownload(report.reportGroupId)} className="mobile-action-btn">
                          <FiDownload size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && activeModalType === "DAILY_TASK" && (
        <ReportModal showModal={showModal} modalLoading={modalLoading} previewData={previewData} onClose={() => setShowModal(false)} onDownload={handleDownload} formatTime={formatTime} formatDate={formatDate} />
      )}
      {showModal && activeModalType === "FIELD_VISIT" && (
        <FieldVisitReport showModal={showModal} modalLoading={modalLoading} previewData={previewData} onClose={() => setShowModal(false)} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loader-modern { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top: 3px solid #164976; border-radius: 50%; animation: spin 0.8s linear infinite; }
        * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        
        /* Desktop Default: Ensure the meta-row acts as a transparent container */
        .mobile-meta-row {
          display: contents; 
        }

        /* ========== RESPONSIVE DESIGN ========== */
        
        @media (max-width: 1024px) {
          .admin-header { flex-direction: column !important; height: auto !important; padding: 25px 20px !important; align-items: flex-start !important; gap: 20px; }
          .header-right { width: 100%; justify-content: space-between; }
          .filter-bar { flex-direction: column !important; height: auto !important; padding: 20px !important; gap: 15px; margin: -20px 20px 30px 20px !important; }
          .filter-group { flex-direction: column !important; width: 100%; gap: 15px !important; }
          .filter-divider { display: none !important; }
          .table-header { display: none !important; }
          .header-right-mobile-fix {
           margin-bottom: 20px; /* Adjust this value as needed */
           width: 100%;
           justify-content: space-between;
      }
        }

        @media (max-width: 768px) {
          .list-row {
            flex-direction: column !important; 
            padding: 15px !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .mobile-hide-dot {
            position: absolute;
            margin-top: 6px;
          }
          .row-territory {
            padding-left: 28px;
            width: 100%;
          }
          .mobile-meta-row {
            display: flex !important;
            flex-direction: row !important;
            width: 100%;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 5px;
            padding-left: 28px;
          }
          .row-date {
            flex: 0 0 auto !important;
            font-size: 11px !important;
          }
          .row-user {
            flex: 0 0 auto !important;
          }
          .mobile-badge-style {
            font-size: 10px !important;
            padding: 4px 8px !important;
          }
          .row-actions {
            flex: 1 !important;
            width: auto !important;
            justify-content: flex-end !important;
            gap: 6px !important;
          }
          .btn-text { display: none; }
          .mobile-action-btn {
            width: 34px !important;
            height: 34px !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
        }

        @media (max-width: 480px) {
           .mobile-meta-row { gap: 4px; }
           .mobile-badge-style { max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        }
      `}</style>
    </div>
  );
}

const pageWrapper: React.CSSProperties = { minHeight: '100vh', background: '#f8fafc', padding: '0 0 50px 0' };
const headerGradient: React.CSSProperties = { 
  background: 'linear-gradient(135deg, #164976 0%, #1e6aad 100%)', 
  padding: '0 6%', height: '180px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white'
};
const headerLeftContent: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '20px' };
const backBtnGradient: React.CSSProperties = { background: 'rgba(255,255,255,0.15)', border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' };
const logoIconBox: React.CSSProperties = { width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const titleWhite: React.CSSProperties = { margin: 0, fontSize: '30px', fontWeight: 800 };
const subtitleWhite: React.CSSProperties = { margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, display: 'flex', alignItems: 'center' };
const headerRightContent: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px' };
const pillBadge: React.CSSProperties = { background: 'rgba(0,0,0,0.2)', padding: '8px 18px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.1)' };
const pillLabel: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' };
const pillValue: React.CSSProperties = { fontSize: '16px', fontWeight: 800 };
const refreshBtnWhite: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'white', color: '#164976', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' };
const filterBar: React.CSSProperties = { background: 'white', margin: '-35px 6% 30px 6%', borderRadius: '18px', height: '75px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', boxShadow: '0 12px 30px -10px rgba(0,0,0,0.1)', position: 'relative', zIndex: 100 };
const filterGroup: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '25px' };
const inputContainer: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px' };
const selectWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center' };
const selectReset: React.CSSProperties = { border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: '#1e293b', outline: 'none', appearance: 'none', minWidth: '180px' };
const chevronPosition: React.CSSProperties = { position: 'absolute', right: 0, pointerEvents: 'none' };
const dateReset: React.CSSProperties = { border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: '#1e293b', outline: 'none' };
const dividerVertical: React.CSSProperties = { width: '1px', height: '25px', background: '#f1f5f9' };
const clearBtnMinimal: React.CSSProperties = { border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' };
const timeIndicator: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', color: '#164976', background: '#f0f7ff', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 800 };
const listArea: React.CSSProperties = { padding: '0 6%' };
const listStack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const tableHeaderLabels: React.CSSProperties = { display: 'flex', padding: '0 25px 12px 25px', color: '#94a3b8', fontSize: '11px', letterSpacing: '0.08em', fontWeight: 800 };
const listRow: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '18px 25px', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9', transition: '0.3s', position: 'relative' };
const statusDot = (color: string): React.CSSProperties => ({ width: '8px', height: '8px', borderRadius: '50%', background: color, marginRight: '20px', boxShadow: `0 0 0 5px ${color}15` });
const rowMainTitle: React.CSSProperties = { fontSize: '15px', fontWeight: 700, color: '#0f172a' };
const rowDate: React.CSSProperties = { flex: 1, color: '#64748b', fontSize: '13px', fontWeight: 600 };
const userLabel: React.CSSProperties = { background: '#f8fafc', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', color: '#164976', fontWeight: 700, border: '1px solid #e2e8f0' };
const rowActionGroup: React.CSSProperties = { width: '160px', display: 'flex', gap: '10px', justifyContent: 'flex-end' };
const btnView: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '11px', border: '1.5px solid #164976', background: 'transparent', color: '#164976', fontWeight: 800, fontSize: '13px', cursor: 'pointer' };
const btnDownload: React.CSSProperties = { width: '38px', height: '38px', borderRadius: '11px', background: '#164976', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const loadingCenter: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px', gap: '15px', color: '#64748b' };
const emptyContainer: React.CSSProperties = { textAlign: 'center', padding: '100px', color: '#94a3b8' };