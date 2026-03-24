import React, { useState } from "react";
import {
  FiShoppingCart, FiPlus, FiTrash2,
  FiUpload, FiImage, FiFileText, FiMap, FiGlobe, FiCheckCircle
} from "react-icons/fi";
import Swal from "sweetalert2";

// --- Interfaces ---
interface ReviewRow {
  id: string;
  area: string;
  observation: string;
  image: File | null;
}

interface MegaOutlet {
  id: string;
  name: string;
  sales: string;
  discount: string;
  sku: string;
  outletImage: File | null;
}

// --- Helpers --- 
const generateReportId = (userName: string) => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).slice(2, 7).toUpperCase();
  const cleanName = userName.toUpperCase().replace(/\s+/g, '').slice(0, 5);
  return `ASM-${cleanName}-${timestamp}-${randomStr}`;
};

const newReviewRow = (): ReviewRow => ({
  id: `rev-${Math.random().toString(36).slice(2, 6)}`,
  area: "",
  observation: "",
  image: null,
});

const defaultReviewRows = (): ReviewRow[] => [
  { id: "r1", area: "Route Adherence", observation: "", image: null },
  { id: "r2", area: "Outlet Coverage Gaps", observation: "", image: null },
  { id: "r3", area: "Shelf Presence & Visibility", observation: "", image: null },
  { id: "r4", area: "POSM Condition", observation: "", image: null },
  { id: "r5", area: "Competitor Activities", observation: "", image: null },
  { id: "r6", area: "Pricing & Compliance Issues", observation: "", image: null },
];

const newEmptyOutlet = (): MegaOutlet => ({
  id: Math.random().toString(36).slice(2, 8),
  name: "",
  sales: "",
  discount: "",
  sku: "",
  outletImage: null,
});

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// --- Styles (Matching Stock Status) ---
const fieldInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1.5px solid #4a6d8c",
  background: "rgba(22,73,118,0.04)",
  color: "#0a1f33",
  fontSize: "14px",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#4a6d8c",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const smallDashedBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "10px 24px",
  borderRadius: "10px",
  border: "1.5px dashed #164976",
  background: "#fff",
  color: "#164976",
  fontWeight: 700,
  fontSize: "13px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  marginTop: "12px",
};

