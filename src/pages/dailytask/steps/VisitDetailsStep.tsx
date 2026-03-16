import { useState, useEffect, useRef } from "react";
import { FiMapPin, FiSearch } from "react-icons/fi";
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

  const [regions, setRegions] = useState<string[]>([]);
  const [userRegionsString, setUserRegionsString] = useState<string>("");  // Comma-separated
  const [areas, setAreas] = useState<string[]>([]);
  const [distributors, setDistributors] = useState<{ name: string; code: string }[]>([]);
  const [territories, setTerritories] = useState<string[]>([]);
  
  // Territory search states
  const [filteredTerritories, setFilteredTerritories] = useState<string[]>([]);
  const [territorySearch, setTerritorySearch] = useState("");
  const [showTerritoryDropdown, setShowTerritoryDropdown] = useState(false);
  const territoryDropdownRef = useRef<HTMLDivElement>(null);

  // Distributor search states
  const [filteredDistributors, setFilteredDistributors] = useState<{ name: string; code: string }[]>([]);
  const [distributorSearch, setDistributorSearch] = useState("");
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);
  const distributorDropdownRef = useRef<HTMLDivElement>(null);

  // Load regions for logged-in user
  useEffect(() => {
    if (!username) return;
    
    axios.get(`http://localhost:8080/api/users/my-regions?username=${username}`)
      .then(res => {
        const userRegions: string[] = res.data;
        setRegions(userRegions);
        
        // Store as comma-separated string for API calls
        const regionsString = userRegions.join(", ");
        setUserRegionsString(regionsString);
        
        // Auto-select if only 1 region
        if (userRegions.length === 1) {
          setFormData(prev => ({ ...prev, region: userRegions[0] }));
        }
      })
      .catch(err => console.error("Regions error:", err));
  }, [username]);

  // Load areas for logged-in user
  useEffect(() => {
    if (!username) return;
    
    axios.get(`http://localhost:8080/api/users/my-areas?username=${username}`)
      .then(res => {
        const userAreas: string[] = res.data;
        setAreas(userAreas);
        
        // Auto-select if only 1 area
        if (userAreas.length === 1) {
          setFormData(prev => ({ ...prev, area: userAreas[0] }));
        }
      })
      .catch(err => console.error("Areas error:", err));
  }, [username]);

  // Load distributors for ALL user's regions (not just selected region)
  useEffect(() => {
    if (!userRegionsString) return;
    
    axios.get(`http://localhost:8080/api/distributors/by-regions?regions=${encodeURIComponent(userRegionsString)}`)
      .then(res => {
        const allDistributors = res.data;
        setDistributors(allDistributors);
        setFilteredDistributors(allDistributors);
      })
      .catch(err => console.error("Distributors error:", err));
  }, [userRegionsString]);

  // Load territories from ALL user's regions (not just selected region)
 useEffect(() => {
  if (!userRegionsString) return;

  axios
    .get<string[]>(`http://localhost:8080/api/distributors/territories/by-regions?regions=${encodeURIComponent(userRegionsString)}`)
    .then(res => {
      const allTerritories = [...res.data].sort(); // already string[]
      setTerritories(allTerritories);
      setFilteredTerritories(allTerritories);
    })
    .catch(err => console.error("Territories error:", err));

}, [userRegionsString]);

  // Filter distributors based on search
  useEffect(() => {
    if (distributorSearch.trim() === "") {
      setFilteredDistributors(distributors);
    } else {
      const filtered = distributors.filter(d => 
        d.name.toLowerCase().includes(distributorSearch.toLowerCase()) ||
        d.code.toLowerCase().includes(distributorSearch.toLowerCase())
      );
      setFilteredDistributors(filtered);
    }
  }, [distributorSearch, distributors]);

  // Filter territories based on search
  useEffect(() => {
    if (territorySearch.trim() === "") {
      setFilteredTerritories(territories);
    } else {
      const filtered = territories.filter(t => 
        t.toLowerCase().includes(territorySearch.toLowerCase())
      );
      setFilteredTerritories(filtered);
    }
  }, [territorySearch, territories]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (territoryDropdownRef.current && !territoryDropdownRef.current.contains(event.target as Node)) {
        setShowTerritoryDropdown(false);
      }
      if (distributorDropdownRef.current && !distributorDropdownRef.current.contains(event.target as Node)) {
        setShowDistributorDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof VisitDetailsData]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // ✅ Handle distributor selection from dropdown
  const handleDistributorSelect = (distributor: { name: string; code: string }) => {
    setFormData(prev => ({
      ...prev,
      dbName: distributor.name,
      dbCode: distributor.code
    }));
    setDistributorSearch(distributor.name);
    setShowDistributorDropdown(false);
    if (errors.dbName || errors.dbCode) {
      setErrors(prev => ({ ...prev, dbName: "", dbCode: "" }));
    }
  };

  // Handle territory selection from dropdown
  const handleTerritorySelect = (value: string) => {
    setFormData(prev => ({ ...prev, territoryName: value }));
    setTerritorySearch(value);
    setShowTerritoryDropdown(false);
    if (errors.territoryName) {
      setErrors(prev => ({ ...prev, territoryName: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VisitDetailsData, string>> = {};
    const required: [keyof VisitDetailsData, string][] = [
      ["region", "Region"],
      ["area", "Area"],
      ["dbName", "DB Name"],
      ["dbCode", "DB Code"],
      ["territoryName", "Territory Name"],
      ["visitedBy", "Visited By"],
      ["accompaniedBy", "Accompanied By"],
      ["visitType", "Visit Type"],
    ];
    required.forEach(([key, label]) => {
      if (!formData[key]) newErrors[key] = `${label} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      const visitDetailsData: VisitDetailsData = {
        ...formData,
        userName: username
      };
      
      console.log("📦 Visit Details with userName:", visitDetailsData);
      onNext(visitDetailsData);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #4a6d8c",
    background: "rgba(22,73,118,0.04)",
    color: "#0a1f33",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: 600,
    cursor: "pointer",
    appearance: "auto",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "#4a6d8c",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: "8px",
  };

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Visit Details"
      Icon={FiMapPin}
      onNext={handleNext}
      onBack={onBack}
    >
      {/* Region & Area dropdowns */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label style={labelStyle}>Region *</label>
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            style={{
              ...inputStyle,
              border: errors.region ? "1.5px solid #f87171" : "1.5px solid #4a6d8c",
            }}
          >
            <option value="">Select Region</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.region && <span className="text-red-500 text-xs mt-1 block">{errors.region}</span>}
        </div>

        <div>
          <label style={labelStyle}>Area *</label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            style={{
              ...inputStyle,
              border: errors.area ? "1.5px solid #f87171" : "1.5px solid #4a6d8c",
            }}
          >
            <option value="">Select Area</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          {errors.area && <span className="text-red-500 text-xs mt-1 block">{errors.area}</span>}
        </div>
      </div>

      {/* ✅ Distributor Searchable Dropdown */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div ref={distributorDropdownRef} style={{ position: "relative" }}>
          <label style={labelStyle}>DB Name *</label>
          <div style={{ position: "relative" }}>
            <FiSearch 
              style={{ 
                position: "absolute", 
                left: "12px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "#4a6d8c",
                pointerEvents: "none"
              }} 
              size={16}
            />
            <input
              type="text"
              value={distributorSearch}
              onChange={(e) => {
                setDistributorSearch(e.target.value);
                setShowDistributorDropdown(true);
              }}
              onFocus={() => setShowDistributorDropdown(true)}
              placeholder="Search distributor..."
              style={{
                ...inputStyle,
                paddingLeft: "36px",
                cursor: "text",
                border: errors.dbName ? "1.5px solid #f87171" : "1.5px solid #4a6d8c",
              }}
            />
          </div>

          {/* Dropdown */}
          {showDistributorDropdown && filteredDistributors.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              maxHeight: "200px",
              overflowY: "auto",
              background: "white",
              border: "1.5px solid #4a6d8c",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 1000,
            }}>
              {filteredDistributors.map((d) => (
                <div
                  key={d.code}
                  onClick={() => handleDistributorSelect(d)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    color: "#0a1f33",
                    transition: "background 0.15s ease",
                    borderBottom: "1px solid rgba(74,109,140,0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(22,73,118,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <div>{d.name}</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                    Code: {d.code}
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors.dbName && <span className="text-red-500 text-xs mt-1 block">{errors.dbName}</span>}
        </div>

        <div>
          <label style={labelStyle}>DB Code *</label>
          <input
            type="text"
            name="dbCode"
            value={formData.dbCode}
            readOnly
            style={{
              ...inputStyle,
              background: "rgba(22,73,118,0.06)",
              cursor: "not-allowed",
              border: errors.dbCode ? "1.5px solid #f87171" : "1.5px solid #4a6d8c",
            }}
          />
          {errors.dbCode && <span className="text-red-500 text-xs mt-1 block">{errors.dbCode}</span>}
        </div>
      </div>

      {/* Territory Searchable Dropdown */}
      <div className="mb-4 w-1/2" ref={territoryDropdownRef} style={{ position: "relative" }}>
        <label style={labelStyle}>Territory Name *</label>
        <div style={{ position: "relative" }}>
          <FiSearch 
            style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "#4a6d8c",
              pointerEvents: "none"
            }} 
            size={16}
          />
          <input
            type="text"
            value={territorySearch}
            onChange={(e) => {
              setTerritorySearch(e.target.value);
              setShowTerritoryDropdown(true);
            }}
            onFocus={() => setShowTerritoryDropdown(true)}
            placeholder="Search territory..."
            style={{
              ...inputStyle,
              paddingLeft: "36px",
              cursor: "text",
              border: errors.territoryName ? "1.5px solid #f87171" : "1.5px solid #4a6d8c",
            }}
          />
        </div>

        {/* Dropdown */}
        {showTerritoryDropdown && filteredTerritories.length > 0 && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            background: "white",
            border: "1.5px solid #4a6d8c",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}>
            {filteredTerritories.map((t) => (
              <div
                key={t}
                onClick={() => handleTerritorySelect(t)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: "#0a1f33",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(22,73,118,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                }}
              >
                {t}
              </div>
            ))}
          </div>
        )}

        {errors.territoryName && (
          <span className="text-red-500 text-xs mt-1 block">{errors.territoryName}</span>
        )}
      </div>

      {/* Other text fields */}
      <InputField
        label="Visited By"
        name="visitedBy"
        placeholder="e.g. ASM – Colombo South"
        value={formData.visitedBy}
        onChange={handleChange}
        error={errors.visitedBy}
      />

      <InputField
        label="Accompanied By"
        name="accompaniedBy"
        placeholder="e.g. Sales Rep – Route 03"
        value={formData.accompaniedBy}
        onChange={handleChange}
        error={errors.accompaniedBy}
      />

      <InputField
        label="Visit Type"
        name="visitType"
        placeholder="e.g. Routine Performance & Stock Review"
        value={formData.visitType}
        onChange={handleChange}
        error={errors.visitType}
      />
    </StepShell>
  );
};

export default VisitDetailsStep;
