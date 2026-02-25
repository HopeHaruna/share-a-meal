import styles from './ImpactCard.module.css';

export default function ProcuderCard ({ title, icon, description}){
  return (
    <div className={styles.card}>
         <div className={styles.iconWrapper}>
        <div className={styles.icon}>
          {icon}
        </div>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>
        {description}
      </p>
    </div>
  );
};

