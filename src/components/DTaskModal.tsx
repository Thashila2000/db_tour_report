import React from 'react';
import {
  FiX, FiFileText, FiInfo, FiActivity, FiPackage, FiCheckSquare,
  FiAlertCircle, FiUsers, FiUser, FiEdit3, FiCalendar,
  FiTrendingUp,
} from 'react-icons/fi';

interface ReportModalProps {
  showModal: boolean;
  modalLoading: boolean;
  previewData: any;
  onClose: () => void;
  onDownload: (reportGroupId: string) => void;
  formatTime: (visitTime: string) => string; 
  formatDate: (visitTime: string) => string;
  
}


export default function ReportModal({
  showModal,
  modalLoading,
  previewData,
  onClose,
  
}: ReportModalProps) {
  if (!showModal) return null;

  return (
    <>
      <div style={modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={modalContainer}>

          {/* ── Dark navy header ── */}
          <div style={mHeader}>
            <div style={mHeaderDecor} />
            <div style={mHeaderLeft}>
              <div style={mHeaderIconBox}>
                <FiFileText size={15} color="#93c5fd" />
              </div>
              <div>
                <p style={mHeaderEyebrow}>DB Visit Report</p>
                <h2 style={mHeaderTitle}>Detailed Visit Summary</h2>
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

        {/* 1. Visit Information */}
<div style={mSection}>
  <div style={mSectionHead('#3b82f6')}>
    <div style={mSectionIcon('#3b82f6', '#dbeafe')}>
      <FiInfo size={12} color="#3b82f6" />
    </div>
    <span style={mSectionTitle}>1. Visit Information</span>
  </div>
  
  <div style={mInfoGrid}>
    {[
      ['DB Name',    previewData.visitDetails?.dbName],
      ['Code',       previewData.visitDetails?.dbCode],
      ['Visit Type', previewData.visitDetails?.visitType], // Added Visit Type here
      ['Area',       previewData.visitDetails?.area],
      ['Region',     previewData.visitDetails?.region],
      ['Territory',  previewData.visitDetails?.territoryName],
      ['Visit Time', (() => {
        const raw = previewData.visitDetails?.visitTime; 
        if (!raw || typeof raw !== 'string') return '—';

        try {
          const parts = raw.split(' ');
          const datePart = parts[0]; 
          const timePart = parts[1] ? parts[1].replace('.', ':') : ''; 

          const [y, m, d] = datePart.split('.');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          const formattedDate = `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
          
          return timePart ? `${formattedDate} | ${timePart}` : formattedDate;
        } catch (e) {
          return raw; 
        }
      })()],
    ].map(([label, val]) => (
      <div key={label as string} style={mInfoChip}>
        <span style={mChipLabel}>{label}</span>
        <span style={mChipValue}>{val || '—'}</span>
      </div>
    ))}
  </div>
</div>
               {/* 2. DB Profile */}
<div style={{ 
  background: '#ffffff', 
  borderRadius: '24px', 
  padding: '24px', 
  marginBottom: '24px', 
  border: '1px solid #f1f5f9',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
    <div style={{ 
      background: '#f8fafc', 
      padding: '10px', 
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <FiActivity size={20} color="#64748b" />
    </div>
    <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>2. DB Profile</span>
  </div>

  {/* 1. Infrastructure & Support - LIGHT BLUE */}
  <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: (12), textTransform: 'uppercase', letterSpacing: '0.05em' }}>Infrastructure & Support</p>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
    {[
      ['Owner',       previewData.dbProfile?.dbOwnerContact],
      ['Coverage',    previewData.dbProfile?.coverageArea],
      ['Routes',      previewData.dbProfile?.routeStrength],
      ['Sales Team',  previewData.dbProfile?.salesTeam],
      ['Vehicles',    previewData.dbProfile?.vehicleAvailability],
      ['Log Book',    previewData.dbProfile?.logBookUpdate],
    ].map(([label, val]) => (
      <div key={label as string} style={{ background: '#f0f9ff', padding: '14px', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
        <span style={{ fontSize: '10px', color: '#0369a1', display: 'block', marginBottom: '4px', fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#075985' }}>{val || '—'}</span>
      </div>
    ))}
  </div>
{/* 2. Asset Verification - LIGHT PURPLE */}
<p style={{ 
  fontSize: '11px', 
  fontWeight: 700, 
  color: '#64748b', 
  marginBottom: '12px', 
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}}>
  Asset Verification
</p>

<div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
  {[
    { 
      label: 'Territory Map', 
      status: previewData.dbProfile?.territoryRouteMap, 
      img: previewData.dbProfile?.routeMapImage 
    },
    { 
      label: 'Route Plan',    
      status: previewData.dbProfile?.routePlan,         
      img: previewData.dbProfile?.routePlanImage 
    },
  ].map(({ label, status, img }) => (
    <div 
      key={label} 
      style={{ 
        flex: 1, 
        background: '#f5f3ff', 
        padding: '16px', 
        borderRadius: '20px', 
        border: '1px solid #ede9fe',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <span style={{ fontSize: '10px', color: '#6d28d9', fontWeight: 700 }}>{label}</span>
      <span style={{ 
        display: 'block', 
        fontSize: '12px', 
        fontWeight: 800, 
        color: '#4c1d95', 
        marginTop: '2px',
        marginBottom: img ? '12px' : '0px' // Only add margin if an image follows
      }}>
        {status?.toUpperCase() || '—'}
      </span>
      
      {/* Conditional Rendering: Only show the image tag if img exists */}
      {img && (
        <img 
          src={img} 
          style={{ 
            width: '100%', 
            height: '250px', // Increased space
            objectFit: 'contain', 
            borderRadius: '12px', 
            border: '1px solid #ddd6fe',
            background: '#ffffff'
          }} 
          alt={label} 
        />
      )}
    </div>
  ))}
</div>

{/* 3. Financial Health - LIGHT GREEN */}
<p style={{ 
  fontSize: '11px', 
  fontWeight: 700, 
  color: '#64748b', 
  marginBottom: '12px', 
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}}>
  Financial Health
</p>

<div style={{ 
  display: 'grid', 
  gridTemplateColumns: '1fr 1fr 1fr', 
  gap: '12px', 
  marginBottom: '24px' 
}}>
  {[
    { 
      label: 'Credit Bills',  
      value: `${previewData.dbProfile?.creditBillCount || 0} · LKR ${Number(previewData.dbProfile?.creditBillTotal || 0).toLocaleString()}` 
    },
    { 
      label: 'Cheques',       
      value: `${previewData.dbProfile?.chequeCount || 0} · LKR ${Number(previewData.dbProfile?.chequeTotal || 0).toLocaleString()}` 
    },
    { 
      label: 'Total Cash in Hand+Bank',    
      value: `LKR ${Number(previewData.dbProfile?.cashTotal || 0).toLocaleString()}` 
    },
  ].map(({ label, value }) => (
    <div 
      key={label} 
      style={{ 
        background: '#f0fdf4', 
        padding: '14px', 
        borderRadius: '12px', 
        border: '1px solid #dcfce7',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <span style={{ 
        fontSize: '10px', 
        color: '#15803d', 
        display: 'block', 
        marginBottom: '4px', 
        fontWeight: 700,
        textTransform: 'uppercase'
      }}>
        {label}
      </span>
      <span style={{ 
        fontSize: '14px', 
        fontWeight: 800, 
        color: '#166534',
        whiteSpace: 'nowrap'
      }}>
        {value}
      </span>
    </div>
  ))}
</div>
  
  {/* 4. PROGRESS & SKU PERFORMANCE - LIGHT YELLOW/AMBER */}
  <div style={{ 
    marginBottom: '24px',
    background: '#fffbeb', 
    border: '1px solid #fef3c7',
    borderRadius: '16px',
    overflow: 'hidden'
  }}>
    <div style={{ background: '#fef3c7', padding: '12px 20px', borderBottom: '1px solid #fde68a' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        PROGRESS & SKU PERFORMANCE
      </span>
    </div>
    
    <div style={{ padding: '20px' }}>
      <div style={{ fontSize: '14px', color: '#451a03', lineHeight: '2' }}>
        <p style={{ margin: '0 0 8px 0' }}>• <strong>Progress Sheet Update Status:</strong> {previewData.dbProfile?.progressSheetUpdate || '—'}</p>
        <p style={{ margin: '0' }}>• <strong>SKU Sales Performance:</strong> 
            <span style={{ marginLeft: '6px', color: '#b45309', fontWeight: 800 }}>{previewData.dbProfile?.skuSalesUpdate?.toUpperCase() || '—'}</span>
        </p>
        
        <div style={{ marginTop: '20px', borderTop: '1px dashed #fde68a', paddingTop: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '8px' }}>
            SKU Sales Observations:
          </p>
          <div style={{ 
            fontSize: '14px', 
            color: '#451a03', 
            lineHeight: '1.6', 
            whiteSpace: 'pre-wrap', 
            minHeight: '120px', 
            background: '#ffffff',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #fde68a'
          }}>
            {previewData.dbProfile?.skuSalesComment || 'No additional performance notes provided.'}
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* 5. Storage & Conditions - LIGHT ROSE/PINK (Expanded) */}
  <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Storage & Conditions</p>
  
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
    {[
      ['Store Size', `${previewData.dbProfile?.storeLength || 0} ft × ${previewData.dbProfile?.storeWidth || 0} ft`],
      ['Table Count',  `${previewData.dbProfile?.tableCount || 0}`],
      ['Chair Count',  `${previewData.dbProfile?.chairCount || 0}`],
    ].map(([label, val]) => (
      <div key={label as string} style={{ background: '#fff1f2', padding: '12px', borderRadius: '12px', border: '1px solid #ffe4e6' }}>
        <span style={{ fontSize: '9px', color: '#be123c', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#9f1239' }}>{val}</span>
      </div>
    ))}
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ background: '#fff1f2', padding: '16px', borderRadius: '12px', border: '1px solid #ffe4e6' }}>
      <span style={{ fontSize: '10px', color: '#be123c', display: 'block', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Store Condition Observations</span>
      <div style={{ fontSize: '13px', color: '#9f1239', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
        {previewData.dbProfile?.storeCondition || 'No store condition notes provided.'}
      </div>
    </div>

    <div style={{ background: '#fff1f2', padding: '16px', borderRadius: '12px', border: '1px solid #ffe4e6' }}>
      <span style={{ fontSize: '10px', color: '#be123c', display: 'block', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Market Return Condition</span>
      <div style={{ fontSize: '13px', color: '#9f1239', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
        {previewData.dbProfile?.marketReturnCondition || 'No market return condition notes provided.'}
      </div>
    </div>
  </div>
</div>

                {/* 3. Sales Performance */}
                <div style={mSection}>
                  <div style={mSectionHead('#f59e0b')}>
                    <div style={mSectionIcon('#f59e0b', '#fef3c7')}><FiTrendingUp size={12} color="#f59e0b" /></div>
                    <span style={mSectionTitle}>3. Sales Performance (MTD)</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={mTable}>
                      <thead><tr style={mThead}>
                        {['Category','MTD Target','MTD Achieved','Variance','Remarks'].map(h => <th key={h} style={mTh}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {previewData.salesPerformance?.length > 0 ? previewData.salesPerformance.map((item: any, i: number) => (
                          <tr key={i} style={mTr(i)}>
                            <td style={{ ...mTd, fontWeight: 700 }}>{item.category}</td>
                            <td style={mTd}>{item.mtdTarget}</td>
                            <td style={mTd}>{item.mtdAchieved}</td>
                            <td style={mTd}><span style={mVariance(item.variance)}>{item.variance}</span></td>
                            <td style={{ ...mTd, fontStyle: 'italic', color: '#4a6d8c', fontSize: '12px' }}>{item.remarks}</td>
                          </tr>
                        )) : <tr><td colSpan={5} style={mEmpty}>No performance data available.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

              {/* 4. Stock Status (Grouped by Category) */}
<div style={mSection}>
  <div style={mSectionHead('#8b5cf6')}>
    <div style={mSectionIcon('#8b5cf6', '#ede9fe')}>
      <FiPackage size={12} color="#8b5cf6" />
    </div>
    <span style={mSectionTitle}>4. Stock Status</span>
  </div>

  {(() => {
    const grouped = previewData.stockItems?.reduce((acc: any, item: any) => {
      if (!acc[item.categoryName]) acc[item.categoryName] = [];
      acc[item.categoryName].push(item);
      return acc;
    }, {});

    return grouped && Object.entries(grouped).map(([category, items]: [string, any]) => (
      <div key={category} style={{ marginBottom: '32px' }}> {/* Increased spacing between categories */}
        
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: 800, 
          color: '#1e293b', 
          marginBottom: '12px', 
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8b5cf6' }} />
          Category: {category}
        </h4>

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '12px' }}>
          <table style={{ ...mTable, margin: 0 }}>
            <thead>
              <tr style={mThead}>
                {['Item', 'System', 'Physical', 'Variance'].map(h => (
                  <th key={h} style={mTh}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((s: any, i: number) => (
                <tr key={i} style={mTr(i)}>
                  <td style={{ ...mTd, fontWeight: 600, color: '#334155' }}>{s.itemName}</td>
                  <td style={mTd}>{Number(s.systemStock || 0).toLocaleString()}</td>
                  <td style={mTd}>{Number(s.stockLevel || 0).toLocaleString()}</td>
                  <td style={mTd}>
                    <span style={mVariance(s.variance)}>{s.variance}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EXPANDED COMMENT BOX FOR CATEGORY */}
        {items[0]?.categoryComment && (
          <div style={{ 
            background: '#f5f3ff', // Light purple background
            padding: '16px', 
            borderRadius: '12px', 
            border: '1px solid #ddd6fe',
          }}>
            <span style={{ 
              fontSize: '10px', 
              color: '#6d28d9', 
              display: 'block', 
              textTransform: 'uppercase', 
              marginBottom: '8px', 
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              Observation for {category}
            </span>
            <div style={{ 
              fontSize: '14px', 
              color: '#4c1d95', 
              lineHeight: '1.6', 
              whiteSpace: 'pre-wrap',
              background: '#ffffff', // White inner box for focus
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ede9fe',
              minHeight: '60px' // Ensures space for commentary
            }}>
              {items[0].categoryComment}
            </div>
          </div>
        )}
      </div>
    ));
  })()}
</div>

                {/* 6. Issues */}
                <div style={mSection}>
                  <div style={mSectionHead('#ef4444')}>
                    <div style={mSectionIcon('#ef4444', '#fee2e2')}><FiAlertCircle size={12} color="#ef4444" /></div>
                    <span style={mSectionTitle}>6. Issues & Observations</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={mTable}>
                      <thead><tr style={mThead}>
                        {['Issue Type','Description','Severity'].map(h => <th key={h} style={mTh}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {previewData.issues?.length > 0 ? previewData.issues.map((issue: any, i: number) => (
                          <tr key={i} style={mTr(i)}>
                            <td style={{ ...mTd, fontWeight: 700 }}>{issue.issueType}</td>
                            <td style={{ ...mTd, maxWidth: '260px' }}>{issue.description}</td>
                            <td style={mTd}><span style={mSeverity(issue.security)}>{issue.security?.toUpperCase()}</span></td>
                          </tr>
                        )) : <tr><td colSpan={3} style={mEmpty}>No issues identified during this visit.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 7. Actions Agreed */}
                <div style={mSection}>
                  <div style={mSectionHead('#10b981')}>
                    <div style={mSectionIcon('#10b981', '#d1fae5')}><FiCheckSquare size={12} color="#10b981" /></div>
                    <span style={mSectionTitle}>7. Actions Agreed with DB</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={mTable}>
                      <thead><tr style={mThead}>
                        <th style={{ ...mTh, width: '40%' }}>Action Item</th>
                        <th style={{ ...mTh, width: '60%' }}>DB Commitment / Comment</th>
                      </tr></thead>
                      <tbody>
                        {previewData.actions?.length > 0 ? previewData.actions.map((act: any, i: number) => (
                          <tr key={i} style={mTr(i)}>
                            <td style={{ ...mTd, fontWeight: 700, color: '#07182a' }}>{act.action}</td>
                            <td style={{ ...mTd, color: '#1e293b' }}>{act.comment}</td>
                          </tr>
                        )) : <tr><td colSpan={2} style={mEmpty}>No specific actions recorded.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

               {/* 8. Staff Feedback */}
<div style={mSection}>
  <div style={mSectionHead('#6366f1')}>
    <div style={mSectionIcon('#6366f1', '#e0e7ff')}><FiUsers size={12} color="#6366f1" /></div>
    <span style={mSectionTitle}>8. Staff Feedback & Agreed Actions</span>
  </div>

  <div style={{ overflowX: 'auto', marginTop: '10px' }}>
    <table style={mTable}>
      <thead>
        <tr style={mThead}>
          <th style={{ ...mTh, width: '20%' }}>Designation</th>
          <th style={{ ...mTh, width: '30%' }}>Name</th>
          <th style={{ ...mTh, width: '50%' }}>Comment</th>
        </tr>
      </thead>
      <tbody>
        {previewData.staffActions?.length > 0 ? (
          previewData.staffActions.map((staff: any, i: number) => (
            <tr key={i} style={mTr(i)}>
              <td style={mTd}>
                {/* Dynamically colors the designation badge based on role */}
                <span style={positionBadge(staff.position || staff.designation)}>
                  {(staff.position || staff.designation)?.toUpperCase()}
                </span>
              </td>
              <td style={{ ...mTd, fontWeight: 600, color: '#1e293b' }}>
                {staff.name || staff.staffName || '—'}
              </td>
              <td style={{ ...mTd, fontStyle: 'italic', color: '#475569' }}>
                {staff.comment || staff.feedback || 'No specific feedback provided.'}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} style={mEmpty}>No staff feedback recorded for this visit.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

                {/* 9. Follow-Up */}
                <div style={mSection}>
                  <div style={mSectionHead('#f59e0b')}>
                    <div style={mSectionIcon('#f59e0b', '#fef3c7')}><FiCalendar size={12} color="#f59e0b" /></div>
                    <span style={mSectionTitle}>9. Follow-Up Plan & Deadlines</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={mTable}>
                      <thead><tr style={mThead}>
                        {['Follow-Up Action','Responsible Party','Deadline'].map(h => <th key={h} style={mTh}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {previewData.followUps?.length > 0 ? previewData.followUps.map((item: any, i: number) => (
                          <tr key={i} style={mTr(i)}>
                            <td style={{ ...mTd, color: '#1e293b' }}>{item.action}</td>
                            <td style={mTd}>
                              <span style={responsibleName}>
                                <FiUser style={{ marginRight: '4px' }} /> {item.responsible}
                              </span>
                            </td>
                            <td style={mTd}><span style={deadlineBadge}>{item.deadline}</span></td>
                          </tr>
                        )) : <tr><td colSpan={3} style={mEmpty}>No follow-up items scheduled.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 10. General Remarks */}
                <div style={{ ...mSection, marginBottom: 0 }}>
                  <div style={mSectionHead('#ec4899')}>
                    <div style={mSectionIcon('#ec4899', '#fce7f3')}><FiEdit3 size={12} color="#ec4899" /></div>
                    <span style={mSectionTitle}>10. General Remarks</span>
                  </div>
                  <div style={remarksContainer}>
                    <div style={remarksLabel}>General Summary</div>
                    <div style={remarksText}>
                      {previewData.finalRemarks?.remarks ||
                       (typeof previewData.finalRemarks === 'string' ? previewData.finalRemarks : null) ||
                       'No final remarks provided for this visit.'}
                    </div>
                  </div>
                  <div style={signatureArea}>
                    <div style={signatureLine}>
                      <span style={signLabel}>Prepared By:</span>
                      <span style={signValue}>{previewData.finalRemarks?.preparedBy || 'N/A'}</span>
                    </div>
                  </div>
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
}

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
  background: '#ffffff', borderTop: '1.5px solid #d1dce8', flexShrink: 0,
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
  borderBottom: `2px solid ${accent}`,
});

const mSectionIcon = (color: string, bg: string): React.CSSProperties => ({
  width: '28px', height: '28px', borderRadius: '7px',
  background: bg, border: `1.5px solid ${color}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const mSectionTitle: React.CSSProperties = {
  fontSize: '14px', fontWeight: 800, color: '#07182a',
  fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
};



const mInfoGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
};

const mInfoChip: React.CSSProperties = {
  background: '#f0f5fb', borderRadius: '9px',
  padding: '11px 14px', border: '1.5px solid #c8d9ea',
  display: 'flex', flexDirection: 'column', gap: '4px',
};

const mChipLabel: React.CSSProperties = {
  fontSize: '10px', fontWeight: 800, color: '#4a6d8c',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  fontFamily: "'DM Sans', sans-serif",
};

const mChipValue: React.CSSProperties = {
  fontSize: '14px', fontWeight: 700, color: '#07182a',
  fontFamily: "'DM Sans', sans-serif",
};



const mTable: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', border: '1px solid #d1dce8' };
const mThead: React.CSSProperties = { background: '#e4edf7' };
const mTh: React.CSSProperties = {
  textAlign: 'left', padding: '11px 14px', fontSize: '11px',
  fontWeight: 800, color: '#164976', textTransform: 'uppercase',
  letterSpacing: '0.06em', borderBottom: '2px solid #b8cfe0',
  fontFamily: "'DM Sans', sans-serif",
};
const mTd: React.CSSProperties = {
  padding: '11px 14px', fontSize: '13px', color: '#1e293b',
  borderBottom: '1px solid #e2ebf3', fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
};
const mTr = (i: number): React.CSSProperties => ({
  background: i % 2 === 0 ? '#ffffff' : '#f4f8fc',
});
const mEmpty: React.CSSProperties = {
  textAlign: 'center', padding: '20px', color: '#64748b',
  fontSize: '13px', fontStyle: 'italic', fontWeight: 600,
};

const mVariance = (v: string): React.CSSProperties => {
  const neg = String(v).includes('-');
  return {
    display: 'inline-block', padding: '3px 10px', borderRadius: '100px',
    fontSize: '12px', fontWeight: 800,
    background: neg ? '#fecaca' : '#bbf7d0',
    color:      neg ? '#991b1b' : '#14532d',
    border:     neg ? '1px solid #f87171' : '1px solid #4ade80',
  };
};

const mSeverity = (level: string): React.CSSProperties => ({
  display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
  fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
  background: level === 'High' ? '#fecaca' : level === 'Medium' ? '#fde68a' : '#bbf7d0',
  color:      level === 'High' ? '#991b1b' : level === 'Medium' ? '#92400e' : '#14532d',
  border:     level === 'High' ? '1px solid #f87171' : level === 'Medium' ? '1px solid #f59e0b' : '1px solid #4ade80',
});



const positionBadge = (role: string): React.CSSProperties => ({
  fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '5px',
  textTransform: 'uppercase',
  background: role === 'ASM' ? '#bfdbfe' : role === 'ASE' ? '#e2e8f0' : '#bbf7d0',
  color:      role === 'ASM' ? '#1d4ed8' : role === 'ASE' ? '#334155' : '#14532d',
  border:     role === 'ASM' ? '1px solid #93c5fd' : role === 'ASE' ? '1px solid #94a3b8' : '1px solid #4ade80',
});

const responsibleName: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  background: '#e4edf7', padding: '4px 10px',
  borderRadius: '6px', fontSize: '12px', color: '#1e293b',
  fontWeight: 700, border: '1px solid #b8cfe0',
};
const deadlineBadge: React.CSSProperties = {
  fontWeight: 800, fontSize: '12px', color: '#991b1b',
  background: '#fecaca', padding: '4px 10px',
  borderRadius: '6px', border: '1px solid #f87171',
  display: 'inline-block',
};

const remarksContainer: React.CSSProperties = {
  background: '#fef9ec', border: '1.5px solid #f6c90e',
  padding: '18px 20px', borderRadius: '10px', marginBottom: '14px',
};
const remarksLabel: React.CSSProperties = {
  fontSize: '11px', fontWeight: 800, color: '#78350f',
  textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '10px',
};
const remarksText: React.CSSProperties = {
  fontSize: '14px', lineHeight: '1.75', color: '#431407', whiteSpace: 'pre-wrap', fontWeight: 500,
};
const signatureArea: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '8px',
  paddingTop: '14px', borderTop: '2px dashed #b8cfe0',
};
const signatureLine: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '13px' };
const signLabel: React.CSSProperties = { color: '#4a6d8c', fontWeight: 700 };
const signValue: React.CSSProperties = { color: '#07182a', fontWeight: 800, fontSize: '14px' };

const emptyStateStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', color: '#94a3b8' };
