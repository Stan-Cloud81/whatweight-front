import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const PROFILE_STORAGE_KEY = 'whatweight-user-profile';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      gender: null,
      birthDate: null,
      height: null,
    };
  });

  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
  }, [userProfile]);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  const isProfileComplete = (): boolean => {
    return userProfile.gender !== null && 
           userProfile.birthDate !== null && 
           userProfile.height !== null;
  };

  return {
    userProfile,
    updateProfile,
    isProfileComplete,
  };
}
