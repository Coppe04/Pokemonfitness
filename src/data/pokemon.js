// 🔧 MODO DEMO — valores reduzidos para facilitar demonstração de evolução
// Para produção: xpToEvolve ~400-500, levelRequired ~16/36
export const POKEMON_LIST = [
  {
    id: 4,
    name: 'Charmander',
    type: 'Fogo',
    typeColor: '#D85A30',
    typeBg: '#FAECE7',
    xpToEvolve: 100,
    evolutions: [
      { id: 5,  name: 'Charmeleon', levelRequired: 7  },
      { id: 6,  name: 'Charizard',  levelRequired: 12 },
    ],
  },
  {
    id: 7,
    name: 'Squirtle',
    type: 'Água',
    typeColor: '#185FA5',
    typeBg: '#E6F1FB',
    xpToEvolve: 100,
    evolutions: [
      { id: 8,  name: 'Wartortle', levelRequired: 7  },
      { id: 9,  name: 'Blastoise', levelRequired: 12 },
    ],
  },
  {
    id: 1,
    name: 'Bulbasaur',
    type: 'Planta',
    typeColor: '#3B6D11',
    typeBg: '#EAF3DE',
    xpToEvolve: 100,
    evolutions: [
      { id: 2,  name: 'Ivysaur',  levelRequired: 7  },
      { id: 3,  name: 'Venusaur', levelRequired: 12 },
    ],
  },
  {
    id: 25,
    name: 'Pikachu',
    type: 'Elétrico',
    typeColor: '#854F0B',
    typeBg: '#FAEEDA',
    xpToEvolve: 100,
    evolutions: [
      { id: 26, name: 'Raichu', levelRequired: 7 }, // forma final clássica
    ],
  },
];


export const DAILY_LIMITS = { workout: 999, food: 999 }; // 🔧 DEMO — sem limite

export const ACTIONS = [
  {
    id: 'strength', type: 'workout', emoji: '💪', name: 'Treino de força', hp: 5,
    statBonuses: { atk: 8, def: 3 },
    fields: [
      { key: 'sets',   label: 'Séries',             type: 'number', min: 1,   max: 20,  unit: 'séries', default: 3 },
      { key: 'reps',   label: 'Repetições / série',  type: 'number', min: 1,   max: 50,  unit: 'reps',   default: 10 },
      { key: 'weight', label: 'Carga média',          type: 'number', min: 0,   max: 300, unit: 'kg',     default: 20 },
    ],
    // 💪 Base 60 + 4 XP/série + 2 XP/10kg → teto 160 XP
    calcXp: (f) => Math.min(160, 60 + f.sets * 4 + Math.floor(f.weight / 5)),
  },
  {
    id: 'meal', type: 'food', emoji: '🥗', name: 'Refeição saudável', hp: 8,
    statBonuses: { def: 5, spdef: 3 },
    fields: [
      {
        key: 'quality', label: 'Qualidade da refeição', type: 'select', default: 'good',
        options: [
          { value: 'excellent', label: '⭐ Excelente (clean, balanceada)' },
          { value: 'good',      label: '👍 Boa (saudável no geral)' },
          { value: 'regular',   label: '😐 Regular (poderia ser melhor)' },
        ],
      },
    ],
    // 🥗 Excelente 55 / Boa 40 / Regular 20 XP
    calcXp: (f) => f.quality === 'excellent' ? 55 : f.quality === 'good' ? 40 : 20,
  },
  {
    id: 'run', type: 'workout', emoji: '🏃', name: 'Corrida', hp: 4,
    statBonuses: { spd: 10, atk: 3 },
    fields: [
      { key: 'distance', label: 'Distância', type: 'number', min: 0.5, max: 42, unit: 'km',  default: 5,  step: 0.5 },
      { key: 'time',     label: 'Tempo',      type: 'number', min: 1,   max: 300, unit: 'min', default: 30 },
    ],
    // 🏃 15 XP/km → teto 140 XP
    calcXp: (f) => Math.min(140, Math.round(f.distance * 15)),
  },
  {
    id: 'water', type: 'food', emoji: '💧', name: 'Hidratação', hp: 6,
    statBonuses: { spdef: 3 },
    fields: [
      { key: 'amount', label: 'Quantidade', type: 'number', min: 0.5, max: 5, unit: 'L', default: 2, step: 0.5 },
    ],
    // 💧 15 XP/L → teto 40 XP
    calcXp: (f) => Math.min(40, Math.round(f.amount * 15)),
  },
  {
    id: 'yoga', type: 'workout', emoji: '🧘', name: 'Yoga / Meditação', hp: 10,
    statBonuses: { spatk: 8, spdef: 5 },
    fields: [
      { key: 'duration', label: 'Duração', type: 'number', min: 5, max: 180, unit: 'min', default: 30 },
    ],
    // 🧘 2 XP/min → teto 90 XP
    calcXp: (f) => Math.min(90, Math.round(f.duration * 2)),
  },
  {
    id: 'sleep', type: 'food', emoji: '😴', name: 'Sono', hp: 12,
    statBonuses: { def: 5, spdef: 8 },
    fields: [
      { key: 'hours', label: 'Horas dormidas', type: 'number', min: 1, max: 12, unit: 'h', default: 8 },
    ],
    // 😴 8 XP/hora → teto 60 XP
    calcXp: (f) => Math.min(60, Math.round(f.hours * 8)),
  },
];

// ── Pokémon selvagens para batalhas treino ─────────────────────────────────
export const WILD_POKEMON = [
  { id: 16,  name: 'Pidgey',    level: 5,  maxHp: 40, atk: 45, def: 40, spd: 56, spatk: 35, spdef: 35 },
  { id: 19,  name: 'Rattata',   level: 6,  maxHp: 35, atk: 56, def: 35, spd: 72, spatk: 25, spdef: 35 },
  { id: 41,  name: 'Zubat',     level: 7,  maxHp: 40, atk: 45, def: 35, spd: 55, spatk: 30, spdef: 40 },
  { id: 43,  name: 'Oddish',    level: 9,  maxHp: 45, atk: 50, def: 55, spd: 30, spatk: 75, spdef: 65 },
  { id: 63,  name: 'Abra',      level: 10, maxHp: 25, atk: 20, def: 15, spd: 90, spatk:105, spdef: 55 },
  { id: 74,  name: 'Geodude',   level: 11, maxHp: 55, atk: 80, def: 100,spd: 20, spatk: 30, spdef: 30 },
  { id: 129, name: 'Magikarp',  level: 5,  maxHp: 20, atk: 10, def: 55, spd: 80, spatk:  15,spdef: 20 },
  { id: 58,  name: 'Growlithe', level: 13, maxHp: 55, atk: 70, def: 45, spd: 60, spatk: 70, spdef: 50 },
];

export function spriteAnimatedUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
}

export function spriteStaticUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
