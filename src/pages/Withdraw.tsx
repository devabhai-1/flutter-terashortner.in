import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirebaseDatabase, safeEmailKey } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, push, update, get } from "firebase/database";
import DashboardSidebar from "../components/DashboardSidebar";
import "../styles/Withdraw.css";

interface WithdrawalHistory {
  method: string;
  amount: number;
  details: any;
  status: string;
  date: string;
}

function Withdraw() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIFSC, setBankIFSC] = useState("");
  const [bankName, setBankName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [history, setHistory] = useState<Record<string, WithdrawalHistory>>({});
  const [currentUserEmailKey, setCurrentUserEmailKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDatabase();

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          setShowLoginOverlay(true);
          setTimeout(() => {
            navigate("/login");
          }, 1500);
          return;
        }

        const emailKey = safeEmailKey(user.email || "");
        setCurrentUserEmailKey(emailKey);
        setShowLoginOverlay(false);

        const basePath = `users/${emailKey}/withdrawals`;

        // Load totalavailable
        onValue(ref(db, `${basePath}/totalavailable`), (snap) => {
          setAvailableBalance(snap.exists() ? Number(snap.val()) : 0);
        });

        // Load totalWithdrawn
        onValue(ref(db, `${basePath}/totalWithdrawn`), (snap) => {
          setTotalWithdrawn(snap.exists() ? Number(snap.val()) : 0);
        });

        // Load history
        onValue(ref(db, `${basePath}/history`), (snap) => {
          if (snap.exists()) {
            setHistory(snap.val());
          } else {
            setHistory({});
          }
        });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const selectMethod = (method: string) => {
    setSelectedMethod(method);
    setWithdrawDetails("");
    setBankAccountNumber("");
    setBankIFSC("");
    setBankName("");
    setWhatsappNumber("");
    setMessage(null);
  };

  const submitWithdraw = async () => {
    setLoading(true);
    setMessage(null);

    const amount = parseFloat(withdrawAmount);

    if (!selectedMethod) {
      setMessage({ type: "error", text: "Please select a withdrawal method." });
      setLoading(false);
      return;
    }
    if (!amount || amount < 10) {
      setMessage({ type: "error", text: "Minimum withdrawal amount is ₹10." });
      setLoading(false);
      return;
    }
    if (amount > availableBalance) {
      setMessage({ type: "error", text: "Insufficient balance." });
      setLoading(false);
      return;
    }

    let structuredDetails: any = {};

    if (selectedMethod === "upi") {
      const upiId = withdrawDetails.trim();
      if (!upiId) {
        setMessage({ type: "error", text: "Please enter your UPI ID." });
        setLoading(false);
        return;
      }
      structuredDetails = { upi: upiId };
    } else if (selectedMethod === "bank") {
      const accountNumber = bankAccountNumber.trim();
      const ifsc = bankIFSC.trim();
      const name = bankName.trim();
      
      if (!accountNumber || !ifsc) {
        setMessage({ type: "error", text: "Please enter Account Number and IFSC code." });
        setLoading(false);
        return;
      }
      structuredDetails = {
        accountNumber,
        ifsc,
        name: name || "",
      };
    } else if (selectedMethod === "crypto") {
      const wallet = withdrawDetails.trim();
      if (!wallet) {
        setMessage({ type: "error", text: "Please enter wallet address." });
        setLoading(false);
        return;
      }
      structuredDetails = { wallet };
    }

    // Add WhatsApp if provided
    if (whatsappNumber.trim()) {
      structuredDetails.whatsapp = whatsappNumber.trim();
    }

    const request = {
      method: selectedMethod,
      amount,
      details: structuredDetails,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };

    const basePath = `users/${currentUserEmailKey}/withdrawals`;

    try {
      const db = getFirebaseDatabase();

      // 1) push history
      await push(ref(db, `${basePath}/history`), request);

      // 2) update balances
      const newBalance = availableBalance - amount;
      await update(ref(db, basePath), { totalavailable: newBalance });

      // 3) update totalWithdrawn
      const snap = await get(ref(db, `${basePath}/totalWithdrawn`));
      const prev = snap.exists() ? Number(snap.val()) : 0;
      await update(ref(db, basePath), { totalWithdrawn: prev + amount });

      setMessage({ type: "success", text: "Withdrawal request submitted successfully!" });
      setWithdrawAmount("");
      setWithdrawDetails("");
      setBankAccountNumber("");
      setBankIFSC("");
      setBankName("");
      setWhatsappNumber("");
      setSelectedMethod("");
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Error: " + (err?.message || "Unknown error") });
    } finally {
      setLoading(false);
    }
  };

  const showDetailsSection = selectedMethod && parseFloat(withdrawAmount) >= 10;

  const historyEntries = Object.entries(history).reverse();
  const pendingCount = historyEntries.filter(([, entry]) => entry.status === "Pending").length;
  const completedCount = historyEntries.filter(([, entry]) => entry.status === "Completed" || entry.status === "Approved").length;

  const getStatusColor = (status: string) => {
    if (status === "Pending") return "#f59e0b";
    if (status === "Completed" || status === "Approved") return "#10b981";
    if (status === "Rejected") return "#ef4444";
    return "#6b7280";
  };

  return (
    <div className="dashboard-wrapper">
      {/* Login Overlay */}
      {showLoginOverlay && (
        <div id="loginOverlay" className="login-overlay">
          <div className="login-modal">
            <h2>Session Expired</h2>
            <p>Please login to continue.</p>
            <button onClick={() => navigate("/login")}>Login Now</button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
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

      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="withdraw-main-content" style={{ filter: showLoginOverlay ? "blur(4px)" : "none" }}>
        {/* Page Header */}
        <div className="withdraw-page-header">
          <div>
            <h1>Withdraw Earnings</h1>
            <p>Request withdrawal to your preferred payment method</p>
          </div>
          <div className="balance-summary">
            <div className="balance-card">
              <span className="balance-label">Available Balance</span>
              <span className="balance-amount">₹{availableBalance.toLocaleString()}</span>
            </div>
            <div className="balance-card">
              <span className="balance-label">Total Withdrawn</span>
              <span className="balance-amount">₹{totalWithdrawn.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`message-banner-withdraw ${message.type}`}>
            <span>{message.type === "success" ? "✓" : "✕"}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Withdraw Form */}
        <div className="withdraw-form-section">
          <h2>Request Withdrawal</h2>
          
          {/* Payment Methods */}
          <div className="payment-methods">
            <button
              type="button"
              onClick={() => selectMethod("upi")}
              className={`method-btn ${selectedMethod === "upi" ? "active" : ""}`}
            >
              <div className="method-icon">💳</div>
              <div className="method-info">
                <span className="method-name">UPI</span>
                <span className="method-desc">Instant transfer</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => selectMethod("bank")}
              className={`method-btn ${selectedMethod === "bank" ? "active" : ""}`}
            >
              <div className="method-icon">🏦</div>
              <div className="method-info">
                <span className="method-name">Bank Transfer</span>
                <span className="method-desc">1-3 business days</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => selectMethod("crypto")}
              className={`method-btn ${selectedMethod === "crypto" ? "active" : ""}`}
            >
              <div className="method-icon">₿</div>
              <div className="method-info">
                <span className="method-name">Crypto</span>
                <span className="method-desc">Blockchain transfer</span>
              </div>
            </button>
          </div>

          {/* Amount Input */}
          <div className="form-group-withdraw">
            <label htmlFor="withdrawAmount">Withdrawal Amount</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                id="withdrawAmount"
                placeholder="Enter amount (Min ₹10)"
                min="10"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="input-hint">Minimum withdrawal: ₹10</p>
          </div>

          {/* Details Section */}
          {showDetailsSection && (
            <>
              {selectedMethod === "bank" ? (
                <>
                  <div className="form-group-withdraw">
                    <label htmlFor="bankAccountNumber">Account Number *</label>
                    <input
                      type="text"
                      id="bankAccountNumber"
                      placeholder="Enter Account Number"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group-withdraw">
                    <label htmlFor="bankIFSC">IFSC Code *</label>
                    <input
                      type="text"
                      id="bankIFSC"
                      placeholder="Enter IFSC Code"
                      value={bankIFSC}
                      onChange={(e) => setBankIFSC(e.target.value.toUpperCase())}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group-withdraw">
                    <label htmlFor="bankName">Account Holder Name</label>
                    <input
                      type="text"
                      id="bankName"
                      placeholder="Enter Account Holder Name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group-withdraw">
                  <label htmlFor="withdrawDetails">
                    {selectedMethod === "upi" ? "UPI ID *" : "Wallet Address *"}
                  </label>
                  <input
                    type="text"
                    id="withdrawDetails"
                    placeholder={selectedMethod === "upi" ? "Enter your UPI ID (example: name@upi)" : "Enter wallet address"}
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              
              {/* WhatsApp Number (Optional for all methods) */}
              <div className="form-group-withdraw">
                <label htmlFor="whatsappNumber">
                  WhatsApp Number <span className="optional-label">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="whatsappNumber"
                  placeholder="Enter WhatsApp number (e.g., +91 9876543210)"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  disabled={loading}
                />
                <p className="input-hint">We'll use this to notify you about withdrawal status</p>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            className="submit-withdraw-btn"
            type="button"
            onClick={submitWithdraw}
            disabled={
              loading ||
              !selectedMethod ||
              !withdrawAmount ||
              parseFloat(withdrawAmount) < 10 ||
              (selectedMethod === "bank" && (!bankAccountNumber.trim() || !bankIFSC.trim())) ||
              (selectedMethod !== "bank" && !withdrawDetails.trim())
            }
          >
            {loading ? (
              <>
                <span className="spinner-withdraw"></span>
                Processing...
              </>
            ) : (
              <>
                <span>💸</span>
                Submit Withdrawal Request
              </>
            )}
          </button>
        </div>

        {/* Withdrawal History */}
        <div className="history-section">
          <div className="history-header">
            <div>
              <h2>Withdrawal History</h2>
              <p className="history-stats">
                {historyEntries.length} total • {pendingCount} pending • {completedCount} completed
              </p>
            </div>
          </div>

          {historyEntries.length === 0 ? (
            <div className="empty-history">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#e5e7eb" strokeWidth="2"/>
                <path d="M32 20v24M20 32h24" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>No withdrawal history</h3>
              <p>Your withdrawal requests will appear here</p>
            </div>
          ) : (
            <div className="history-list">
              {historyEntries.map(([key, entry]) => (
                <div key={key} className="history-item">
                  <div className="history-main">
                    <div className="history-method">
                      <span className="method-badge">{entry.method.toUpperCase()}</span>
                      <span className="history-amount">₹{entry.amount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="history-meta">
                      <span className="history-date">{entry.date || "N/A"}</span>
                      <span
                        className="history-status"
                        style={{ color: getStatusColor(entry.status || "Pending") }}
                      >
                        {entry.status || "Pending"}
                      </span>
                    </div>
                  </div>
                  <details className="history-details">
                    <summary>View Details</summary>
                    <div className="details-content">
                      <pre>{JSON.stringify(entry.details || {}, null, 2)}</pre>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Withdraw;
