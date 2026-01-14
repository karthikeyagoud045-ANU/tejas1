// Step Tracking Service
// Handles step counting, storage, and history management

export interface StepData {
    date: string; // YYYY-MM-DD format
    steps: number;
    distanceKm: number;
    caloriesBurned: number;
    source: 'phone' | 'manual' | 'fitbit' | 'google' | 'apple';
}

export interface DailyGoal {
    targetSteps: number;
    achieved: boolean;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Get step data for a specific date
 */
export function getStepsForDate(date: string): StepData | null {
    const key = `hw_steps_${date}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
}

/**
 * Get today's step data
 */
export function getTodaySteps(): StepData {
    const today = getTodayDate();
    const existing = getStepsForDate(today);

    if (existing) {
        return existing;
    }

    // Return empty data for today
    return {
        date: today,
        steps: 0,
        distanceKm: 0,
        caloriesBurned: 0,
        source: 'manual'
    };
}

/**
 * Save step data for a specific date
 */
export function saveStepData(stepData: StepData): void {
    const key = `hw_steps_${stepData.date}`;
    localStorage.setItem(key, JSON.stringify(stepData));

    // Also update the index of tracked dates
    updateStepIndex(stepData.date);
}

/**
 * Update step count for today
 */
export function updateTodaySteps(
    steps: number,
    distanceKm: number,
    caloriesBurned: number,
    source: StepData['source'] = 'manual'
): void {
    const stepData: StepData = {
        date: getTodayDate(),
        steps,
        distanceKm,
        caloriesBurned,
        source
    };

    saveStepData(stepData);
}

/**
 * Add steps to today's count (for incremental updates)
 */
export function addStepsToToday(additionalSteps: number, weightKg: number = 70): void {
    const today = getTodaySteps();
    const newSteps = today.steps + additionalSteps;

    // Recalculate distance and calories
    const avgStepLength = 0.76; // meters
    const newDistance = parseFloat((newSteps * avgStepLength / 1000).toFixed(2));
    const newCalories = Math.round(newSteps * 0.04 * (weightKg / 70));

    updateTodaySteps(newSteps, newDistance, newCalories, today.source);
}

/**
 * Maintain an index of all dates with step data
 */
function updateStepIndex(date: string): void {
    const index = getStepIndex();
    if (!index.includes(date)) {
        index.push(date);
        index.sort(); // Keep chronological order
        localStorage.setItem('hw_step_index', JSON.stringify(index));
    }
}

/**
 * Get list of all dates with step data
 */
function getStepIndex(): string[] {
    const saved = localStorage.getItem('hw_step_index');
    return saved ? JSON.parse(saved) : [];
}

/**
 * Get step history for the last N days
 */
export function getStepHistory(days: number = 7): StepData[] {
    const history: StepData[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const stepData = getStepsForDate(dateStr);
        if (stepData) {
            history.push(stepData);
        } else {
            // Add empty data for missing days
            history.push({
                date: dateStr,
                steps: 0,
                distanceKm: 0,
                caloriesBurned: 0,
                source: 'manual'
            });
        }
    }

    return history.reverse(); // Oldest to newest
}

/**
 * Get weekly step summary
 */
export function getWeeklySummary(): {
    totalSteps: number;
    totalDistance: number;
    totalCalories: number;
    averageSteps: number;
    daysTracked: number;
} {
    const history = getStepHistory(7);

    const totalSteps = history.reduce((sum, day) => sum + day.steps, 0);
    const totalDistance = history.reduce((sum, day) => sum + day.distanceKm, 0);
    const totalCalories = history.reduce((sum, day) => sum + day.caloriesBurned, 0);
    const daysTracked = history.filter(day => day.steps > 0).length;
    const averageSteps = daysTracked > 0 ? Math.round(totalSteps / 7) : 0;

    return {
        totalSteps,
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalCalories,
        averageSteps,
        daysTracked
    };
}

/**
 * Get/Set daily step goal
 */
export function getStepGoal(): number {
    const saved = localStorage.getItem('hw_step_goal');
    return saved ? parseInt(saved) : 10000; // Default: 10,000 steps
}

export function setStepGoal(goal: number): void {
    localStorage.setItem('hw_step_goal', goal.toString());
}

/**
 * Check if daily goal is achieved
 */
export function isGoalAchieved(steps: number): boolean {
    return steps >= getStepGoal();
}

/**
 * Get goal progress percentage
 */
export function getGoalProgress(steps: number): number {
    const goal = getStepGoal();
    return Math.min(100, Math.round((steps / goal) * 100));
}

/**
 * Get step milestones and their status
 */
export function getMilestones(currentSteps: number): {
    milestone: number;
    achieved: boolean;
    label: string;
}[] {
    return [
        {
            milestone: 5000,
            achieved: currentSteps >= 5000,
            label: '5,000 steps - Good Start!'
        },
        {
            milestone: 7500,
            achieved: currentSteps >= 7500,
            label: '7,500 steps - Keep Going!'
        },
        {
            milestone: 10000,
            achieved: currentSteps >= 10000,
            label: '10,000 steps - Daily Goal!'
        },
        {
            milestone: 15000,
            achieved: currentSteps >= 15000,
            label: '15,000 steps - Superstar!'
        },
        {
            milestone: 20000,
            achieved: currentSteps >= 20000,
            label: '20,000 steps - Elite Level!'
        }
    ];
}

/**
 * Get current streak (consecutive days meeting goal)
 */
export function getStepStreak(): number {
    const index = getStepIndex();
    if (index.length === 0) return 0;

    let streak = 0;
    const today = getTodayDate();
    const goal = getStepGoal();

    for (let i = 0; i < 365; i++) { // Check up to a year
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        if (dateStr > today) continue; // Skip future dates

        const stepData = getStepsForDate(dateStr);
        if (stepData && stepData.steps >= goal) {
            streak++;
        } else {
            break; // Streak broken
        }
    }

    return streak;
}

/**
 * Request permission for motion sensors (if available)
 */
export async function requestMotionPermission(): Promise<boolean> {
    // Check if Generic Sensor API is available
    if ('Accelerometer' in window) {
        try {
            // @ts-ignore - TypeScript may not have types for this experimental API
            const sensor = new Accelerometer({ frequency: 60 });
            await sensor.start();
            sensor.stop();
            return true;
        } catch (error) {
            console.log('Motion sensor not available:', error);
            return false;
        }
    }

    return false;
}

/**
 * Clear all step data (for testing or reset)
 */
export function clearStepData(): void {
    const index = getStepIndex();
    index.forEach(date => {
        localStorage.removeItem(`hw_steps_${date}`);
    });
    localStorage.removeItem('hw_step_index');
    localStorage.removeItem('hw_step_goal');
}
