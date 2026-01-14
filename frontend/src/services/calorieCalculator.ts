// Calorie Calculator Service
// Calculates BMR, activity calories, and total calorie burn

export interface HealthProfile {
    age: number;
    gender: 'male' | 'female' | 'other';
    weightKg: number;
    heightCm: number;
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
}

export interface CalorieBreakdown {
    bmr: number;
    activityCalories: number;
    exerciseCalories: number;
    totalBurned: number;
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * This is the number of calories burned at rest
 */
export function calculateBMR(profile: HealthProfile): number {
    const { age, gender, weightKg, heightCm } = profile;

    if (gender === 'male') {
        // BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
        return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    } else {
        // BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
        return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
    }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * BMR adjusted for activity level
 */
export function calculateTDEE(profile: HealthProfile): number {
    const bmr = calculateBMR(profile);
    const activityMultipliers = {
        sedentary: 1.2,           // Little or no exercise
        lightly_active: 1.375,    // 1-3 days/week exercise
        moderately_active: 1.55,  // 3-5 days/week exercise
        very_active: 1.725,       // 6-7 days/week exercise
        extremely_active: 1.9     // Athlete or very physical job
    };

    return Math.round(bmr * activityMultipliers[profile.activityLevel]);
}

/**
 * Calculate calories burned from walking/steps
 * Formula: Steps × 0.04 × (Weight in kg / 70)
 * Assumes average of 0.04 calories per step for 70kg person
 */
export function calculateStepCalories(steps: number, weightKg: number): number {
    return Math.round(steps * 0.04 * (weightKg / 70));
}

/**
 * Calculate distance walked from steps
 * Average step length: ~0.76 meters
 */
export function calculateDistance(steps: number): number {
    const avgStepLengthMeters = 0.76;
    return parseFloat((steps * avgStepLengthMeters / 1000).toFixed(2)); // Returns km
}

/**
 * Calculate calories burned from exercise duration and type
 */
export function calculateExerciseCalories(
    exerciseType: string,
    durationMinutes: number,
    weightKg: number = 70
): number {
    // MET (Metabolic Equivalent of Task) values for different exercises
    const metValues: Record<string, number> = {
        'Yoga Flow': 2.5,
        'Morning Energy': 3.5,
        'Core Focus': 3.8,
        'Full Body': 5.0,
        'Cardio Blast': 7.0,
        'Strength Training': 4.5,
        'Flexibility Flow': 2.5,
        'Evening Wind Down': 2.0,
        'Walking': 3.5,
        'Jogging': 7.0,
        'Running': 9.8,
        'Cycling': 6.8,
        'Swimming': 6.0,
        'HIIT': 8.0,
        'Dancing': 5.5,
        'default': 4.0
    };

    const met = metValues[exerciseType] || metValues.default;

    // Calories = MET × weight(kg) × duration(hours)
    const durationHours = durationMinutes / 60;
    return Math.round(met * weightKg * durationHours);
}

/**
 * Calculate complete calorie breakdown for the day
 */
export function calculateDailyCalories(
    profile: HealthProfile,
    steps: number,
    exerciseMinutes: number,
    exerciseType: string = 'default'
): CalorieBreakdown {
    const bmr = calculateBMR(profile);
    const activityCalories = calculateStepCalories(steps, profile.weightKg);
    const exerciseCalories = calculateExerciseCalories(exerciseType, exerciseMinutes, profile.weightKg);

    return {
        bmr,
        activityCalories,
        exerciseCalories,
        totalBurned: bmr + activityCalories + exerciseCalories
    };
}

/**
 * Calculate calorie balance (net calories)
 * Positive = surplus, Negative = deficit
 */
export function calculateCalorieBalance(caloriesConsumed: number, caloriesBurned: number): {
    balance: number;
    status: 'deficit' | 'balanced' | 'surplus';
    message: string;
} {
    const balance = caloriesConsumed - caloriesBurned;

    let status: 'deficit' | 'balanced' | 'surplus';
    let message: string;

    if (balance < -200) {
        status = 'deficit';
        message = 'Good for weight loss!';
    } else if (balance > 200) {
        status = 'surplus';
        message = 'May lead to weight gain';
    } else {
        status = 'balanced';
        message = 'Balanced for maintenance';
    }

    return { balance, status, message };
}

/**
 * Get recommended calorie intake based on goal
 */
export function getRecommendedCalories(
    profile: HealthProfile,
    goal: 'lose_weight' | 'maintain' | 'gain_muscle'
): number {
    const tdee = calculateTDEE(profile);

    switch (goal) {
        case 'lose_weight':
            return Math.round(tdee - 500); // 500 calorie deficit for ~0.5kg/week loss
        case 'gain_muscle':
            return Math.round(tdee + 300); // 300 calorie surplus for muscle gain
        case 'maintain':
        default:
            return tdee;
    }
}

/**
 * Save health profile to localStorage
 */
export function saveHealthProfile(profile: HealthProfile): void {
    localStorage.setItem('hw_health_profile', JSON.stringify(profile));
}

/**
 * Load health profile from localStorage
 */
export function loadHealthProfile(): HealthProfile | null {
    const saved = localStorage.getItem('hw_health_profile');
    return saved ? JSON.parse(saved) : null;
}

/**
 * Check if health profile is complete and valid
 */
export function isProfileComplete(profile: HealthProfile | null): boolean {
    if (!profile) return false;
    return profile.age > 0 && profile.weightKg > 0 && profile.heightCm > 0;
}
