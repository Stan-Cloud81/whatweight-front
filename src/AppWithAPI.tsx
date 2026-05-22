import { useState, useEffect } from 'react';
import './App.css';
import { ViewMode } from './types';
import { usePointsTrackerAPI } from './hooks/usePointsTrackerAPI';
import { useWeightTrackerAPI } from './hooks/useWeightTrackerAPI';
import { useUserProfileAPI } from './hooks/useUserProfileAPI';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { NavigationBar } from './components/NavigationBar';
import { DailyPage } from './pages/DailyPage';
import { HistoryPage } from './pages/HistoryPage';
import { WeightPage } from './pages/WeightPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProfileSetup } from './components/ProfileSetup';
import { LoginPage } from './pages/LoginPage';
import { calculateBasePoints } from './utils/basePointsCalculator';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('daily');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { userProfile, updateProfile, isProfileComplete, isLoading: profileLoading } = useUserProfileAPI();

  const { 
    weightEntries, 
    getCurrentWeight, 
    addWeightEntry, 
    deleteWeightEntry,
  } = useWeightTrackerAPI();
  
  const currentWeight = getCurrentWeight();

  const initialBasePoints = userProfile.gender && userProfile.birthDate && userProfile.height && currentWeight
    ? calculateBasePoints(userProfile.gender, currentWeight, userProfile.birthDate, userProfile.height)
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
    isLoading: dataLoading,
  } = usePointsTrackerAPI(initialBasePoints);

  useEffect(() => {
    if (userProfile.gender && userProfile.birthDate && userProfile.height && currentWeight) {
      updateBasePoints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeight, userProfile.gender, userProfile.birthDate, userProfile.height]);

  const handleProfileComplete = async (gender: 'femme' | 'homme', birthDate: string, height: number) => {
    await updateProfile({ gender, birthDate, height });
    await updateBasePoints();
  };

  const handleAddWeight = async (weight: number, date?: string) => {
    await addWeightEntry(weight, date);
    if (userProfile.gender && userProfile.birthDate && userProfile.height) {
      await updateBasePoints();
    }
  };

  const handleDeleteWeight = async (id: string) => {
    await deleteWeightEntry(id);
    if (userProfile.gender && userProfile.birthDate && userProfile.height) {
      await updateBasePoints();
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="app loading-screen">
        <h2>Chargement...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      {!isProfileComplete() && (
        <ProfileSetup onComplete={handleProfileComplete} />
      )}

      <header className="header">
        <h1>🎯 WhatWeight</h1>
        <p>Suivi de points quotidien</p>
      </header>

      {dataLoading ? (
        <div className="page-content">
          <p>Chargement des données...</p>
        </div>
      ) : (
        <>
          {currentView === 'daily' && (
            <DailyPage
              todayData={todayData}
              remainingPoints={remainingPoints}
              currentWeight={currentWeight}
              onAddConsumption={addConsumption}
              onAddActivity={addActivity}
              onUpdateConsumptionQuantity={updateConsumptionQuantity}
              onDeleteConsumption={deleteConsumption}
              onDeleteActivity={deleteActivity}
              onNavigateToWeight={() => setCurrentView('weight')}
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
              onUpdateProfile={async (profile) => {
                await updateProfile(profile);
                await updateBasePoints();
              }}
              currentWeight={currentWeight}
            />
          )}
        </>
      )}

      <NavigationBar currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

function AppWithAPI() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default AppWithAPI;
