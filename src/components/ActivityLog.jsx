import styles from './ActivityLog.module.css';

export default function ActivityLog({ log }) {
  if (log.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.sectionTitle}>Histórico</p>
        <p className={styles.empty}>Nenhuma atividade ainda. Comece a treinar! 💪</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className={styles.sectionTitle}>Histórico</p>
      <ul className={styles.list}>
        {log.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <span className={`${styles.dot} ${entry.type === 'workout' ? styles.dotWorkout : styles.dotFood}`} />
            <span className={styles.name}>{entry.name}</span>
            <span className={styles.time}>{entry.time}</span>
            <span className={styles.xp}>+{entry.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
