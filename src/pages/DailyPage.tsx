import { ConsumptionForm } from '../components/ConsumptionForm';
import { ActivityForm } from '../components/ActivityForm';
import { EntriesList } from '../components/EntriesList';
import { DayData, MealType, ActivityIntensity, WeekData } from '../types';
import { useFoodHistoryAPI, useActivityHistoryAPI } from '../hooks/useHistoryAPI';
import { getFoodHistory, getActivityHistory } from '../hooks/useHistory';

interface Props {
  todayData: DayData;
  remainingPoints: number;
  weekData?: WeekData;
  currentWeight: number | null;
  onAddConsumption: (name: string, pointsPerUnit: number, mealType: MealType, quantity: number) => void | Promise<void>;
  onAddActivity: (name: string, intensity: ActivityIntensity, duration: number, points: number) => void | Promise<void>;
  onUpdateConsumptionQuantity: (id: string, delta: number) => void;
  onDeleteConsumption: (id: string) => void;
  onDeleteActivity: (id: string) => void;
}

export function DailyPage({
  todayData,
  remainingPoints,
  weekData,
  currentWeight,
  onAddConsumption,
  onAddActivity,
  onUpdateConsumptionQuantity,
  onDeleteConsumption,
  onDeleteActivity,
}: Props) {
  const { foodHistory: apiFoodHistory, refresh: refreshFoodHistory } = useFoodHistoryAPI();
  const { activityHistory: apiActivityHistory, refresh: refreshActivityHistory } = useActivityHistoryAPI();
  
  const localFoodHistory = weekData ? getFoodHistory(weekData) : [];
  const localActivityHistory = weekData ? getActivityHistory(weekData) : [];
  
  const foodHistory = weekData ? localFoodHistory : apiFoodHistory;
  const activityHistory = weekData ? localActivityHistory : apiActivityHistory;
  

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
        <ConsumptionForm 
          onAdd={async (name, pointsPerUnit, mealType, quantity) => {
            await onAddConsumption(name, pointsPerUnit, mealType, quantity);
            if (!weekData) {
              await refreshFoodHistory();
            }
          }} 
          foodHistory={foodHistory} 
        />
      </section>

      <section className="section">
        <h3>🏃 Activités</h3>
        <ActivityForm 
          onAdd={async (name, intensity, duration, points) => {
            await onAddActivity(name, intensity, duration, points);
            if (!weekData) {
              await refreshActivityHistory();
            }
          }} 
          activityHistory={activityHistory}
          currentWeight={currentWeight}
        />
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
