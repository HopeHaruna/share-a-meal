import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); 
  };

  return (
    <header className={styles.header}>
      <div className={styles.rightSection}>
        <div className={styles.iconWrapper}>
          <FaBell className={styles.bellIcon} />
          <span className={styles.notifBadge}></span>
        </div>

        <div className={styles.profileBadge}>
          <img 
            src={user?.avatar || ""} 
            alt="Profile" 
            className={styles.avatar} 
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userRole}>
              {user?.type?.toUpperCase()} Account
            </span>
          </div>
        </div>

       
      </div>
    </header>
  );
};

export default Header;