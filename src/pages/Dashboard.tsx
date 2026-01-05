import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirebaseDatabase, safeEmailKey } from "../utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import DashboardSidebar from "../components/DashboardSidebar";
import "../styles/Dashboard.css";

interface DailyStats {
  impressions: number;
  earnings: number;
  cpm: number;
}

interface DashboardData {
  totalEarnings: number;
  todayEarnings: number;
  totalImpressions: number;
  todayImpressions: number;
  currentCPM: number;
  dailyStats: Record<string, DailyStats>;
}

function Dashboard() {
  const navigate = useNavigate();
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [profileName, setProfileName] = useState("User");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalEarnings: 0,
    todayEarnings: 0,
    totalImpressions: 0,
    todayImpressions: 0,
    currentCPM: 0,
    dailyStats: {},
  });
  const [sortedDates, setSortedDates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const rowsPerPage = 15;

  // Parse ISO date
  const parseISODate = (dateStr: string) => new Date(dateStr);

  // Load dashboard data
  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDatabase();

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          setShowLoginOverlay(true);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }

        const emailKey = safeEmailKey(user.email || "");
        setShowLoginOverlay(false);

        // Load profile name
        const profileRef = ref(db, `users/${emailKey}/profile/name`);
        onValue(profileRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfileName(snapshot.val());
          }
        });

        // Load dashboard data
        const dashboardRef = ref(db, `users/${emailKey}/dashboard`);
        onValue(dashboardRef, (snapshot) => {
          const data = snapshot.val();
          if (!data) return;

          const dailyStats = data.dailyStats || {};
          
          // Sort dates (latest → oldest), limit 120 days
          const dates = Object.keys(dailyStats)
            .sort((a, b) => parseISODate(b).getTime() - parseISODate(a).getTime())
            .slice(0, 120); // ✅ 120 days limit

          setSortedDates(dates);
          setDashboardData({
            totalEarnings: data.totalEarnings ?? 0,
            todayEarnings: data.todayEarnings ?? 0,
            totalImpressions: data.totalImpressions ?? 0,
            todayImpressions: data.todayImpressions ?? 0,
            currentCPM: data.currentCPM ?? 0,
            dailyStats: dailyStats,
          });
        });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Dashboard error:", error);
      navigate("/login");
    }
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    try {
      const auth = getFirebaseAuth();
      signOut(auth)
        .then(() => {
          localStorage.clear();
          navigate("/");
        })
        .catch((err) => {
          alert("Logout error: " + err.message);
        });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Pagination
  const totalPages = Math.ceil(sortedDates.length / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageDates = sortedDates.slice(start, end);

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Get latest stats for display
  const latestDate = sortedDates[0];
  const latestStats = latestDate ? dashboardData.dailyStats[latestDate] : null;

  // Prepare chart data for last 10 days
  const chartData = sortedDates
    .slice(0, 10)
    .reverse()
    .map((date) => {
      const stats = dashboardData.dailyStats[date] || { earnings: 0, impressions: 0, cpm: 0 };
      const dateObj = new Date(date);
      return {
        date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        earnings: stats.earnings || 0,
        impressions: stats.impressions || 0,
        cpm: stats.cpm || 0,
      };
    });

  // Calculate total for 10 days
  const tenDaysTotal = chartData.reduce((sum, item) => sum + item.earnings, 0);

  return (
    <div className="dashboard-wrapper">
      {/* Login Overlay */}
      {showLoginOverlay && (
        <div id="loginOverlay" className="login-overlay">
          <div id="loginModal" className="login-modal">
            <h2>Session Expired</h2>
            <p>Please login to continue.</p>
            <button onClick={() => navigate("/login")}>Login Now</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div id="mainContent" className={showLoginOverlay ? "blurred" : ""}>
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </div>
          <div className="logo">
            <img src="/logo.png" alt="ShortEarn Logo" className="top-navbar-logo" />
            <span>ShortEarn</span>
          </div>
          <div className="profile-icon" onClick={handleLogout}>
            Logout
          </div>
        </header>

        {/* Sidebar */}
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="main-content">
          {/* Announcement Banner */}
          <div className="announcement-banner">
            <div className="announcement-icon">📢</div>
            <div className="announcement-content">
              <strong>CPM Rates:</strong> Our dynamic CPM system adjusts based on traffic, country & device. 
              Current rates range from ₹150-₹400 per 1000 impressions. <a href="#cpm">View all rates →</a>
            </div>
            <button className="announcement-close" onClick={(e) => {
              const banner = e.currentTarget.closest('.announcement-banner') as HTMLElement;
              if (banner) {
                banner.style.display = 'none';
              }
            }}>×</button>
          </div>

          {/* Page Header */}
          <div className="page-header-dashboard">
            <h2>
              Welcome back, <span className="profile-name">{profileName}</span>
            </h2>
            <p className="welcome-text">Here's your performance overview</p>
          </div>

          {/* Stats Grid */}
          <section className="stats-grid">
            <div className="card">
              <h4>💰 Total Earnings</h4>
              <p id="totalEarnings">₹{dashboardData.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="card">
              <h4>📅 Today's Earnings</h4>
              <p id="todayEarnings">
                ₹{(dashboardData.todayEarnings || latestStats?.earnings || 0).toLocaleString()}
              </p>
            </div>
            <div className="card">
              <h4>👁️ Total Impressions</h4>
              <p id="totalImpressions">
                {(dashboardData.todayImpressions || latestStats?.impressions || 0).toLocaleString()}
              </p>
            </div>
            <div className="card">
              <h4>📈 Current CPM</h4>
              <p id="currentCPM">
                ₹{(dashboardData.currentCPM || latestStats?.cpm || 0).toLocaleString()}
              </p>
            </div>
          </section>

          {/* Earnings Chart - Last 10 Days */}
          {chartData.length > 0 && (
            <section className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>📈 Last 10 Days Earnings</h2>
                  <p className="chart-subtitle">Total: ₹{tenDaysTotal.toLocaleString()}</p>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Earnings']}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#667eea"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorEarnings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Performance Table - Last 120 Days */}
          <section className="tool-section">
            <div className="section-title-row">
              <div>
                <h2>📊 Last 120 Days Performance</h2>
                <p className="section-info">Showing {sortedDates.length} days of data</p>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Impressions</th>
                    <th>Earnings (₹)</th>
                    <th>CPM</th>
                  </tr>
                </thead>
                <tbody id="dailyStatsBody">
                  {pageDates.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                        <div style={{ color: "#6b7280" }}>
                          <p style={{ fontSize: "16px", marginBottom: "8px" }}>No stats available</p>
                          <p style={{ fontSize: "14px" }}>Your performance data will appear here</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageDates.map((date) => {
                      const stats = dashboardData.dailyStats[date] || {};
                      return (
                        <tr key={date}>
                          <td style={{ fontWeight: 500 }}>{date}</td>
                          <td>{stats.impressions?.toLocaleString() ?? 0}</td>
                          <td style={{ fontWeight: 600, color: "#059669" }}>
                            ₹{stats.earnings?.toLocaleString() ?? 0}
                          </td>
                          <td>₹{stats.cpm?.toLocaleString() ?? 0}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div id="pagination" className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
