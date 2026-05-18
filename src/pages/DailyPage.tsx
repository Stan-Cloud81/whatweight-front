import { ConsumptionForm } from '../components/ConsumptionForm';
import { ActivityForm } from '../components/ActivityForm';
import { EntriesList } from '../components/EntriesList';
import { DayData, MealType, ActivityIntensity } from '../types';

interface Props {
  todayData: DayData;
  remainingPoints: number;
  onAddConsumption: (name: string, pointsPerUnit: number, mealType: MealType, quantity: number) => void;
  onAddActivity: (name: string, intensity: ActivityIntensity, duration: number) => void;
  onUpdateConsumptionQuantity: (id: string, delta: number) => void;
  onDeleteConsumption: (id: string) => void;
  onDeleteActivity: (id: string) => void;
}

export function DailyPage({
  todayData,
  remainingPoints,
  onAddConsumption,
  onAddActivity,
  onUpdateConsumptionQuantity,
  onDeleteConsumption,
  onDeleteActivity,
}: Props) {
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
        <ConsumptionForm onAdd={onAddConsumption} />
      </section>

      <section className="section">
        <h3>🏃 Activités</h3>
        <ActivityForm onAdd={onAddActivity} />
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
