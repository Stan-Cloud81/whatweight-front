import { ActivityIntensity } from '../types';

const INTENSITY_FACTORS: Record<ActivityIntensity, { factor: number; offset: number }> = {
  'léger': { factor: 0.000232, offset: 0.5 },
  'modéré': { factor: 0.000327, offset: 0.4 },
  'élevé': { factor: 0.0008077, offset: 0.5 },
};

export function calculateActivityPoints(
  intensity: ActivityIntensity,
  durationMinutes: number,
  weightKg: number
): number {
  const weightLbs = weightKg * 2.205;
  const { factor, offset } = INTENSITY_FACTORS[intensity];
  const points = weightLbs * durationMinutes * factor + offset;
  return Math.floor(points);
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
