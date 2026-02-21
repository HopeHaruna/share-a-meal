import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import styles from "./Footer.module.css";
import logo from "../../assets/logo.png";


function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <img src={logo} alt="Share-A-Meal" className={styles.logoImg} />
            <span className={styles.brandName}>Share-A-Meal</span>
          </div>
          <p className={styles.tagline}>Connecting SMEs, Sponsors & People in Need.</p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialIcon} aria-label="Instagram"><FaInstagram /></a>
            <a href="#" className={styles.socialIcon} aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" className={styles.socialIcon} aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="#" className={styles.socialIcon} aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>
        <div className={styles.linksGrid}>
          <div className={styles.column}>
            <h4>Pages</h4>
            <Link to="/">Home</Link>
            <Link to="/how-it-works">How it Works</Link>
            <Link to="/impact">Impact</Link>
            <Link to="/about">About Us</Link>
          </div>
          <div className={styles.column}>
            <h4>Community</h4>
            <Link to="/sponsors">Sponsors</Link>
            <Link to="/ngos">Partner NGOs</Link>
            <Link to="/volunteer">Volunteer</Link>
          </div>
          <div className={styles.column}>
            <h4>Support</h4>
            <Link to="/help">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/faq">FAQs</Link>
          </div>
          <div className={styles.column}>
            <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>© 2026 Share-A-Meal Ltd. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;