import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaSearch, FaMap, FaExclamationTriangle } from "react-icons/fa";
import styles from "./NgoDash.module.css";

const NgoDash = () => {
  const context = useOutletContext();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3002/ngoDashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashData(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching NGO data:", err));
  }, []);
  if (!context || !context.user || loading) {
    return <div className={styles.loader}>Loading Dashboard Content...</div>;
  }

  const { user } = context;

  return (
    <div className={styles.container}>
      <header className={styles.welcome}>
        <h1>Hello, Welcome Back</h1>
        <p>
          {user.name}, <span>📍 Operating in {user.location}</span>
        </p>
      </header>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Available Food Nearby</p>
          <h2>{dashData.stats.available}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Reserved Meals</p>
          <h2>{dashData.stats.reserved}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Total Meals Saved</p>
          <h2>{dashData.stats.totalSaved}</h2>
        </div>
      </div>
      <div className={styles.actionRow}>
        <div className={styles.searchBar}>
          <FaSearch />
          <input type="text" placeholder="Search by food type or location..." />
        </div>
        <button className={styles.mapBtn}>
          <FaMap /> Map
        </button>
      </div>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>✨ Recommended For You ({dashData.recommended.length})</h3>
          <p>High Match: Based on your capacity and location</p>
        </div>
        <div className={styles.scrollRow}>
          {dashData.recommended.map((item) => (
            <div key={item.id} className={styles.foodCard}>
              <span className={styles.badge}>High Match</span>
              <h4>{item.title}</h4>
              <p>From: {item.restaurant}</p>
              <div className={styles.meta}>
                <span><FaMapMarkerAlt /> {item.location}</span>
                <span><FaClock /> {item.prepared}</span>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.status}>Available</span>
                <button className={styles.reserveBtn}>Reserve Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.urgentSection}>
        <h3>
          <FaExclamationTriangle color="#f6ad55" /> Urgent - Expiring Soon (
          {dashData.urgent.length})
        </h3>
        {dashData.urgent.map((item) => (
          <div key={item.id} className={styles.urgentCard}>
            <div className={styles.urgentInfo}>
              <h4>{item.title}</h4>
              <p>{item.restaurant} • {item.location}</p>
              <p className={styles.expiryText}>
                <FaClock /> {item.expires}
              </p>
            </div>
            <button className={styles.reserveBtn}>Reserve Now</button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default NgoDash;