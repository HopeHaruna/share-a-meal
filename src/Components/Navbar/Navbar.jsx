import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import styles from "./Navbar.module.css";
import logo from "../../assets/logo.png";


function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} alt="Logo" className={styles.logoImg} />
          </Link>
        </div>
        <ul className={styles.desktopLinks}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/how-it-works" className={styles.activeLink}>How it Works</Link></li>
          <li><Link to="/impact">Impact</Link></li>
          <li><Link to="/about">AboutUS</Link></li>
          <Link to="/signup" className={styles.navBtn}>Get Started</Link>
        </ul>
        <div className={styles.hamburger} onClick={toggleMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.show : ""}`}>
        <Link to="/" onClick={toggleMenu}>Home</Link>
        <Link to="/how-it-works" onClick={toggleMenu}>How it Works</Link>
        <Link to="/impact" onClick={toggleMenu}>Impact</Link>
        <Link to="/about" onClick={toggleMenu}>AboutUS</Link>
        <Link to="/signup" className={styles.mobileNavBtn} onClick={toggleMenu}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;