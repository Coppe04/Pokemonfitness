const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * Retorna lista de condições ativas (buffs e debuffs) baseada nos stats e atividades do dia.
 */
export function computeStatus(battleStats, activityTracking) {
  const conditions = [];
  const { atk, def, spd, spatk, spdef } = battleStats;
  const avg = (atk + def + spd + spatk + spdef) / 5;
  const today = todayStr();
  const track = activityTracking;

  // ── Buffs ──────────────────────────────────────────────────
  if (avg >= 65)
    conditions.push({ id: 'em_forma', label: 'Em Forma', emoji: '🔥', type: 'buff', effect: 'all_boost' });
  if (atk + spd >= 130)
    conditions.push({ id: 'forte', label: 'Forte', emoji: '💪', type: 'buff', effect: 'atk_boost' });
  if (def + spdef >= 130)
    conditions.push({ id: 'recuperado', label: 'Recuperado', emoji: '🌿', type: 'buff', effect: 'def_boost' });
  if (spd >= 75)
    conditions.push({ id: 'agil', label: 'Ágil', emoji: '⚡', type: 'buff', effect: 'spd_boost' });

  // ── Debuffs ────────────────────────────────────────────────
  // Queimado: sem treino por 2+ dias
  if (track.lastWorkoutDate) {
    const days = Math.floor((new Date(today) - new Date(track.lastWorkoutDate)) / 86400000);
    if (days >= 2)
      conditions.push({ id: 'queimado', label: 'Queimado', emoji: '🤒', type: 'debuff', effect: 'atk_penalty' });
  }

  // Envenenado: sem refeição saudável hoje
  if (track.date === today && !track.hadMeal)
    conditions.push({ id: 'envenenado', label: 'Envenenado', emoji: '☠️', type: 'debuff', effect: 'hp_drain' });

  // Desidratado: menos de 1L de água hoje
  if (track.date === today && track.waterLiters < 1)
    conditions.push({ id: 'paralisado', label: 'Desidratado', emoji: '💧', type: 'debuff', effect: 'spd_penalty' });

  // Cansado: sem sono registrado hoje
  if (track.date === today && !track.hadSleep)
    conditions.push({ id: 'cansado', label: 'Cansado', emoji: '😴', type: 'debuff', effect: 'all_penalty' });

  return conditions;
}

/**
 * Aplica modificadores das condições aos stats base, retornando stats efetivos para batalha.
 */
export function getEffectiveStats(battleStats, conditions) {
  let { atk, def, spd, spatk, spdef } = { ...battleStats };

  for (const c of conditions) {
    if (c.type === 'buff') {
      if (c.effect === 'all_boost')  { atk *= 1.10; def *= 1.10; spd *= 1.10; spatk *= 1.10; spdef *= 1.10; }
      if (c.effect === 'atk_boost')  { atk *= 1.15; }
      if (c.effect === 'def_boost')  { def *= 1.15; spdef *= 1.15; }
      if (c.effect === 'spd_boost')  { spd *= 1.20; }
    }
    if (c.type === 'debuff') {
      if (c.effect === 'atk_penalty') { atk *= 0.70; }
      if (c.effect === 'all_penalty') { atk *= 0.80; def *= 0.80; spd *= 0.80; spatk *= 0.80; spdef *= 0.80; }
      if (c.effect === 'spd_penalty') { spd *= 0.50; }
    }
  }

  return {
    atk:   Math.floor(atk),
    def:   Math.floor(def),
    spd:   Math.floor(spd),
    spatk: Math.floor(spatk),
    spdef: Math.floor(spdef),
  };
}

/**
 * Calcula dano de batalha com variância aleatória.
 */
export function calcDamage(atkStat, defStat) {
  const base = Math.max(3, Math.floor((atkStat / Math.max(1, defStat)) * 22));
  const variance = 0.85 + Math.random() * 0.30;
  return Math.max(3, Math.floor(base * variance));
}
