import { useState } from 'react';
import { Consumption, ActivityEntry } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  consumptions: Consumption[];
  activities: ActivityEntry[];
  onUpdateConsumptionQuantity: (id: string, delta: number) => void;
  onDeleteConsumption: (id: string) => void;
  onDeleteActivity: (id: string) => void;
}

export function EntriesList({
  consumptions,
  activities,
  onUpdateConsumptionQuantity,
  onDeleteConsumption,
  onDeleteActivity,
}: Props) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  const allEntries = [
    ...consumptions.map((c) => ({
      id: c.id,
      type: 'consumption' as const,
      name: c.foodName,
      details: c.mealType,
      points: -c.points,
      timestamp: c.timestamp,
      quantity: c.quantity,
      pointsPerUnit: c.pointsPerUnit,
    })),
    ...activities.map((a) => ({
      id: a.id,
      type: 'activity' as const,
      name: a.activityName,
      details: `${a.durationMinutes}min - ${a.intensity}`,
      points: a.pointsEarned,
      timestamp: a.timestamp,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  if (allEntries.length === 0) {
    return <div className="empty-state">Aucune entrée aujourd'hui</div>;
  }

  return (
    <>
      <div className="entries-list">
        {allEntries.map((entry) => (
          <div key={entry.id} className="entry-item">
            <div className="entry-info">
              <div className="entry-name">{entry.name}</div>
              <div className="entry-details">
                {entry.details}
                {entry.type === 'consumption' && (
                  <> • Qté: {entry.quantity}</>
                )}
              </div>
            </div>
            <div
              className={`entry-points ${
                entry.points > 0 ? 'positive' : 'negative'
              }`}
            >
              {entry.points > 0 ? '+' : ''}
              {entry.points}
            </div>
            {entry.type === 'consumption' ? (
              <div className="consumption-controls">
                <button
                  className="quantity-btn-small"
                  onClick={() => onUpdateConsumptionQuantity(entry.id, 1)}
                  title="Augmenter quantité"
                >
                  +
                </button>
                <button
                  className="quantity-btn-small"
                  onClick={() => {
                    if (entry.quantity === 1) {
                      setConfirmDialog({
                        isOpen: true,
                        message: `Supprimer "${entry.name}" ?`,
                        onConfirm: () => {
                          onDeleteConsumption(entry.id);
                          setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
                        },
                      });
                    } else {
                      onUpdateConsumptionQuantity(entry.id, -1);
                    }
                  }}
                  title={entry.quantity === 1 ? 'Supprimer' : 'Réduire quantité'}
                >
                  {entry.quantity === 1 ? '🗑️' : '−'}
                </button>
              </div>
            ) : (
              <button
                className="delete-btn"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    message: `Supprimer l'activité "${entry.name}" ?`,
                    onConfirm: () => {
                      onDeleteActivity(entry.id);
                      setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
                    },
                  });
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} })}
      />
    </>
  );
}
