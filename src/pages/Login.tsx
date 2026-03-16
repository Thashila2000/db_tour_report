import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiUser, FiLock, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", role: "", password: "", server: "" });

  const validate = () => {
    let newErrors = { username: "", role: "", password: "", server: "" };
    let isValid = true;
    if (!username.trim()) { newErrors.username = "Username is required"; isValid = false; }
    if (!role) { newErrors.role = "Please select a role"; isValid = false; }
    if (!password) { newErrors.password = "Password is required"; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        name: username,
        password,
        role,
      });

      const data = response.data;

      if (data && data.id) {
        localStorage.setItem("isAuth", "true");
        
        const userToStore = {
          id: data.id,
          name: data.name || username,
          role: data.role || role,
          region: data.region || "N/A" 
        };

        localStorage.setItem("user", JSON.stringify(userToStore));
        
        // Redirect based on role
        if (userToStore.role === "ADMIN") {
          navigate("/admin-dashboard");
        } else {
          navigate("/daily-task");
        }
      } else {
        setErrors(prev => ({ ...prev, server: "Authentication failed." }));
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, server: err.response?.data?.message || "Server error." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={titleStyle}>Welcome Back</h2>
          <p style={{ color: "#666", fontSize: "14px" }}>Please enter your details</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}><FiUser size={12}/> Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={inputStyle} 
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}><FiShield size={12}/> Select Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
              <option value="">-- Choose Role --</option>
              <option value="ASM">ASM</option>
              <option value="RSM">RSM</option>
              {/* Added Admin Role */}
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}><FiLock size={12}/> Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={inputStyle} 
              />
              <span onClick={() => setShowPassword(!showPassword)} style={eyeIconStyle}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>
          {errors.server && <div style={serverErrorBox}>{errors.server}</div>}
          <button type="submit" style={buttonStyle} disabled={loading}>{loading ? "Verifying..." : "Sign In"}</button>
        </form>
      </motion.div>
    </div>
  );
}

/* ---------- UI Styles (Kept Exactly Same) ---------- */
const containerStyle: React.CSSProperties = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f0f2f5",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "400px",
  background: "#ffffff",
  padding: "40px",
  borderRadius: "20px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#164976",
  fontSize: "24px",
  fontWeight: 800,
};

const fieldStyle: React.CSSProperties = { marginBottom: "20px" };

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "8px",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box"
};

const eyeIconStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  color: "#9ca3af",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  background: "#164976",
  color: "#fff",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "10px",
  boxShadow: "0 4px 6px -1px rgba(22, 73, 118, 0.3)",
};

const serverErrorBox: React.CSSProperties = {
  background: "#fef2f2",
  color: "#991b1b",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "13px",
  textAlign: "center",
  marginBottom: "15px",
  border: "1px solid #fecaca"
};