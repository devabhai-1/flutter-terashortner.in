import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirebaseDatabase, safeEmailKey } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, set, runTransaction, get, onValue } from "firebase/database";
import DashboardSidebar from "../components/DashboardSidebar";
import "../styles/Shorten.css";

interface ShortLink {
  originalUrl: string;
  shortUrl: string;
  fileId: string;
  createdAt: string;
  views: number;
}

function Shorten() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [longUrl, setLongUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; shortUrl?: string; fileId?: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recentLinks, setRecentLinks] = useState<Record<string, ShortLink>>({});
  const [totalLinks, setTotalLinks] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [totalViews, setTotalViews] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

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

        // Load recent links
        const linksRef = ref(db, `users/${emailKey}/shortner/web`);
        onValue(linksRef, (snapshot) => {
          if (snapshot.exists()) {
            const links = snapshot.val();
            setRecentLinks(links);
            setTotalLinks(Object.keys(links).length);
            
            // Calculate total views
            const views = Object.values(links).reduce((sum: number, link: any) => sum + (link.views || 0), 0);
            setTotalViews(views);
          }
        });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/login");
    }
  }, [navigate]);

  // Extract File ID (same Firebase logic)
  const extractFileId = (url: string) => {
    try {
      const clean = url.split("?")[0].split("#")[0];
      const parts = clean.split("/").filter(Boolean);
      return parts[parts.length - 1] || null;
    } catch {
      return null;
    }
  };

  // Shorten URL Function (same Firebase logic)
  const shortenUrl = async () => {
    setResult(null);
    setLoading(true);

    if (!currentUser) {
      setResult({ success: false, message: "Login required." });
      setLoading(false);
      return;
    }

    const url = longUrl.trim();

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setResult({ success: false, message: "Please enter a valid http/https URL." });
      setLoading(false);
      return;
    }

    const fileId = extractFileId(url);
    if (!fileId) {
      setResult({ success: false, message: "Could not extract file ID." });
      setLoading(false);
      return;
    }

    const shortUrl = `${window.location.origin}/a/${fileId}`;
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const data: ShortLink = {
      originalUrl: url,
      shortUrl,
      fileId,
      createdAt: now.toISOString(),
      views: 0,
    };

    const emailKey = safeEmailKey(currentUser.email || "");
    const db = getFirebaseDatabase();

    const globalRef = ref(db, `shortLinks/${fileId}`);
    const userRef = ref(db, `users/${emailKey}/shortner/web/${fileId}`);
    const statRef = ref(db, `users/${emailKey}/dashboard/totalLinks`);

    try {
      const existing = await get(globalRef);
      if (existing.exists()) {
        setResult({
          success: false,
          message: "This short code already exists. Try a different link.",
        });
        setLoading(false);
        return;
      }

      await set(globalRef, { ...data, dailyViews: { [today]: 0 } });
      await set(userRef, data);
      await runTransaction(statRef, (val) => (val || 0) + 1);

      setResult({
        success: true,
        message: "Link shortened successfully!",
        shortUrl: shortUrl,
        fileId: fileId,
      });
      setLongUrl("");
    } catch (error: any) {
      console.error("Error:", error);
      setResult({ success: false, message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      shortenUrl();
    }
  };

  const copyToClipboard = async (text: string, fileId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(fileId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(fileId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // Filter links based on search
  const filteredLinks = Object.entries(recentLinks)
    .filter(([, link]) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        link.shortUrl.toLowerCase().includes(query) ||
        link.originalUrl.toLowerCase().includes(query) ||
        link.fileId.toLowerCase().includes(query)
      );
    })
    .sort(([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="shorten-page-professional">
      {/* Login Overlay */}
      {showLoginOverlay && (
        <div id="loginOverlay" className="login-overlay">
          <div className="login-modal">
            <h2>Login Required</h2>
            <p>Please login to use the shortener.</p>
            <button onClick={() => navigate("/login")}>Login</button>
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
        <div className="profile-icon" onClick={() => navigate("/dashboard")}>👤</div>
      </header>

      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="shorten-main-professional" style={{ filter: showLoginOverlay ? "blur(4px)" : "none" }}>
        {/* Header Section */}
        <div className="page-header">
          <div>
            <h1>Shorten Links</h1>
            <p>Create short, trackable links for your content</p>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span className="stat-value">{totalLinks}</span>
              <span className="stat-label">Links</span>
            </div>
            <div className="header-stat">
              <span className="stat-value">{totalViews.toLocaleString()}</span>
              <span className="stat-label">Clicks</span>
            </div>
          </div>
        </div>

        {/* Shorten Box */}
        <div className="shorten-container-professional">
          <div className="shorten-box-professional">
            <div className="input-section">
              <label htmlFor="longUrl">Paste your long URL</label>
              <div className="input-group-professional">
                <input
                  type="text"
                  id="longUrl"
                  placeholder="https://example.com/very/long/url/here"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={shortenUrl}
                  disabled={loading || !longUrl.trim()}
                  className="shorten-btn-professional"
                >
                  {loading ? (
                    <>
                      <span className="spinner-professional"></span>
                      Shortening...
                    </>
                  ) : (
                    "Shorten"
                  )}
                </button>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className={`result-section-professional ${result.success ? "success" : "error"}`}>
                {result.success ? (
                  <>
                    <div className="result-header-professional">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z" fill="#10b981"/>
                      </svg>
                      <span>Link shortened successfully!</span>
                    </div>
                    <div className="result-url-professional">
                      <div className="url-display-professional">
                        <input
                          type="text"
                          readOnly
                          value={result.shortUrl || ""}
                          className="result-input-professional"
                        />
                        <button
                          className={`copy-btn-professional ${copiedId === result.fileId ? "copied" : ""}`}
                          onClick={() => copyToClipboard(result.shortUrl || "", result.fileId || "")}
                        >
                          {copiedId === result.fileId ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M13.5 2L6 9.5 2.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 5V3a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5"/>
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="result-actions-professional">
                        <a
                          href={result.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-link-professional"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 2H14a2 2 0 012 2v4M14 2l-4 4M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Open link
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="error-message-professional">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="#ef4444"/>
                    </svg>
                    <span>{result.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Links Section - Always Show */}
        <div className="links-section-professional">
          <div className="section-header-professional">
            <div>
              <h2>Your Links</h2>
              <p className="section-subtitle">
                {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"}
                {totalLinks > 0 && ` • Total: ${totalLinks}`}
              </p>
            </div>
            {filteredLinks.length > 0 && (
              <div className="section-controls">
                <div className="search-box-professional">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="view-toggle">
                  <button
                    className={viewMode === "list" ? "active" : ""}
                    onClick={() => setViewMode("list")}
                    title="List view"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor"/>
                      <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" fill="currentColor"/>
                      <rect x="2" y="11.5" width="12" height="1.5" rx="0.75" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className={viewMode === "grid" ? "active" : ""}
                    onClick={() => setViewMode("grid")}
                    title="Grid view"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                      <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                      <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/>
                      <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {filteredLinks.length > 0 ? (
            <div className={`links-container-professional ${viewMode}`}>
              {filteredLinks.map(([key, link]) => (
                <div key={key} className="link-card-professional">
                  <div className="link-main-info">
                    <div className="link-url-section">
                      <div className="short-url-professional">
                        <span className="domain">{window.location.host}/a/</span>
                        <span className="code">{link.fileId}</span>
                      </div>
                      <div className="original-url-professional" title={link.originalUrl}>
                        {link.originalUrl.length > 60
                          ? link.originalUrl.substring(0, 60) + "..."
                          : link.originalUrl}
                      </div>
                    </div>
                    <div className="link-stats-professional">
                      <div className="stat-item-professional">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12.5c-3.03 0-5.5-2.47-5.5-5.5S4.97 2.5 8 2.5 13.5 4.97 13.5 8 11.03 13.5 8 13.5z" fill="currentColor"/>
                          <path d="M8 4.5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>{formatDate(link.createdAt)}</span>
                      </div>
                      <div className="stat-item-professional">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" fill="currentColor"/>
                          <path d="M8 4v4l3 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>{formatTime(link.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="link-actions-section">
                    <div className="link-clicks">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" fill="currentColor"/>
                        <path d="M8 4v4l3 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="clicks-count">{link.views || 0}</span>
                      <span className="clicks-label">clicks</span>
                    </div>
                    <div className="link-buttons">
                      <button
                        className={`action-btn-professional ${copiedId === link.fileId ? "copied" : ""}`}
                        onClick={() => copyToClipboard(link.shortUrl, link.fileId)}
                        title="Copy link"
                      >
                        {copiedId === link.fileId ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.5 2L6 9.5 2.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M5 5V3a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        )}
                      </button>
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn-professional"
                        title="Open link"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M10 2H14a2 2 0 012 2v4M14 2l-4 4M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="empty-state-professional">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#e5e7eb" strokeWidth="2"/>
                <path d="M32 20v24M20 32h24" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>No links found</h3>
              <p>Try adjusting your search query</p>
            </div>
          ) : (
            <div className="empty-state-professional">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M32 12L20 24L28 24L28 44L36 44L36 24L44 24L32 12Z" fill="#e5e7eb"/>
                <circle cx="32" cy="32" r="30" stroke="#e5e7eb" strokeWidth="2"/>
              </svg>
              <h3>No links yet</h3>
              <p>Start shortening your first link above</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Shorten;
