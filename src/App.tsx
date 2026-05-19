import { useState } from 'react';
import './App.css';
import { ViewMode } from './types';
import { usePointsTracker } from './hooks/usePointsTracker';
import { useWeightTracker } from './hooks/useWeightTracker';
import { useUserProfile } from './hooks/useUserProfile';
import { NavigationBar } from './components/NavigationBar';
import { DailyPage } from './pages/DailyPage';
import { HistoryPage } from './pages/HistoryPage';
import { WeightPage } from './pages/WeightPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProfileSetup } from './components/ProfileSetup';
import { calculateBasePoints } from './utils/basePointsCalculator';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('daily');
  const { userProfile, updateProfile, isProfileComplete } = useUserProfile();
  
  const initialBasePoints = userProfile.gender && userProfile.birthDate && userProfile.height
    ? calculateBasePoints(userProfile.gender, 70, userProfile.birthDate, userProfile.height)
    : undefined;
  
  const {
    todayData,
    remainingPoints,
    addConsumption,
    addActivity,
    updateConsumptionQuantity,
    deleteConsumption,
    deleteActivity,
    weekData,
    addConsumptionForDate,
    addActivityForDate,
    updateConsumptionQuantityForDate,
    deleteConsumptionForDate,
    deleteActivityForDate,
    updateBasePoints,
  } = usePointsTracker(initialBasePoints);

  const { weightEntries, getCurrentWeight, addWeightEntry, deleteWeightEntry } = useWeightTracker();
  const currentWeight = getCurrentWeight();
  
  const handleProfileComplete = (gender: 'femme' | 'homme', birthDate: string, height: number) => {
    updateProfile({ gender, birthDate, height });
    
    if (currentWeight) {
      const newBasePoints = calculateBasePoints(gender, currentWeight, birthDate, height);
      updateBasePoints(newBasePoints);
    }
  };
  
  const handleAddWeight = (weight: number, date?: string) => {
    addWeightEntry(weight, date, userProfile, updateBasePoints);
  };
  
  const handleDeleteWeight = (id: string) => {
    deleteWeightEntry(id, userProfile, updateBasePoints);
  };

  return (
    <div className="app">
      {!isProfileComplete() && (
        <ProfileSetup onComplete={handleProfileComplete} />
      )}
      
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
        <HistoryPage 
          weekData={weekData}
          currentWeight={currentWeight}
          onAddConsumption={addConsumptionForDate}
          onAddActivity={addActivityForDate}
          onUpdateConsumptionQuantity={updateConsumptionQuantityForDate}
          onDeleteConsumption={deleteConsumptionForDate}
          onDeleteActivity={deleteActivityForDate}
        />
      )}

      {currentView === 'weight' && (
        <WeightPage 
          weightEntries={weightEntries}
          onAddWeight={handleAddWeight}
          onDeleteWeight={handleDeleteWeight}
        />
      )}

      {currentView === 'profile' && (
        <ProfilePage 
          userProfile={userProfile}
          onUpdateProfile={(profile) => {
            updateProfile(profile);
            if (currentWeight && profile.gender && profile.birthDate && profile.height) {
              const newBasePoints = calculateBasePoints(
                profile.gender, 
                currentWeight, 
                profile.birthDate, 
                profile.height
              );
              updateBasePoints(newBasePoints);
            }
          }}
          currentWeight={currentWeight}
        />
      )}

      <NavigationBar currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

export default App;
