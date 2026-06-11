import { BADGES } from '../data/story';
import styles from './BadgesPanel.module.css';

export default function BadgesPanel({ earnedBadges, state, onClose }) {
  const getProgress = (badge) => {
    const req = badge.requirement;
    let current = 0;
    if (req.type === 'workout') current = state.totalWorkouts || 0;
    if (req.type === 'cardio') current = state.totalWorkouts || 0; // Using workouts for now
    if (req.type === 'waterDays') current = state.totalWaterDays || 0;
    if (req.type === 'meals') current = state.totalMeals || 0;
    if (req.type === 'zen') current = state.totalWorkouts || 0; // Using workouts for now
    if (req.type === 'sleep') current = state.totalSleep || 0;
    if (req.type === 'streak') current = state.streak || 0;
    if (req.type === 'level') current = state.pokemon[state.currentPokeIndex]?.level || 0;
    
    return { current, target: req.target, percent: Math.min(100, Math.round((current / req.target) * 100)) };
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Insígnias PokéFit</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.grid}>
          {BADGES.map(badge => {
            const isEarned = earnedBadges.includes(badge.id);
            const progress = getProgress(badge);
            
            return (
              <div key={badge.id} className={`${styles.badgeCard} ${isEarned ? styles.earned : styles.locked}`}>
                <div className={styles.iconBox}>{isEarned ? badge.emoji : '❓'}</div>
                <div className={styles.infoBox}>
                  <h3>{badge.name}</h3>
                  <p>{badge.description}</p>
                  {!isEarned && (
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${progress.percent}%` }}></div>
                    </div>
                  )}
                  <span className={styles.progressText}>
                    {isEarned ? 'Conquistada!' : `${progress.current} / ${progress.target}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
