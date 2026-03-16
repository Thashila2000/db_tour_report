import { useState } from "react";
import { FiHome, FiUpload } from "react-icons/fi";
import InputField from "../InputField";
import StepShell from "../StepShell";

// ── Form data shape ───────────────────────────────────────────────────────────
export interface DBProfileData {
  dbOwnerContact:        string;
  coverageArea:          string;
  routeStrength:         string;
  salesTeam:             string;
  vehicleAvailability:   string;
  logBookUpdate:         string;
  territoryRouteMap:     "yes" | "no" | "";
  routeMapImage:         File | null;
  routeMapImageBase64?:  string | null;
  routePlan:             "yes" | "no" | "";
  routePlanImage:        File | null;
  routePlanImageBase64?: string | null;
  creditBillCount:       string;
  creditBillTotal:       string;
  chequeCount:           string;
  chequeTotal:           string;
  cashTotal:             string;
  progressSheetUpdate:   string;
  skuSalesUpdate:        "low" | "high" | "";
  skuSalesComment:       string;
  storeLength:           string;
  storeWidth:            string;
  storeCondition:        string;
  marketReturnCondition: string;
  tableCount:            string;
  chairCount:            string;
  storeComments:         string;
}

// ── Image Compression Utility ────────────────────────────────────────────────
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
    };
    reader.onerror = (err) => reject(err);
  });
};

const EMPTY: DBProfileData = {
  dbOwnerContact:        "",
  coverageArea:          "",
  routeStrength:         "",
  salesTeam:             "",
  vehicleAvailability:   "",
  logBookUpdate:         "",
  territoryRouteMap:     "",
  routeMapImage:         null,
  routePlan:             "",
  routePlanImage:        null,
  creditBillCount:       "",
  creditBillTotal:       "",
  chequeCount:           "",
  chequeTotal:           "",
  cashTotal:             "",
  progressSheetUpdate:   "",
  skuSalesUpdate:        "",
  skuSalesComment:       "",
  storeLength:           "",
  storeWidth:            "",
  storeCondition:        "",
  marketReturnCondition: "",
  tableCount:            "",
  chairCount:            "",
  storeComments:         "",
};

interface Props {
  totalSteps:   number;
  stepNumber:   number;
  initialData?: DBProfileData;
  onNext:       (data: DBProfileData) => void;
  onBack:       () => void;
  username:     string;
}

// ── Internal Components ──────────────────────────────────────────────────────
const RadioField = ({ label, value, onChange, error, options }: any) => (
  <div className="flex flex-col gap-2">
    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a6d8c" }}>{label}</span>
    <div style={{ display: "flex", gap: "1.5rem" }}>
      {options.map((option: any) => (
        <label key={option.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: value === option.value ? 600 : 400, color: value === option.value ? "#164976" : "#6e90b0" }}>
          <div onClick={() => onChange(option.value)} style={{ width: "18px", height: "18px", borderRadius: "50%", border: value === option.value ? "2px solid #164976" : "2px solid #4a6d8c", background: value === option.value ? "#164976" : "#f5f8fc", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", flexShrink: 0 }}>
            {value === option.value && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}
          </div>
          {option.label}
        </label>
      ))}
    </div>
    {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
  </div>
);

const FileUploadField = ({ label, name, onChange, fileName }: any) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a6d8c" }}>{label}</span>
    <label htmlFor={name} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", border: "1.5px dashed #4a6d8c", background: "rgba(22,73,118,0.03)", cursor: "pointer", fontSize: "13px", color: fileName ? "#164976" : "#94a9be" }}>
      <FiUpload size={15} style={{ color: "#164976" }} />
      {fileName || "Click to upload image"}
      <input id={name} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </label>
  </div>
);

const TextAreaField = ({ label, name, placeholder, value, onChange, error }: any) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a6d8c" }}>{label}</label>
    <textarea 
      id={name} 
      name={name} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange} 
      rows={3} 
      style={{ 
        width: "100%", 
        padding: "12px", 
        borderRadius: "12px", 
        border: error ? "1.5px solid #f87171" : "1.5px solid #4a6d8c", 
        background: "rgba(22,73,118,0.04)", 
        color: "#0f2d4a", 
        fontSize: "13px", 
        outline: "none", 
        resize: "vertical" 
      }} 
    />
    {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
  </div>
);

