import React, { useState, useEffect } from 'react';
import { 
  FiMap, FiLogOut, FiUser, FiChevronDown, 
  FiFileText, FiBarChart2, FiArrowRight
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const regions = [
  "Central", "Western", "Southern", 
  "Northern", "Eastern", "North Western", 
  "North Central", "Uva", "Sabaragamuwa"
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState({
    userName: "Loading...",
    role: "Administrator"
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          userName: parsedUser.userName || parsedUser.name || "Admin User",
          role: parsedUser.role || "Regional Manager"
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleCardClick = (region: string) => {
    navigate(`/admin/reports?region=${region}`);
  };

  const handleLogout = () => {
    // 1. Immediately clear storage
    localStorage.removeItem('user');
    localStorage.removeItem('isAuth');
    localStorage.clear(); // Safety clear for any other auth keys

    // 2. Close menu state
    setShowProfileMenu(false);

    // 3. Navigate to root/login
    // Using replace: true prevents the user from navigating back to the dashboard
    navigate('/', { replace: true });

    // Note: If you still encounter a blank page, it usually means your App.tsx 
    // Router isn't re-rendering. In that case, use:
    // window.location.href = "/";
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        
        .region-card {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .region-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(22,73,118,0.12) !important;
          border-color: #164976 !important;
        }
        .region-card:hover .icon-box {
          background: #164976 !important;
          transform: scale(1.1);
        }
        .region-card:hover .arrow-icon {
          transform: translateX(5px);
          opacity: 1 !important;
        }

        @media (max-width: 992px) {
          .nav-container { padding: 0 20px !important; }
          .grid-container { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important; }
        }

        @media (max-width: 768px) {
          .nav-title { font-size: 18px !important; }
          .nav-subtitle { display: none !important; }
          .profile-name { display: none !important; }
          .profile-role { display: none !important; }
          .profile-btn { padding: 8px !important; }
          .main-content { padding: 20px 15px !important; }
          .section-title { font-size: 22px !important; }
          .logo-box { width: 40px !important; height: 40px !important; }
        }

        @media (max-width: 480px) {
          .grid-container { grid-template-columns: 1fr !important; }
          .region-card { padding: 20px !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={navStyle}>
        <div className="nav-container" style={navContainer}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="logo-box" style={logoBox}>
              <FiBarChart2 size={20} color="white" />
            </div>
            <div>
              <h1 className="nav-title" style={navTitle}>Dashboard</h1>
              <p className="nav-subtitle" style={navSubTitle}>Regional Performance</p>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <button 
              className="profile-btn" 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              style={profileBtn}
            >
              <div style={avatarBox}><FiUser size={18} color="white" /></div>
              <div style={{ textAlign: "left" }}>
                <div className="profile-name" style={profileName}>{userData.userName}</div>
                <div className="profile-role" style={profileRole}>{userData.role}</div>
              </div>
              <FiChevronDown style={{ transform: showProfileMenu ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }} />
            </button>

            {showProfileMenu && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
                  onClick={() => setShowProfileMenu(false)} 
                />
                <div style={dropdownStyle}>
                  <button onClick={handleLogout} style={logoutBtn}>
                    <FiLogOut size={16} /> <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="main-content" style={mainContent}>
        <div style={{ marginBottom: "32px" }}>
          <h2 className="section-title" style={sectionTitle}>Welcome, {userData.userName.split(' ')[0]}</h2>
          <p style={{ color: "#64748b", fontWeight: 500, fontSize: '14px' }}>
            Select a region to monitor performance and reports.
          </p>
        </div>

        <div className="grid-container" style={gridStyle}>
          {regions.map((region) => (
            <div 
              key={region}
              className="region-card"
              onClick={() => handleCardClick(region)}
              style={cardStyle}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div className="icon-box" style={iconBoxStyle}>
                    <FiMap size={22} color="white" />
                  </div>
                  <span style={regionNameText}>{region}</span>
                </div>
                <FiArrowRight className="arrow-icon" style={{ opacity: 0.3, transition: '0.3s', color: '#164976' }} size={20} />
              </div>
              
              <div style={cardFooter}>
                <div style={statItem}>
                  <FiFileText size={14} /> <span>View Regional Reports</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- STYLES ---------- */
const navStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #164976 0%, #1e6aad 100%)",
  padding: "15px 0",
  position: "sticky",
  top: 0,
  zIndex: 100,
  width: '100%'
};

const navContainer: React.CSSProperties = {
  maxWidth: "1400px", 
  margin: "0 auto", 
  padding: "0 30px",
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center"
};

const logoBox: React.CSSProperties = {
  width: "44px", height: "44px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", 
  display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)"
};

const navTitle: React.CSSProperties = {
  margin: 0, fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: 800, color: "white"
};

const navSubTitle: React.CSSProperties = {
  margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: 600
};

const profileBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", padding: "8px 12px", cursor: "pointer", color: "white"
};

const avatarBox: React.CSSProperties = {
  width: "32px", height: "32px", background: "linear-gradient(135deg, #10b981, #059669)",
  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
};

const profileName: React.CSSProperties = { fontSize: "13px", fontWeight: 700, lineHeight: 1.2 };
const profileRole: React.CSSProperties = { fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: 500 };

const mainContent: React.CSSProperties = { maxWidth: "1400px", margin: "0 auto", padding: "40px 30px" };

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: 800, color: "#164976", margin: "0 0 8px 0"
};

const gridStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px"
};

const cardStyle: React.CSSProperties = {
  background: "white", 
  borderRadius: "16px", 
  padding: "24px", 
  // Change 2px to 4px or higher
  border: "4px solid #e2e8f0", 
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
};

const iconBoxStyle: React.CSSProperties = {
  width: "48px", height: "48px", background: "#1e6aad", borderRadius: "12px",
  display: "flex", alignItems: "center", justifyContent: "center", transition: "0.3s"
};

const regionNameText: React.CSSProperties = {
  fontFamily: "'Sora', sans-serif", fontSize: "17px", fontWeight: 700, color: "#0f172a"
};

const cardFooter: React.CSSProperties = {
  marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px"
};

const statItem: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#64748b"
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute", top: "calc(100% + 10px)", right: 0, background: "white", borderRadius: "10px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", minWidth: "160px", overflow: "hidden",
  zIndex: 100
};

const logoutBtn: React.CSSProperties = {
  width: "100%", padding: "10px 15px", border: "none", background: "white", display: "flex",
  alignItems: "center", gap: "8px", cursor: "pointer", color: "#ef4444", fontWeight: 700, fontSize: '13px'
};

export default AdminDashboard;