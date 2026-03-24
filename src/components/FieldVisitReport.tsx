import React, { useState } from 'react';
import { 
  FiX, FiShoppingCart, FiFileText, FiImage, 
  FiUser
} from 'react-icons/fi';

interface FieldVisitReportProps {
  showModal: boolean;
  modalLoading: boolean;
  previewData: any; 
  onClose: () => void;
}

const FieldVisitReport: React.FC<FieldVisitReportProps> = ({ 
  showModal, 
  modalLoading, 
  previewData, 
  onClose
}) => {
  // 
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  
  // 1. MODAL GUARDS
  if (!showModal) return null;

  // 2. DATA MAPPING
  const outlets = previewData?.outlets || []; 
  const reviews = previewData?.reviews || [];
  
  // 3. HEADER EXTRACTION
  const headerSource = outlets.length > 0 ? outlets[0] : (reviews[0] || {});

  const auditorName = headerSource.userName || "N/A";
  const territory = headerSource.territoryName || "N/A";
  const region = headerSource.region || "N/A";
  const route = headerSource.routeName || "N/A";
  const visitDate = headerSource.createdAt;

  return (
    <>
      <div style={modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={modalContainer}>

          {/* ── Dark navy header ── */}
          <div style={mHeader}>
            <div style={mHeaderDecor} />
            <div style={mHeaderLeft}>
              <div style={mHeaderIconBox}>
                <FiShoppingCart size={15} color="#93c5fd" />
              </div>
              <div>
                <p style={mHeaderEyebrow}>Market Execution Report</p>
                <h2 style={mHeaderTitle}>Field Visit Summary</h2>
              </div>
            </div>
            <button 
              style={mCloseBtn} 
              onClick={onClose}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'}
            >
              <FiX size={16} />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div style={mBody}>
            {modalLoading ? (
              <div style={mLoadingWrap}>
                <div style={mSpinner} />
                <p style={mLoadingText}>Loading report data…</p>
              </div>
            ) : previewData ? (
              <div style={mScroll} className="m-scroll">

                {/* Visit Information Header */}
                <div style={mSection}>
                  <div style={mSectionHead('#3b82f6')}>
                    <div style={mSectionIcon('#3b82f6', '#dbeafe')}><FiUser size={12} color="#3b82f6" /></div>
                    <span style={mSectionTitle}>Visit Information</span>
                  </div>
                  <div style={mInfoGrid}>
                    {[
                      ['ASM Name', auditorName],
                      ['Territory', territory],
                      ['Route', route],
                      ['Region', region],
                      ['Visit Date', visitDate ? new Date(visitDate).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : 'N/A'],
                    ].map(([label, val]) => (
                      <div key={label as string} style={mInfoChip}>
                        <span style={mChipLabel}>{label}</span>
                        <span style={mChipValue}>{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mega Outlets Section */}
                <div style={mSection}>
                  <div style={mSectionHead('#10b981')}>
                    <div style={mSectionIcon('#10b981', '#d1fae5')}><FiShoppingCart size={12} color="#10b981" /></div>
                    <span style={mSectionTitle}>Mega Outlets Execution</span>
                  </div>
                  
                  {outlets.length > 0 ? (
                    <div style={outletGrid}>
                      {outlets.map((outlet: any, idx: number) => (
                        <div key={idx} style={outletCard}>
                          <div style={imageContainer}>
                            {outlet.outletImageBase64 ? (
                              <img 
                                src={outlet.outletImageBase64} 
                                alt="Outlet" 
                                style={{...cardImg, cursor: 'zoom-in'}} 
                                onClick={() => setZoomImage(outlet.outletImageBase64)}
                              />
                            ) : (
                              <div style={noImgPlaceholder}><FiImage size={24} /></div>
                            )}
                          </div>
                          <div style={cardDetails}>
                            <h4 style={outletTitle}>{outlet.name || 'Unnamed Outlet'}</h4>
                            <div style={statRow}>
                              <div style={statItem}>
                                <span style={statLabel}>Sales</span>
                                <span style={statValue}>LKR {outlet.sales || 0}</span>
                              </div>
                              <div style={statItem}>
                                <span style={statLabel}>Discount</span>
                                <span style={statValue}>{outlet.discount || 0}%</span>
                              </div>
                              <div style={statItem}>
                                <span style={statLabel}>SKUs</span>
                                <span style={statValue}>{outlet.sku || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={emptySection}>No outlet data available for this visit.</div>
                  )}
                </div>

                {/* Market Performance Review Section */}
                <div style={{ ...mSection, marginBottom: 0 }}>
                  <div style={mSectionHead('#f59e0b')}>
                    <div style={mSectionIcon('#f59e0b', '#fef3c7')}><FiFileText size={12} color="#f59e0b" /></div>
                    <span style={mSectionTitle}>Market Performance Review</span>
                  </div>
                  
                  {reviews.length > 0 ? (
                    <div style={tableWrapper}>
                      <table style={mTable}>
                        <thead>
                          <tr style={mThead}>
                            <th style={mTh}>Review Area</th>
                            <th style={mTh}>Observation</th>
                            <th style={mTh}>Evidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviews.map((rev: any, idx: number) => (
                            <tr key={idx} style={mTr(idx)}>
                              <td style={areaCell}>{rev.area}</td>
                              <td style={obsCell}>{rev.observation}</td>
                              <td style={imgCell}>
                                {rev.imageBase64 ? (
                                  <img 
                                    src={rev.imageBase64} 
                                    alt="Evidence" 
                                    style={tableThumb} 
                                    onClick={() => setZoomImage(rev.imageBase64)}
                                  />
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>No Image</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={emptySection}>No market review entries found for this visit.</div>
                  )}
                </div>

              </div>
            ) : <div style={emptyStateStyle}><p>Details unavailable.</p></div>}
          </div>

          {/* ── Footer ── */}
          <div style={mFooter}>
            <button 
              style={mFooterClose} 
              onClick={onClose}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f1f5f9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
            >
              <FiX size={13} /> Close Summary
            </button>
          </div>
        </div>
      </div>

      {/* ── ✅ NEW: IMAGE ZOOM OVERLAY ── */}
      {zoomImage && (
        <div style={zoomOverlay} onClick={() => setZoomImage(null)}>
          <div style={zoomContainer}>
            <button style={zoomCloseBtn} onClick={() => setZoomImage(null)}>
              <FiX size={20} color="#1e293b" />
            </button>
            <img src={zoomImage} alt="Full Preview" style={zoomImg} />
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modal-slide-in {
          from { opacity: 0; transform: scale(0.96) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .m-scroll::-webkit-scrollbar       { width: 5px; }
        .m-scroll::-webkit-scrollbar-track  { background: transparent; }
        .m-scroll::-webkit-scrollbar-thumb  { background: rgba(22,73,118,0.18); border-radius: 10px; }
      `}</style>
    </>
  );
};

// ==================== MODAL STYLES ====================

const modalOverlay: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  background: 'rgba(5,13,26,0.80)', backdropFilter: 'blur(7px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};

const modalContainer: React.CSSProperties = {
  width: '92%', maxWidth: '920px', height: '88vh',
  borderRadius: '22px', overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 40px 100px rgba(5,13,26,0.60), 0 0 0 1px rgba(255,255,255,0.07)',
  animation: 'modal-slide-in 0.25s cubic-bezier(0.34,1.20,0.64,1)',
  background: '#eef3f9',
};

const mHeader: React.CSSProperties = {
  background: 'linear-gradient(130deg, #071829 0%, #0d2d50 55%, #164976 100%)',
  padding: '20px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexShrink: 0, position: 'relative', overflow: 'hidden',
};

const mHeaderDecor: React.CSSProperties = {
  position: 'absolute', top: '-40px', right: '-40px',
  width: '180px', height: '180px', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const mHeaderLeft: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '14px' };

const mHeaderIconBox: React.CSSProperties = {
  width: '38px', height: '38px', borderRadius: '11px',
  background: 'rgba(96,165,250,0.14)', border: '1px solid rgba(96,165,250,0.22)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

const mHeaderEyebrow: React.CSSProperties = {
  margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'rgba(147,197,253,0.70)',
  fontFamily: "'DM Sans', sans-serif",
};

const mHeaderTitle: React.CSSProperties = {
  margin: '2px 0 0', fontSize: '17px', fontWeight: 800, color: '#ffffff',
  fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
};

const mCloseBtn: React.CSSProperties = {
  width: '34px', height: '34px', borderRadius: '9px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s ease', flexShrink: 0,
};

const mBody: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column',
  overflow: 'hidden', minHeight: 0,
};

const mScroll: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '20px 22px',
  display: 'flex', flexDirection: 'column', gap: '12px',
} as any;

const mLoadingWrap: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '60px',
};

const mSpinner: React.CSSProperties = {
  width: '34px', height: '34px',
  border: '3px solid rgba(22,73,118,0.10)',
  borderTop: '3px solid #164976',
  borderRadius: '50%', animation: 'spin 0.75s linear infinite',
};

const mLoadingText: React.CSSProperties = {
  fontSize: '13px', color: '#64748b', fontWeight: 500,
  fontFamily: "'DM Sans', sans-serif",
};

const mFooter: React.CSSProperties = {
  padding: '13px 22px', display: 'flex', justifyContent: 'flex-end', gap: '10px',
  background: '#f8fafc', borderTop: '1.5px solid #e2e8f0', flexShrink: 0,
};

const mFooterClose: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '9px 18px', borderRadius: '9px',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#475569', fontSize: '13px', fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'background 0.15s',
};

const mSection: React.CSSProperties = {
  background: '#ffffff', borderRadius: '14px',
  border: '1.5px solid #d1dce8',
  padding: '20px 22px',
  boxShadow: '0 2px 8px rgba(22,73,118,0.08)',
};

const mSectionHead = (accent: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  marginBottom: '18px', paddingBottom: '14px',
  borderBottom: `1.5px solid ${accent}15`,
});

const mSectionIcon = (color: string, bg: string): React.CSSProperties => ({
  width: '26px', height: '26px', borderRadius: '7px',
  background: bg, border: `1.5px solid ${color}30`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const mSectionTitle: React.CSSProperties = {
  fontSize: '14px', fontWeight: 800, color: '#164976',
  fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
};

const mInfoGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px',
};

const mInfoChip: React.CSSProperties = {
  background: '#f0f5fb', border: '1.5px solid #c8d9ea',
  borderRadius: '9px', padding: '10px 13px',
  display: 'flex', flexDirection: 'column', gap: '3px',
};

const mChipLabel: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  fontFamily: "'DM Sans', sans-serif",
};

const mChipValue: React.CSSProperties = {
  fontSize: '13px', fontWeight: 700, color: '#1e293b',
  fontFamily: "'DM Sans', sans-serif",
};

const outletGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: '14px',
};

const outletCard: React.CSSProperties = {
  borderRadius: '11px',
  border: '1.5px solid #d1dce8',
  background: '#fff',
  overflow: 'hidden',
  boxShadow: '0 2px 6px rgba(22,73,118,0.06)',
};

const imageContainer: React.CSSProperties = {
  height: '140px',
  background: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottom: '1.5px solid #e2e8f0',
};

const cardImg: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const noImgPlaceholder: React.CSSProperties = {
  color: '#cbd5e1',
};

const cardDetails: React.CSSProperties = {
  padding: '14px',
};

const outletTitle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: '14px',
  fontWeight: 800,
  color: '#164976',
  fontFamily: "'Sora', sans-serif",
};

const statRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const statItem: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const statLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  fontFamily: "'DM Sans', sans-serif",
};

const statValue: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#1e293b',
  fontFamily: "'DM Sans', sans-serif",
};

const tableWrapper: React.CSSProperties = {
  borderRadius: '10px',
  border: '1.5px solid #d1dce8',
  overflow: 'hidden',
};

const mTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
  fontFamily: "'DM Sans', sans-serif",
};

const mThead: React.CSSProperties = {
  background: '#e4edf7',
  color: '#164976',
};

const mTh: React.CSSProperties = {
  padding: '12px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const mTr = (idx: number): React.CSSProperties => ({
  background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
  borderTop: '1px solid #e2e8f0',
});

const areaCell: React.CSSProperties = {
  padding: '12px 14px',
  fontWeight: 700,
  color: '#164976',
  width: '25%',
};

const obsCell: React.CSSProperties = {
  padding: '12px 14px',
  color: '#334155',
  lineHeight: '1.5',
};

const imgCell: React.CSSProperties = {
  padding: '12px 14px',
  width: '80px',
  textAlign: 'center',
};

const tableThumb: React.CSSProperties = {
  width: '50px',
  height: '50px',
  borderRadius: '6px',
  objectFit: 'cover',
  cursor: 'pointer',
  border: '1.5px solid #d1dce8',
  transition: 'transform 0.2s',
};

const emptySection: React.CSSProperties = {
  padding: '30px',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: '13px',
  background: '#f8fafc',
  borderRadius: '8px',
  fontFamily: "'DM Sans', sans-serif",
};

const emptyStateStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
  fontSize: '14px',
  fontFamily: "'DM Sans', sans-serif",
};

//  ZOOM STYLES
const zoomOverlay: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  background: 'rgba(5, 13, 26, 0.94)', backdropFilter: 'blur(10px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 2000, cursor: 'zoom-out',
};

const zoomContainer: React.CSSProperties = {
  position: 'relative', maxWidth: '85vw', maxHeight: '85vh',
  display: 'flex', justifyContent: 'center',
};

const zoomImg: React.CSSProperties = {
  maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px',
  boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1.5px solid rgba(255,255,255,0.1)',
  objectFit: 'contain',
};

const zoomCloseBtn: React.CSSProperties = {
  position: 'absolute', top: '-50px', right: '0', width: '36px', height: '36px',
  borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default FieldVisitReport;