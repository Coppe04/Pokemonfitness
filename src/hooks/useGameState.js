import { useState, useCallback } from 'react';
import { POKEMON_LIST, DAILY_LIMITS } from '../data/pokemon';
import { computeStatus } from '../utils/battleStatus';

const todayStr = () => new Date().toISOString().slice(0, 10);

const INITIAL_BATTLE_STATS = { atk: 30, def: 30, spd: 30, spatk: 30, spdef: 30, lastUpdated: todayStr() };

const INITIAL_ACTIVITY = {
  date: todayStr(),
  hadWorkout: false,
  hadMeal: false,
  waterLiters: 0,
  hadSleep: false,
  lastWorkoutDate: null,
};

const INITIAL_STATE = {
  trainerName: 'Treinador',
  trainerLevel: 1,
  streak: 0,
  currentPokeIndex: 0,
  pokemon: POKEMON_LIST.map((p) => ({
    ...p,
    currentXp: 0,
    currentHp: 100,
    level: 5,
    evolutionStage: 0,
    battleStats: { ...INITIAL_BATTLE_STATS },
  })),
  log: [],
  toast: null,
  dailyStats: { date: todayStr(), workout: 0, food: 0 },
  activityTracking: { ...INITIAL_ACTIVITY },
};

/** Aplica decay de stats por dias sem atividade */
function applyDecay(battleStats) {
  const today = todayStr();
  if (battleStats.lastUpdated === today) return battleStats;
  const days = Math.floor((new Date(today) - new Date(battleStats.lastUpdated)) / 86400000);
  if (days <= 0) return battleStats;
  const d = days * 3;
  return {
    atk:   Math.max(10, battleStats.atk   - d),
    def:   Math.max(10, battleStats.def   - d),
    spd:   Math.max(10, battleStats.spd   - d),
    spatk: Math.max(10, battleStats.spatk - Math.floor(d * 0.7)),
    spdef: Math.max(10, battleStats.spdef - Math.floor(d * 0.7)),
    lastUpdated: today,
  };
}

function getValidatedDaily(daily) {
  const today = todayStr();
  return daily.date !== today ? { date: today, workout: 0, food: 0 } : daily;
}

function getValidatedActivity(track) {
  const today = todayStr();
  return track.date !== today
    ? { ...INITIAL_ACTIVITY, date: today, lastWorkoutDate: track.lastWorkoutDate }
    : track;
}

