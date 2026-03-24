import { FaTasks, FaMapMarkerAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const NAV_ITEMS = [
  { to: "/daily-task",   end: false, icon: FaTasks,         label: "Daily Task"  },
  { to: "/market-execution",  end: false, icon: FaMapMarkerAlt,  label: "Field Visit" },
  { to: "/reports", end: false, icon: FaTasks, label: "Reports" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

     <aside
  className={`
    fixed left-0 z-50 flex flex-col
    top-16 bottom-0 w-110
    md:top-16 md:w-50
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
  style={{
    background:  "linear-gradient(180deg, #0a1f33 0%, #0d2a44 40%, #102d4a 100%)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  }}
>
        {/* Top decorative accent line */}
        <div style={{
          height:     "2px",
          background: "linear-gradient(90deg, #164976, #1e6aad, #2a8fd4, transparent)",
          flexShrink: 0,
        }} />

        {/* Nav section label */}
        <div style={{
          padding:       "20px 20px 8px",
          fontSize:      "9px",
          fontWeight:    700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.25)",
          fontFamily:    "'DM Sans', sans-serif",
        }}>
          Navigation
        </div>

        {/* Nav items */}
        <nav style={{ padding: "0 12px", flex: 1, overflowY: "auto" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
            {NAV_ITEMS.map(({ to, end, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={closeSidebar}
                  style={({ isActive }) => ({
                    display:        "flex",
                    alignItems:     "center",
                    gap:            "12px",
                    padding:        "11px 14px",
                    borderRadius:   "10px",
                    textDecoration: "none",
                    fontFamily:     "'DM Sans', sans-serif",
                    fontSize:       "13px",
                    fontWeight:     isActive ? 600 : 400,
                    color:          isActive ? "#ffffff" : "rgba(255,255,255,0.60)",
                    background:     isActive
                      ? "linear-gradient(135deg, rgba(22,73,118,0.90), rgba(30,106,173,0.80))"
                      : "transparent",
                    boxShadow:      isActive ? "0 2px 12px rgba(22,73,118,0.40)" : "none",
                    border:         isActive ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent",
                    transition:     "all 0.2s ease",
                    position:       "relative",
                    overflow:       "hidden",
                  })}
                  className="sidebar-nav-link"
                >
                  {({ isActive }) => (
                    <>
                      {/* Active left indicator bar */}
                      {isActive && (
                        <span style={{
                          position:     "absolute",
                          left:         0,
                          top:          "20%",
                          height:       "60%",
                          width:        "3px",
                          borderRadius: "0 3px 3px 0",
                          background:   "linear-gradient(180deg, #2a8fd4, #1e6aad)",
                        }} />
                      )}
                      {/* Icon wrapper */}
                      <span style={{
                        width:          "30px",
                        height:         "30px",
                        borderRadius:   "8px",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        background:     isActive
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.05)",
                        flexShrink:     0,
                        transition:     "all 0.2s ease",
                      }}>
                        <Icon size={13} color={isActive ? "#ffffff" : "rgba(255,255,255,0.55)"} />
                      </span>
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom branding strip */}
        <div style={{
          padding:    "16px 20px",
          borderTop:  "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <div style={{
            display:    "flex",
            alignItems: "center",
            gap:        "8px",
          }}>
            <div style={{
              width:        "28px",
              height:       "28px",
              borderRadius: "8px",
              background:   "linear-gradient(135deg, #164976, #1e6aad)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
            }}>
              <FaTasks size={12} color="white" />
            </div>
            <div>
              <p style={{
                margin:     0,
                fontSize:   "11px",
                fontWeight: 700,
                color:      "rgba(255,255,255,0.80)",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.2,
              }}>ASM / RSM</p>
              <p style={{
                margin:     0,
                fontSize:   "9px",
                color:      "rgba(255,255,255,0.30)",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>DB Tour Report</p>
            </div>
          </div>
        </div>

        {/* Hover styles via injected CSS */}
        <style>{`
          .sidebar-nav-link:hover:not([aria-current="page"]) {
            background: rgba(255,255,255,0.06) !important;
            color: rgba(255,255,255,0.85) !important;
            border-color: rgba(255,255,255,0.06) !important;
          }
          .sidebar-nav-link:hover:not([aria-current="page"]) span:first-of-type {
            background: rgba(255,255,255,0.09) !important;
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;