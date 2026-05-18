import { ActivityIntensity } from '../types';

const POINTS_PER_MINUTE: Record<ActivityIntensity, number> = {
  'léger': 0.5,
  'modéré': 1.0,
  'élevé': 1.5,
};

export function calculateActivityPoints(
  intensity: ActivityIntensity,
  durationMinutes: number
): number {
  return Math.round(POINTS_PER_MINUTE[intensity] * durationMinutes);
}

export function calculateDayRemainingPoints(
  basePoints: number,
  pointsUsed: number,
  pointsEarned: number,
  carryOverFromPreviousDay: number
): number {
  return basePoints + carryOverFromPreviousDay + pointsEarned - pointsUsed;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
