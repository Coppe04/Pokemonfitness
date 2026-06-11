import { useState, useEffect } from 'react';
import { spriteAnimatedUrl, spriteStaticUrl } from '../data/pokemon';
import { POKEMON_DIALOGUES } from '../data/story';
import PokemonDialogue from './PokemonDialogue';
import styles from './PokemonCard.module.css';

const STAT_CONFIG = [
  { key: 'atk',   label: 'ATK',   emoji: '⚔️',  color: '#ef4444' },
  { key: 'def',   label: 'DEF',   emoji: '🛡️',  color: '#3b82f6' },
  { key: 'spd',   label: 'SPD',   emoji: '⚡',  color: '#f59e0b' },
  { key: 'spatk', label: 'SP.ATK',emoji: '🔮',  color: '#8b5cf6' },
  { key: 'spdef', label: 'SP.DEF',emoji: '💠',  color: '#06b6d4' },
];

export default function PokemonCard({ poke, baseData, xpPercent, canEvolve, onEvolve, battleStatus, gameState }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const animated = new Image();
    animated.onload = () => { setImgSrc(spriteAnimatedUrl(poke.id)); setLoaded(true); };
    animated.onerror = () => { setImgSrc(spriteStaticUrl(poke.id)); setLoaded(true); };
    animated.src = spriteAnimatedUrl(poke.id);
  }, [poke.id]);

  const buffs   = battleStatus?.filter((c) => c.type === 'buff')   ?? [];
  const debuffs = battleStatus?.filter((c) => c.type === 'debuff') ?? [];

  return (
    <div className={styles.card}>
      <div className={styles.decorCircle} />

      <div className={styles.nameRow}>
        <span className={styles.name}>{poke.name}</span>
        <span className={styles.typeBadge} style={{ background: baseData.typeBg, color: baseData.typeColor }}>
          {poke.type || baseData.type}
        </span>
      </div>

      <div className={styles.spriteArea}>
        {imgSrc && <img src={imgSrc} alt={poke.name} className={`${styles.sprite} ${loaded ? styles.loaded : ''}`} />}
        {!loaded && <div className={styles.spritePlaceholder} />}
        {gameState && (
          <PokemonDialogue text={POKEMON_DIALOGUES.find(d => d.condition(gameState))?.text} />
        )}
      </div>

      <div className={styles.levelBadge}>Lv. {poke.level}</div>

      {/* Status Badges */}
      {(buffs.length > 0 || debuffs.length > 0) && (
        <div className={styles.statusRow}>
          {buffs.map((c) => (
            <span key={c.id} className={`${styles.statusBadge} ${styles.buff}`} title={c.label}>
              {c.emoji} {c.label}
            </span>
          ))}
          {debuffs.map((c) => (
            <span key={c.id} className={`${styles.statusBadge} ${styles.debuff}`} title={c.label}>
              {c.emoji} {c.label}
            </span>
          ))}
        </div>
      )}

      {/* HP + XP bars */}
      <div className={styles.bars}>
        <div className={styles.barRow}>
          <span className={styles.barLabel}>XP</span>
          <div className={styles.barTrack}>
            <div className={`${styles.barFill} ${styles.barXp}`} style={{ width: `${xpPercent}%` }} />
          </div>
          <span className={styles.barValue}>{poke.currentXp} / {poke.xpToEvolve}</span>
        </div>
        <div className={styles.barRow}>
          <span className={styles.barLabel}>HP</span>
          <div className={styles.barTrack}>
            <div className={`${styles.barFill} ${styles.barHp}`} style={{ width: `${poke.currentHp}%` }} />
          </div>
          <span className={styles.barValue}>{poke.currentHp} / 100</span>
        </div>
      </div>

      {/* Battle Stats */}
      <div className={styles.battleStats}>
        <p className={styles.battleStatsTitle}>Stats de Batalha</p>
        {STAT_CONFIG.map(({ key, label, emoji, color }) => (
          <div key={key} className={styles.statRow}>
            <span className={styles.statLabel}>{emoji} {label}</span>
            <div className={styles.statTrack}>
              <div
                className={styles.statFill}
                style={{ width: `${poke.battleStats?.[key] ?? 0}%`, background: color }}
              />
            </div>
            <span className={styles.statValue}>{poke.battleStats?.[key] ?? 0}</span>
          </div>
        ))}
      </div>

      {/* Evolve button */}
      {canEvolve && (
        <button className={styles.evolveBanner} onClick={onEvolve}>
          <span className={styles.evolveIcon}>✨</span>
          <div className={styles.evolveText}>
            <strong>Pronto pra evoluir!</strong>
            <span>Toque para evoluir</span>
          </div>
          <span className={styles.evolveArrow}>›</span>
        </button>
      )}
    </div>
  );
}
