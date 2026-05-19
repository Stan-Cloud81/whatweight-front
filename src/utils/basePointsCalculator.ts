import { Gender } from '../types';

export function calculateBasePoints(
  gender: Gender,
  weight: number,
  birthDate: string,
  height: number
): number {
  const genderPoints = gender === 'homme' ? 8 : 2;
  
  const weightPoints = Math.floor((weight * 2.205) / 10);
  
  const age = calculateAge(birthDate);
  let agePoints = 0;
  if (age >= 17 && age <= 26) agePoints = 4;
  else if (age >= 27 && age <= 37) agePoints = 3;
  else if (age >= 38 && age <= 47) agePoints = 2;
  else if (age >= 48 && age <= 58) agePoints = 1;
  else agePoints = 0;
  
  const heightPoints = height < 160 ? 1 : 2;
  
  return Math.floor(genderPoints + weightPoints + agePoints + heightPoints);
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
