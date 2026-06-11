import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import PokemonSelector from './components/PokemonSelector';
import PokemonCard from './components/PokemonCard';
import ActionGrid from './components/ActionGrid';
import ActivityLog from './components/ActivityLog';
import Toast from './components/Toast';
import BattleScreen from './components/BattleScreen';
import StoryModal from './components/StoryModal';
import BadgesPanel from './components/BadgesPanel';
import DailyMission from './components/DailyMission';
import { CUTSCENES, DAILY_MISSIONS, BADGES } from './data/story';
import styles from './App.module.css';
import { useEffect } from 'react';

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
    markCutsceneSeen,
    awardBadge,
    setDailyMission,
    completeDailyMission,
  } = useGameState();

  const [showBattle, setShowBattle] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [currentCutscene, setCurrentCutscene] = useState(null);

  // Lógica de Cutscenes
  useEffect(() => {
    if (!state.storyCutscenesSeen.includes('prologue')) {
      setCurrentCutscene({ id: 'prologue', sequence: CUTSCENES.prologue });
      return;
    }
    const levelId = `level${state.trainerLevel}`;
    if (CUTSCENES[levelId] && !state.storyCutscenesSeen.includes(levelId)) {
      setCurrentCutscene({ id: levelId, sequence: CUTSCENES[levelId] });
    }
  }, [state.trainerLevel, state.storyCutscenesSeen]);

  const handleCloseCutscene = () => {
    if (currentCutscene) {
      markCutsceneSeen(currentCutscene.id);
      setCurrentCutscene(null);
    }
  };

  // Lógica de Missões Diárias (Seta uma aleatória se não tiver)
  useEffect(() => {
    if (!state.dailyMission || state.dailyMission.date !== new Date().toISOString().slice(0, 10)) {
      const randomMission = DAILY_MISSIONS[Math.floor(Math.random() * DAILY_MISSIONS.length)];
      setDailyMission(randomMission.id);
    }
  }, [state.dailyMission, setDailyMission]);

  // Lógica de Insígnias (Checa se alguma meta foi atingida)
  useEffect(() => {
    BADGES.forEach(badge => {
      if (state.badgesEarned.includes(badge.id)) return;
      const req = badge.requirement;
      let current = 0;
      if (req.type === 'workout' || req.type === 'cardio' || req.type === 'zen') current = state.totalWorkouts || 0;
      if (req.type === 'waterDays') current = state.totalWaterDays || 0;
      if (req.type === 'meals') current = state.totalMeals || 0;
      if (req.type === 'sleep') current = state.totalSleep || 0;
      if (req.type === 'streak') current = state.streak || 0;
      if (req.type === 'level') current = state.pokemon[state.currentPokeIndex]?.level || 0;

      if (current >= req.target) {
        awardBadge(badge.id);
      }
    });
  }, [state, awardBadge]);

  // Completar missão diária
  useEffect(() => {
    if (state.dailyMission && !state.dailyMission.completed) {
      const missionData = DAILY_MISSIONS.find(m => m.id === state.dailyMission.missionId);
      if (missionData) {
        let isCompleted = false;
        const track = state.activityTracking;
        if (missionData.actionRequired === 'workout' && track.hadWorkout) isCompleted = true;
        if (missionData.actionRequired === 'water' && track.waterLiters > 0) isCompleted = true;
        if (missionData.actionRequired === 'meal' && track.hadMeal) isCompleted = true;
        if (missionData.actionRequired === 'sleep' && track.hadSleep) isCompleted = true;
        
        if (isCompleted) {
          completeDailyMission(missionData.reward);
        }
      }
    }
  }, [state.activityTracking, state.dailyMission, completeDailyMission]);

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
            className={styles.battleBtn}
            onClick={() => setShowBadges(true)}
            title="Insígnias PokéFit"
          >
            🏅 Insígnias
          </button>
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
        gameState={state}
      />

      {/* Daily Mission */}
      {state.dailyMission && (
        <DailyMission 
          mission={{
            ...DAILY_MISSIONS.find(m => m.id === state.dailyMission.missionId),
            completed: state.dailyMission.completed
          }}
        />
      )}

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
          }}
        />
      )}

      {/* Badges Panel */}
      {showBadges && (
        <BadgesPanel 
          earnedBadges={state.badgesEarned} 
          state={state} 
          onClose={() => setShowBadges(false)} 
        />
      )}

      {/* Story Modal (Cutscenes) */}
      {currentCutscene && (
        <StoryModal 
          sequence={currentCutscene.sequence} 
          onClose={handleCloseCutscene} 
        />
      )}
    </div>
  );
}
