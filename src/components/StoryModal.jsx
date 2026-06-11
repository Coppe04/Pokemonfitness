import { useState } from 'react';
import styles from './StoryModal.module.css';
import imgProfGymRat from '../assets/images/prof_gymrat.png';
import imgRivalSedentauro from '../assets/images/rival_sedentauro.png';
import imgCmtCalorix from '../assets/images/cmt_calorix.png';

export default function StoryModal({ sequence, onClose }) {
  const [index, setIndex] = useState(0);

  if (!sequence || sequence.length === 0) return null;

  const currentLine = sequence[index];

  const handleNext = () => {
    if (index < sequence.length - 1) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  };

  const getAvatar = (speaker) => {
    if (speaker === 'Prof. GymRat') return imgProfGymRat;
    if (speaker === 'Rival Sedentauro') return imgRivalSedentauro;
    if (speaker === 'Cmt. Calórix') return imgCmtCalorix;
    return null;
  };

  const avatarSrc = getAvatar(currentLine.speaker);

  return (
    <div className={styles.overlay} onClick={handleNext}>
      <div className={styles.dialogContainer} onClick={(e) => e.stopPropagation()}>
        {avatarSrc && (
          <div className={styles.avatarBox}>
            <img src={avatarSrc} alt={currentLine.speaker} className={styles.avatarImg} />
          </div>
        )}
        <div className={styles.dialogBox}>
          <div className={styles.speakerBox}>
            {currentLine.speaker}
          </div>
          <div className={styles.textBox}>
            <p className={styles.text}>{currentLine.text}</p>
            <span className={styles.cursor} onClick={handleNext}>▼</span>
          </div>
        </div>
      </div>
    </div>
  );
}
