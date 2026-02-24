import styles from "./Header.module.css";

export default function Header({ ngo }) {
  return (
    <div className={styles.header}>
      
      {/* LEFT SIDE */}
      <div className={styles.left}>
        <h2 className={styles.greeting}>
         
        </h2>

        <p className={styles.subtext}>
          
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.right}>
        <div className={styles.notification}>
          🔔
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar}>
            {ngo?.name?.charAt(0) || "N"}
          </div>

          <div>
            <p className={styles.profileName}>
              {ngo?.name || "NGO Account"}
            </p>
            <span className={styles.accountType}>
              NGO Account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}