import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import DashboardSidebar from "../components/DashboardSidebar";
import "../styles/Support.css";

function Support() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would send to backend/Firebase
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSupportForm({ subject: "", message: "" });
    }, 3000);
  };

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
      
      <main className="support-main-content">
        <div className="support-container">
          {/* Header */}
          <div className="support-header">
            <h1>Contact Support</h1>
            <p>We're here to help! Reach out to us anytime</p>
          </div>

          {/* Contact Methods */}
          <div className="contact-methods">
            <div className="contact-card">
              <div className="contact-icon">📧</div>
              <h3>Email Support</h3>
              <p>Get help via email</p>
              <a href="mailto:support@shortearn.com" className="contact-link">
                support@shortearn.com
              </a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">💬</div>
              <h3>Telegram Support</h3>
              <p>Chat with us on Telegram</p>
              <a
                href="https://t.me/Zek_indian"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                @Zek_indian
              </a>
            </div>
          </div>

          {/* Support Form */}
          <div className="support-form-section">
            <h2>Send us a message</h2>
            {submitted ? (
              <div className="success-message">
                <span>✓</span>
                <span>Message sent! We'll get back to you soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="support-form">
                <div className="form-group-support">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    placeholder="What's this about?"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group-support">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    placeholder="Describe your issue or question..."
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                    rows={6}
                    required
                  />
                </div>
                <button type="submit" className="submit-support-btn">
                  <span>📤</span>
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              <details className="faq-item">
                <summary>How do I withdraw my earnings?</summary>
                <p>Go to the Withdraw page, select your preferred payment method (UPI, Bank, or Crypto), enter the amount and details, then submit your request.</p>
              </details>
              <details className="faq-item">
                <summary>What is the minimum withdrawal amount?</summary>
                <p>The minimum withdrawal amount is ₹10. You can request withdrawals anytime your balance reaches this threshold.</p>
              </details>
              <details className="faq-item">
                <summary>How long does withdrawal take?</summary>
                <p>UPI transfers are usually instant. Bank transfers take 1-3 business days. Crypto transfers depend on blockchain confirmation times.</p>
              </details>
              <details className="faq-item">
                <summary>How do I use the Telegram bot?</summary>
                <p>Open our Telegram bot, send your long URL, and receive a shortened link instantly. Use commands to check stats and manage links.</p>
              </details>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Support;
