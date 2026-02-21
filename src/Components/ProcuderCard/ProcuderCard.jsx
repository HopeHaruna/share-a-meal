import styles from './ProcuderCard.module.css';

export default function ProcuderCard ({ title, icon, description}){
  return (
    <div 
      className={styles.card} 
      
    >
      <h3 className={styles.title}>{title}</h3>

      <div className={styles.iconWrapper}>
        <div className={styles.icon}>
          {icon}
        </div>
      </div>

      <p className={styles.description}>
        {description}
      </p>
    </div>
  );
};

