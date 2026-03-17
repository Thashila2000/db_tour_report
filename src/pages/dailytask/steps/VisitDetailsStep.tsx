import { useState, useEffect, useRef } from "react";
import { FiMapPin, FiSearch, FiCamera, FiX } from "react-icons/fi";
import axios from "axios";
import InputField from "../InputField";
import StepShell from "../StepShell";

export interface VisitDetailsData {
  region: string;
  area: string;
  dbName: string;
  dbCode: string;
  territoryName: string;
  visitedBy: string;
  accompaniedBy: string;
  accompaniedByImage: string | null; // ✅ New field
  visitType: string;
  userName: string;
}

const EMPTY: VisitDetailsData = {
  region: "",
  area: "",
  dbName: "",
  dbCode: "",
  territoryName: "",
  visitedBy: "",
  accompaniedBy: "",
  accompaniedByImage: null,
  visitType: "",
  userName: "",
};

interface Props {
  totalSteps: number;
  stepNumber: number;
  initialData?: VisitDetailsData;
  onNext: (data: VisitDetailsData) => void;
  onBack: () => void;
  username: string;
  role: string;
  roleValue: string;
}

const VisitDetailsStep = ({
  totalSteps,
  stepNumber,
  initialData,
  onNext,
  username,
  onBack,
}: Props) => {
  const [formData, setFormData] = useState<VisitDetailsData>(initialData ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof VisitDetailsData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for dynamic data
  const [regions, setRegions] = useState<string[]>([]);
  const [userRegionsString, setUserRegionsString] = useState<string>(""); 
  const [areas, setAreas] = useState<string[]>([]);
  const [distributors, setDistributors] = useState<{ name: string; code: string }[]>([]);
  const [territories, setTerritories] = useState<string[]>([]);
  
  // Search and Dropdown states
  const [filteredTerritories, setFilteredTerritories] = useState<string[]>([]);
  const [territorySearch, setTerritorySearch] = useState(initialData?.territoryName ?? "");
  const [showTerritoryDropdown, setShowTerritoryDropdown] = useState(false);
  const territoryDropdownRef = useRef<HTMLDivElement>(null);

  const [filteredDistributors, setFilteredDistributors] = useState<{ name: string; code: string }[]>([]);
  const [distributorSearch, setDistributorSearch] = useState(initialData?.dbName ?? "");
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);
  const distributorDropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Image Compression Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600; // Optimal for Base64 storage
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress to 0.7 quality to keep string length short
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        setFormData(prev => ({ ...prev, accompaniedByImage: base64 }));
      };
    };
  };

  // Logic to load data (Regions, Areas, etc.) remains same as your original
  useEffect(() => {
    if (formData.dbName) setDistributorSearch(formData.dbName);
    if (formData.territoryName) setTerritorySearch(formData.territoryName);
  }, [formData.dbName, formData.territoryName]);

  useEffect(() => {
    if (!username) return;
    axios.get(`http://localhost:8080/api/users/my-regions?username=${username}`)
      .then(res => {
        setRegions(res.data);
        setUserRegionsString(res.data.join(", "));
        if (res.data.length === 1 && !formData.region) {
          setFormData(prev => ({ ...prev, region: res.data[0] }));
        }
      });
  }, [username]);

  useEffect(() => {
    if (!username) return;
    axios.get(`http://localhost:8080/api/users/my-areas?username=${username}`)
      .then(res => {
        setAreas(res.data);
        if (res.data.length === 1 && !formData.area) {
          setFormData(prev => ({ ...prev, area: res.data[0] }));
        }
      });
  }, [username]);

  useEffect(() => {
    if (!userRegionsString) return;
    axios.get(`http://localhost:8080/api/distributors/by-regions?regions=${encodeURIComponent(userRegionsString)}`)
      .then(res => {
        setDistributors(res.data);
        setFilteredDistributors(res.data);
      });
    axios.get<string[]>(`http://localhost:8080/api/distributors/territories/by-regions?regions=${encodeURIComponent(userRegionsString)}`)
      .then(res => {
        const allTerrs = [...res.data].sort();
        setTerritories(allTerrs);
        setFilteredTerritories(allTerrs);
      });
  }, [userRegionsString]);

  useEffect(() => {
    const filtered = distributors.filter(d => 
      d.name.toLowerCase().includes(distributorSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(distributorSearch.toLowerCase())
    );
    setFilteredDistributors(filtered);
  }, [distributorSearch, distributors]);

  useEffect(() => {
    const filtered = territories.filter(t => 
      t.toLowerCase().includes(territorySearch.toLowerCase())
    );
    setFilteredTerritories(filtered);
  }, [territorySearch, territories]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VisitDetailsData, string>> = {};
    const required: (keyof VisitDetailsData)[] = ["region", "area", "dbName", "dbCode", "territoryName", "visitedBy", "accompaniedBy", "visitType"];
    required.forEach(key => { if (!formData[key]) newErrors[key] = "Required field"; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: 700, color: "#4a6d8c",
    letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #4a6d8c",
    background: "rgba(22,73,118,0.04)", color: "#0a1f33", fontSize: "13px", fontWeight: 600, outline: "none",
  };

  return (
    <StepShell stepNumber={stepNumber} totalSteps={totalSteps} title="Visit Details" Icon={FiMapPin} onNext={() => validate() && onNext({ ...formData, userName: username })} onBack={onBack}>
      
      {/* Region & Area Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label style={labelStyle}>Region *</label>
          <select name="region" value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} style={{ ...inputStyle, border: errors.region ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }}>
            <option value="">Select Region</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Area *</label>
          <select name="area" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} style={{ ...inputStyle, border: errors.area ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }}>
            <option value="">Select Area</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Distributor Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div ref={distributorDropdownRef} style={{ position: "relative" }}>
          <label style={labelStyle}>DB Name *</label>
          <div style={{ position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#4a6d8c" }} size={16} />
            <input type="text" value={distributorSearch} onChange={(e) => { setDistributorSearch(e.target.value); setShowDistributorDropdown(true); }} onFocus={() => setShowDistributorDropdown(true)} placeholder="Search distributor..." style={{ ...inputStyle, paddingLeft: "36px", border: errors.dbName ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} />
          </div>
          {showDistributorDropdown && filteredDistributors.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, maxHeight: "200px", overflowY: "auto", background: "white", border: "1.5px solid #4a6d8c", borderRadius: "10px", zIndex: 1000 }}>
              {filteredDistributors.map((d) => (
                <div key={d.code} onClick={() => { setFormData({...formData, dbName: d.name, dbCode: d.code}); setDistributorSearch(d.name); setShowDistributorDropdown(false); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none">
                  <div className="text-[13px] font-semibold text-slate-800">{d.name}</div>
                  <div className="text-[11px] text-slate-500">Code: {d.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle}>DB Code *</label>
          <input type="text" value={formData.dbCode} readOnly style={{ ...inputStyle, background: "rgba(22,73,118,0.08)", cursor: "not-allowed" }} />
        </div>
      </div>

      <div className="mb-4 w-1/2" ref={territoryDropdownRef} style={{ position: "relative" }}>
        <label style={labelStyle}>Territory Name *</label>
        <div style={{ position: "relative" }}>
          <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#4a6d8c" }} size={16} />
          <input type="text" value={territorySearch} onChange={(e) => { setTerritorySearch(e.target.value); setShowTerritoryDropdown(true); }} onFocus={() => setShowTerritoryDropdown(true)} placeholder="Search territory..." style={{ ...inputStyle, paddingLeft: "36px", border: errors.territoryName ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} />
        </div>
        {showTerritoryDropdown && filteredTerritories.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, maxHeight: "200px", overflowY: "auto", background: "white", border: "1.5px solid #4a6d8c", borderRadius: "10px", zIndex: 1000 }}>
            {filteredTerritories.map((t) => (
              <div key={t} onClick={() => { setFormData({...formData, territoryName: t}); setTerritorySearch(t); setShowTerritoryDropdown(false); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 text-[13px] font-semibold">
                {t}
              </div>
            ))}
          </div>
        )}
      </div>

      <InputField label="Visited By" name="visitedBy" placeholder="e.g. ASM – Colombo South" value={formData.visitedBy} onChange={(e) => setFormData({...formData, visitedBy: e.target.value})} error={errors.visitedBy} />
      
      {/* Accompanied By + Compressed Image Input */}
      <div className="mb-4">
        <label style={labelStyle}>Accompanied By *</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="e.g. Sales Rep – Route 03" 
              value={formData.accompaniedBy} 
              onChange={(e) => setFormData({...formData, accompaniedBy: e.target.value})} 
              style={{ ...inputStyle, border: errors.accompaniedBy ? "1.5px solid #f87171" : "1.5px solid #4a6d8c" }} 
            />
            {errors.accompaniedBy && <span className="text-red-500 text-[10px] mt-1 block">{errors.accompaniedBy}</span>}
          </div>
          
          <div style={{ position: "relative" }}>
            <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleImageUpload} style={{ display: "none" }} />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              style={{ 
                height: "38px", width: "45px", display: "flex", alignItems: "center", justifyContent: "center", 
                background: formData.accompaniedByImage ? "#164976" : "rgba(22,73,118,0.08)", 
                color: formData.accompaniedByImage ? "white" : "#164976",
                border: "1.5px solid #164976", borderRadius: "10px", cursor: "pointer" 
              }}
            >
              <FiCamera size={18} />
            </button>
            {formData.accompaniedByImage && (
              <div style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", borderRadius: "50%", padding: "2px", cursor: "pointer" }} onClick={() => setFormData({...formData, accompaniedByImage: null})}>
                <FiX size={10} color="white" />
              </div>
            )}
          </div>
        </div>
        {formData.accompaniedByImage && (
          <img src={formData.accompaniedByImage} alt="Preview" style={{ marginTop: "8px", width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid #4a6d8c" }} />
        )}
      </div>

      <InputField label="Visit Type" name="visitType" placeholder="e.g. Routine Performance & Stock Review" value={formData.visitType} onChange={(e) => setFormData({...formData, visitType: e.target.value})} error={errors.visitType} />
    </StepShell>
  );
};

export default VisitDetailsStep;