import { useState } from 'react';
import './App.css';
import { ViewMode } from './types';
import { usePointsTracker } from './hooks/usePointsTracker';
import { useWeightTracker } from './hooks/useWeightTracker';
import { NavigationBar } from './components/NavigationBar';
import { DailyPage } from './pages/DailyPage';
import { HistoryPage } from './pages/HistoryPage';
import { WeightPage } from './pages/WeightPage';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('daily');
  
  const {
    todayData,
    remainingPoints,
    addConsumption,
    addActivity,
    updateConsumptionQuantity,
    deleteConsumption,
    deleteActivity,
    weekData,
  } = usePointsTracker();

  const { getCurrentWeight } = useWeightTracker();
  const currentWeight = getCurrentWeight();

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 WhatWeight</h1>
        <p>Suivi de points quotidien</p>
      </header>

      {currentView === 'daily' && (
        <DailyPage
          todayData={todayData}
          remainingPoints={remainingPoints}
          weekData={weekData}
          currentWeight={currentWeight}
          onAddConsumption={addConsumption}
          onAddActivity={addActivity}
          onUpdateConsumptionQuantity={updateConsumptionQuantity}
          onDeleteConsumption={deleteConsumption}
          onDeleteActivity={deleteActivity}
        />
      )}

      {currentView === 'history' && (
        <HistoryPage weekData={weekData} />
      )}

      {currentView === 'weight' && (
        <WeightPage />
      )}

      <NavigationBar currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

export default App;
