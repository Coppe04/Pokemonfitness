import styles from './DailyMission.module.css';
import imgProfGymRat from '../assets/images/prof_gymrat.png';
import imgRivalSedentauro from '../assets/images/rival_sedentauro.png';
import imgCmtCalorix from '../assets/images/cmt_calorix.png';

export default function DailyMission({ mission, onComplete }) {
  if (!mission) return null;

  const getAvatar = (speaker) => {
    if (speaker === 'Prof. GymRat') return imgProfGymRat;
    if (speaker === 'Rival Sedentauro') return imgRivalSedentauro;
    if (speaker === 'Cmt. Calórix') return imgCmtCalorix;
    return null;
  };

  const avatarSrc = getAvatar(mission.giver);

  return (
    <div className={`${styles.card} ${mission.completed ? styles.completed : ''}`}>
      <div className={styles.header}>
        <div className={styles.giverInfo}>
          {avatarSrc && <img src={avatarSrc} alt={mission.giver} className={styles.avatarImg} />}
          <span className={styles.giver}>{mission.giver}</span>
        </div>
        {mission.completed && <span className={styles.status}>Concluída!</span>}
      </div>
      
      <p className={styles.text}>{mission.text}</p>
      
      <div className={styles.footer}>
        <div className={styles.objective}>
          <strong>Objetivo:</strong> {mission.objective}
        </div>
        <div className={styles.reward}>
          +{mission.reward} XP
        </div>
      </div>
    </div>
  );
}
