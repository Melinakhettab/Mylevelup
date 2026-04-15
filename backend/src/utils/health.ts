/**
 * Health calculation utilities
 * BMI, BMR (Mifflin-St Jeor), TDEE
 */

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100
}

/**
 * Mifflin-St Jeor equation for BMR
 * gender: 'homme' | 'femme' | default (average of both)
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string = 'non_specifie'
): number {
  if (gender === 'homme') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
  }
  if (gender === 'femme') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161)
  }
  // Average for non-specified
  const male = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  const female = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  return Math.round((male + female) / 2)
}

/**
 * TDEE = BMR × activity multiplier
 * hoursPerWeek mapped to activity levels
 */
export function calculateTDEE(bmr: number, hoursPerWeek: number): number {
  let multiplier: number
  if (hoursPerWeek <= 1) multiplier = 1.2       // Sedentary
  else if (hoursPerWeek <= 3) multiplier = 1.375 // Lightly active
  else if (hoursPerWeek <= 5) multiplier = 1.55  // Moderately active
  else if (hoursPerWeek <= 8) multiplier = 1.725 // Very active
  else multiplier = 1.9                           // Extra active

  return Math.round(bmr * multiplier)
}
