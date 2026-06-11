import { useState, useCallback } from 'react';
import { WILD_POKEMON, spriteAnimatedUrl, spriteStaticUrl } from '../data/pokemon';
import { getEffectiveStats, calcDamage } from '../utils/battleStatus';
import styles from './BattleScreen.module.css';

const PHASES = { SELECT: 'select', FIGHT: 'fight', RESULT: 'result' };
const AI_MOVES = ['attack', 'attack', 'special', 'defend'];

const MOVE_LIST = [
  { id: 'attack',  label: 'ATACAR',   type: 'FÍSICO'   },
  { id: 'special', label: 'ESPECIAL', type: 'ESPECIAL' },
  { id: 'defend',  label: 'DEFENDER', type: 'STATUS'   },
  { id: 'flee',    label: 'FUGIR',    type: '---'       },
];

function backSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${id}.gif`;
}
function backSpriteStaticUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;
}

function EnemySprite({ id, name, animClass }) {
  const [src, setSrc] = useState(spriteAnimatedUrl(id));
  return (
    <img
      key={id}
      src={src}
      alt={name}
      className={`${styles.enemySprite} ${animClass ? styles[animClass] : ''}`}
      onError={() => setSrc(spriteStaticUrl(id))}
    />
  );
}

function PlayerSprite({ id, name, animClass }) {
  const [src, setSrc] = useState(backSpriteUrl(id));
  const [tried, setTried] = useState(false);
  return (
    <img
      key={id}
      src={src}
      alt={name}
      className={`${styles.playerSprite} ${animClass ? styles[animClass] : ''}`}
      onError={() => {
        if (!tried) {
          setTried(true);
          setSrc(backSpriteStaticUrl(id));
        } else {
          setSrc(spriteStaticUrl(id));
        }
      }}
    />
  );
}

function HpBar({ hp, maxHp }) {
  const pct = Math.max(0, Math.round((hp / maxHp) * 100));
  const color = pct > 50 ? '#60d060' : pct > 20 ? '#f8d030' : '#f03030';
  return (
    <div className={styles.hpBarOuter}>
      <div className={styles.hpBarInner} style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function BattleScreen({ playerPoke, battleStatus, onClose, onBattleEnd }) {
  const [phase, setPhase] = useState(PHASES.SELECT);
  const [opponent, setOpponent] = useState(null);
  const [playerHp, setPlayerHp] = useState(playerPoke.currentHp);
  const [opponentHp, setOpponentHp] = useState(0);
  const [textMsg, setTextMsg] = useState('');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [oppDefending, setOppDefending] = useState(false);
  const [showMoves, setShowMoves] = useState(false);
  const [selectedMove, setSelectedMove] = useState(0);

  const [playerAnim, setPlayerAnim] = useState(null);
  const [oppAnim, setOppAnim] = useState(null);

  const eff = getEffectiveStats(playerPoke.battleStats, battleStatus);

  // ── Opponent AI turn ──────────────────────────────────────
  const runOpponentTurn = useCallback((curPlayerHp, opp, playerDefending) => {
    setBusy(true);
    setShowMoves(false);

    setTimeout(() => {
      const move = AI_MOVES[Math.floor(Math.random() * AI_MOVES.length)];
      const defStat = playerDefending ? Math.floor(eff.def * 1.5) : eff.def;
      const isAttack = move === 'special' || move === 'attack';
      let dmg = 0;

      if (move === 'defend') {
        setOppDefending(true);
        setTextMsg(`${opp.name} está se preparando!`);
      } else if (move === 'special') {
        dmg = calcDamage(opp.spatk, eff.spdef);
        setOppDefending(false);
        setTextMsg(`${opp.name} usou Ataque Especial!`);
      } else {
        dmg = calcDamage(opp.atk, defStat);
        setOppDefending(false);
        setTextMsg(`${opp.name} atacou!`);
      }

      if (isAttack) {
        setOppAnim('animLungeTop');
        setTimeout(() => {
          setPlayerAnim('animShake');
          const newHp = Math.max(0, curPlayerHp - dmg);
          setPlayerHp(newHp);
          setTimeout(() => {
            setOppAnim(null);
            setPlayerAnim(null);
            setTextMsg(`${playerPoke.name} perdeu ${dmg} HP!`);
            setTimeout(() => checkEnd(newHp), 900);
          }, 600);
        }, 200);
      } else {
        setTimeout(() => checkEnd(curPlayerHp), 900);
      }

      function checkEnd(finalHp) {
        if (finalHp <= 0) {
          setTextMsg(`${playerPoke.name} desmaiou!`);
          setTimeout(() => {
            setResult('lose');
            setPhase(PHASES.RESULT);
            onBattleEnd({ win: false, xpGain: 0, hpChange: -15 });
          }, 1000);
        } else {
          setIsPlayerTurn(true);
          setShowMoves(true);
          setTextMsg(`O que ${playerPoke.name} vai fazer?`);
        }
        setBusy(false);
      }
    }, 900);
  }, [eff, onBattleEnd, playerPoke.name]);

  // ── Start battle ──────────────────────────────────────────
  const startBattle = (wild) => {
    setOpponent(wild);
    setOpponentHp(wild.maxHp);
    setPlayerHp(playerPoke.currentHp);
    setOppDefending(false);
    setSelectedMove(0);
    const playerFirst = eff.spd >= wild.spd;
    setPhase(PHASES.FIGHT);

    // Intro sequence
    setBusy(true);
    setShowMoves(false);
    setTextMsg(`Um ${wild.name} selvagem apareceu!`);

    setTimeout(() => {
      if (!playerFirst) {
        setTextMsg(`${wild.name} é mais rápido e age primeiro!`);
        setTimeout(() => runOpponentTurn(playerPoke.currentHp, wild, false), 1000);
      } else {
        setIsPlayerTurn(true);
        setShowMoves(true);
        setTextMsg(`O que ${playerPoke.name} vai fazer?`);
        setBusy(false);
      }
    }, 1400);
  };

  // ── Player move ───────────────────────────────────────────
  const handlePlayerMove = (moveId) => {
    if (!isPlayerTurn || busy || phase !== PHASES.FIGHT) return;
    if (moveId === 'flee') { onClose(); return; }

    setBusy(true);
    setIsPlayerTurn(false);
    setShowMoves(false);

    let dmg = 0;
    let defending = false;
    let isAttack = false;

    if (moveId === 'defend') {
      defending = true;
      setTextMsg(`${playerPoke.name} está se defendendo!`);
    } else if (moveId === 'special') {
      const isConfused = battleStatus.some((c) => c.effect === 'all_penalty');
      const oppSpdef = oppDefending ? Math.floor(opponent.spdef * 1.5) : opponent.spdef;
      if (isConfused && Math.random() < 0.25) {
        dmg = Math.floor(calcDamage(eff.spatk, eff.spdef) * 0.5);
        setTextMsg(`${playerPoke.name} está confuso! Acertou a si mesmo!`);
        isAttack = 'self';
      } else {
        dmg = calcDamage(eff.spatk, oppSpdef);
        setTextMsg(`${playerPoke.name} usou Ataque Especial!`);
        isAttack = 'opponent';
      }
    } else {
      const oppDef = oppDefending ? Math.floor(opponent.def * 1.5) : opponent.def;
      dmg = calcDamage(eff.atk, oppDef);
      setTextMsg(`${playerPoke.name} atacou!`);
      isAttack = 'opponent';
    }

    setOppDefending(false);

    const finishTurn = (finalOppHp, finalPlayerHp) => {
      if (finalOppHp <= 0) {
        const xpGain = opponent.level * 10;
        setTextMsg(`${opponent.name} desmaiou!`);
        setTimeout(() => {
          setTextMsg(`${playerPoke.name} ganhou ${xpGain} pts de EXP!`);
          setTimeout(() => {
            setResult('win');
            setPhase(PHASES.RESULT);
            onBattleEnd({ win: true, xpGain, hpChange: 5 });
            setBusy(false);
          }, 1200);
        }, 900);
        return;
      }
      if (finalPlayerHp <= 0) {
        setTextMsg(`${playerPoke.name} desmaiou!`);
        setTimeout(() => {
          setResult('lose');
          setPhase(PHASES.RESULT);
          onBattleEnd({ win: false, xpGain: 0, hpChange: -15 });
          setBusy(false);
        }, 1200);
        return;
      }
      const isParalyzed = battleStatus.some((c) => c.effect === 'spd_penalty');
      if (isParalyzed && Math.random() < 0.5) {
        setTextMsg(`${playerPoke.name} está paralisado e não consegue se mover!`);
        setTimeout(() => { setBusy(false); runOpponentTurn(finalPlayerHp, opponent, false); }, 1100);
        return;
      }
      setTimeout(() => { setBusy(false); runOpponentTurn(finalPlayerHp, opponent, defending); }, 500);
    };

    if (isAttack === 'opponent') {
      setTimeout(() => {
        setPlayerAnim('animLungeBottom');
        setTimeout(() => {
          setOppAnim('animShake');
          const newOppHp = Math.max(0, opponentHp - dmg);
          setOpponentHp(newOppHp);
          setTimeout(() => {
            setPlayerAnim(null);
            setOppAnim(null);
            setTextMsg(`Causou ${dmg} de dano!`);
            setTimeout(() => finishTurn(newOppHp, playerHp), 800);
          }, 600);
        }, 300);
      }, 300);
    } else if (isAttack === 'self') {
      setTimeout(() => {
        setPlayerAnim('animShake');
        const newPlayerHp = Math.max(0, playerHp - dmg);
        setPlayerHp(newPlayerHp);
        setTimeout(() => {
          setPlayerAnim(null);
          setTextMsg(`Causou ${dmg} de dano a si mesmo!`);
          setTimeout(() => finishTurn(opponentHp, newPlayerHp), 800);
        }, 600);
      }, 400);
    } else {
      setTimeout(() => finishTurn(opponentHp, playerHp), 1000);
    }
  };

  // ── SELECT phase ──────────────────────────────────────────
  if (phase === PHASES.SELECT) {
    if (playerPoke.currentHp <= 0) {
      return (
        <div className={styles.overlay} onClick={onClose}>
          <div className={styles.classicModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.exhaustedBox}>
              <p className={styles.exhaustedEmoji}>😴</p>
              <p className={styles.exhaustedTitle}>{playerPoke.name.toUpperCase()} ESGOTADO!</p>
              <p className={styles.exhaustedSub}>Registre hábitos saudáveis para recuperar HP antes de batalhar.</p>
              <button className={styles.classicBtn} onClick={onClose}>VOLTAR</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.classicModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.selectHeader}>
            <span className={styles.selectIcon}>⚔️</span>
            <h2 className={styles.selectTitle}>BATALHA TREINO</h2>
            <button className={styles.xBtn} onClick={onClose}>✕</button>
          </div>
          <p className={styles.selectHint}>▶ Escolha um oponente:</p>
          <div className={styles.wildList}>
            {WILD_POKEMON.map((w) => (
              <button key={w.id} className={styles.wildCard} onClick={() => startBattle(w)}>
                <img src={spriteStaticUrl(w.id)} alt={w.name} className={styles.wildSprite}
                  onError={(e) => { e.target.style.display = 'none'; }} />
                <div className={styles.wildInfo}>
                  <span className={styles.wildName}>{w.name.toUpperCase()}</span>
                  <span className={styles.wildLevel}>Lv. {w.level}</span>
                </div>
                <div className={styles.wildStats}>
                  <span>ATQ {w.atk}</span>
                  <span>DEF {w.def}</span>
                  <span>VEL {w.spd}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT phase ──────────────────────────────────────────
  if (phase === PHASES.RESULT) {
    return (
      <div className={styles.overlay}>
        <div className={styles.classicModal}>
          <div className={styles.resultBox}>
            <p className={styles.resultEmoji}>{result === 'win' ? '🏆' : '💔'}</p>
            <p className={styles.resultTitle}>{result === 'win' ? 'VITÓRIA!' : 'DERROTA!'}</p>
            <p className={styles.resultSub}>
              {result === 'win'
                ? `${playerPoke.name.toUpperCase()} ganhou ${opponent.level * 10} pts de EXP!`
                : 'Treine mais para ficar mais forte!'}
            </p>
            <button className={styles.classicBtn} onClick={onClose}>FECHAR</button>
          </div>
        </div>
      </div>
    );
  }

  // ── FIGHT phase ───────────────────────────────────────────
  return (
    <div className={styles.overlay}>
      <div className={styles.battleWindow}>

        {/* ── Campo de batalha ── */}
        <div className={styles.field}>
          {/* Info do oponente – top left */}
          <div className={styles.enemyInfoBox}>
            <div className={styles.infoRow}>
              <span className={styles.pokeName}>{opponent.name.toUpperCase()}</span>
              <span className={styles.pokeLv}>Lv{opponent.level}</span>
            </div>
            <div className={styles.hpRow}>
              <span className={styles.hpLabel}>HP</span>
              <HpBar hp={opponentHp} maxHp={opponent.maxHp} />
            </div>
          </div>

          {/* Sprite oponente – top right */}
          <div className={styles.enemySpriteArea}>
            <EnemySprite key={opponent.id} id={opponent.id} name={opponent.name} animClass={oppAnim} />
            <div className={styles.platform} />
          </div>

          {/* Sprite jogador – bottom left */}
          <div className={styles.playerSpriteArea}>
            <PlayerSprite key={playerPoke.id} id={playerPoke.id} name={playerPoke.name} animClass={playerAnim} />
            <div className={styles.platform} />
          </div>

          {/* Info do jogador – bottom right */}
          <div className={styles.playerInfoBox}>
            <div className={styles.infoRow}>
              <span className={styles.pokeName}>{playerPoke.name.toUpperCase()}</span>
              <span className={styles.pokeLv}>Lv{playerPoke.level}</span>
            </div>
            <div className={styles.hpRow}>
              <span className={styles.hpLabel}>HP</span>
              <HpBar hp={playerHp} maxHp={100} />
            </div>
            <div className={styles.hpNumbers}>
              <span className={styles.hpCurrent}>{playerHp}</span>
              <span className={styles.hpSlash}>/</span>
              <span className={styles.hpMax}>100</span>
            </div>
          </div>
        </div>

        {/* ── Painel inferior ── */}
        <div className={styles.bottomPanel}>
          {showMoves ? (
            /* Move selection UI */
            <div className={styles.battleUI}>
              <div className={styles.movesGrid}>
                {MOVE_LIST.map((m, i) => (
                  <button
                    key={m.id}
                    className={`${styles.moveCell} ${selectedMove === i ? styles.moveCellActive : ''}`}
                    onClick={() => handlePlayerMove(m.id)}
                    onMouseEnter={() => setSelectedMove(i)}
                    disabled={busy}
                  >
                    {selectedMove === i && <span className={styles.cursor}>▶</span>}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
              <div className={styles.moveInfoPanel}>
                <div className={styles.ppBox}>
                  <span className={styles.ppLabel}>TIPO</span>
                  <span className={styles.ppType}>{MOVE_LIST[selectedMove].type}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Text box during animations */
            <div className={styles.textBox}>
              <p className={styles.textMsg}>{textMsg}</p>
              <span className={styles.textCursor}>▼</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
