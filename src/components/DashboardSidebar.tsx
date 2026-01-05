import { useNavigate, useLocation } from "react-router-dom";
import "../styles/DashboardSidebar.css";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/shorten", icon: "🔗", label: "Shorten Link" },
    { path: "/withdraw", icon: "💸", label: "Withdraw" },
    { path: "/telegram", icon: "🤖", label: "Telegram Bot" },
    { path: "/support", icon: "📧", label: "Support" },
    { path: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside id="sidebar" className={`sidebar-professional ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="ShortEarn Logo" className="sidebar-logo-image" />
            <span className="logo-text">ShortEarn</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-items-professional">
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={`nav-item-professional ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigateTo(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive(item.path) && <span className="active-indicator"></span>}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="support-section">
            <h4>Need Help?</h4>
            <div className="support-links">
              <a href="mailto:support@shortearn.com" className="support-link">
                <span>📧</span>
                <span>support@shortearn.com</span>
              </a>
              <a href="https://t.me/Zek_indian" target="_blank" rel="noopener noreferrer" className="support-link">
                <span>💬</span>
                <span>@Zek_indian</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default DashboardSidebar;
