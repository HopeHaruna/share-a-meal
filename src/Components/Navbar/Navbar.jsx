import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  return (
    <nav className={styles.nav}>
      <h2 className={styles.logo}>ShareAMeal</h2>

      <div className={styles.links}>
        <NavLink
          to="/sponsor"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Sponsor
        </NavLink>

        <NavLink
          to="/sme"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          SME
        </NavLink>

        <NavLink
          to="/ngo"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          NGO
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;