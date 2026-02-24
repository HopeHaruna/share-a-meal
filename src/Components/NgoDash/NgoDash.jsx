import { useEffect, useState } from "react";
import styles from "../NgoDash/NgoDash.module.css"
import ngoMock from "../../../src/assets/data/ngoMock"

export default function NgoDash() {
  const [ngo, setNgo] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setNgo(ngoMock);
    }, 800);
  }, []);

  if (!ngo) return <div className={styles.dashboard}>Loading dashboard...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>Hello, Welcome Back 👋</h2>
        <p className={styles.subtext}>
          {ngo.name} • Operating in {ngo.location.areas.join(" & ")}
        </p>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <h4>Available Nearby</h4>
          <h2>{ngo.stats.availableNearby}</h2>
        </div>

        <div className={`${styles.card} ${styles.greenCard}`}>
          <h4>Reserved Meals</h4>
          <h2>{ngo.stats.reservedMeals}</h2>
        </div>

        <div className={styles.card}>
          <h4>Total Meals Saved</h4>
          <h2>{ngo.stats.totalMealsSaved}</h2>
        </div>
      </div>
    <div className={styles.recommendHeader}>
    <div className={styles.matchIcon}>✨</div>
    <div>
      <h3 className={styles.recommendTitle}>
        Recommended For You <span className={styles.count}>2</span>
      </h3>
      <p className={styles.matchText}>
      High match — these listings match your capacity and are close to your location
    </p>
    </div>
    </div>
     
      <div className={styles.recommendations}>
        {ngo.recommendations.map((item) => (
          <div key={item.id} className={styles.recommendCard}>
            <h4>{item.title}</h4>
            <p>From: {item.restaurant}</p>
            <p>
              {item.distance} • Prepared {item.preparedTime}
            </p>
            <button className={styles.reserveBtn}>
              Reserve Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}