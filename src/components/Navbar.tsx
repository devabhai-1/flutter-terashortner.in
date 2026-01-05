import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src="/logo.png" alt="ShortEarn Logo" className="logo-image" />
          <span className="logo-text">ShortEarn</span>
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <a href="#cpm">CPM</a>
        </li>
        <li>
          <a href="#privacy">Privacy</a>
        </li>
        <li>
          <a href="#earnings">Earnings</a>
        </li>
      </ul>
      <div className="auth-buttons">
        <Link to="/login" className="btn login-btn">
          Login
        </Link>
        <Link to="/signup" className="btn signup-btn">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;

