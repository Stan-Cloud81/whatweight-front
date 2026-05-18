import { ConsumptionForm } from '../components/ConsumptionForm';
import { ActivityForm } from '../components/ActivityForm';
import { EntriesList } from '../components/EntriesList';
import { DayData, MealType, ActivityIntensity, WeekData } from '../types';
import { getFoodHistory, getActivityHistory } from '../hooks/useHistory';

interface Props {
  todayData: DayData;
  remainingPoints: number;
  weekData: WeekData;
  onAddConsumption: (name: string, pointsPerUnit: number, mealType: MealType, quantity: number) => void;
  onAddActivity: (name: string, intensity: ActivityIntensity, duration: number, points: number) => void;
  onUpdateConsumptionQuantity: (id: string, delta: number) => void;
  onDeleteConsumption: (id: string) => void;
  onDeleteActivity: (id: string) => void;
}

export function DailyPage({
  todayData,
  remainingPoints,
  weekData,
  onAddConsumption,
  onAddActivity,
  onUpdateConsumptionQuantity,
  onDeleteConsumption,
  onDeleteActivity,
}: Props) {
  const foodHistory = getFoodHistory(weekData);
  const activityHistory = getActivityHistory(weekData);

  return (
    <div className="page-content">
      <div className="points-display">
        <h2>Points disponibles</h2>
        <div className="points-number">{remainingPoints}</div>
        <div className="points-breakdown">
          <span>Base: {todayData.basePoints}</span>
          {todayData.carryOverPoints > 0 && (
            <span>Report: +{todayData.carryOverPoints}</span>
          )}
          <span>Gagnés: +{todayData.pointsEarned}</span>
          <span>Utilisés: -{todayData.pointsUsed}</span>
        </div>
      </div>

      <section className="section">
        <h3>🍽️ Consommations</h3>
        <ConsumptionForm onAdd={onAddConsumption} foodHistory={foodHistory} />
      </section>

      <section className="section">
        <h3>🏃 Activités</h3>
        <ActivityForm onAdd={onAddActivity} activityHistory={activityHistory} />
      </section>

      <section className="section">
        <h3>📋 Historique du jour</h3>
        <EntriesList
          consumptions={todayData.consumptions}
          activities={todayData.activities}
          onUpdateConsumptionQuantity={onUpdateConsumptionQuantity}
          onDeleteConsumption={onDeleteConsumption}
          onDeleteActivity={onDeleteActivity}
        />
      </section>
    </div>
  );
}
