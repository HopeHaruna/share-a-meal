import React from "react";
import styles from "./SmeDash.module.css";
import {
  FaUtensils,
  FaThLarge,
  FaClipboardList,
  FaTruck,
  FaMapMarkerAlt,
  FaCog,
  FaBell,
  FaSignOutAlt
} from "react-icons/fa";

const SmeDashboard = () => {
  return (
    <div className={styles.layout}>
   
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <FaUtensils />
          <span>Share A Meal</span>
        </div>

        <nav>
          <ul>
            <li className={styles.active}><FaThLarge /> Dashboard</li>
            <li><FaClipboardList /> My Listings</li>
            <li><FaClipboardList /> Reservations</li>
            <li><FaTruck /> Pickups</li>
            <li><FaMapMarkerAlt /> Map</li>
            <li><FaCog /> Settings</li>
          </ul>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back, Restaurant Admin 👋</p>
          </div>

          <div className={styles.headerRight}>
            <FaBell />
            <div className={styles.user}>
              <div className={styles.avatar}>M</div>
              <div>
                <strong>Mama's Kitchen</strong>
                <span>SME Account</span>
              </div>
            </div>
            <FaSignOutAlt />
          </div>
        </header>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h4>Active Listings</h4>
            <h2>5</h2>
          </div>

          <div className={`${styles.card} ${styles.highlightGreen}`}>
            <h4>Pickups Today</h4>
            <h2>3</h2>
          </div>

          <div className={`${styles.card} ${styles.highlightOrange}`}>
            <h4>Expiring Soon</h4>
            <h2>1</h2>
          </div>

          <div className={`${styles.card} ${styles.highlightPeach}`}>
            <h4>Reservations</h4>
            <h2>2</h2>
          </div>
        </div>
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h3>My Food Listings</h3>
            <button className={styles.addBtn}>+ Add Listing</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Food Item</th>
                <th>Quantity</th>
                <th>Prep Time</th>
                <th>Location</th>
                <th>Expires In</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Jollof Rice</td>
                <td>15 plates</td>
                <td>2 hrs ago</td>
                <td>Yaba, Lagos</td>
                <td>4 hrs</td>
                <td><span className={styles.available}>Available</span></td>
              </tr>

              <tr>
                <td>Fried Plantain & Beans</td>
                <td>8 plates</td>
                <td>1 hr ago</td>
                <td>Surulere, Lagos</td>
                <td>3 hrs</td>
                <td><span className={styles.reserved}>Reserved</span></td>
              </tr>

              <tr>
                <td>Chicken Stew & Rice</td>
                <td>5 plates</td>
                <td>3 hrs ago</td>
                <td>Yaba, Lagos</td>
                <td>30 min</td>
                <td><span className={styles.expiring}>Expiring Soon</span></td>
              </tr>

              <tr>
                <td>Moi Moi</td>
                <td>20 wraps</td>
                <td>30 min ago</td>
                <td>Ikeja, Lagos</td>
                <td>5 hrs</td>
                <td><span className={styles.available}>Available</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default SmeDashboard;