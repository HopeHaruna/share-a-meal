import React from 'react';
import styles from './SideBar.module.css';
import { 
  MdDashboard, MdSearch, MdCalendarToday, MdLocalShipping, 
  MdChatBubbleOutline, MdSettings, MdLogout, MdKeyboardArrowLeft 
} from 'react-icons/md';

export default function Sidebar(){
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🍽️</span>
        <span className={styles.logoText}>Share A Meal</span>
      </div>
      
      <nav className={styles.nav}>
        <div className={`${styles.navItem} ${styles.active}`}>
          <MdDashboard /> Dashboard
        </div>
        <div className={styles.navItem}><MdSearch /> Browse Food</div>
        <div className={styles.navItem}><MdCalendarToday /> Reserve</div>
        <div className={styles.navItem}><MdLocalShipping /> Pickup</div>
        <div className={styles.navItem}>
          <MdChatBubbleOutline /> Messages
          <span className={styles.badge}>3</span>
        </div>
        <div className={styles.navItem}><MdSettings /> Settings</div>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.navItem}><MdLogout /> Logout</div>
        <div className={styles.navItem}><MdKeyboardArrowLeft /> Collapse</div>
      </div>
    </aside>
  );
};

