import { useState } from 'react';
import { ACTIONS } from '../data/pokemon';
import ActionModal from './ActionModal';
import styles from './ActionGrid.module.css';

export default function ActionGrid({ onAction, dailyRemaining }) {
  const [pendingAction, setPendingAction] = useState(null);

  const handleCardClick = (action) => {
    const remaining = dailyRemaining[action.type] ?? 0;
    if (remaining <= 0) return; // bloqueado pelo estilo, mas segurança dupla
    setPendingAction(action);
  };

  const handleConfirm = (actionWithXp) => {
    onAction(actionWithXp);
    setPendingAction(null);
  };

  return (
    <>
      <div>
        {/* Cabeçalho com saldo do dia */}
        <div className={styles.header}>
          <p className={styles.sectionTitle}>Ações de hoje</p>
          <div className={styles.limits}>
            <span className={`${styles.badge} ${styles.badgeWorkout}`}>
              💪 {dailyRemaining.workout} treino{dailyRemaining.workout !== 1 ? 's' : ''}
            </span>
            <span className={`${styles.badge} ${styles.badgeFood}`}>
              🥗 {dailyRemaining.food} refeição{dailyRemaining.food !== 1 ? 'ões' : ''}
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          {ACTIONS.map((action) => {
            const remaining = dailyRemaining[action.type] ?? 0;
            const isDisabled = remaining <= 0;

            return (
              <button
                key={action.id}
                id={`action-${action.id}`}
                className={`
                  ${styles.card}
                  ${action.type === 'food' ? styles.cardFood : styles.cardWorkout}
                  ${isDisabled ? styles.cardDisabled : ''}
                `}
                onClick={() => handleCardClick(action)}
                disabled={isDisabled}
                aria-label={`${action.name}${isDisabled ? ' — limite diário atingido' : ''}`}
              >
                <span className={styles.emoji}>{action.emoji}</span>
                <span className={styles.name}>{action.name}</span>
                {isDisabled ? (
                  <span className={styles.limitTag}>Limite atingido</span>
                ) : (
                  <span className={styles.xp}>
                    {action.calcXp ? 'Calcular XP' : `+${action.xp} XP`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de confirmação */}
      {pendingAction && (
        <ActionModal
          action={pendingAction}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </>
  );
}
