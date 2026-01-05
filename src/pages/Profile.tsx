import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirebaseDatabase, safeEmailKey, hashPassword } from "../utils/firebase";
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { ref, onValue, update } from "firebase/database";
import DashboardSidebar from "../components/DashboardSidebar";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    createdAt: "",
    lastLogin: "",
  });
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        setCurrentUser(user);
        setShowLoginOverlay(false);

        const emailKey = safeEmailKey(user.email || "");

        // Load profile data
        const profileRef = ref(db, `users/${emailKey}/profile`);
        onValue(profileRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setProfileData({
              name: data.name || "",
              email: data.email || user.email || "",
              createdAt: data.createdAt || "",
              lastLogin: data.lastLogin || "",
            });
            setName(data.name || "");
          }
        });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!currentUser || !name.trim()) {
      setMessage({ type: "error", text: "Please enter a valid name." });
      setLoading(false);
      return;
    }

    try {
      const db = getFirebaseDatabase();
      const emailKey = safeEmailKey(currentUser.email || "");
      const profileRef = ref(db, `users/${emailKey}/profile`);

      await update(profileRef, {
        name: name.trim(),
      });

      setMessage({ type: "success", text: "Name updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Update error:", error);
      setMessage({ type: "error", text: "Failed to update name. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!currentUser) {
      setMessage({ type: "error", text: "User not authenticated." });
      setLoading(false);
      return;
    }

    if (!currentPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill all password fields." });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      setLoading(false);
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email || "",
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      // Update password hash in database
      const db = getFirebaseDatabase();
      const emailKey = safeEmailKey(currentUser.email || "");
      const hashedPass = await hashPassword(newPassword);
      await update(ref(db, `users/${emailKey}/profile`), {
        passwordHash: hashedPass,
      });

      setMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.code === "auth/wrong-password") {
        setMessage({ type: "error", text: "Current password is incorrect." });
      } else if (error.code === "auth/weak-password") {
        setMessage({ type: "error", text: "Password is too weak." });
      } else {
        setMessage({ type: "error", text: "Failed to update password. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
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
      <main className="profile-main-content" style={{ filter: showLoginOverlay ? "blur(4px)" : "none" }}>
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{profileData.name.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div className="profile-info">
              <h1>{profileData.name || "User"}</h1>
              <p>{profileData.email}</p>
            </div>
          </div>

          {/* Account Info */}
          <div className="info-section">
            <h3>Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profileData.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Created</span>
                <span className="info-value">{formatDate(profileData.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Login</span>
                <span className="info-value">{formatDate(profileData.lastLogin)}</span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`message-banner ${message.type}`}>
              <span>{message.type === "success" ? "✓" : "✕"}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Update Name Section */}
          <div className="profile-section">
            <h2>Update Name</h2>
            <form onSubmit={handleNameUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="update-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Name"}
              </button>
            </form>
          </div>

          {/* Update Password Section */}
          <div className="profile-section">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="update-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;

