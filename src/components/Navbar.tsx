import React, { useState } from "react";
import { FaBars, FaUserCircle, FaBell } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [profileOpen, setProfileOpen] = useState(false);

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

        /* Subtle top accent line */
        .navbar-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2.5px;
          background: linear-gradient(90deg, #164976 0%, #1e6aad 50%, #2a8fd4 100%);
        }

        /* ── Left ── */
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

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
          flex-shrink: 0;
        }
        .hamburger-btn:hover {
          background: rgba(22,73,118,0.10);
          border-color: rgba(22,73,118,0.30);
        }

        @media (max-width: 768px) {
          .hamburger-btn { display: flex; }
        }

        .nav-logo {
          height: 36px;
          object-fit: contain;
          display: block;
        }

        .nav-divider {
          width: 1px;
          height: 28px;
          background: rgba(22,73,118,0.12);
        }

        .nav-brand {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .nav-brand-title {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #0a1f33;
          white-space: nowrap;
        }
        .nav-brand-sub {
          font-size: 10px;
          font-weight: 500;
          color: #4a6d8c;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .nav-divider,
          .nav-brand { display: none; }
        }

        /* ── Center badge ── */
        .nav-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(22,73,118,0.06);
          border: 1px solid rgba(22,73,118,0.12);
          border-radius: 100px;
          padding: 5px 14px;
        }
        .nav-center-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 2px rgba(22,163,74,0.25);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .nav-center-text {
          font-size: 11px;
          font-weight: 600;
          color: #164976;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .nav-center { display: none; }
        }

        /* ── Right ── */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Bell */
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
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-icon-btn:hover {
          background: rgba(22,73,118,0.06);
          color: #164976;
          border-color: rgba(22,73,118,0.25);
        }
        .nav-notif-badge {
          position: absolute;
          top: 6px; right: 6px;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #dc2626;
          border: 1.5px solid #fff;
        }

        /* Profile button */
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
          position: relative;
        }
        .nav-profile-btn:hover {
          background: rgba(22,73,118,0.05);
          border-color: rgba(22,73,118,0.25);
        }

        .nav-avatar {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #164976, #1e6aad);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-profile-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          text-align: left;
        }
        .nav-profile-name {
          font-size: 12px;
          font-weight: 700;
          color: #0a1f33;
          white-space: nowrap;
        }
        .nav-profile-role {
          font-size: 10px;
          color: #4a6d8c;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .nav-profile-info { display: none; }
          .nav-profile-btn  { padding: 5px; }
        }

        /* Dropdown */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 180px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid rgba(22,73,118,0.12);
          box-shadow: 0 8px 28px rgba(22,73,118,0.14);
          padding: 6px;
          z-index: 200;
          animation: dropdown-in 0.15s ease;
        }
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-dropdown-item {
          display: block;
          width: 100%;
          padding: 9px 12px;
          border-radius: 9px;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          color: #0a1f33;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .nav-dropdown-item:hover { background: rgba(22,73,118,0.06); }
        .nav-dropdown-item.danger { color: #dc2626; }
        .nav-dropdown-item.danger:hover { background: rgba(220,38,38,0.06); }
        .nav-dropdown-divider {
          height: 1px;
          background: rgba(22,73,118,0.08);
          margin: 4px 0;
        }
      `}</style>

      <nav className="navbar-root">

        {/* Left — hamburger + logo + brand */}
        <div className="navbar-left">
          <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <FaBars size={15} />
          </button>

          <img src="/images/logo.jpeg" alt="Company Logo" className="nav-logo" />

          <div className="nav-divider" />

          <div className="nav-brand">
            <span className="nav-brand-title">ASM / RSM Portal</span>
            <span className="nav-brand-sub">DB Tour Report</span>
          </div>
        </div>

       
       {/* Right — bell + profile */}
        <div className="navbar-right">

          {/* Bell */}
          <button className="nav-icon-btn" aria-label="Notifications">
            <FaBell size={14} />
            <span className="nav-notif-badge" />
          </button>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <button
              className="nav-profile-btn"
              onClick={() => setProfileOpen((p) => !p)}
              aria-label="Profile menu"
            >
              <div className="nav-avatar">
                <FaUserCircle size={18} color="white" />
              </div>
              <div className="nav-profile-info">
                <span className="nav-profile-name">ASM User</span>
                <span className="nav-profile-role">Field Manager</span>
              </div>
              <FiChevronDown
                size={12}
                color="#4a6d8c"
                style={{
                  transition:  "transform 0.2s ease",
                  transform:   profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  flexShrink:  0,
                }}
              />
            </button>

            {profileOpen && (
              <>
                {/* Click-outside backdrop */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 199 }}
                  onClick={() => setProfileOpen(false)}
                />
                <div className="nav-dropdown">
                  <button className="nav-dropdown-item">My Profile</button>
                  <button className="nav-dropdown-item">Settings</button>
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item danger">Sign Out</button>
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