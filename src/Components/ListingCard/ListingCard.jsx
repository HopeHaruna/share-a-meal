import React from 'react';
import styles from './ListingCard.module.css';
import { MdLocationOn, MdAutoAwesome } from 'react-icons/md';

export default function ListingCard({ title, restaurant, distance, isHighMatch = true }){
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h4 className={styles.title}>{title}</h4>
        {isHighMatch && (
          <span className={styles.matchBadge}>
            <MdAutoAwesome className={styles.sparkleIcon} />
            High Match
          </span>
        )}
      </div>
      
      <p className={styles.restaurantLabel}>
        From: <span className={styles.restaurantName}>{restaurant}</span>
      </p>
      
      <div className={styles.cardFooter}>
        <span className={styles.locationInfo}>
          <MdLocationOn className={styles.pinIcon} />
          Yaba, Lagos • {distance}
        </span>
      </div>
    </div>
  );
};

