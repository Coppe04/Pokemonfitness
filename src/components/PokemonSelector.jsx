import { spriteStaticUrl } from '../data/pokemon';
import styles from './PokemonSelector.module.css';

export default function PokemonSelector({ pokemonList, currentIndex, onSelect }) {
  return (
    <div className={styles.selector}>
      {pokemonList.map((p, i) => (
        <button
          key={p.id}
          className={`${styles.chip} ${i === currentIndex ? styles.active : ''}`}
          onClick={() => onSelect(i)}
          aria-label={`Selecionar ${p.name}`}
        >
          <img
            src={spriteStaticUrl(p.id)}
            alt={p.name}
            className={styles.chipImg}
          />
          <span className={styles.chipName}>{p.name}</span>
          {p.evolved && <span className={styles.evolvedDot} title="Evoluído" />}
        </button>
      ))}
    </div>
  );
}
