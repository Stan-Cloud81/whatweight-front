import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { profileService } from '../services/profileService';

export function useUserProfileAPI() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    gender: null,
    birthDate: null,
    height: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await profileService.get();
      setUserProfile(profile);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      const updated = await profileService.update(profile);
      setUserProfile(updated);
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const isProfileComplete = (): boolean => {
    return (
      userProfile.gender !== null &&
      userProfile.birthDate !== null &&
      userProfile.height !== null
    );
  };

  return {
    userProfile,
    updateProfile,
    isProfileComplete,
    isLoading,
    error,
    refresh: loadProfile,
  };
}
