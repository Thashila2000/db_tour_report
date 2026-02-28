import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    role: "",
    password: "",
    server: "",
  });

  const validate = () => {
    let newErrors = { username: "", role: "", password: "", server: "" };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!role) {
      newErrors.role = "Please select a role";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username,
        password,
        role, 
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Login response:", data);

    if (data.success) {
      // ✅ Save login state
      localStorage.setItem("isAuth", "true");
      navigate("/home");
    } else {
      alert(data.message);
    }
  } catch (err: any) {
    console.error("Login failed:", err);
    alert("Server error, please try again.");
  }
};
  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={cardStyle}
      >
        <h2 style={titleStyle}>System Login</h2>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
            {errors.username && (
              <span style={errorStyle}>{errors.username}</span>
            )}
          </div>

          {/* Role */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Select Role --</option>
              <option value="ASM">ASM</option>
              <option value="RSM">RSM</option>
            </select>
            {errors.role && <span style={errorStyle}>{errors.role}</span>}
          </div>

          {/* Password */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={eyeIconStyle}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            {errors.password && (
              <span style={errorStyle}>{errors.password}</span>
            )}
          </div>

          {/* Server Error */}
          {errors.server && (
            <div style={{ ...errorStyle, textAlign: "center" }}>
              {errors.server}
            </div>
          )}

          <button type="submit" style={buttonStyle}>
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ---------- Styles ---------- */

const containerStyle: React.CSSProperties = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(to right, #f3f4f6, #e5e7eb)",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "380px",
  background: "#ffffff",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const titleStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
  color: "#164976",
  fontWeight: 700,
};

const fieldStyle: React.CSSProperties = {
  marginBottom: "18px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "6px",
  color: "#164976",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
};

const eyeIconStyle: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  color: "#164976",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#164976",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "10px",
};

const errorStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "12px",
  marginTop: "4px",
  display: "block",
};