export function useGameState() {
  const [state, setState] = useState(INITIAL_STATE);

  const selectPokemon = useCallback((index) => {
    setState((s) => ({ ...s, currentPokeIndex: index }));
  }, []);

  const doAction = useCallback((action) => {
    setState((s) => {
      const daily = getValidatedDaily(s.dailyStats);
      const count = daily[action.type] ?? 0;
      const limit = DAILY_LIMITS[action.type] ?? Infinity;

      if (count >= limit) {
        const typeLabel = action.type === 'workout' ? 'treinos' : 'refeições';
        return { ...s, dailyStats: daily, toast: `⛔ Limite diário de ${limit} ${typeLabel} atingido!` };
      }

      const pokemon = [...s.pokemon];
      const idx = s.currentPokeIndex;
      const poke = { ...pokemon[idx] };

      poke.currentXp = poke.currentXp + action.xp;
      poke.currentHp = Math.min(100, poke.currentHp + action.hp);

      // Aplica decay + bônus de stat
      const decayed = applyDecay(poke.battleStats);
      const bonuses = action.statBonuses || {};
      poke.battleStats = {
        atk:   Math.min(100, decayed.atk   + (bonuses.atk   || 0)),
        def:   Math.min(100, decayed.def   + (bonuses.def   || 0)),
        spd:   Math.min(100, decayed.spd   + (bonuses.spd   || 0)),
        spatk: Math.min(100, decayed.spatk + (bonuses.spatk || 0)),
        spdef: Math.min(100, decayed.spdef + (bonuses.spdef || 0)),
        lastUpdated: todayStr(),
      };

      let toastMsg = `${action.emoji} +${action.xp} XP!`;
      let leveledUp = false;

      if (poke.currentXp >= poke.xpToEvolve) {
        poke.currentXp = poke.currentXp - poke.xpToEvolve;
        poke.level = poke.level + 1;
        leveledUp = true;
        toastMsg = `🌟 Level Up! Lv.${poke.level}`;
      }

      pokemon[idx] = poke;

      const logEntry = {
        id: Date.now(),
        type: action.type,
        name: action.name,
        xp: action.xp,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      // Atualiza rastreamento de atividades
      const track = getValidatedActivity(s.activityTracking);
      const updatedTrack = { ...track };
      if (action.type === 'workout') { updatedTrack.hadWorkout = true; updatedTrack.lastWorkoutDate = todayStr(); }
      if (action.id === 'meal')   updatedTrack.hadMeal = true;
      if (action.id === 'sleep')  updatedTrack.hadSleep = true;
      if (action.id === 'water')  updatedTrack.waterLiters += 2; // default 2L

      return {
        ...s,
        pokemon,
        trainerLevel: leveledUp ? s.trainerLevel + 1 : s.trainerLevel,
        log: [logEntry, ...s.log].slice(0, 10),
        toast: toastMsg,
        dailyStats: { ...daily, [action.type]: count + 1 },
        activityTracking: updatedTrack,
      };
    });

    setTimeout(() => setState((s) => ({ ...s, toast: null })), 2500);
  }, []);

  const evolvePokemon = useCallback(() => {
    setState((s) => {
      const pokemon = [...s.pokemon];
      const idx = s.currentPokeIndex;
      const poke = { ...pokemon[idx] };
      const base = POKEMON_LIST[idx];
      const nextStage = poke.evolutionStage;

      if (nextStage >= base.evolutions.length) return s;
      const nextEvo = base.evolutions[nextStage];
      if (poke.level < nextEvo.levelRequired) return s;

      const prevName = poke.name;
      poke.id = nextEvo.id;
      poke.name = nextEvo.name;
      poke.evolutionStage = nextStage + 1;
      pokemon[idx] = poke;

      return { ...s, pokemon, toast: `✨ ${prevName} evoluiu para ${nextEvo.name}!` };
    });
    setTimeout(() => setState((s) => ({ ...s, toast: null })), 2500);
  }, []);

  const applyBattleResult = useCallback((xpGain, hpChange) => {
    setState((s) => {
      const pokemon = [...s.pokemon];
      const idx = s.currentPokeIndex;
      const poke = { ...pokemon[idx] };
      poke.currentHp = Math.max(0, Math.min(100, poke.currentHp + hpChange));
      poke.currentXp = poke.currentXp + xpGain;
      let leveledUp = false;
      if (poke.currentXp >= poke.xpToEvolve) {
        poke.currentXp -= poke.xpToEvolve;
        poke.level += 1;
        leveledUp = true;
      }
      pokemon[idx] = poke;
      return {
        ...s,
        pokemon,
        trainerLevel: leveledUp ? s.trainerLevel + 1 : s.trainerLevel,
        toast: xpGain > 0 ? `🏆 Vitória! +${xpGain} XP` : '💔 Derrota! HP perdido.',
      };
    });
    setTimeout(() => setState((s) => ({ ...s, toast: null })), 2500);
  }, []);

  const currentPoke = state.pokemon[state.currentPokeIndex];
  const baseData = POKEMON_LIST[state.currentPokeIndex];
  const nextEvo = baseData.evolutions[currentPoke.evolutionStage];
  const canEvolve = !!nextEvo && currentPoke.level >= nextEvo.levelRequired;
  const xpPercent = Math.min(100, Math.round((currentPoke.currentXp / currentPoke.xpToEvolve) * 100));

  const daily = state.dailyStats.date === todayStr()
    ? state.dailyStats : { date: todayStr(), workout: 0, food: 0 };
  const dailyRemaining = {
    workout: Math.max(0, DAILY_LIMITS.workout - daily.workout),
    food: Math.max(0, DAILY_LIMITS.food - daily.food),
  };

  const battleStatus = computeStatus(currentPoke.battleStats, state.activityTracking);

  return {
    state, currentPoke, baseData, canEvolve, xpPercent,
    dailyRemaining, battleStatus,
    selectPokemon, doAction, evolvePokemon, applyBattleResult,
  };
}
