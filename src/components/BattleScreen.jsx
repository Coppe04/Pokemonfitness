import { useState, useCallback } from 'react';
import { WILD_POKEMON, spriteAnimatedUrl, spriteStaticUrl } from '../data/pokemon';
import { getEffectiveStats, calcDamage } from '../utils/battleStatus';
import styles from './BattleScreen.module.css';

const PHASES = { SELECT: 'select', FIGHT: 'fight', RESULT: 'result' };
const AI_MOVES = ['attack', 'attack', 'special', 'defend'];

function WildSprite({ id, name, animClass }) {
  const [src, setSrc] = useState(spriteAnimatedUrl(id));
  return (
    <div className={styles.floatingTextContainer}>
      <img
        src={src}
        alt={name}
        className={`${styles.sprite} ${animClass ? styles[animClass] : ''}`}
        onError={() => setSrc(spriteStaticUrl(id))}
      />
    </div>
  );
}

export default function BattleScreen({ playerPoke, battleStatus, onClose, onBattleEnd }) {
  const [phase, setPhase] = useState(PHASES.SELECT);
  const [opponent, setOpponent] = useState(null);
  const [playerHp, setPlayerHp] = useState(playerPoke.currentHp);
  const [opponentHp, setOpponentHp] = useState(0);
  const [log, setLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [result, setResult] = useState(null); // 'win' | 'lose'
  const [busy, setBusy] = useState(false);

  // Estados de Animação
  const [playerAnim, setPlayerAnim] = useState(null);
  const [oppAnim, setOppAnim] = useState(null);
  const [playerDmgText, setPlayerDmgText] = useState(null);
  const [oppDmgText, setOppDmgText] = useState(null);

  const eff = getEffectiveStats(playerPoke.battleStats, battleStatus);

  const addLog = (msg) => setLog((l) => [msg, ...l].slice(0, 6));

  const startBattle = (wild) => {
    setOpponent(wild);
    setOpponentHp(wild.maxHp);
    setPlayerHp(playerPoke.currentHp);
    setLog([`⚔️ ${playerPoke.name} vs ${wild.name}! Vá!`]);
    const playerFirst = eff.spd >= wild.spd;
    setIsPlayerTurn(playerFirst);
    if (!playerFirst) addLog(`${wild.name} age primeiro!`);
    setPhase(PHASES.FIGHT);
  };

  const runOpponentTurn = useCallback((curPlayerHp, opp, playerDefending) => {
    setBusy(true);
    setTimeout(() => {
      const move = AI_MOVES[Math.floor(Math.random() * AI_MOVES.length)];
      let dmg = 0;
      let msg = '';
      const defStat = playerDefending ? Math.floor(eff.def * 1.5) : eff.def;

      const isAttack = move === 'special' || move === 'attack';
      
      if (move === 'defend') {
        msg = `🛡️ ${opp.name} se defende!`;
      } else if (move === 'special') {
        dmg = calcDamage(opp.spatk, eff.spdef);
        msg = `🔮 ${opp.name} usou Ataque Especial! -${dmg} HP`;
      } else {
        dmg = calcDamage(opp.atk, defStat);
        msg = `⚔️ ${opp.name} atacou! -${dmg} HP`;
      }

      addLog(msg);

      if (isAttack) {
        setOppAnim('animLungeTop');
        setTimeout(() => {
          setPlayerAnim('animShake');
          setPlayerDmgText(dmg);
          const newHp = Math.max(0, curPlayerHp - dmg);
          setPlayerHp(newHp);
          
          setTimeout(() => {
            setOppAnim(null);
            setPlayerAnim(null);
            setPlayerDmgText(null);
            checkEnd(newHp);
          }, 600);
        }, 150);
      } else {
        checkEnd(curPlayerHp);
      }

      function checkEnd(finalHp) {
        if (finalHp <= 0) {
          setResult('lose');
          setPhase(PHASES.RESULT);
          onBattleEnd({ win: false, xpGain: 0, hpChange: -15 });
        } else {
          setIsPlayerTurn(true);
        }
        setBusy(false);
      }
    }, 800);
  }, [eff, onBattleEnd]);

  const handlePlayerMove = (move) => {
    if (!isPlayerTurn || busy || phase !== PHASES.FIGHT) return;
    setBusy(true);
    setIsPlayerTurn(false);

    let dmg = 0;
    let msg = '';
    let newOppHp = opponentHp;
    let defending = false;

    let isAttack = false;

    if (move === 'defend') {
      defending = true;
      msg = `🛡️ ${playerPoke.name} se defende! DEF +50%`;
    } else if (move === 'special') {
      const isConfused = battleStatus.some((c) => c.effect === 'all_penalty');
      if (isConfused && Math.random() < 0.25) {
        dmg = Math.floor(calcDamage(eff.spatk, eff.spdef) * 0.5);
        msg = `😵 Confuso! ${playerPoke.name} acertou a si mesmo! -${dmg} HP`;
        isAttack = 'self';
      } else {
        dmg = calcDamage(eff.spatk, opponent.spdef);
        msg = `🔮 ${playerPoke.name} usou Ataque Especial! -${dmg} HP`;
        isAttack = 'opponent';
      }
    } else {
      dmg = calcDamage(eff.atk, opponent.def);
      msg = `⚔️ ${playerPoke.name} atacou! -${dmg} HP`;
      isAttack = 'opponent';
    }

    addLog(msg);

    const checkEndPlayer = (finalOppHp, finalPlayerHp) => {
      if (finalOppHp <= 0) {
        const xpGain = opponent.level * 10;
        setResult('win');
        setPhase(PHASES.RESULT);
        onBattleEnd({ win: true, xpGain, hpChange: 5 });
        setBusy(false);
        return;
      }
      
      if (finalPlayerHp <= 0) {
        setResult('lose');
        setPhase(PHASES.RESULT);
        onBattleEnd({ win: false, xpGain: 0, hpChange: -15 });
        setBusy(false);
        return;
      }

      const isParalyzed = battleStatus.some((c) => c.effect === 'spd_penalty');
      if (isParalyzed && Math.random() < 0.5) {
        addLog(`⚡ ${playerPoke.name} está paralisado!`);
        setBusy(false);
        runOpponentTurn(finalPlayerHp, opponent, false);
        return;
      }

      setTimeout(() => {
        setBusy(false);
        runOpponentTurn(finalPlayerHp, opponent, defending);
      }, 400);
    };

    if (isAttack === 'opponent') {
      setPlayerAnim('animLungeBottom');
      setTimeout(() => {
        setOppAnim('animShake');
        setOppDmgText(dmg);
        newOppHp = Math.max(0, opponentHp - dmg);
        setOpponentHp(newOppHp);
        
        setTimeout(() => {
          setPlayerAnim(null);
          setOppAnim(null);
          setOppDmgText(null);
          checkEndPlayer(newOppHp, playerHp);
        }, 600);
      }, 150);
    } else if (isAttack === 'self') {
      setPlayerAnim('animShake');
      setPlayerDmgText(dmg);
      const newPlayerHp = Math.max(0, playerHp - dmg);
      setPlayerHp(newPlayerHp);
      
      setTimeout(() => {
        setPlayerAnim(null);
        setPlayerDmgText(null);
        checkEndPlayer(opponentHp, newPlayerHp);
      }, 600);
    } else {
      checkEndPlayer(opponentHp, playerHp);
    }
  };

  const hpPct = (hp, max) => Math.max(0, Math.round((hp / max) * 100));
  const hpColor = (pct) => pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';

  // ── SELECT ────────────────────────────────────────────────
  if (phase === PHASES.SELECT) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <span className={styles.headerIcon}>⚔️</span>
            <h2 className={styles.headerTitle}>Batalha Treino</h2>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <p className={styles.selectHint}>Escolha um oponente:</p>
          <div className={styles.wildList}>
            {WILD_POKEMON.map((w) => (
              <button key={w.id} className={styles.wildCard} onClick={() => startBattle(w)}>
                <img src={spriteStaticUrl(w.id)} alt={w.name} className={styles.wildSprite}
                  onError={(e) => { e.target.style.display = 'none'; }} />
                <div className={styles.wildInfo}>
                  <span className={styles.wildName}>{w.name}</span>
                  <span className={styles.wildLevel}>Lv. {w.level}</span>
                </div>
                <div className={styles.wildStats}>
                  <span>⚔️ {w.atk}</span><span>🛡️ {w.def}</span><span>⚡ {w.spd}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────
  if (phase === PHASES.RESULT) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.resultBox}>
            <span className={styles.resultEmoji}>{result === 'win' ? '🏆' : '💔'}</span>
            <h2 className={styles.resultTitle}>{result === 'win' ? 'Vitória!' : 'Derrota!'}</h2>
            <p className={styles.resultSub}>
              {result === 'win' ? `+${opponent.level * 10} XP ganho` : 'Treine mais para ficar mais forte!'}
            </p>
            <button className={styles.closeBtn2} onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── FIGHT ─────────────────────────────────────────────────
  const playerPct = hpPct(playerHp, 100);
  const oppPct    = hpPct(opponentHp, opponent.maxHp);

  return (
    <div className={styles.overlay}>
      <div className={styles.battleModal}>
        {/* Oponente */}
        <div className={styles.combatantTop}>
          <div className={styles.combatantInfo}>
            <span className={styles.combatantName}>{opponent.name}</span>
            <span className={styles.combatantLevel}>Lv. {opponent.level}</span>
          </div>
          <div className={styles.hpBar}>
            <div className={`${styles.hpFill} ${oppPct <= 25 ? styles.hpLow : ''}`} style={{ width: `${oppPct}%`, background: hpColor(oppPct) }} />
          </div>
          <span className={styles.hpText}>{opponentHp} / {opponent.maxHp}</span>
          <div className={styles.spriteWrapperTop}>
            <WildSprite id={opponent.id} name={opponent.name} animClass={oppAnim} />
            {oppDmgText && <span className={styles.floatingText}>-{oppDmgText}</span>}
          </div>
        </div>

        {/* Jogador */}
        <div className={styles.combatantBottom}>
          <div className={styles.spriteWrapperBottom}>
            <WildSprite id={playerPoke.id} name={playerPoke.name} animClass={playerAnim} />
            {playerDmgText && <span className={styles.floatingText}>-{playerDmgText}</span>}
          </div>
          <div className={styles.combatantInfo}>
            <span className={styles.combatantName}>{playerPoke.name}</span>
            <span className={styles.combatantLevel}>Lv. {playerPoke.level}</span>
          </div>
          <div className={styles.hpBar}>
            <div className={`${styles.hpFill} ${playerPct <= 25 ? styles.hpLow : ''}`} style={{ width: `${playerPct}%`, background: hpColor(playerPct) }} />
          </div>
          <span className={styles.hpText}>{playerHp} / 100</span>
        </div>

        {/* Log */}
        <div className={styles.logBox}>
          {log.map((msg, i) => (
            <p key={i} className={`${styles.logMsg} ${i === 0 ? styles.logNew : ''}`}>{msg}</p>
          ))}
        </div>

        {/* Ações */}
        <div className={styles.moveGrid}>
          <button className={`${styles.moveBtn} ${styles.movePhy}`}
            onClick={() => handlePlayerMove('attack')} disabled={!isPlayerTurn || busy}>
            ⚔️ Atacar
          </button>
          <button className={`${styles.moveBtn} ${styles.moveSp}`}
            onClick={() => handlePlayerMove('special')} disabled={!isPlayerTurn || busy}>
            🔮 Especial
          </button>
          <button className={`${styles.moveBtn} ${styles.moveDef}`}
            onClick={() => handlePlayerMove('defend')} disabled={!isPlayerTurn || busy}>
            🛡️ Defender
          </button>
          <button className={`${styles.moveBtn} ${styles.moveFlee}`}
            onClick={onClose} disabled={busy}>
            🏃 Fugir
          </button>
        </div>

        {!isPlayerTurn && !busy && (
          <p className={styles.turnIndicator}>Turno do oponente...</p>
        )}
      </div>
    </div>
  );
}
