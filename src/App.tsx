import './App.css';
import { usePointsTracker } from './hooks/usePointsTracker';
import { ConsumptionForm } from './components/ConsumptionForm';
import { ActivityForm } from './components/ActivityForm';
import { EntriesList } from './components/EntriesList';

function App() {
  const {
    todayData,
    remainingPoints,
    addConsumption,
    addActivity,
    updateConsumptionQuantity,
    deleteConsumption,
    deleteActivity,
  } = usePointsTracker();

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 WhatWeight</h1>
        <p>Suivi de points quotidien</p>
      </header>

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
        <ConsumptionForm onAdd={addConsumption} />
      </section>

      <section className="section">
        <h3>🏃 Activités</h3>
        <ActivityForm onAdd={addActivity} />
      </section>

      <section className="section">
        <h3>📋 Historique du jour</h3>
        <EntriesList
          consumptions={todayData.consumptions}
          activities={todayData.activities}
          onUpdateConsumptionQuantity={updateConsumptionQuantity}
          onDeleteConsumption={deleteConsumption}
          onDeleteActivity={deleteActivity}
        />
      </section>
    </div>
  );
}

export default App;
