import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import PokemonSelector from './components/PokemonSelector';
import PokemonCard from './components/PokemonCard';
import ActionGrid from './components/ActionGrid';
import ActivityLog from './components/ActivityLog';
import Toast from './components/Toast';
import BattleScreen from './components/BattleScreen';
import styles from './App.module.css';

export default function App() {
  const {
    state,
    currentPoke,
    baseData,
    canEvolve,
    xpPercent,
    dailyRemaining,
    battleStatus,
    selectPokemon,
    doAction,
    evolvePokemon,
    applyBattleResult,
  } = useGameState();

  const [showBattle, setShowBattle] = useState(false);

  const handleBattleEnd = ({ win, xpGain, hpChange }) => {
    applyBattleResult(xpGain, hpChange);
  };

  return (
    <div className={styles.app}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.trainerInfo}>
          <div className={styles.avatar}>TR</div>
          <div>
            <p className={styles.trainerName}>{state.trainerName}</p>
            <p className={styles.trainerLevel}>Nível {state.trainerLevel}</p>
          </div>
        </div>
        <div className={styles.topActions}>
          <button
            id="btn-battle"
            className={styles.battleBtn}
            onClick={() => setShowBattle(true)}
            title="Batalha Treino"
          >
            ⚔️ Batalhar
          </button>
          <div className={styles.streak}>
            <span className={styles.streakFlame}>🔥</span>
            <span>{state.streak} dias</span>
          </div>
        </div>
      </header>

      {/* Pokémon selector */}
      <PokemonSelector
        pokemonList={state.pokemon}
        currentIndex={state.currentPokeIndex}
        onSelect={selectPokemon}
      />

      {/* Main Pokémon card */}
      <PokemonCard
        poke={currentPoke}
        baseData={baseData}
        xpPercent={xpPercent}
        canEvolve={canEvolve}
        onEvolve={evolvePokemon}
        battleStatus={battleStatus}
      />

      {/* Action buttons */}
      <ActionGrid onAction={doAction} dailyRemaining={dailyRemaining} />

      {/* Activity log */}
      <ActivityLog log={state.log} />

      {/* Toast notifications */}
      <Toast message={state.toast} />

      {/* Battle Screen */}
      {showBattle && (
        <BattleScreen
          playerPoke={currentPoke}
          battleStatus={battleStatus}
          onClose={() => setShowBattle(false)}
          onBattleEnd={(result) => {
            handleBattleEnd(result);
            setShowBattle(false);
          }}
        />
      )}
    </div>
  );
}
