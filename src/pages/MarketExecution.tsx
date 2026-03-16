import React, { useState } from "react";
import {
  FiShoppingCart, FiPlus, FiTrash2,
  FiUpload, FiImage, FiFileText, FiCheckCircle, FiMap, FiGlobe
} from "react-icons/fi";

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

// --- Styles ---
const fieldInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
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
  // Global Fields State
  const [territoryName, setTerritoryName] = useState("");
  const [routeName, setRouteName] = useState("");

  const [outlets, setOutlets] = useState<MegaOutlet[]>([newEmptyOutlet()]);
  const [reviews, setReviews] = useState<ReviewRow[]>(defaultReviewRows());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [finalReportId, setFinalReportId] = useState("");

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
      alert("⚠️ Please fill in all required fields before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("❌ User not logged in. Please log in first.");
        setSubmitting(false);
        return;
      }

      const loggedInUser = JSON.parse(userStr);
      const sharedId = generateReportId(loggedInUser.name);

      // Map Outlets
      const outletPayload = await Promise.all(
        outlets.map(async (o) => ({
          name: o.name,
          sales: o.sales,
          discount: o.discount,
          sku: o.sku,
          outletImageBase64: o.outletImage ? await fileToBase64(o.outletImage) : null,
        }))
      );

      // Map Reviews
      const reviewPayload = await Promise.all(
        reviews.map(async (r) => ({
          area: r.area,
          observation: r.observation,
          imageBase64: r.image ? await fileToBase64(r.image) : null,
          isDefault: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].includes(r.id),
        }))
      );

      // --- FINAL MASTER PAYLOAD ---
      const masterPayload = {
        reportGroupId: sharedId,
        userName: loggedInUser.name,
        userRole: loggedInUser.role,
        region: loggedInUser.region || "N/A", // Passing Region from Login Data
        territoryName: territoryName,         // Passing Territory
        routeName: routeName,                 // Passing Route
        outlets: outletPayload,
        reviews: reviewPayload
      };

      const response = await fetch("http://localhost:8080/api/market-execution/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(masterPayload),
      });

      if (response.ok) {
        setFinalReportId(sharedId);
        setSubmitted(true);
      } else {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Submission failed");
      }
    } catch (error: any) {
      alert("❌ Submission Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "linear-gradient(135deg, #f8fafd 0%, #e8f0f7 100%)", padding: "2rem" }}>
        <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 20px 60px rgba(22,73,118,0.15)", padding: "3rem 2rem", maxWidth: "500px", width: "100%", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "0 10px 30px rgba(16,185,129,0.3)" }}>
            <FiCheckCircle size={40} color="white" strokeWidth={3} />
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#0c2340", margin: "0 0 0.5rem 0" }}>Submission Successful!</h2>
          <p style={{ fontSize: "14px", color: "#6e90b0", margin: "0 0 0.5rem 0" }}>Report ID: <b>{finalReportId}</b></p>
          <p style={{ fontSize: "14px", color: "#6e90b0", margin: "0 0 2rem 0", lineHeight: "1.6" }}>Market report for {territoryName} has been saved.</p>
          <button onClick={() => window.location.reload()} style={{ background: "linear-gradient(135deg, #164976, #1e6aad)", color: "white", padding: "14px 32px", borderRadius: "12px", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Submit Another Report</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: "2rem", padding: "15px", maxWidth: "1200px", margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Sora:wght@700;800&display=swap');
        .me-upload-btn:hover { border-color: #164976 !important; background: rgba(22,73,118,0.08) !important; }
        .action-btn:hover { background: #164976 !important; color: #fff !important; }
        .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f1f5f9; padding: 20px; borderRadius: 16px; border: 1.5px solid #cbd5e1; }
        @media (max-width: 768px) { .header-grid { grid-template-columns: 1fr; } .outlet-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#164976", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiShoppingCart size={24} color="white" />
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.5rem", margin: 0, color: "#164976" }}>Market Review</h1>
        </div>

        {/* Territory & Route Section */}
        <div className="header-grid">
          <div>
            <label style={labelSt}><FiMap size={12} /> Territory Name *</label>
            <input 
              style={{ ...fieldInput, background: "#fff", border: errors["territoryName"] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} 
              placeholder="e.g. North Zone" value={territoryName} onChange={(e) => setTerritoryName(e.target.value)} disabled={submitting} 
            />
            {errors["territoryName"] && <span style={{ fontSize: "11px", color: "#f87171", marginTop: "4px", display: "block" }}>{errors["territoryName"]}</span>}
          </div>
          <div>
            <label style={labelSt}><FiGlobe size={12} /> Route / Area *</label>
            <input 
              style={{ ...fieldInput, background: "#fff", border: errors["routeName"] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} 
              placeholder="e.g. Route A-12" value={routeName} onChange={(e) => setRouteName(e.target.value)} disabled={submitting} 
            />
            {errors["routeName"] && <span style={{ fontSize: "11px", color: "#f87171", marginTop: "4px", display: "block" }}>{errors["routeName"]}</span>}
          </div>
        </div>
      </div>

      {/* Outlet Section */}
      <section>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", color: "#164976", borderBottom: "2px solid #cbd5e1", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <FiShoppingCart size={18} /> Outlet Details
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {outlets.map((outlet, idx) => (
            <div key={outlet.id} style={{ borderRadius: "16px", border: "1.5px solid #4a6d8c", background: "#fff", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
              <div style={{ background: "#164976", padding: "14px 20px", display: "flex", justifyContent: "space-between", color: "white", borderTopLeftRadius: "14px", borderTopRightRadius: "14px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>OUTLET {idx + 1}</span>
                {outlets.length > 1 && <FiTrash2 style={{ cursor: "pointer" }} onClick={() => removeOutlet(outlet.id)} />}
              </div>
              <div style={{ padding: "20px" }}>
                <div className="outlet-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <label style={labelSt}>Outlet Name *</label>
                    <input style={{ ...fieldInput, border: errors[`${outlet.id}-name`] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} placeholder="Store Name" value={outlet.name} onChange={(e)=>handleOutletField(outlet.id, "name", e.target.value)} disabled={submitting} />
                  </div>
                  <div>
                    <label style={labelSt}>Avg. Sales *</label>
                    <input style={{ ...fieldInput, border: errors[`${outlet.id}-sales`] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} placeholder="0.00" value={outlet.sales} onChange={(e)=>handleNumericField(outlet.id, "sales", e.target.value)} disabled={submitting} />
                  </div>
                  <div>
                    <label style={labelSt}>Discount (%) *</label>
                    <input style={{ ...fieldInput, border: errors[`${outlet.id}-discount`] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} placeholder="0" value={outlet.discount ? `${outlet.discount}%` : ""} onChange={(e)=>handleDiscountField(outlet.id, e.target.value)} disabled={submitting} />
                  </div>
                  <div>
                    <label style={labelSt}>SKU Amount *</label>
                    <input style={{ ...fieldInput, border: errors[`${outlet.id}-sku`] ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} placeholder="0" value={outlet.sku} onChange={(e)=>handleNumericField(outlet.id, "sku", e.target.value)} disabled={submitting} />
                  </div>
                </div>
                <label htmlFor={`img-${outlet.id}`} className="me-upload-btn" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: "1.5px dashed #4a6d8c", borderRadius: "10px", cursor: submitting ? "not-allowed" : "pointer", background: "rgba(22,73,118,0.02)" }}>
                  <FiImage color="#4a6d8c" size={20} />
                  <span style={{ fontSize: "14px", color: "#164976" }}>{outlet.outletImage ? outlet.outletImage.name : "Upload Outlet Photo"}</span>
                  <input id={`img-${outlet.id}`} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleOutletImage(outlet.id, e.target.files?.[0] || null)} disabled={submitting} />
                </label>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addExtraOutlet} className="action-btn" style={{...actionBtn, marginTop: "20px"}} disabled={submitting}><FiPlus /> Add New Outlet</button>
      </section>

      {/* Review Table Section */}
        <section style={{ animation: "fadeInUp 0.7s ease-out" }}>
          <div style={{ 
            fontFamily: "'Sora', sans-serif", 
            fontSize: "1.2rem", 
            color: "#164976", 
            borderBottom: "3px solid #164976", 
            paddingBottom: "14px", 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            marginBottom: "24px",
            fontWeight: 800,
            background: "linear-gradient(to right, #164976, #1e6aad)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #164976, #1e6aad)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <FiFileText size={18} color="white" strokeWidth={2.5} />
            </div>
            Performance Assessment
          </div>
          <div 
            className="scroll-container" 
            style={{ 
              border: "2px solid #1e293b", 
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(22,73,118,0.08)"
            }}
          >
            <table className="wide-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ 
                  background: "linear-gradient(135deg, #164976, #1e6aad)", 
                  textAlign: "left", 
                  fontSize: "12px", 
                  color: "white",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}>
                  <th style={{ padding: "18px 20px", width: "25%" }}>Review Area</th>
                  <th style={{ padding: "18px 20px", width: "50%" }}>Observation</th>
                  <th style={{ padding: "18px 20px", width: "15%" }}>Image</th>
                  <th style={{ padding: "18px 20px", width: "10%" }}></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((row, idx) => (
                  <tr 
                    key={row.id} 
                    style={{ 
                      borderTop: "1px solid #e2e8f0",
                      background: idx % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(248,250,252,0.5)"
                    }}
                  >
                    <td style={{ padding: "14px 20px", width: "25%" }}>
                      <input 
                        style={{ 
                          ...fieldInput, 
                          background: ['r1','r2','r3','r4','r5','r6'].includes(row.id) ? "rgba(241,245,249,0.8)" : "white",
                          border: "2px solid #4a6d8c"
                        }} 
                        value={row.area} 
                        onChange={(e) => handleReviewField(row.id, "area", e.target.value)} 
                        disabled={submitting || ['r1','r2','r3','r4','r5','r6'].includes(row.id)}
                        onFocus={(e) => {
                          if (!['r1','r2','r3','r4','r5','r6'].includes(row.id)) {
                            e.target.style.border = "2px solid #164976";
                            e.target.style.background = "rgba(22,73,118,0.07)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.border = "2px solid #4a6d8c";
                          e.target.style.background = ['r1','r2','r3','r4','r5','r6'].includes(row.id) ? "rgba(241,245,249,0.8)" : "white";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </td>
                    <td style={{ padding: "14px 20px", width: "50%" }}>
                      <input 
                        style={{...fieldInput, border: "2px solid #4a6d8c", background: "white"}} 
                        placeholder="Findings..." 
                        value={row.observation} 
                        onChange={(e) => handleReviewField(row.id, "observation", e.target.value)} 
                        disabled={submitting}
                        onFocus={(e) => {
                          e.target.style.border = "2px solid #164976";
                          e.target.style.background = "rgba(22,73,118,0.07)";
                          e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                        }}
                        onBlur={(e) => {
                          e.target.style.border = "2px solid #4a6d8c";
                          e.target.style.background = "white";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </td>
                    <td style={{ padding: "14px 20px", width: "15%" }}>
                      {row.id === 'r1' || row.id === 'r2' ? (
                        <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>N/A</span>
                      ) : (
                        <label 
                          htmlFor={`rev-img-${row.id}`} 
                          style={{ 
                            cursor: "pointer", 
                            fontSize: "13px", 
                            color: row.image ? "#10b981" : "#164976", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontWeight: 700,
                            transition: "all 0.2s"
                          }}
                        >
                          <FiUpload size={16} strokeWidth={2.5} /> {row.image ? "DONE ✓" : "UPLOAD"}
                          <input 
                            id={`rev-img-${row.id}`} 
                            type="file" 
                            accept="image/*" 
                            style={{ display: "none" }} 
                            onChange={(e) => handleReviewImage(row.id, e.target.files?.[0] || null)} 
                            disabled={submitting} 
                          />
                        </label>
                      )}
                    </td>
                    <td style={{ textAlign: "center", padding: "14px 20px", width: "10%" }}>
                      {!['r1','r2','r3','r4','r5','r6'].includes(row.id) && (
                        <FiTrash2 
                          onClick={() => removeReviewRow(row.id)} 
                          color="#ef4444" 
                          size={18}
                          strokeWidth={2.5}
                          style={{ cursor: "pointer", transition: "all 0.2s" }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button 
            onClick={addReviewRow} 
            className="action-btn" 
            style={{...actionBtn, marginTop: "24px"}} 
            disabled={submitting}
          >
            <FiPlus strokeWidth={2.5} /> Add Review
          </button>
        </section>


      <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "2px solid #cbd5e1", paddingTop: "30px" }}>
        <button onClick={handleSubmit} disabled={submitting} style={{ background: "linear-gradient(135deg, #164976, #1e6aad)", color: "white", padding: "14px 40px", borderRadius: "12px", border: "none", fontWeight: 700, cursor: "pointer" }}>
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
};

export default MarketExecution;