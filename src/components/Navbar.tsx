import React, { useState } from "react";
import { FaBars, FaUserCircle, FaBell, FaSignOutAlt } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // --- SAFE USER DATA RETRIEVAL ---
  const userJson = localStorage.getItem("user");
  let userName = "User";
  let userRole = "Field Manager";

  if (userJson) {
    try {
      const userData = JSON.parse(userJson);
      userName = userData.name || "User";
      userRole = userData.role || "Field Manager";
    } catch (e) {
      console.error("Failed to parse user data", e);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <>
      <style>{`
        .navbar-root {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: 64px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          background: #ffffff;
          border-bottom: 1px solid rgba(22,73,118,0.10);
          box-shadow: 0 1px 16px rgba(22,73,118,0.08), 0 1px 3px rgba(22,73,118,0.05);
          font-family: 'DM Sans', sans-serif;
        }

        .navbar-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2.5px;
          background: linear-gradient(90deg, #164976 0%, #1e6aad 50%, #2a8fd4 100%);
        }

        .navbar-left { display: flex; align-items: center; gap: 14px; }

        .hamburger-btn {
          display: none;
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1.5px solid rgba(22,73,118,0.15);
          background: rgba(22,73,118,0.04);
          color: #164976;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        @media (max-width: 768px) { .hamburger-btn { display: flex; } }

        .nav-logo { height: 36px; object-fit: contain; }
        .nav-divider { width: 1px; height: 28px; background: rgba(22,73,118,0.12); }

        .nav-brand { display: flex; flex-direction: column; line-height: 1.2; }
        .nav-brand-title { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #0a1f33; }
        .nav-brand-sub { font-size: 10px; font-weight: 500; color: #4a6d8c; text-transform: uppercase; }

        .navbar-right { display: flex; align-items: center; gap: 8px; }

        .nav-icon-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1.5px solid rgba(22,73,118,0.12);
          background: transparent;
          color: #4a6d8c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
        }

        .nav-notif-badge {
          position: absolute;
          top: 6px; right: 6px;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #dc2626;
          border: 1.5px solid #fff;
        }

        .nav-profile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px 5px 5px;
          border-radius: 12px;
          border: 1.5px solid rgba(22,73,118,0.12);
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-avatar {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #164976, #1e6aad);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-profile-info { display: flex; flex-direction: column; line-height: 1.2; text-align: left; }
        .nav-profile-name { font-size: 12px; font-weight: 700; color: #0a1f33; }
        .nav-profile-role { font-size: 10px; color: #4a6d8c; }

        .nav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 160px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid rgba(22,73,118,0.12);
          box-shadow: 0 8px 28px rgba(22,73,118,0.14);
          padding: 5px;
          z-index: 200;
        }

        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #dc2626;
          cursor: pointer;
          transition: background 0.15s;
        }

        .nav-dropdown-item:hover { background: rgba(220,38,38,0.06); }
      `}</style>

      <nav className="navbar-root">
        <div className="navbar-left">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <FaBars size={15} />
          </button>
          <img src="/images/logo.jpeg" alt="Logo" className="nav-logo" />
          <div className="nav-divider" />
          <div className="nav-brand">
            <span className="nav-brand-title">ASM / RSM Portal</span>
            <span className="nav-brand-sub">DB Tour Report</span>
          </div>
        </div>

        <div className="navbar-right">
          <button className="nav-icon-btn">
            <FaBell size={14} />
            <span className="nav-notif-badge" />
          </button>

          <div style={{ position: "relative" }}>
            <button className="nav-profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="nav-avatar">
                <FaUserCircle size={18} color="white" />
              </div>
              <div className="nav-profile-info">
                <span className="nav-profile-name">{userName}</span>
                <span className="nav-profile-role">{userRole}</span>
              </div>
              <FiChevronDown
                size={12}
                style={{
                  transition: "transform 0.2s ease",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {profileOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 199 }}
                  onClick={() => setProfileOpen(false)}
                />
                <div className="nav-dropdown">
                  <button className="nav-dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt size={14} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;