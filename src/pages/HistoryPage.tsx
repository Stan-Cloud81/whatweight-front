import { useState, useEffect } from 'react';
import { WeekData, DayData, MealType, ActivityIntensity } from '../types';
import { calculateDayRemainingPoints } from '../utils/pointsCalculator';
import { setupBackButtonHandler, pushNavigationState } from '../utils/navigation';
import { ConsumptionForm } from '../components/ConsumptionForm';
import { ActivityForm } from '../components/ActivityForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getFoodHistory, getActivityHistory } from '../hooks/useHistory';

interface Props {
  weekData: WeekData;
  currentWeight: number | null;
  onAddConsumption: (date: string, name: string, pointsPerUnit: number, mealType: MealType, quantity: number) => void;
  onAddActivity: (date: string, name: string, intensity: ActivityIntensity, duration: number, points: number) => void;
  onUpdateConsumptionQuantity: (date: string, id: string, delta: number) => void;
  onDeleteConsumption: (date: string, id: string) => void;
  onDeleteActivity: (date: string, id: string) => void;
}

type HistoryView = 'week' | 'day';
type SelectedView = { type: 'week'; weekStart: string } | { type: 'day'; date: string } | null;

export function HistoryPage({ 
  weekData, 
  currentWeight,
  onAddConsumption,
  onAddActivity,
  onUpdateConsumptionQuantity,
  onDeleteConsumption,
  onDeleteActivity,
}: Props) {
  const [viewMode, setViewMode] = useState<HistoryView>('week');
  const [selectedView, setSelectedView] = useState<SelectedView>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'consumption' | 'activity'; id: string; date: string } | null>(null);
  
  const foodHistory = getFoodHistory(weekData);
  const activityHistory = getActivityHistory(weekData);

  useEffect(() => {
    if (selectedView) {
      pushNavigationState(selectedView.type);
      const cleanup = setupBackButtonHandler(() => {
        setSelectedView(null);
      });
      return cleanup;
    }
  }, [selectedView]);

  const getDaysArray = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return Object.entries(weekData.days)
      .filter(([entryDate]) => entryDate !== todayStr)
      .map(([entryDate, { basePoints, pointsUsed, pointsEarned, consumptions, activities, carryOverPoints }]) => ({ 
        date: entryDate, 
        basePoints,
        pointsUsed,
        pointsEarned,
        consumptions,
        activities,
        carryOverPoints
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getWeeksData = () => {
    const days = getDaysArray();
    const weeks: Record<string, DayData[]> = {};

    days.forEach((day) => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(day);
    });

    return Object.entries(weeks)
      .map(([weekStart, days]) => {
        const totalPoints = days.reduce((sum, day) => {
          return sum + calculateDayRemainingPoints(
            day.basePoints,
            day.pointsUsed,
            day.pointsEarned,
            day.carryOverPoints
          );
        }, 0);

        const totalUsed = days.reduce((sum, day) => sum + day.pointsUsed, 0);
        const totalEarned = days.reduce((sum, day) => sum + day.pointsEarned, 0);

        return {
          weekStart,
          days: days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          totalPoints,
          totalUsed,
          totalEarned,
        };
      })
      .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
  };

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`;
  };

  const days = getDaysArray();
  const weeks = getWeeksData();

  if (selectedView?.type === 'day') {
    const dayData = weekData.days[selectedView.date];
    if (!dayData) return null;

    const remaining = calculateDayRemainingPoints(
      dayData.basePoints,
      dayData.pointsUsed,
      dayData.pointsEarned,
      dayData.carryOverPoints
    );

    const handleDeleteConsumption = (id: string) => {
      if (deleteConfirm) {
        onDeleteConsumption(deleteConfirm.date, id);
        setDeleteConfirm(null);
      }
    };

    const handleDeleteActivity = (id: string) => {
      if (deleteConfirm) {
        onDeleteActivity(deleteConfirm.date, id);
        setDeleteConfirm(null);
      }
    };

    return (
      <div className="page-content">
        <div className="day-detail-header">
          <h2>{new Date(selectedView.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</h2>
          <div className="points-summary-inline">
            <span className="points-badge">Base: {dayData.basePoints}</span>
            {dayData.carryOverPoints > 0 && (
              <span className="points-badge positive">+{dayData.carryOverPoints}</span>
            )}
            <span className="points-badge positive">Gagnés: +{dayData.pointsEarned}</span>
            <span className="points-badge negative">Utilisés: -{dayData.pointsUsed}</span>
            <span className={`points-badge ${remaining >= 0 ? 'positive' : 'negative'}`}>
              Restants: {remaining}
            </span>
          </div>
        </div>

        <section className="section">
          <h3>🏃 Activités ({dayData.activities.length})</h3>
          {dayData.activities.length > 0 ? (
            <div className="entries-list">
              {dayData.activities.map((a) => (
                <div key={a.id} className="entry-item">
                  <div className="entry-info">
                    <div className="entry-name">{a.activityName}</div>
                    <div className="entry-details">
                      {a.durationMinutes}min - {a.intensity}
                    </div>
                  </div>
                  <div className="entry-points positive">+{a.pointsEarned}</div>
                  <button
                    className="delete-btn"
                    onClick={() => setDeleteConfirm({ type: 'activity', id: a.id, date: selectedView.date })}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucune activité</div>
          )}
          <ActivityForm
            onAdd={(name, intensity, duration, points) => 
              onAddActivity(selectedView.date, name, intensity, duration, points)
            }
            activityHistory={activityHistory}
            currentWeight={currentWeight}
          />
        </section>

        <section className="section">
          <h3>🍽️ Consommations ({dayData.consumptions.length})</h3>
          {dayData.consumptions.length > 0 ? (
            <div className="entries-list">
              {dayData.consumptions.map((c) => (
                <div key={c.id} className="entry-item">
                  <div className="entry-info">
                    <div className="entry-name">{c.foodName}</div>
                    <div className="entry-details">{c.mealType} • Qté: {c.quantity}</div>
                  </div>
                  <div className="entry-points negative">-{c.points}</div>
                  <div className="consumption-controls">
                    <button
                      className="quantity-btn-small"
                      onClick={() => onUpdateConsumptionQuantity(selectedView.date, c.id, 1)}
                      title="Augmenter quantité"
                    >
                      +
                    </button>
                    <button
                      className="quantity-btn-small"
                      onClick={() => {
                        if (c.quantity === 1) {
                          setDeleteConfirm({ type: 'consumption', id: c.id, date: selectedView.date });
                        } else {
                          onUpdateConsumptionQuantity(selectedView.date, c.id, -1);
                        }
                      }}
                      title={c.quantity === 1 ? 'Supprimer' : 'Réduire quantité'}
                    >
                      {c.quantity === 1 ? '🗑️' : '−'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucune consommation</div>
          )}
          <ConsumptionForm
            onAdd={(name, pointsPerUnit, mealType, quantity) => 
              onAddConsumption(selectedView.date, name, pointsPerUnit, mealType, quantity)
            }
            foodHistory={foodHistory}
          />
        </section>

        {deleteConfirm && (
          <ConfirmDialog
            isOpen={true}
            message={`Supprimer cette ${deleteConfirm.type === 'consumption' ? 'consommation' : 'activité'} ?`}
            onConfirm={() => {
              if (deleteConfirm.type === 'consumption') {
                handleDeleteConsumption(deleteConfirm.id);
              } else {
                handleDeleteActivity(deleteConfirm.id);
              }
            }}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </div>
    );
  }

  if (selectedView?.type === 'week') {
    const weekData = weeks.find(w => w.weekStart === selectedView.weekStart);
    if (!weekData) return null;

    return (
      <div className="page-content">
        <h2>Semaine du {formatWeekRange(selectedView.weekStart)}</h2>
        <div className="week-summary">
          <div className="summary-card">
            <span className="summary-label">Total utilisé</span>
            <span className="summary-value negative">-{weekData.totalUsed}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total gagné</span>
            <span className="summary-value positive">+{weekData.totalEarned}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Solde</span>
            <span className={`summary-value ${weekData.totalPoints >= 0 ? 'positive' : 'negative'}`}>
              {weekData.totalPoints >= 0 ? '+' : ''}{weekData.totalPoints}
            </span>
          </div>
        </div>

        <section className="section">
          <h3>📅 Jours de la semaine</h3>
          <div className="entries-list">
            {weekData.days.map((day) => {
              const remaining = calculateDayRemainingPoints(
                day.basePoints,
                day.pointsUsed,
                day.pointsEarned,
                day.carryOverPoints
              );
              return (
                <div
                  key={day.date}
                  className="entry-item clickable"
                  onClick={() => setSelectedView({ type: 'day', date: day.date })}
                >
                  <div className="entry-info">
                    <div className="entry-name">
                      {new Date(day.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <div className="entry-details">
                      {day.consumptions.length} consommations • {day.activities.length} activités
                    </div>
                  </div>
                  <div className={`entry-points ${remaining >= 0 ? 'positive' : 'negative'}`}>
                    {remaining >= 0 ? '+' : ''}{remaining}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h2>Historique des points</h2>

      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
          onClick={() => setViewMode('week')}
        >
          Par semaine
        </button>
        <button
          className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
          onClick={() => setViewMode('day')}
        >
          Par jour
        </button>
      </div>

      {viewMode === 'week' ? (
        <section className="section">
          {weeks.length > 0 ? (
            <div className="entries-list">
              {weeks.map((week) => (
                <div
                  key={week.weekStart}
                  className="entry-item clickable"
                  onClick={() => setSelectedView({ type: 'week', weekStart: week.weekStart })}
                >
                  <div className="entry-info">
                    <div className="entry-name">Semaine du {formatWeekRange(week.weekStart)}</div>
                    <div className="entry-details">{week.days.length} jours enregistrés</div>
                  </div>
                  <div className={`entry-points ${week.totalPoints >= 0 ? 'positive' : 'negative'}`}>
                    {week.totalPoints >= 0 ? '+' : ''}{week.totalPoints}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucune donnée</div>
          )}
        </section>
      ) : (
        <section className="section">
          {days.length > 0 ? (
            <div className="entries-list">
              {days.map((day) => {
                const remaining = calculateDayRemainingPoints(
                  day.basePoints,
                  day.pointsUsed,
                  day.pointsEarned,
                  day.carryOverPoints
                );
                return (
                  <div
                    key={day.date}
                    className="entry-item clickable"
                    onClick={() => setSelectedView({ type: 'day', date: day.date })}
                  >
                    <div className="entry-info">
                      <div className="entry-name">
                        {new Date(day.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                      <div className="entry-details">
                        {day.consumptions.length} consommations • {day.activities.length} activités
                      </div>
                    </div>
                    <div className={`entry-points ${remaining >= 0 ? 'positive' : 'negative'}`}>
                      {remaining >= 0 ? '+' : ''}{remaining}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">Aucune donnée</div>
          )}
        </section>
      )}
    </div>
  );
}
