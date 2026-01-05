import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Home.css";

function Home() {
  console.log("Home component rendering");
  const [linkInput, setLinkInput] = useState("");

  const shortenLink = () => {
    const longURL = linkInput.trim();
    if (!longURL.startsWith("http://") && !longURL.startsWith("https://")) {
      alert("Enter valid http/https URL.");
      return;
    }

    const shortCode = Math.random().toString(36).slice(2, 8);
    const newShortUrl = `${window.location.origin}/a/${shortCode}`;
    setLinkInput(newShortUrl);
    alert("Shortened: " + newShortUrl);
  };

  const cpmRates = [
    "🇺🇸 USA - ₹400",
    "🇬🇧 UK - ₹380",
    "🇨🇦 Canada - ₹350",
    "🇦🇺 Australia - ₹330",
    "🇩🇪 Germany - ₹310",
    "🇫🇷 France - ₹300",
    "🇮🇳 India - ₹250",
    "🇧🇷 Brazil - ₹240",
    "🇮🇹 Italy - ₹230",
    "🇸🇬 Singapore - ₹320",
    "🇰🇷 Korea - ₹300",
    "🇯🇵 Japan - ₹310",
    "🇲🇾 Malaysia - ₹260",
    "🇵🇭 Philippines - ₹220",
    "🇮🇩 Indonesia - ₹200",
    "🇿🇦 South Africa - ₹180",
    "🇷🇺 Russia - ₹270",
    "🇲🇽 Mexico - ₹250",
    "🇦🇪 UAE - ₹330",
    "🇸🇦 Saudi Arabia - ₹300",
    "🇪🇬 Egypt - ₹180",
    "🇹🇷 Turkey - ₹210",
    "🇻🇳 Vietnam - ₹190",
    "🇹🇭 Thailand - ₹200",
    "🇳🇬 Nigeria - ₹150",
    "🇵🇰 Pakistan - ₹160",
    "🇧🇩 Bangladesh - ₹170",
    "🇳🇵 Nepal - ₹180",
    "🇨🇭 Switzerland - ₹320",
    "🇳🇱 Netherlands - ₹310",
    "🇪🇸 Spain - ₹300",
    "🇳🇴 Norway - ₹330",
    "🇸🇪 Sweden - ₹320",
    "🇧🇪 Belgium - ₹290",
    "🇫🇮 Finland - ₹280",
    "🇮🇪 Ireland - ₹270",
    "🇦🇹 Austria - ₹275",
    "🇨🇱 Chile - ₹240",
    "🇦🇷 Argentina - ₹220",
    "🇵🇹 Portugal - ₹230",
    "🇮🇱 Israel - ₹310",
    "🇭🇰 Hong Kong - ₹300",
    "🇳🇿 New Zealand - ₹340",
    "🇰🇪 Kenya - ₹160",
    "🇨🇳 China - ₹280",
    "🇶🇦 Qatar - ₹300",
    "🇴🇲 Oman - ₹270",
    "🇯🇴 Jordan - ₹260",
    "🇬🇷 Greece - ₹250",
    "🌍 Others - ₹200+",
  ];

  const earnings = [
    "🇮🇳 Ravi from India earned ₹42,000/month via YouTube traffic.",
    "🇧🇩 Samia from Bangladesh made ₹31,000 with Telegram groups.",
    "🇺🇸 John from USA crossed ₹60,000 sharing tech blog links.",
    "🇵🇭 Paolo from Philippines earns ₹18,000 monthly with Facebook links.",
    "🇧🇷 Bruno from Brazil earned ₹25,000 through meme pages.",
    "🇬🇧 James from UK posted gaming walkthroughs earning ₹48,000.",
    "🇨🇦 Emily promoted music videos and earned ₹34,000.",
    "🇳🇬 Ayo from Nigeria shared WhatsApp links and made ₹12,000.",
    "🇵🇰 Asad from Pakistan earned ₹22,000 from sports updates.",
    "🌍 Thousands of others earn daily with ShortEarn.",
  ];

  return (
    <>
      <Navbar />
      <section className="hero">
        <h1>Smart URL Shortener</h1>
        <p>Shorten your links and earn from every visitor</p>
        <div className="shortener-box">
          <input
            type="text"
            id="linkInput"
            placeholder="Paste your long URL here..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
          />
          <button id="shortenBtn" onClick={shortenLink}>
            Shorten Now
          </button>
        </div>
      </section>

      <section className="cpm-section" id="cpm">
        <div className="container">
          <h2>📊 Real-Time CPM Rates</h2>
          <p>Our dynamic CPM system adjusts based on traffic, country & device.</p>
          <div className="cpm-grid">
            {cpmRates.map((rate, index) => (
              <div key={index}>{rate}</div>
            ))}
          </div>
          <p className="note">Updated in real-time based on traffic performance.</p>
        </div>
      </section>

      <section id="privacy" className="content-box">
        <h2>🔐 Privacy Policy</h2>
        <p>
          At ShortEarn, your privacy is our priority. We maintain the highest
          standards in handling personal data globally.
          <br />
          <br />
          1. We collect only necessary data (e.g., email, IP) for improving
          services.
          <br />
          2. We never share user data with 3rd parties without consent.
          <br />
          3. Passwords are stored securely using industry-standard encryption.
          <br />
          4. Your shortened links are private unless you choose to share.
          <br />
          5. GDPR, CCPA, and other international compliance maintained.
          <br />
          6. You can request account deletion anytime.
          <br />
          7. No invasive tracking; only essential cookies used.
          <br />
          8. Logs are retained for 30 days for security.
          <br />
          9. Email communication only with user permission.
          <br />
          10. We perform regular data security audits.
          <br />
          11. Backups are encrypted and geographically distributed.
          <br />
          12. Third-party ad services are restricted to safe partners.
          <br />
          13. Child data is never knowingly collected.
          <br />
          14. User-generated content is monitored for violations.
          <br />
          15. Reports of abuse are taken seriously and acted on fast.
          <br />
          16. Admin access is secured with 2FA.
          <br />
          17. You retain full control over your account and links.
          <br />
          18. Privacy dashboard available in user profile.
          <br />
          19. Contact us for questions anytime.
          <br />
          20. Policy updates will be notified via email and dashboard.
        </p>
      </section>

      <section id="earnings" className="content-box">
        <h2>💼 Global Top Earners</h2>
        <ul className="earnings-list">
          {earnings.map((earning, index) => (
            <li key={index}>{earning}</li>
          ))}
        </ul>
      </section>

      <Footer />
    </>
  );
}

export default Home;

