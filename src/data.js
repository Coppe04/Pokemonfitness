// ============================================================
//  POKÉMON DATA
// ============================================================

export const POKEMON_LIST = [
  {
    id: 4,
    name: 'Charmander',
    type: 'Fogo',
    typeColor: '#D85A30',
    typeBg: '#FAECE7',
    xpToEvolve: 500,
    evolvedId: 5,
    evolvedName: 'Charmeleon',
    levelToEvolve: 16,
  },
  {
    id: 7,
    name: 'Squirtle',
    type: 'Água',
    typeColor: '#185FA5',
    typeBg: '#E6F1FB',
    xpToEvolve: 480,
    evolvedId: 8,
    evolvedName: 'Wartortle',
    levelToEvolve: 16,
  },
  {
    id: 1,
    name: 'Bulbasaur',
    type: 'Planta',
    typeColor: '#3B6D11',
    typeBg: '#EAF3DE',
    xpToEvolve: 520,
    evolvedId: 2,
    evolvedName: 'Ivysaur',
    levelToEvolve: 16,
  },
  {
    id: 25,
    name: 'Pikachu',
    type: 'Elétrico',
    typeColor: '#854F0B',
    typeBg: '#FAEEDA',
    xpToEvolve: 400,
    evolvedId: 26,
    evolvedName: 'Raichu',
    levelToEvolve: 14,
  },
];

// ============================================================
//  ACTIONS (treinos e alimentação)
// ============================================================

export const ACTIONS = [
  { id: 'strength',  type: 'workout', emoji: '💪', name: 'Treino de força',    xp: 30, hp: 5  },
  { id: 'meal',      type: 'food',    emoji: '🥗', name: 'Refeição saudável',  xp: 15, hp: 8  },
  { id: 'run',       type: 'workout', emoji: '🏃', name: 'Corrida 5km',        xp: 25, hp: 4  },
  { id: 'water',     type: 'food',    emoji: '💧', name: 'Hidratação 2L',      xp: 10, hp: 6  },
  { id: 'yoga',      type: 'workout', emoji: '🧘', name: 'Yoga / Alongamento', xp: 20, hp: 7  },
  { id: 'protein',   type: 'food',    emoji: '🥩', name: 'Proteína pós-treino',xp: 12, hp: 5  },
];

// ============================================================
//  SPRITE URLS
// ============================================================

export const spriteAnimated = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

export const spriteStatic = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
