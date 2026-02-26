
import React from 'react';
import styles from './Header.module.css';
import { MdNotificationsNone } from 'react-icons/md';

export default function Header ({name, role, avator}){
  return(
   <header className={styles.header}>
      <div className={styles.headerRight}>
        {/* Notification Section */}
        <div className={styles.notificationWrapper}>
          <MdNotificationsNone className={styles.headerIcon} />
          <span className={styles.dot}></span>
        </div>

        {/* Vertical Divider (optional based on image) */}
        <div className={styles.divider}></div>

        {/* Profile Section */}
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{avator}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{name}</span>
            <span className={styles.userRole}>{role}</span>
          </div>
        </div>
      </div>
    </header>
  )
}




