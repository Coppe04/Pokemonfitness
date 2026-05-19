import { useState, useEffect } from 'react';
import styles from './ActionModal.module.css';

/**
 * Inicializa o estado do formulário com os valores default de cada campo.
 */
function initForm(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, f.default]));
}

export default function ActionModal({ action, onConfirm, onCancel }) {
  const [form, setForm] = useState(() => initForm(action.fields));
  const [xpPreview, setXpPreview] = useState(0);

  // Recalcula o XP ao vivo sempre que o formulário muda
  useEffect(() => {
    try {
      setXpPreview(action.calcXp(form));
    } catch {
      setXpPreview(0);
    }
  }, [form, action]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ ...action, xp: xpPreview });
  };

  const isWorkout = action.type === 'workout';

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={`${styles.modal} ${isWorkout ? styles.workout : styles.food}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Registrar ${action.name}`}
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.emoji}>{action.emoji}</span>
          <div>
            <h2 className={styles.title}>{action.name}</h2>
            <p className={styles.subtitle}>Preencha os detalhes do registro</p>
          </div>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Fechar">✕</button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {action.fields.map((field) => (
            <div key={field.key} className={styles.fieldGroup}>
              <label className={styles.label} htmlFor={`modal-${field.key}`}>
                {field.label}
              </label>

              {field.type === 'select' ? (
                <select
                  id={`modal-${field.key}`}
                  className={styles.select}
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div className={styles.inputRow}>
                  <input
                    id={`modal-${field.key}`}
                    className={styles.input}
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
                  />
                  {field.unit && <span className={styles.unit}>{field.unit}</span>}
                </div>
              )}
            </div>
          ))}

          {/* Preview de XP */}
          <div className={styles.xpPreview}>
            <span className={styles.xpLabel}>XP calculado</span>
            <span className={styles.xpValue}>+{xpPreview} XP</span>
          </div>

          {/* Ações */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.confirmBtn} ${isWorkout ? styles.confirmWorkout : styles.confirmFood}`}
              id={`confirm-action-${action.id}`}
            >
              ✅ Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
