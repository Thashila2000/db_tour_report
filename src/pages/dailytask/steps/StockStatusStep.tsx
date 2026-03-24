import { useState, useEffect } from "react";
import { FiPackage } from "react-icons/fi";
import StepShell from "../StepShell";

// ── Data shapes ───────────────────────────────────────────────────────────────
export interface StockItem {
  id:          string;
  itemName:    string;
  stockLevel:  string;
  systemStock: string;
}

export interface StockCategory {
  id:      string;
  name:    string;
  items:   StockItem[];
  comment: string;
}

export interface StockStatusData {
  categories: StockCategory[];
}

// ── Auto-calculate variance: stockLevel - systemStock ────────────────────────
const calcVariance = (
  stockLevel: string,
  systemStock: string
): { value: string; color: string } => {
  const s = parseFloat(stockLevel);
  const y = parseFloat(systemStock);
  if (isNaN(s) || isNaN(y)) return { value: "", color: "#4a6d8c" };
  const v = s - y;
  return {
    value: (v >= 0 ? "+" : "") + v.toFixed(2),
    color: v > 0 ? "#15803d" : v < 0 ? "#dc2626" : "#4a6d8c",
  };
};

// ── Fixed categories ──────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: StockCategory[] = [
  {
    id: "biscuits", name: "Biscuits", comment: "",
    items: [
      { id: "b1", itemName: "", stockLevel: "", systemStock: "" },
      { id: "b2", itemName: "", stockLevel: "", systemStock: "" },
      { id: "b3", itemName: "", stockLevel: "", systemStock: "" },
    ],
  },
  {
    id: "chocolates", name: "Chocolates", comment: "",
    items: [
      { id: "c1", itemName: "", stockLevel: "", systemStock: "" },
      { id: "c2", itemName: "", stockLevel: "", systemStock: "" },
      { id: "c3", itemName: "", stockLevel: "", systemStock: "" },
    ],
  },
  {
    id: "snacks", name: "Snacks", comment: "",
    items: [
      { id: "s1", itemName: "", stockLevel: "", systemStock: "" },
      { id: "s2", itemName: "", stockLevel: "", systemStock: "" },
      { id: "s3", itemName: "", stockLevel: "", systemStock: "" },
    ],
  },
  {
    id: "crackers", name: "Crackers", comment: "",
    items: [
      { id: "cr1", itemName: "", stockLevel: "", systemStock: "" },
      { id: "cr2", itemName: "", stockLevel: "", systemStock: "" },
    ],
  },
  {
    id: "gems", name: "Gems", comment: "",
    items: [
      { id: "g1", itemName: "", stockLevel: "", systemStock: "" },
    ],
  },
];

// ── Prop types ────────────────────────────────────────────────────────────────
interface Props {
  totalSteps:   number;
  stepNumber:   number;
  initialData?: StockStatusData;
  onNext:       (data: StockStatusData) => void;
  onBack:       () => void;
}

// ── Shared cell input style ───────────────────────────────────────────────────
const cellInput: React.CSSProperties = {
  width:        "100%",
  padding:      "10px 12px",
  borderRadius: "8px",
  border:       "1.5px solid #4a6d8c",
  background:   "rgba(22,73,118,0.04)",
  color:        "#0a1f33",
  fontSize:     "14px",
  fontFamily:   "'DM Sans', sans-serif",
  outline:      "none",
  transition:   "all 0.2s ease",
};

