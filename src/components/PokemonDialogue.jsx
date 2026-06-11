import styles from './PokemonDialogue.module.css';

export default function PokemonDialogue({ text }) {
  if (!text) return null;

  return (
    <div className={styles.balloon}>
      <p className={styles.text}>{text}</p>
      <div className={styles.tail}></div>
    </div>
  );
}
