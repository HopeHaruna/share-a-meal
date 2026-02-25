import { useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';

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
          <li><HashLink smooth to="/#how-it-works-ln" className={styles.activeLink}>How it Works</HashLink></li>
          <li><HashLink smooth to="/#impact" className={styles.activeLink}>Impact</HashLink></li>
          <li><HashLink smooth to="/#about-us" className={styles.activeLink}>AboutUs</HashLink></li>
          <Link to="/signup" className={styles.navBtn}>Get Started</Link>
        </ul>
        <div className={styles.hamburger} onClick={toggleMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
       
        <hr className={styles.navDivider} />

      {/* Mobile Dropdown Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.show : ""}`}>
        <Link to="/" onClick={toggleMenu}>Home</Link>
        <HashLink to="/#how-it-works-ln" onClick={toggleMenu}>How it Works</HashLink>
        <HashLink to="/#impact" onClick={toggleMenu}>Impact</HashLink>
        <HashLink to="/#about-us" onClick={toggleMenu}>AboutUS</HashLink>
        <Link to="/signup" className={styles.mobileNavBtn} onClick={toggleMenu}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;