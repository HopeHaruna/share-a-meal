import { useEffect, useState } from "react";
import styles from "./SmeDash.module.css";

const SmeDash = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Server not responding");
        return res.json();
      })
      .then((json) => {
        // FIX: json-server returns an array [ {...} ]. 
        // We need the first object inside that array.
        const dashboardData = Array.isArray(json) ? json[0] : json;
        setData(dashboardData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  // Guard Clause: Don't render the dashboard until data is actually loaded
  if (loading) 
  return 
  <div className={styles.loader}>Loading Dashboard...</div>;
  if (!data) 
  return <div className={styles.error}>No data found. Ensure json-server is running.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>HELLO, WELCOME BACK</h1>
        {/* Use optional chaining ?. just in case */}
        <p className={styles.restaurantName}>{data?.restaurantName}</p>
        <p className={styles.location}>📍 Location: {data?.location}</p>
      </header>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{data?.stats?.active}</span>
          <span className={styles.statLabel}>ACTIVE</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{data?.stats?.pickedUp}</span>
          <span className={styles.statLabel}>PICKED UP</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{data?.stats?.donations}</span>
          <span className={styles.statLabel}>DONATIONS</span>
        </div>
      </div>

      {/* Smart Insights */}
      <div className={styles.insightsCard}>
        <h3>✨ SMART INSIGHTS</h3>
        <ul>
          <li>{data?.insights?.nearbyNGOs} NGOs nearby are actively seeking food donations</li>
          <li>Peak pickup time {data?.insights?.peakTime}</li>
          <li>Your donations saved {data?.insights?.mealsSaved} meals this month</li>
        </ul>
      </div>

      {/* Active Listings */}
      <div className={styles.sectionHeader}>
        <h2>ACTIVE LISTINGS</h2>
        <button className={styles.viewAll}>View All</button>
      </div>

      <div className={styles.listingsStack}>
        {/* Safety check to ensure listings exists before mapping */}
        {data?.listings?.map((item, index) => (
          <div key={item.id || index} className={styles.listingCard}>
            <div className={styles.listingInfo}>
              <h3>{item.quantity} {item.title}</h3>
              <p className={styles.expiry}>{item.statusText}</p>
              <p>🕒 Prepared: {item.preparedTime}</p>
              <p>📍 {item.location}</p>
              <span className={styles.statusBadge}>{item.badgeText}</span>
            </div>
            <div className={styles.listingImagePlaceholder}></div>
          </div>
        ))}
      </div>

      <div className={styles.footerAction}>
        <button className={styles.addBtn}>+ Add Donations</button>
      </div>
    </div>
  );
};

export default SmeDash;