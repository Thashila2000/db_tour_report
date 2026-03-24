import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiUser, FiLock, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: false, role: false, password: false });

  const validate = () => {
    const errors = {
      username: !username.trim(),
      role: !role,
      password: !password,
    };
    setFieldErrors(errors);

    if (errors.username || errors.role || errors.password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all fields before signing in.",
        confirmButtonColor: "#164976",
      });
      return false;
    }
    return true;
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
        
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          timer: 1500,
          text: `Welcome back, ${userToStore.name}!`,
          confirmButtonColor: "#164976",
          showConfirmButton: false,
        });

        navigate(userToStore.role === "ADMIN" ? "/admin-dashboard" : "/daily-task");
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid credentials.",
        confirmButtonColor: "#164976",
      });
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
          {/* Username Field */}
          <div style={fieldStyle}>
            <label style={labelStyle}><FiUser size={12}/> Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{
                ...inputStyle,
                borderColor: fieldErrors.username ? "#ef4444" : "#d1d5db"
              }} 
            />
          </div>

          {/* Role Field - Placeholder fix */}
          <div style={fieldStyle}>
            <label style={labelStyle}><FiShield size={12}/> Select Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              style={{
                ...inputStyle,
                color: role === "" ? "#9ca3af" : "#000", // Makes placeholder look like a placeholder
                borderColor: fieldErrors.role ? "#ef4444" : "#d1d5db"
              }}
            >
              <option value="" disabled hidden>Choose Role</option>
              <option value="ASM" style={{ color: "#000" }}>ASM</option>
              <option value="RSM" style={{ color: "#000" }}>RSM</option>
              <option value="ADMIN" style={{ color: "#000" }}>ADMIN</option>
            </select>
          </div>

          {/* Password Field - Eye Icon fix */}
          <div style={fieldStyle}>
            <label style={labelStyle}><FiLock size={12}/> Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{
                  ...inputStyle,
                  paddingRight: "45px", 
                  borderColor: fieldErrors.password ? "#ef4444" : "#d1d5db"
                }} 
              />
              <span onClick={() => setShowPassword(!showPassword)} style={eyeIconStyle}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }} 
            disabled={loading}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ---------- Styles ---------- */
const containerStyle: React.CSSProperties = {
  height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5",
};

const cardStyle: React.CSSProperties = {
  width: "100%", maxWidth: "400px", background: "#ffffff", padding: "40px", borderRadius: "20px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
};

const titleStyle: React.CSSProperties = { margin: 0, color: "#164976", fontSize: "24px", fontWeight: 800 };

const fieldStyle: React.CSSProperties = { marginBottom: "20px" };

const labelStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #d1d5db",
  fontSize: "14px", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
};

const eyeIconStyle: React.CSSProperties = {
  position: "absolute",
  right: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  color: "#9ca3af",
  display: "flex",
  alignItems: "center",
  zIndex: 10, // Ensures it stays above the input
};

const buttonStyle: React.CSSProperties = {
  width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: "#164976",
  color: "#fff", fontSize: "16px", fontWeight: 600, marginTop: "10px", cursor: "pointer"
};