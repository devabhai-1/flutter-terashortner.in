import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import DashboardSidebar from "../components/DashboardSidebar";
import "../styles/Telegram.css";

function Telegram() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="dashboard-wrapper">
      <header className="top-navbar">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </div>
        <div className="logo">
          <img src="/logo.png" alt="ShortEarn Logo" className="top-navbar-logo" />
          <span>ShortEarn</span>
        </div>
        <div className="profile-icon" onClick={() => navigate("/dashboard")}>
          Dashboard
        </div>
      </header>
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="telegram-main-content">
        <div className="telegram-container">
          {/* Hero Section */}
          <div className="telegram-hero">
            <div className="telegram-icon-large">🤖</div>
            <h1>Connect Telegram Bot</h1>
            <p>Generate short links, monitor stats, and get instant updates directly from Telegram</p>
          </div>

          {/* Features Grid */}
          <div className="telegram-features">
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Quick Shortening</h3>
              <p>Shorten links instantly with simple commands</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Stats</h3>
              <p>Monitor clicks and earnings on the go</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Updates</h3>
              <p>Get notifications about your link performance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Easy Management</h3>
              <p>Manage all your links from Telegram</p>
            </div>
          </div>

          {/* Connect Section */}
          <div className="telegram-connect">
            <div className="connect-content">
              <h2>Ready to get started?</h2>
              <p>Click below to open our Telegram bot and start shortening links</p>
              <a
                href="https://t.me/TeraboxLinkshortnarbot"
                target="_blank"
                rel="noopener noreferrer"
                className="telegram-btn-primary"
              >
                <span>🤖</span>
                <span>Open Telegram Bot</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="telegram-instructions">
            <h3>How to use:</h3>
            <ol className="instructions-list">
              <li>Click the button above to open our Telegram bot</li>
              <li>Start a conversation with the bot</li>
              <li>Send your long URL to the bot</li>
              <li>Receive your shortened link instantly</li>
              <li>Track stats and earnings through bot commands</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Telegram;
