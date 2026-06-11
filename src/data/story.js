export const BADGES = [
  {
    id: 'badge_iron',
    name: 'Insígnia Ferro',
    emoji: '💪',
    description: 'Concedida por registrar seus primeiros 3 treinos de força.',
    requirement: { type: 'workout', target: 3 },
  },
  {
    id: 'badge_cardio',
    name: 'Insígnia Cardio',
    emoji: '🏃',
    description: 'Concedida por completar 5 sessões de cardio.',
    requirement: { type: 'cardio', target: 5 }, // Assume future cardio feature, mapping to workouts for now
  },
  {
    id: 'badge_hydro',
    name: 'Insígnia Hidro',
    emoji: '💧',
    description: 'Concedida por manter-se hidratado por 7 dias.',
    requirement: { type: 'waterDays', target: 7 },
  },
  {
    id: 'badge_nutri',
    name: 'Insígnia Nutri',
    emoji: '🥗',
    description: 'Concedida por fazer 14 refeições saudáveis.',
    requirement: { type: 'meals', target: 14 },
  },
  {
    id: 'badge_zen',
    name: 'Insígnia Zen',
    emoji: '🧘',
    description: 'Concedida por 7 dias de meditação/yoga.',
    requirement: { type: 'zen', target: 7 }, // Mapping to general activity for now
  },
  {
    id: 'badge_sleep',
    name: 'Insígnia Sono',
    emoji: '😴',
    description: 'Concedida por 10 noites de sono bem dormidas.',
    requirement: { type: 'sleep', target: 10 },
  },
  {
    id: 'badge_flame',
    name: 'Insígnia Chama',
    emoji: '🔥',
    description: 'Concedida por manter um streak ativo por 7 dias.',
    requirement: { type: 'streak', target: 7 },
  },
  {
    id: 'badge_master',
    name: 'Insígnia Mestre',
    emoji: '🏆',
    description: 'Concedida ao treinar um Pokémon até o Nível 12.',
    requirement: { type: 'level', target: 12 },
  },
];

export const CUTSCENES = {
  prologue: [
    { speaker: 'Prof. GymRat', text: 'Saudações, novo treinador! O mundo Pokémon precisa de você.' },
    { speaker: 'Prof. GymRat', text: 'O terrível vírus V.I.C.E. da Equipe Sedentária está enfraquecendo todos os Pokémon!' },
    { speaker: 'Prof. GymRat', text: 'Seu parceiro precisa que você mantenha hábitos saudáveis para ter forças para lutar.' },
    { speaker: 'Prof. GymRat', text: 'Estou contando com você para nos ajudar a derrotar o Comandante Calórix!' }
  ],
  level3: [
    { speaker: 'Rival Sedentauro', text: 'Ha! Você acha que levantar uns pesinhos vai te fazer um Mestre Pokémon?' },
    { speaker: 'Rival Sedentauro', text: 'Eu prefiro ficar no sofá, meus Pokémon já são fortes o suficiente!' },
    { speaker: 'Prof. GymRat', text: 'Não dê ouvidos a ele. Continue o bom trabalho! Você logo conseguirá sua primeira insígnia.' }
  ],
  level5: [
    { speaker: 'Prof. GymRat', text: 'A Equipe Sedentária está se espalhando. Precisamos de mais energia!' },
    { speaker: 'Prof. GymRat', text: 'Lembre-se: água e sono são tão importantes quanto o treino.' }
  ],
  level10: [
    { speaker: 'Rival Sedentauro', text: 'Seu Pokémon... ele está diferente. Parece tão... cheio de energia.' },
    { speaker: 'Rival Sedentauro', text: 'Talvez eu devesse começar a fazer algumas flexões...' }
  ],
  level15: [
    { speaker: 'Prof. GymRat', text: 'Você está incrível! A energia do seu Pokémon está no máximo!' },
    { speaker: 'Prof. GymRat', text: 'É hora de desafiar a base principal da Equipe Sedentária!' },
    { speaker: 'Cmt. Calórix', text: 'Você não pode nos vencer com saladas e suor! Vamos esmagá-lo com a força da inércia!' }
  ]
};

export const DAILY_MISSIONS = [
  {
    id: 'mission_water',
    giver: 'Prof. GymRat',
    text: '"A amostra do V.I.C.E. reage mal à hidratação! Beba bastante água hoje."',
    objective: 'Registrar consumo de água.',
    actionRequired: 'water',
    reward: 20
  },
  {
    id: 'mission_workout',
    giver: 'Prof. GymRat',
    text: '"Precisamos fortalecer as defesas do seu Pokémon. Um treino hoje é essencial!"',
    objective: 'Registrar um treino de força ou cardio.',
    actionRequired: 'workout',
    reward: 30
  },
  {
    id: 'mission_meal',
    giver: 'Rival Sedentauro',
    text: '"Você não vai conseguir comer nada saudável hoje. Eu aposto!"',
    objective: 'Provar que ele está errado registrando uma refeição saudável.',
    actionRequired: 'meal',
    reward: 20
  },
  {
    id: 'mission_sleep',
    giver: 'Prof. GymRat',
    text: '"O vírus se propaga rápido em corpos cansados. Garanta um bom sono hoje à noite."',
    objective: 'Registrar noite de sono.',
    actionRequired: 'sleep',
    reward: 25
  },
  {
    id: 'mission_calorix_taunt',
    giver: 'Cmt. Calórix',
    text: '"Seu Pokémon parece cansado. Por que você não desiste e vai comer um bolo?"',
    objective: 'Não se render! Registrar um treino para aumentar os stats do Pokémon.',
    actionRequired: 'workout',
    reward: 35
  }
];

export const POKEMON_DIALOGUES = [
  { condition: (state) => state.currentHp < 30, text: 'Estou ficando fraco... por favor, cuide de você...' },
  { condition: (state) => state.streak >= 7, text: '7 dias seguidos! Você é incrível, treinador!' },
  { condition: (state) => state.streak >= 3 && state.currentHp >= 80, text: 'Estou me sentindo invencível hoje! Vamos continuar o treino!' },
  { condition: (state) => !state.activityTracking?.hadWorkout, text: 'Que tal um treino rápido hoje? Eu ajudo a carregar os pesos! 💪' },
  { condition: (state) => state.activityTracking?.waterLiters < 2, text: 'Estou com sede só de olhar pra você. Beba água, tá?' },
  { condition: () => true, text: 'Pronto para mais um dia de aventuras!' } // Fallback
];