const SectionDivider = ({ title }: { title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "1.5rem 0 1rem", paddingBottom: "8px", borderBottom: "1.5px solid rgba(22,73,118,0.10)" }}>
    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "#164976" }}>{title}</span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const DBProfileStep = ({ totalSteps, stepNumber, initialData, onNext, onBack, username }: Props) => {
  const [formData, setFormData] = useState<DBProfileData>(initialData ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof DBProfileData, string>>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Number validation helper
  const isValidNumber = (value: string): boolean => {
    return /^\d*\.?\d*$/.test(value); // Allows digits and optional decimal point
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // ✅ Fields that must be numbers only
    const numberFields = [
      "creditBillCount", "creditBillTotal", "chequeCount", 
      "chequeTotal", "cashTotal", "storeLength", "storeWidth", 
      "tableCount", "chairCount"
    ];
    
    // ✅ Validate number fields
    if (numberFields.includes(name)) {
      if (value !== "" && !isValidNumber(value)) {
        return; // Don't update if not a valid number
      }
    }
    
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof DBProfileData]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleRadio = (field: "territoryRouteMap" | "routePlan" | "skuSalesUpdate", val: string) => {
    setFormData((p) => ({ 
      ...p, 
      [field]: val, 
      ...(field === "territoryRouteMap" && val === "no" ? { routeMapImage: null } : {}),
      ...(field === "routePlan" && val === "no" ? { routePlanImage: null } : {})
    }));
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validate = (): boolean => {
    const newErrors: any = {};
    
    // Required text fields
    const reqKeys: (keyof DBProfileData)[] = [
      "dbOwnerContact", "coverageArea", "routeStrength", "salesTeam", 
      "vehicleAvailability", "logBookUpdate", "territoryRouteMap", "routePlan", 
      "creditBillCount", "creditBillTotal", "chequeCount", "chequeTotal", 
      "cashTotal", "progressSheetUpdate", "skuSalesUpdate", "skuSalesComment",
      "storeLength", "storeWidth", "storeCondition", "marketReturnCondition", 
      "tableCount", "chairCount"
    ];
    
    reqKeys.forEach(k => { 
      if (!formData[k]) {
        newErrors[k] = "Required";
      }
    });
    
    // ✅ Validate number fields contain valid numbers
    const numberFields: (keyof DBProfileData)[] = [
      "creditBillCount", "creditBillTotal", "chequeCount", 
      "chequeTotal", "cashTotal", "storeLength", "storeWidth", 
      "tableCount", "chairCount"
    ];
    
    numberFields.forEach(field => {
      if (formData[field] && !isValidNumber(formData[field] as string)) {
        newErrors[field] = "Must be a valid number";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    
    setIsProcessing(true);
    try {
      const updatedData = { ...formData };
      
      // Compress Route Map
      if (formData.territoryRouteMap === "yes" && formData.routeMapImage) {
        updatedData.routeMapImageBase64 = await compressImage(formData.routeMapImage);
      }
      
      // Compress Route Plan
      if (formData.routePlan === "yes" && formData.routePlanImage) {
        updatedData.routePlanImageBase64 = await compressImage(formData.routePlanImage);
      }

      // Add userName
      (updatedData as any).userName = username;

      // Pass to parent
      onNext(updatedData);
    } catch (err) {
      console.error("Compression Error:", err);
      alert("Error processing images. Try a different file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StepShell stepNumber={stepNumber} totalSteps={totalSteps} title="DB Profile" Icon={FiHome} onNext={handleNext} onBack={onBack}>
      {/* Loading Overlay */}
      {isProcessing && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999
        }}>
          <div style={{
            background: "white", padding: "30px 50px", borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)", textAlign: "center"
          }}>
            <div style={{
              width: "40px", height: "40px", border: "4px solid #f3f3f3",
              borderTop: "4px solid #164976", borderRadius: "50%",
              animation: "spin 1s linear infinite", margin: "0 auto 15px"
            }} />
            <p style={{ color: "#164976", fontWeight: 600, fontSize: "14px" }}>
              Compressing images & saving...
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="form-grid-2">
        <InputField label="DB Owner Contact" name="dbOwnerContact" placeholder="e.g. 077-1234567" value={formData.dbOwnerContact} onChange={handleChange} error={errors.dbOwnerContact} />
        <InputField label="Coverage Area" name="coverageArea" placeholder="e.g. Colombo South" value={formData.coverageArea} onChange={handleChange} error={errors.coverageArea} />
      </div>
      <div className="form-grid-2">
        <InputField label="Route Strength" name="routeStrength" placeholder="e.g. 5 routes" value={formData.routeStrength} onChange={handleChange} error={errors.routeStrength} />
        <InputField label="Sales Team Attached" name="salesTeam" placeholder="e.g. 8 reps" value={formData.salesTeam} onChange={handleChange} error={errors.salesTeam} />
      </div>
      <div className="form-grid-2">
        <InputField label="Vehicle Availability" name="vehicleAvailability" placeholder="e.g. 3 trucks" value={formData.vehicleAvailability} onChange={handleChange} error={errors.vehicleAvailability} />
        <InputField label="Log Book Update" name="logBookUpdate" placeholder="e.g. Up to date" value={formData.logBookUpdate} onChange={handleChange} error={errors.logBookUpdate} />
      </div>

      <RadioField 
        label="Territory Route Map" 
        value={formData.territoryRouteMap} 
        onChange={(v:any) => handleRadio("territoryRouteMap", v)} 
        error={errors.territoryRouteMap}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ]}
      />
      {formData.territoryRouteMap === "yes" && <FileUploadField label="Upload Route Map" name="routeMapImage" fileName={formData.routeMapImage?.name ?? ""} onChange={(f:any) => setFormData({...formData, routeMapImage: f})} />}

      <RadioField 
        label="Route Plan" 
        value={formData.routePlan} 
        onChange={(v:any) => handleRadio("routePlan", v)} 
        error={errors.routePlan}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ]}
      />
      {formData.routePlan === "yes" && <FileUploadField label="Upload Route Plan" name="routePlanImage" fileName={formData.routePlanImage?.name ?? ""} onChange={(f:any) => setFormData({...formData, routePlanImage: f})} />}

      <div className="form-grid-2">
        <InputField 
          label="Credit Bill Count" 
          name="creditBillCount" 
          placeholder="e.g. 12"
          value={formData.creditBillCount} 
          onChange={handleChange} 
          error={errors.creditBillCount} 
        />
        <InputField 
          label="Credit Bill Total" 
          name="creditBillTotal" 
          placeholder="e.g. 250000"
          value={formData.creditBillTotal} 
          onChange={handleChange} 
          error={errors.creditBillTotal} 
        />
      </div>
      <div className="form-grid-2">
        <InputField 
          label="Cheque Count" 
          name="chequeCount" 
          placeholder="e.g. 4"
          value={formData.chequeCount} 
          onChange={handleChange} 
          error={errors.chequeCount} 
        />
        <InputField 
          label="Cheque Total" 
          name="chequeTotal" 
          placeholder="e.g. 180000"
          value={formData.chequeTotal} 
          onChange={handleChange} 
          error={errors.chequeTotal} 
        />
      </div>
      <InputField 
        label="Cash Total" 
        name="cashTotal" 
        placeholder="e.g. 45000"
        value={formData.cashTotal} 
        onChange={handleChange} 
        error={errors.cashTotal} 
      />

      {/* ✅ NEW SECTION: Progress Sheet Update */}
      <SectionDivider title="Progress & SKU Updates" />
      
      <TextAreaField 
        label="Progress Sheet Update" 
        name="progressSheetUpdate" 
        placeholder="Enter progress sheet update comment..."
        value={formData.progressSheetUpdate} 
        onChange={handleChange}
        error={errors.progressSheetUpdate}
      />

      {/* ✅ NEW: SKU Sales Update */}
      <RadioField 
        label="SKU Sales Update" 
        value={formData.skuSalesUpdate} 
        onChange={(v:any) => handleRadio("skuSalesUpdate", v)} 
        error={errors.skuSalesUpdate}
        options={[
          { value: "low", label: "Low" },
          { value: "high", label: "High" }
        ]}
      />

      {/* ✅ NEW: SKU Sales Comment */}
      <TextAreaField 
        label="SKU Sales Comment" 
        name="skuSalesComment" 
        placeholder="Enter SKU sales comment..."
        value={formData.skuSalesComment} 
        onChange={handleChange}
        error={errors.skuSalesComment}
      />

      <SectionDivider title="1.1 Stores" />
      <div className="form-grid-2">
        <InputField 
          label="Length (ft)" 
          name="storeLength" 
          placeholder="e.g. 40"
          value={formData.storeLength} 
          onChange={handleChange} 
          error={errors.storeLength} 
        />
        <InputField 
          label="Width (ft)" 
          name="storeWidth" 
          placeholder="e.g. 20"
          value={formData.storeWidth} 
          onChange={handleChange} 
          error={errors.storeWidth} 
        />
      </div>
      <InputField label="Store Condition" name="storeCondition" placeholder="e.g. Good / Needs improvement" value={formData.storeCondition} onChange={handleChange} error={errors.storeCondition} />
      <InputField label="Market Return Condition" name="marketReturnCondition" placeholder="e.g. Segregated and labelled" value={formData.marketReturnCondition} onChange={handleChange} error={errors.marketReturnCondition} />
      <div className="form-grid-2">
        <InputField 
          label="Table Count" 
          name="tableCount" 
          placeholder="e.g. 2"
          value={formData.tableCount} 
          onChange={handleChange} 
          error={errors.tableCount} 
        />
        <InputField 
          label="Chair Count" 
          name="chairCount" 
          placeholder="e.g. 6"
          value={formData.chairCount} 
          onChange={handleChange} 
          error={errors.chairCount} 
        />
      </div>
      <TextAreaField label="Comments" name="storeComments" placeholder="Enter any additional comments about the store" value={formData.storeComments} onChange={handleChange} error={errors.storeComments} />
    </StepShell>
  );
};

export default DBProfileStep;