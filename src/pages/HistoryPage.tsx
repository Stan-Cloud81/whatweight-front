import { useState, useEffect } from 'react';
import { WeekData, DayData } from '../types';
import { calculateDayRemainingPoints } from '../utils/pointsCalculator';
import { setupBackButtonHandler, pushNavigationState } from '../utils/navigation';

interface Props {
  weekData: WeekData;
}

type HistoryView = 'week' | 'day';
type SelectedView = { type: 'week'; weekStart: string } | { type: 'day'; date: string } | null;

export function HistoryPage({ weekData }: Props) {
  const [viewMode, setViewMode] = useState<HistoryView>('week');
  const [selectedView, setSelectedView] = useState<SelectedView>(null);

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
    return Object.entries(weekData.days)
      .map(([date, data]) => ({ date, ...data }))
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
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucune consommation</div>
          )}
        </section>

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
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucune activité</div>
          )}
        </section>
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
