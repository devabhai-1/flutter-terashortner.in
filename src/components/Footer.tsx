import "../styles/Footer.css";

function Footer() {
  return (
    <footer>
      <div className="footer-links">
        <a href="#privacy">Privacy Policy</a> | <a href="#">Terms</a> |{" "}
        <a href="#">Support</a>
      </div>
      <div className="social-links">
        <a href="#">Facebook</a> | <a href="#">Telegram</a> |{" "}
        <a href="#">Instagram</a>
      </div>
      <p>© 2025 ShortEarn. All rights reserved.</p>
    </footer>
  );
}

export default Footer;