// ── Component ─────────────────────────────────────────────────────────────────
const StockStatusStep = ({ totalSteps, stepNumber, initialData, onNext, onBack }: Props) => {
  // Initialize from localStorage with fallback
  const [categories, setCategories] = useState<StockCategory[]>(() => {
    console.log("🎬 StockStatus: Initializing...");
    
    // Priority 1: Use initialData from parent if it has content
    if (initialData?.categories && initialData.categories.length > 0) {
      const hasData = initialData.categories.some(cat => 
        cat.items.some(item => item.itemName || item.stockLevel || item.systemStock) || cat.comment
      );
      if (hasData) {
        console.log("✅ Using initialData from parent");
        return initialData.categories;
      }
    }
    
    // Priority 2: Load from localStorage
    try {
      const saved = localStorage.getItem("stockStatus");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.categories && Array.isArray(parsed.categories)) {
          const hasData = parsed.categories.some((cat: StockCategory) => 
            cat.items.some((item: StockItem) => item.itemName || item.stockLevel || item.systemStock) || cat.comment
          );
          if (hasData) {
            console.log("✅ Loaded from localStorage");
            return parsed.categories;
          }
        }
      }
    } catch (err) {
      console.error("❌ Failed to parse stockStatus:", err);
    }
    
    console.log("⚠️ Using DEFAULT_CATEGORIES");
    return DEFAULT_CATEGORIES;
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Auto-save WITHOUT metadata (clean structure only)
  useEffect(() => {
    const hasData = categories.some(cat => 
      cat.items.some(item => item.itemName || item.stockLevel || item.systemStock) || cat.comment
    );
    
    if (hasData) {
      const timer = setTimeout(() => {
        // ✅ Save ONLY categories - NO metadata
        const payload = { categories };
        console.log("💾 Auto-saving stockStatus");
        localStorage.setItem("stockStatus", JSON.stringify(payload));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [categories]);

  // Update a specific item field
  const handleItemChange = (
    catId: string,
    itemId: string,
    field: keyof StockItem,
    value: string
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : cat
      )
    );
    const errKey = `${catId}-${itemId}-${field}`;
    if (errors[errKey]) setErrors((prev) => ({ ...prev, [errKey]: "" }));
  };

  // Update category comment
  const handleCommentChange = (catId: string, value: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === catId ? { ...cat, comment: value } : cat))
    );
  };

  // Validate required fields
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (!item.itemName)
          newErrors[`${cat.id}-${item.id}-itemName`] = "required";
        if (!item.stockLevel)
          newErrors[`${cat.id}-${item.id}-stockLevel`] = "required";
        if (!item.systemStock)
          newErrors[`${cat.id}-${item.id}-systemStock`] = "required";
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      console.log("📤 StockStatus: Sending data to parent");
      onNext({ categories });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Stock Status at DB"
      Icon={FiPackage}
      onNext={handleNext}
      onBack={onBack}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              borderRadius: "14px",
              border:       "1.5px solid #4a6d8c",
              overflow:     "hidden",
            }}
          >
            {/* Category header */}
            <div
              style={{
                background: "linear-gradient(135deg, #164976, #1e6aad)",
                padding:    "12px 16px",
                display:    "flex",
                alignItems: "center",
                gap:        "10px",
              }}
            >
              <FiPackage size={16} color="white" />
              <span
                style={{
                  fontFamily:    "'Sora', sans-serif",
                  fontSize:      "14px",
                  fontWeight:    700,
                  color:         "white",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {cat.name}
              </span>
            </div>

            {/* Items table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
                <thead>
                  <tr style={{ background: "rgba(22,73,118,0.06)" }}>
                    {["Item", "Stock Level (Value)", "System Stock (Value)", "Variance"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding:       "10px 14px",
                          textAlign:     "left",
                          fontSize:      "11px",
                          fontWeight:    700,
                          color:         "#4a6d8c",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          borderBottom:  "1px solid rgba(22,73,118,0.10)",
                          whiteSpace:    "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((item, idx) => {
                    const nameErr  = !!errors[`${cat.id}-${item.id}-itemName`];
                    const levelErr = !!errors[`${cat.id}-${item.id}-stockLevel`];
                    const sysErr   = !!errors[`${cat.id}-${item.id}-systemStock`];
                    const variance = calcVariance(item.stockLevel, item.systemStock);

                    return (
                      <tr
                        key={item.id}
                        style={{
                          background:   idx % 2 === 0 ? "#ffffff" : "rgba(22,73,118,0.02)",
                          borderBottom: "1px solid rgba(22,73,118,0.07)",
                        }}
                      >
                        {/* Item Name */}
                        <td style={{ padding: "10px 12px" }}>
                          <input
                            type="text"
                            value={item.itemName}
                            placeholder="Enter item name"
                            onChange={(e) =>
                              handleItemChange(cat.id, item.id, "itemName", e.target.value)
                            }
                            style={{
                              ...cellInput,
                              border: nameErr ? "1.5px solid #f87171" : "2px solid #4a6d8c",
                            }}
                            onFocus={(e) => {
                              e.target.style.border    = "2px solid #164976";
                              e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                            }}
                            onBlur={(e) => {
                              e.target.style.border    = nameErr ? "2px solid #f87171" : "2px solid #4a6d8c";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </td>

                        {/* Stock Level */}
                        <td style={{ padding: "10px 12px" }}>
                          <input
                            type="number"
                            value={item.stockLevel}
                            placeholder="0.00"
                            step="0.01"
                            onChange={(e) =>
                              handleItemChange(cat.id, item.id, "stockLevel", e.target.value)
                            }
                            style={{
                              ...cellInput,
                              border: levelErr ? "2px solid #f87171" : "2px solid #4a6d8c",
                            }}
                            onFocus={(e) => {
                              e.target.style.border    = "2px solid #164976";
                              e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                            }}
                            onBlur={(e) => {
                              e.target.style.border    = levelErr ? "2px solid #f87171" : "2px solid #4a6d8c";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </td>

                        {/* System Stock */}
                        <td style={{ padding: "10px 12px" }}>
                          <input
                            type="number"
                            value={item.systemStock}
                            placeholder="0.00"
                            step="0.01"
                            onChange={(e) =>
                              handleItemChange(cat.id, item.id, "systemStock", e.target.value)
                            }
                            style={{
                              ...cellInput,
                              border: sysErr ? "2px solid #f87171" : "2px solid #4a6d8c",
                            }}
                            onFocus={(e) => {
                              e.target.style.border    = "2px solid #164976";
                              e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                            }}
                            onBlur={(e) => {
                              e.target.style.border    = sysErr ? "2px solid #f87171" : "2px solid #4a6d8c";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </td>

                        {/* Variance — auto-calculated, read-only */}
                        <td style={{ padding: "10px 12px" }}>
                          <input
                            type="text"
                            value={variance.value}
                            readOnly
                            placeholder="Auto"
                            style={{
                              ...cellInput,
                              border:     "2px solid transparent",
                              background: "rgba(22,73,118,0.04)",
                              color:      variance.color,
                              fontWeight: variance.value ? 700 : 400,
                              cursor:     "default",
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Category comment */}
            <div
              style={{
                padding:    "12px 14px",
                borderTop:  "1px solid rgba(22,73,118,0.10)",
                background: "rgba(22,73,118,0.02)",
              }}
            >
              <label
                style={{
                  display:       "block",
                  fontSize:      "11px",
                  fontWeight:    700,
                  color:         "#4a6d8c",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom:  "8px",
                }}
              >
                {cat.name} — Comment
              </label>
              <textarea
                value={cat.comment}
                placeholder={`Add comments for ${cat.name}...`}
                rows={2}
                onChange={(e) => handleCommentChange(cat.id, e.target.value)}
                style={{
                  width:        "100%",
                  padding:      "10px 12px",
                  borderRadius: "8px",
                  border:       "2px solid #4a6d8c",
                  background:   "rgba(22,73,118,0.04)",
                  color:        "#0a1f33",
                  fontSize:     "14px",
                  fontFamily:   "'DM Sans', sans-serif",
                  outline:      "none",
                  resize:       "vertical",
                  transition:   "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.border    = "2px solid #164976";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22,73,118,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.border    = "2px solid #4a6d8c";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        ))}

        {/* Validation summary */}
        {Object.keys(errors).length > 0 && (
          <p className="text-xs text-red-400 font-medium">
            Please fill in all required item fields before proceeding.
          </p>
        )}
      </div>
    </StepShell>
  );
};

export default StockStatusStep;