import { useState } from "react";
import {
  FiShoppingCart, FiPlus, FiTrash2,
  FiUpload, FiCheck, FiImage, FiFileText,
} from "react-icons/fi";

// ── Data shapes ───────────────────────────────────────────────────────────────
interface ReviewRow {
  id:          string;
  area:        string;
  observation: string;
  image:       File | null;
}

interface MegaOutlet {
  id:          string;
  name:        string;
  sales:       string;
  discount:    string;
  sku:         string;
  outletImage: File | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const newReviewRow = (): ReviewRow => ({
  id:          `rev-${Math.random().toString(36).slice(2, 6)}`,
  area:        "",
  observation: "",
  image:       null,
});

const defaultReviewRows = (): ReviewRow[] => [
  { id: "r1", area: "Route Adherence",            observation: "", image: null },
  { id: "r2", area: "Outlet Coverage Gaps",        observation: "", image: null },
  { id: "r3", area: "Shelf Presence & Visibility", observation: "", image: null },
  { id: "r4", area: "POSM Condition",               observation: "", image: null },
  { id: "r5", area: "Competitor Activities",       observation: "", image: null },
  { id: "r6", area: "Pricing & Compliance Issues", observation: "", image: null },
];

const newEmptyOutlet = (): MegaOutlet => ({
  id:          Math.random().toString(36).slice(2, 8),
  name:        "",
  sales:       "",
  discount:    "",
  sku:         "",
  outletImage: null,
});

// ── Shared styles ─────────────────────────────────────────────────────────────
const fieldInput: React.CSSProperties = {
  width:         "100%",
  padding:       "12px 14px", // Larger for mobile touch
  borderRadius:  "8px",
  border:        "1.5px solid #4a6d8c",
  background:    "rgba(22,73,118,0.04)",
  color: "#0a1f33",
  fontSize: "14px", // Increased from 13px
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#4a6d8c",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const actionBtn: React.CSSProperties = {
  height: "48px",
  width: "200px", 
  borderRadius: "10px",
  border: "1.5px dashed #164976",
  background: "#fff",
  color: "#164976",
  fontWeight: 700,
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

const MarketExecution = () => {
  const [outlets, setOutlets] = useState<MegaOutlet[]>([newEmptyOutlet()]);
  const [reviews, setReviews] = useState<ReviewRow[]>(defaultReviewRows());
  const [submitted, setSubmitted] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOutletField = (id: string, field: keyof MegaOutlet, value: string) => {
    setOutlets(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleOutletImage = (id: string, file: File | null) => {
    setOutlets(prev => prev.map(o => o.id === id ? { ...o, outletImage: file } : o));
  };

  const addExtraOutlet = () => setOutlets(prev => [...prev, newEmptyOutlet()]);
  const removeOutlet = (id: string) => { if (outlets.length > 1) setOutlets(prev => prev.filter(o => o.id !== id)); };

  const handleReviewField = (rowId: string, field: "area" | "observation", value: string) => {
    setReviews(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
  };

  const handleReviewImage = (rowId: string, file: File | null) => {
    setReviews(prev => prev.map(r => r.id === rowId ? { ...r, image: file } : r));
  };

  const addReviewRow = () => setReviews(prev => [...prev, newReviewRow()]);
  const removeReviewRow = (rowId: string) => setReviews(prev => prev.filter(r => r.id !== rowId));

  if (submitted) {
    return (
        <div style={{ textAlign: "center", padding: "4rem", fontFamily: "'DM Sans', sans-serif" }}>
            <FiCheck size={60} color="#164976" />
            <h2 style={{ color: "#164976" }}>Submission Successful</h2>
            <button onClick={() => window.location.reload()} style={{...actionBtn, margin: "20px auto"}}>Reset Form</button>
        </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: "2rem", padding: "15px", maxWidth: "1200px", margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Sora:wght@700&display=swap');
        .me-upload-btn:hover { border-color: #164976 !important; background: rgba(22,73,118,0.08) !important; }
        .action-btn:hover { background: #164976 !important; color: #fff !important; }
        input::placeholder { color: #64748b; opacity: 1; }
        
        /* Mobile Table Scrolling */
        .scroll-container {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: 12px;
        }
        
        /* Ensure table doesn't collapse on small screens */
        .wide-table {
            min-width: 800px; 
            width: 100%;
            border-collapse: collapse;
        }

        @media (max-width: 768px) {
            .outlet-grid {
                grid-template-columns: 1fr !important;
            }
            .action-btn {
                width: 100% !important;
            }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#164976", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FiShoppingCart size={24} color="white" />
        </div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.5rem", margin: 0, color: "#164976" }}>Market Review</h1>
      </div>

      {/* ── SECTION: OUTLETS ── */}
      <section>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", color: "#164976", borderBottom: "2px solid #cbd5e1", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <FiShoppingCart size={18} /> Outlet Details
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {outlets.map((outlet, idx) => (
            <div key={outlet.id} style={{ borderRadius: "16px", border: "1.5px solid #4a6d8c", background: "#fff", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
              <div style={{ background: "#164976", padding: "14px 20px", display: "flex", justifyContent: "space-between", color: "white", borderTopLeftRadius: "14px", borderTopRightRadius: "14px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>LOCATION {idx + 1}</span>
                {outlets.length > 1 && <FiTrash2 style={{ cursor: "pointer" }} onClick={() => removeOutlet(outlet.id)} />}
              </div>

              <div style={{ padding: "20px" }}>
                <div className="outlet-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <label style={labelSt}>Outlet Name</label>
                    <input style={fieldInput} placeholder="Store full name" value={outlet.name} onChange={(e)=>handleOutletField(outlet.id, "name", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelSt}>Avg. Sales</label>
                    <input style={fieldInput} placeholder="Amount" value={outlet.sales} onChange={(e)=>handleOutletField(outlet.id, "sales", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelSt}>Discount</label>
                    <input style={fieldInput} placeholder="Rate %" value={outlet.discount} onChange={(e)=>handleOutletField(outlet.id, "discount", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelSt}>SKU Amount</label>
                    <input style={fieldInput} placeholder="Qty" value={outlet.sku} onChange={(e)=>handleOutletField(outlet.id, "sku", e.target.value)} />
                  </div>
                </div>

                <div style={{ width: "100%" }}>
                  <label style={labelSt}>Outlet Image</label>
                  <label htmlFor={`img-${outlet.id}`} className="me-upload-btn" style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "16px", 
                    border: "1.5px dashed #4a6d8c", 
                    borderRadius: "10px", 
                    cursor: "pointer", 
                    background: "rgba(22,73,118,0.02)",
                    minHeight: "56px",
                    boxSizing: "border-box"
                  }}>
                      <FiImage color="#4a6d8c" size={20} />
                      <span style={{ fontSize: "14px", color: "#164976", wordBreak: "break-all" }}>
                        {outlet.outletImage ? outlet.outletImage.name : "Tap to upload store photo"}
                      </span>
                      <input id={`img-${outlet.id}`} type="file" style={{ display: "none" }} onChange={(e) => handleOutletImage(outlet.id, e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: "20px" }}>
          <button onClick={addExtraOutlet} className="action-btn" style={actionBtn}>
            <FiPlus /> Add New Outlet
          </button>
        </div>
      </section>

      {/* ── SECTION: PERFORMANCE REVIEW ── */}
      <section>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", color: "#164976", borderBottom: "2px solid #cbd5e1", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <FiFileText size={18} /> Market Performance Table
        </div>

        <div className="scroll-container" style={{ border: "1.5px solid #4a6d8c", background: "#fff" }}>
          <table className="wide-table">
            <thead>
              <tr style={{ background: "rgba(22,73,118,0.08)", textAlign: "left", fontSize: "12px", color: "#164976" }}>
                <th style={{ padding: "18px", width: "30%" }}>REVIEW AREA</th>
                <th style={{ padding: "18px", width: "45%" }}>OBSERVATION</th>
                <th style={{ padding: "18px", width: "15%" }}>IMAGE</th>
                <th style={{ padding: "18px", width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((row, rIdx) => {
                // Check if this is a default row (r1-r6) or a newly added row
                const isDefaultRow = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].includes(row.id);
                
                return (
                  <tr key={row.id} style={{ borderTop: "1px solid #e2e8f0", background: rIdx % 2 === 0 ? "#fff" : "rgba(22,73,118,0.02)" }}>
                    <td style={{ padding: "12px" }}>
                      <input style={fieldInput} placeholder="Area" value={row.area} onChange={(e) => handleReviewField(row.id, "area", e.target.value)} />
                    </td>
                    <td style={{ padding: "12px" }}>
                      <input style={fieldInput} placeholder="Add findings here..." value={row.observation} onChange={(e) => handleReviewField(row.id, "observation", e.target.value)} />
                    </td>
                    <td style={{ padding: "12px" }}>
                        <label htmlFor={`rev-img-${row.id}`} style={{ cursor: "pointer", fontSize: "13px", color: "#164976", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                            <FiUpload size={18} /> {row.image ? "DONE" : "UPLOAD"}
                            <input id={`rev-img-${row.id}`} type="file" style={{ display: "none" }} onChange={(e) => handleReviewImage(row.id, e.target.files?.[0] || null)} />
                        </label>
                    </td>
                    <td style={{ textAlign: "center", padding: "12px" }}>
                      {!isDefaultRow && (
                        <FiTrash2 size={18} color="#dc2626" onClick={() => removeReviewRow(row.id)} style={{ cursor: "pointer" }} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button onClick={addReviewRow} className="action-btn" style={actionBtn}>
            <FiPlus /> Add Performance Area
          </button>
        </div>
      </section>

      {/* ── FINAL SUBMISSION ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "2px solid #cbd5e1", paddingTop: "30px", marginTop: "20px" }}>
        <button 
          onClick={() => setSubmitted(true)} 
          style={{ 
            background: "#164976", 
            color: "white", 
            padding: "0 50px", 
            height: "56px", 
            borderRadius: "12px", 
            border: "none", 
            fontWeight: 700, 
            cursor: "pointer", 
            fontSize: "16px",
            width: "100%", // Full width on mobile by default
            maxWidth: "300px",
            boxShadow: "0 10px 15px -3px rgba(22,73,118,0.3)" 
          }}
        >
          Submit Market Report
        </button>
      </div>
    </div>
  );
};

export default MarketExecution;