const MarketExecution = () => {
  const [territoryName, setTerritoryName] = useState("");
  const [routeName, setRouteName] = useState("");
  const [outlets, setOutlets] = useState<MegaOutlet[]>([newEmptyOutlet()]);
  const [reviews, setReviews] = useState<ReviewRow[]>(defaultReviewRows());
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Logic Handlers
  const handleOutletField = (id: string, field: keyof MegaOutlet, value: string) => {
    setOutlets(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
    if (errors[`${id}-${field}`]) setErrors(prev => ({ ...prev, [`${id}-${field}`]: "" }));
  };

  const handleNumericField = (id: string, field: "sales" | "sku", value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) handleOutletField(id, field, value);
  };

  const handleDiscountField = (id: string, value: string) => {
    const numericValue = value.replace("%", "").trim();
    if (numericValue === "" || /^\d*\.?\d*$/.test(numericValue)) handleOutletField(id, "discount", numericValue);
  };

  const handleOutletImage = (id: string, file: File | null) => {
    setOutlets(prev => prev.map(o => o.id === id ? { ...o, outletImage: file } : o));
  };

  const addExtraOutlet = () => setOutlets(prev => [...prev, newEmptyOutlet()]);
  const removeOutlet = (id: string) => {
    if (outlets.length > 1) setOutlets(prev => prev.filter(o => o.id !== id));
  };

  const handleReviewField = (rowId: string, field: "area" | "observation", value: string) => {
    setReviews(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
    if (errors[`${rowId}-${field}`]) setErrors(prev => ({ ...prev, [`${rowId}-${field}`]: "" }));
  };

  const handleReviewImage = (rowId: string, file: File | null) => {
    setReviews(prev => prev.map(r => r.id === rowId ? { ...r, image: file } : r));
  };

  const addReviewRow = () => setReviews(prev => [...prev, newReviewRow()]);
  const removeReviewRow = (rowId: string) => setReviews(prev => prev.filter(r => r.id !== rowId));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!territoryName.trim()) newErrors["territoryName"] = "Territory is required";
    if (!routeName.trim()) newErrors["routeName"] = "Route is required";
    outlets.forEach((o) => {
      if (!o.name.trim()) newErrors[`${o.id}-name`] = "Outlet name is required";
      if (!o.sales.trim()) newErrors[`${o.id}-sales`] = "Sales is required";
      if (!o.discount.trim()) newErrors[`${o.id}-discount`] = "Discount is required";
      if (!o.sku.trim()) newErrors[`${o.id}-sku`] = "SKU is required";
    });
    reviews.forEach((r) => {
      if (!r.area.trim()) newErrors[`${r.id}-area`] = "Area is required";
      if (!r.observation.trim()) newErrors[`${r.id}-observation`] = "Observation is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Swal.fire({ icon: 'warning', title: 'Incomplete Fields', text: 'Please fill in all required fields.', confirmButtonColor: '#164976' });
      return;
    }
    Swal.fire({ title: 'Submitting Report', text: 'Processing data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    setSubmitting(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not logged in.");
      const loggedInUser = JSON.parse(userStr);
      const sharedId = generateReportId(loggedInUser.name);

      const outletPayload = await Promise.all(outlets.map(async (o) => ({
        name: o.name, sales: o.sales, discount: o.discount, sku: o.sku,
        outletImageBase64: o.outletImage ? await fileToBase64(o.outletImage) : null,
      })));

      const reviewPayload = await Promise.all(reviews.map(async (r) => ({
        area: r.area, observation: r.observation, 
        imageBase64: r.image ? await fileToBase64(r.image) : null,
        isDefault: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].includes(r.id),
      })));

      const masterPayload = {
        reportGroupId: sharedId, userName: loggedInUser.name, userRole: loggedInUser.role,
        region: loggedInUser.region || "N/A", territoryName, routeName,
        outlets: outletPayload, reviews: reviewPayload
      };

      const response = await fetch("http://localhost:8080/api/market-execution/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(masterPayload),
      });

      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Synchronized!', text: 'Submitted successfully.', confirmButtonColor: '#164976' })
          .then(() => window.location.reload());
      } else {
        throw new Error(await response.text() || "Submission failed");
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#164976' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Sora:wght@700;800&display=swap');
        
        .action-btn:hover { background: #164976 !important; color: #fff !important; }
        .upload-area:hover { border-color: #164976 !important; background: rgba(22,73,118,0.06) !important; }
        
        /* Mobile shadow fix - target only cards */
        @media (max-width: 768px) {
          div[style*="boxShadow: 0 4px 12px"] {
            box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
          }
        }
      `}</style>

      {/* STOCK STATUS STYLE PAGE HEADER */}
      <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "15px" }}>
        <div style={{ background: "linear-gradient(135deg, #164976, #1e6aad)", padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center" }}>
          <FiShoppingCart size={24} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontSize: "22px", color: "#164976", fontWeight: 800 }}>Market Execution Report</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#4a6d8c", fontWeight: 500 }}>Daily route performance and outlet standards audit</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* HEADER INFO SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", background: "rgba(22,73,118,0.02)", padding: "24px", borderRadius: "16px", border: "1.5px solid #cbd5e1" }}>
          <div>
            <label style={labelSt}><FiMap size={12} /> Territory Name *</label>
            <input 
              style={{ ...fieldInput, background: "#fff", border: errors["territoryName"] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} 
              placeholder="e.g. North Zone" value={territoryName} onChange={(e) => setTerritoryName(e.target.value)} disabled={submitting} 
            />
          </div>
          <div>
            <label style={labelSt}><FiGlobe size={12} /> Route / Area *</label>
            <input 
              style={{ ...fieldInput, background: "#fff", border: errors["routeName"] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} 
              placeholder="e.g. Route A-12" value={routeName} onChange={(e) => setRouteName(e.target.value)} disabled={submitting} 
            />
          </div>
        </div>

        {/* OUTLET SECTION (Card Style from Stock Status) */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <FiShoppingCart color="#164976" size={18} />
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: 700, color: "#164976", textTransform: "uppercase", letterSpacing: "0.05em" }}>Outlet Details</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {outlets.map((outlet, idx) => (
              <div key={outlet.id} style={{ borderRadius: "14px", border: "1.5px solid #4a6d8c", overflow: "hidden", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <div style={{ background: "linear-gradient(135deg, #164976, #1e6aad)", padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "white", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Outlet #{idx + 1}</span>
                  {outlets.length > 1 && <FiTrash2 color="white" style={{ cursor: "pointer", opacity: 0.8 }} onClick={() => removeOutlet(outlet.id)} />}
                </div>
                <div style={{ padding: "18px" }}>
                   <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", marginBottom: "15px" }}>
                      <div><label style={labelSt}>Outlet Name *</label><input style={{ ...fieldInput, border: errors[`${outlet.id}-name`] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} placeholder="Store Name" value={outlet.name} onChange={(e)=>handleOutletField(outlet.id, "name", e.target.value)} disabled={submitting} /></div>
                      <div><label style={labelSt}>Avg Sales *</label><input style={{ ...fieldInput, border: errors[`${outlet.id}-sales`] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} placeholder="0.00" value={outlet.sales} onChange={(e)=>handleNumericField(outlet.id, "sales", e.target.value)} disabled={submitting} /></div>
                      <div><label style={labelSt}>Disc (%) *</label><input style={{ ...fieldInput, border: errors[`${outlet.id}-discount`] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} placeholder="0" value={outlet.discount ? `${outlet.discount}%` : ""} onChange={(e)=>handleDiscountField(outlet.id, e.target.value)} disabled={submitting} /></div>
                      <div><label style={labelSt}>SKU Amount *</label><input style={{ ...fieldInput, border: errors[`${outlet.id}-sku`] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} placeholder="0" value={outlet.sku} onChange={(e)=>handleNumericField(outlet.id, "sku", e.target.value)} disabled={submitting} /></div>
                   </div>
                   <label className="upload-area" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1.5px dashed #4a6d8c", borderRadius: "8px", cursor: "pointer", background: "rgba(22,73,118,0.01)", transition: "0.2s" }}>
                      <FiImage color="#164976" size={16} />
                      <span style={{ fontSize: "13px", color: "#164976", fontWeight: 600 }}>{outlet.outletImage ? outlet.outletImage.name : "Upload Outlet Photo"}</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleOutletImage(outlet.id, e.target.files?.[0] || null)} disabled={submitting} />
                   </label>
                </div>
              </div>
            ))}
            <div><button style={smallDashedBtn} className="action-btn" onClick={addExtraOutlet} disabled={submitting}><FiPlus /> Add Outlet</button></div>
          </div>
        </div>

        {/* ASSESSMENT SECTION (Table Style from Stock Status) */}
        <div style={{ borderRadius: "14px", border: "1.5px solid #4a6d8c", overflow: "hidden", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <div style={{ background: "linear-gradient(135deg, #164976, #1e6aad)", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
            <FiFileText size={16} color="white" />
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: 700, color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}>Performance Assessment</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ background: "rgba(22,73,118,0.06)" }}>
                  {["Review Area", "Observation Findings", "Evidence", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#4a6d8c", textTransform: "uppercase", borderBottom: "1px solid rgba(22,73,118,0.1)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((row, idx) => (
                  <tr key={row.id} style={{ background: idx % 2 === 0 ? "#fff" : "rgba(22,73,118,0.02)", borderBottom: "1px solid rgba(22,73,118,0.07)" }}>
                    <td style={{ padding: "12px", width: "30%" }}>
                      <input 
                        style={{ ...fieldInput, background: ['r1','r2','r3','r4','r5','r6'].includes(row.id) ? "transparent" : "#fff", border: ['r1','r2','r3','r4','r5','r6'].includes(row.id) ? "none" : "1.5px solid #4a6d8c", fontWeight: ['r1','r2','r3','r4','r5','r6'].includes(row.id) ? 700 : 400 }} 
                        value={row.area} onChange={(e) => handleReviewField(row.id, "area", e.target.value)} 
                        disabled={submitting || ['r1','r2','r3','r4','r5','r6'].includes(row.id)} 
                      />
                    </td>
                    <td style={{ padding: "12px" }}>
                      <input style={{ ...fieldInput, background: "#fff" }} placeholder="Findings..." value={row.observation} onChange={(e) => handleReviewField(row.id, "observation", e.target.value)} disabled={submitting} />
                    </td>
                    <td style={{ padding: "12px", width: "140px" }}>
                      {row.id === 'r1' || row.id === 'r2' ? (
                        <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 700 }}>N/A</span>
                      ) : (
                        <label style={{ cursor: "pointer", color: row.image ? "#10b981" : "#164976", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700 }}>
                          <FiUpload size={14} /> {row.image ? "UPLOADED" : "UPLOAD"}
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleReviewImage(row.id, e.target.files?.[0] || null)} disabled={submitting} />
                        </label>
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", width: "50px" }}>
                      {!['r1','r2','r3','r4','r5','r6'].includes(row.id) && <FiTrash2 onClick={() => removeReviewRow(row.id)} color="#ef4444" size={16} style={{ cursor: "pointer" }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "15px", background: "rgba(22,73,118,0.02)", borderTop: "1px solid rgba(22,73,118,0.1)" }}>
             <button style={{ ...smallDashedBtn, marginTop: 0 }} className="action-btn" onClick={addReviewRow} disabled={submitting}><FiPlus /> Add Custom Area</button>
          </div>
        </div>

        {/* FINAL SUBMIT ACTION */}
        <div style={{ marginTop: "20px", padding: "30px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSubmit} disabled={submitting} style={{
            background: "linear-gradient(135deg, #164976, #1e6aad)",
            color: "white", padding: "14px 40px", borderRadius: "10px", border: "none",
            fontSize: "15px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
            boxShadow: "0 4px 15px rgba(22,73,118,0.2)"
          }}>
            <FiCheckCircle /> {submitting ? "Processing..." : "Submit Report"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MarketExecution;