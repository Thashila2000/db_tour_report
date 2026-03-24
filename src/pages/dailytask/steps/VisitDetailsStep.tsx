import { useState, useEffect, useRef } from "react";
import { FiMapPin, FiSearch, FiCamera, FiX, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";
import InputField from "../InputField";
import StepShell from "../StepShell";

export interface VisitDetailsData {
  actualVisitTime: string;
  region: string;
  area: string;
  dbName: string;
  dbCode: string;
  territoryName: string;
  accompaniedBy: string;
  accompaniedByImage: string | null;
  visitType: string;
  userName: string;
}

const STORAGE_KEY = "visitDetails";

const EMPTY: VisitDetailsData = {
  actualVisitTime: "",
  region: "",
  area: "",
  dbName: "",
  dbCode: "",
  territoryName: "",
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
  role?: string;
  roleValue?: string;
}

const VisitDetailsStep = ({
  totalSteps,
  stepNumber,
  initialData,
  onNext,
  username,
  onBack,
}: Props) => {
  
  const [formData, setFormData] = useState<VisitDetailsData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return initialData || EMPTY;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VisitDetailsData, string>>>({});
  const [isChecking, setIsChecking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to store uploaded file metadata for display
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string } | null>(null);

  const [regions, setRegions] = useState<string[]>([]);
  const [userRegionsString, setUserRegionsString] = useState<string>("");
  const [areas, setAreas] = useState<string[]>([]);
  const [distributors, setDistributors] = useState<{ name: string; code: string }[]>([]);
  const [territories, setTerritories] = useState<string[]>([]);

  const [filteredTerritories, setFilteredTerritories] = useState<string[]>([]);
  const [territorySearch, setTerritorySearch] = useState(formData.territoryName || "");
  const [showTerritoryDropdown, setShowTerritoryDropdown] = useState(false);
  const territoryDropdownRef = useRef<HTMLDivElement>(null);

  const [filteredDistributors, setFilteredDistributors] = useState<{ name: string; code: string }[]>([]);
  const [distributorSearch, setDistributorSearch] = useState(formData.dbName || "");
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);
  const distributorDropdownRef = useRef<HTMLDivElement>(null);

  const VISIT_TYPES = [
    "Routine Performance Review",
    "Stock Audit & Inventory Check",
    "Market Expansion Survey",
    "Distributor Relationship Meeting",
    "Training & Support Visit",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (distributorDropdownRef.current && !distributorDropdownRef.current.contains(event.target as Node)) {
        setShowDistributorDropdown(false);
      }
      if (territoryDropdownRef.current && !territoryDropdownRef.current.contains(event.target as Node)) {
        setShowTerritoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    localStorage.setItem("distributorSearch", distributorSearch);
    localStorage.setItem("territorySearch", territorySearch);
  }, [formData, distributorSearch, territorySearch]);

  useEffect(() => {
    if (!username) return;
    axios.get(`http://localhost:8080/api/users/my-regions?username=${username}`)
      .then((res) => {
        setRegions(res.data);
        setUserRegionsString(res.data.join(", "));
      }).catch(err => console.error(err));

    axios.get(`http://localhost:8080/api/users/my-areas?username=${username}`)
      .then((res) => setAreas(res.data)).catch(err => console.error(err));
  }, [username]);

  useEffect(() => {
    if (!userRegionsString) return;
    axios.get(`http://localhost:8080/api/distributors/by-regions?regions=${encodeURIComponent(userRegionsString)}`)
      .then((res) => {
        setDistributors(res.data);
        setFilteredDistributors(res.data);
      });
    axios.get<string[]>(`http://localhost:8080/api/distributors/territories/by-regions?regions=${encodeURIComponent(userRegionsString)}`)
      .then((res) => {
        const allTerrs = [...res.data].sort();
        setTerritories(allTerrs);
        setFilteredTerritories(allTerrs);
      });
  }, [userRegionsString]);

  useEffect(() => {
    setFilteredDistributors(distributors.filter(d => 
      d.name.toLowerCase().includes(distributorSearch.toLowerCase()) || 
      d.code.toLowerCase().includes(distributorSearch.toLowerCase())
    ));
  }, [distributorSearch, distributors]);

  useEffect(() => {
    setFilteredTerritories(territories.filter(t => t.toLowerCase().includes(territorySearch.toLowerCase())));
  }, [territorySearch, territories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Capture metadata
    setFileInfo({ name: file.name, type: file.type });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.6);
        setFormData(prev => ({ ...prev, accompaniedByImage: base64 }));
        
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
    };
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, accompaniedByImage: null });
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VisitDetailsData, string>> = {};
    const required: (keyof VisitDetailsData)[] = [
      "actualVisitTime", "region", "area", "dbName", 
      "dbCode", "territoryName", "accompaniedBy", "visitType", "accompaniedByImage"
    ];
    required.forEach(key => { if (!formData[key]) newErrors[key] = "Required"; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
  if (!validate()) return;

  setIsChecking(true);
  try {
    const response = await axios.get(
      `http://localhost:8080/api/visit-details/check-today/${encodeURIComponent(username)}/${formData.dbCode}`
    );

    if (response.data.exists === true) {
      Swal.fire({
        title: "Duplicate Entry",
        text: `A report for ${formData.dbName} has already been submitted today.`,
        icon: "warning",
        confirmButtonColor: "#164976",
      });
    } else {
      onNext({ ...formData, userName: username });
    }

  } catch (err: any) {
    console.error("Duplicate check failed:", err);
    Swal.fire({
      icon: 'error',
      title: 'Connection Error',
      text: 'Could not verify visit status with the server.',
    });
  } finally {
    setIsChecking(false);
  }
};
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: 700, color: "#4a6d8c",
    letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px",
  };

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "10px", 
    border: "1.5px solid #4a6d8c", background: "rgba(22,73,118,0.04)", 
    color: "#0a1f33", fontSize: "13px", fontWeight: 600, outline: "none",
  };

  return (
    <StepShell 
      stepNumber={stepNumber} 
      totalSteps={totalSteps} 
      title="Visit Details" 
      Icon={FiMapPin} 
      onNext={handleNextStep} 
      onBack={onBack}
      disabledNext={isChecking}
    >
      
      <div className="mb-4 w-1/2">
        <InputField
          label="Visit Time *"
          name="actualVisitTime"
          type="time"
          value={formData.actualVisitTime}
          onChange={(e) => setFormData({...formData, actualVisitTime: e.target.value})}
          error={errors.actualVisitTime}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label style={labelStyle}>Region *</label>
          <select 
            value={formData.region} 
            onChange={(e) => setFormData({...formData, region: e.target.value})} 
            style={{ ...selectStyle, border: errors.region ? "2px solid #f87171" : "2px solid #4a6d8c" }}
          >
            <option value="" disabled>Select Region</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Area *</label>
          <select 
            value={formData.area} 
            onChange={(e) => setFormData({...formData, area: e.target.value})} 
            style={{ ...selectStyle, border: errors.area ? "2px solid #f87171" : "2px solid #4a6d8c" }}
          >
            <option value="" disabled>Select Area</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div ref={distributorDropdownRef} className="relative">
          <label style={labelStyle}>DB Name *</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-[#4a6d8c]" size={16} />
            <input 
              type="text" 
              value={distributorSearch} 
              onChange={(e) => { setDistributorSearch(e.target.value); setShowDistributorDropdown(true); }} 
              onFocus={() => setShowDistributorDropdown(true)} 
              placeholder="Search distributor..." 
              style={{ ...selectStyle, paddingLeft: "36px", border: errors.dbName ? "2px solid #f87171" : "2px solid #4a6d8c" }} 
            />
          </div>
          {showDistributorDropdown && filteredDistributors.length > 0 && (
            <div 
              className="absolute left-0 right-0 mt-1 overflow-y-auto bg-white border border-[#4a6d8c] rounded-xl shadow-2xl"
              style={{ zIndex: 9999, maxHeight: "250px", top: "100%" }}
            >
              {filteredDistributors.map((d) => (
                <div 
                  key={d.code} 
                  onClick={() => { 
                    setFormData({...formData, dbName: d.name, dbCode: d.code}); 
                    setDistributorSearch(d.name); 
                    setShowDistributorDropdown(false); 
                  }} 
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-none transition-colors"
                >
                  <div className="text-[13px] font-bold text-[#164976]">{d.name}</div>
                  <div className="text-[11px] text-slate-500">Code: {d.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle}>DB Code *</label>
          <input type="text" value={formData.dbCode} readOnly style={{ ...selectStyle, background: "rgba(22,73,118,0.08)", cursor: "not-allowed" }} />
        </div>
      </div>

      <div className="mb-4 w-1/2 relative" ref={territoryDropdownRef}>
        <label style={labelStyle}>Territory Name *</label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-[#4a6d8c]" size={16} />
          <input 
            type="text" 
            value={territorySearch} 
            onChange={(e) => { setTerritorySearch(e.target.value); setShowTerritoryDropdown(true); }} 
            onFocus={() => setShowTerritoryDropdown(true)} 
            placeholder="Search territory..." 
            style={{ ...selectStyle, paddingLeft: "36px", border: errors.territoryName ? "2px solid #f87171" : "2px solid #4a6d8c" }} 
          />
        </div>
        {showTerritoryDropdown && filteredTerritories.length > 0 && (
          <div className="absolute top-full left-0 right-0 `z-[9999]` `max-h-[250px]`overflow-y-auto bg-white border border-[#4a6d8c] rounded-xl shadow-lg">
            {filteredTerritories.map((t) => (
              <div 
                key={t} 
                onClick={() => { 
                  setFormData({...formData, territoryName: t}); 
                  setTerritorySearch(t); 
                  setShowTerritoryDropdown(false); 
                }} 
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 text-[13px] font-semibold"
              >
                {t}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <InputField
              label="Accompanied By *"
              name="accompaniedBy"
              placeholder="e.g. Sales Rep – Route 03"
              value={formData.accompaniedBy}
              onChange={(e) => setFormData({...formData, accompaniedBy: e.target.value})}
              error={errors.accompaniedBy}
            />
          </div>
          <div className="relative pb-1">
            <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              style={{ 
                height: "42px", width: "48px", display: "flex", alignItems: "center", justifyContent: "center", 
                background: formData.accompaniedByImage ? "#10b981" : "rgba(22,73,118,0.08)", 
                color: formData.accompaniedByImage ? "white" : "#164976",
                border: errors.accompaniedByImage ? "2px solid #f87171" : (formData.accompaniedByImage ? "1.5px solid #10b981" : "1.5px solid #164976"), 
                borderRadius: "10px", cursor: "pointer" 
              }}
            >
              {formData.accompaniedByImage ? <FiCheckCircle size={20} /> : <FiCamera size={18} />}
            </button>
            {formData.accompaniedByImage && (
              <div 
                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 cursor-pointer shadow-sm"
                onClick={handleRemoveImage}
              >
                <FiX size={10} color="white" />
              </div>
            )}
          </div>
        </div>
        {/* Display File Metadata */}
        {fileInfo && (
          <div className="mt-1 text-[10px] text-slate-500 font-medium italic">
            {fileInfo.name} ({fileInfo.type.split('/')[1].toUpperCase()})
          </div>
        )}
        {errors.accompaniedByImage && <p className="text-[#f87171] text-[10px] mt-1 font-bold">Image is required *</p>}
      </div>

      <div className="mb-4">
        <label style={labelStyle}>Visit Type *</label>
        <select 
          value={formData.visitType} 
          onChange={(e) => setFormData({...formData, visitType: e.target.value})} 
          style={{ ...selectStyle, border: errors.visitType ? "2px solid #f87171" : "2px solid #4a6d8c" }}
        >
          <option value="" disabled>Select Visit Type</option>
          {VISIT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
    </StepShell>
  );
};

export default VisitDetailsStep;