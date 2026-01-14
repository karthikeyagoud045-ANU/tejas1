// AI Workout Plan Generator Service
// Generates personalized workout plans using AI with exercise library integration

import { sendMessageWithFallback, ChatMessage } from './aiService';
import { Exercise, EXERCISE_LIBRARY, getExercisesByCategory, getExerciseById } from '../data/exerciseLibrary';

export interface WorkoutPlanInput {
    goal: 'lose_weight' | 'build_muscle' | 'improve_endurance' | 'increase_flexibility' | 'general_fitness';
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    sessionDuration: 15 | 30 | 45 | 60; // minutes
    daysPerWeek: number; // 2-7
    equipment: 'none' | 'minimal' | 'full_gym';
    limitations?: string; // e.g., "back pain, avoid high impact"
}

export interface WorkoutExercise {
    exerciseId: string;
    sets?: number;
    reps?: number;
    duration?: number; // seconds for holds or cardio
    tempo?: string; // e.g., "2-1-2" (eccentric-pause-concentric)
    rest?: number; // seconds between sets
}

export interface WorkoutDay {
    dayNumber: number;
    dayName: string; // e.g., "Upper Body", "Legs", "Full Body"
    totalDuration: number; // estimated minutes
    exercises: WorkoutExercise[];
    estimatedCalories: number;
}

export interface WorkoutPlan {
    id: string;
    planName: string;
    goal: string;
    durationWeeks: number;
    daysPerWeek: number;
    totalWorkouts: number;
    workoutDays: WorkoutDay[];
    createdAt: string;
}

/**
 * Generate a workout plan using AI
 */
export async function generateWorkoutPlan(input: WorkoutPlanInput): Promise<WorkoutPlan> {
    // Build AI prompt with exercise library context
    const availableExercises = buildExerciseContext(input);

    const prompt = buildWorkoutPrompt(input, availableExercises);

    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: 'You are an expert fitness trainer creating personalized workout plans. You MUST only use exercises from the provided exercise library. Return structured JSON only.'
        },
        {
            role: 'user',
            content: prompt
        }
    ];

    // Get AI response
    let fullResponse = '';
    for await (const chunk of sendMessageWithFallback(messages)) {
        fullResponse += chunk.text;
    }

    // Parse AI response into workout plan
    const parsedPlan = parseAIResponse(fullResponse, input);

    return parsedPlan;
}

/**
 * Build context of available exercises based on equipment and limitations
 */
function buildExerciseContext(input: WorkoutPlanInput): Exercise[] {
    let available = EXERCISE_LIBRARY;

    // Filter by equipment
    if (input.equipment === 'none') {
        available = available.filter(ex => ex.equipment === 'none');
    }

    // Filter by difficulty (allow current level and one below)
    const allowedDifficulties = input.fitnessLevel === 'beginner'
        ? ['beginner']
        : input.fitnessLevel === 'intermediate'
            ? ['beginner', 'intermediate']
            : ['beginner', 'intermediate', 'advanced'];

    available = available.filter(ex => allowedDifficulties.includes(ex.difficulty));

    return available;
}

/**
 * Build the AI prompt for workout generation
 */
function buildWorkoutPrompt(input: WorkoutPlanInput, exercises: Exercise[]): string {
    const exerciseList = exercises.map(ex =>
        `- ${ex.id}: ${ex.name} (${ex.category}, ${ex.difficulty})`
    ).join('\n');

    return `Generate a ${input.daysPerWeek}-day per week workout plan for ${input.goal.replace('_', ' ')}.

User Profile:
- Fitness Level: ${input.fitnessLevel}
- Session Duration: ${input.sessionDuration} minutes per workout
- Equipment: ${input.equipment}
- Limitations: ${input.limitations || 'none'}

AVAILABLE EXERCISES (you MUST only use these IDs):
${exerciseList}

Create a balanced plan following these rules:
1. Each workout should fit within ${input.sessionDuration} minutes
2. Include warm-up (cardio exercises) at start
3. Mix muscle groups appropriately for the goal
4. Progressive difficulty throughout the week
5. Include cool-down/stretching at end
6. For ${input.goal}:
   ${input.goal === 'lose_weight' ? '- Focus on high-rep, circuit-style, cardio-intensive' : ''}
   ${input.goal === 'build_muscle' ? '- Focus on 3-4 sets of 8-12 reps, compound movements' : ''}
   ${input.goal === 'improve_endurance' ? '- Focus on longer duration, moderate intensity' : ''}
   ${input.goal === 'increase_flexibility' ? '- Focus on holds, stretching, yoga-style' : ''}

Return ONLY valid JSON in this exact format:
{
  "planName": "string",
  "durationWeeks": number (typically 4),
  "workoutDays": [
    {
      "dayNumber": number,
      "dayName": "string (e.g., Full Body Day 1)",
      "exercises": [
        {
          "exerciseId": "exercise_id_from_list",
          "sets": number (or null for cardio/holds),
          "reps": number (or null for time-based),
          "duration": number in seconds (or null for rep-based),
          "rest": number in seconds between sets
        }
      ]
    }
  ]
}`;
}

/**
 * Parse AI response into structured workout plan
 */
function parseAIResponse(response: string, input: WorkoutPlanInput): WorkoutPlan {
    try {
        // Extract JSON from response (AI might include extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON in AI response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Calculate total duration and calories for each day
        const workoutDays: WorkoutDay[] = parsed.workoutDays.map((day: any) => {
            let totalDuration = 0;
            let estimatedCalories = 0;

            const exercises: WorkoutExercise[] = day.exercises.map((ex: any) => {
                const exercise = getExerciseById(ex.exerciseId);
                if (exercise) {
                    // Calculate exercise duration
                    const exDuration = ex.duration
                        ? ex.duration / 60 // Convert seconds to minutes
                        : (ex.sets || 1) * ((ex.reps || 10) * 3 / 60); // Estimate: 3 seconds per rep

                    totalDuration += exDuration;
                    estimatedCalories += exercise.caloriesPerMinute * exDuration;
                }

                return {
                    exerciseId: ex.exerciseId,
                    sets: ex.sets,
                    reps: ex.reps,
                    duration: ex.duration,
                    tempo: ex.tempo,
                    rest: ex.rest || 60
                };
            });

            return {
                dayNumber: day.dayNumber,
                dayName: day.dayName,
                totalDuration: Math.round(totalDuration),
                exercises,
                estimatedCalories: Math.round(estimatedCalories)
            };
        });

        const plan: WorkoutPlan = {
            id: generatePlanId(),
            planName: parsed.planName || `${input.goal.replace('_', ' ')} Plan`,
            goal: input.goal,
            durationWeeks: parsed.durationWeeks || 4,
            daysPerWeek: input.daysPerWeek,
            totalWorkouts: workoutDays.length,
            workoutDays,
            createdAt: new Date().toISOString()
        };

        return plan;
    } catch (error) {
        console.error('Failed to parse AI response:', error);
        // Return fallback template plan
        return createFallbackPlan(input);
    }
}

/**
 * Create a fallback workout plan if AI fails
 */
function createFallbackPlan(input: WorkoutPlanInput): WorkoutPlan {
    // Simple 3-day full body plan for beginners
    const workoutDays: WorkoutDay[] = [
        {
            dayNumber: 1,
            dayName: 'Full Body - Day 1',
            totalDuration: input.sessionDuration,
            exercises: [
                { exerciseId: 'jumping_jacks', duration: 120, rest: 30 },
                { exerciseId: 'pushup_standard', sets: 3, reps: 10, rest: 60 },
                { exerciseId: 'squat_bodyweight', sets: 3, reps: 15, rest: 60 },
                { exerciseId: 'plank_front', duration: 30, rest: 30 },
                { exerciseId: 'inverted_row', sets: 3, reps: 8, rest: 60 }
            ],
            estimatedCalories: 150
        },
        {
            dayNumber: 2,
            dayName: 'Full Body - Day 2',
            totalDuration: input.sessionDuration,
            exercises: [
                { exerciseId: 'high_knees', duration: 120, rest: 30 },
                { exerciseId: 'lunge_forward', sets: 3, reps: 10, rest: 60 },
                { exerciseId: 'pike_pushup', sets: 3, reps: 8, rest: 60 },
                { exerciseId: 'mountain_climber', duration: 60, rest: 30 },
                { exerciseId: 'glute_bridge', sets: 3, reps: 15, rest: 60 }
            ],
            estimatedCalories: 160
        },
        {
            dayNumber: 3,
            dayName: 'Full Body - Day 3',
            totalDuration: input.sessionDuration,
            exercises: [
                { exerciseId: 'burpee', duration: 90, rest: 30 },
                { exerciseId: 'bulgarian_split_squat', sets: 3, reps: 10, rest: 60 },
                { exerciseId: 'tricep_dip', sets: 3, reps: 12, rest: 60 },
                { exerciseId: 'bicycle_crunch', sets: 3, reps: 20, rest: 45 },
                { exerciseId: 'superman_hold', duration: 30, rest: 30 }
            ],
            estimatedCalories: 170
        }
    ];

    return {
        id: generatePlanId(),
        planName: `${input.goal.replace('_', ' ')} Starter Plan`,
        goal: input.goal,
        durationWeeks: 4,
        daysPerWeek: 3,
        totalWorkouts: 3,
        workoutDays,
        createdAt: new Date().toISOString()
    };
}

/**
 * Generate unique plan ID
 */
function generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save workout plan to localStorage
 */
export function saveWorkoutPlan(plan: WorkoutPlan): void {
    const plans = getWorkoutPlans();
    plans.push(plan);
    localStorage.setItem('hw_workout_plans', JSON.stringify(plans));
}

/**
 * Get all saved workout plans
 */
export function getWorkoutPlans(): WorkoutPlan[] {
    const saved = localStorage.getItem('hw_workout_plans');
    return saved ? JSON.parse(saved) : [];
}

/**
 * Get specific workout plan by ID
 */
export function getWorkoutPlanById(id: string): WorkoutPlan | null {
    const plans = getWorkoutPlans();
    return plans.find(p => p.id === id) || null;
}

/**
 * Delete workout plan
 */
export function deleteWorkoutPlan(id: string): void {
    const plans = getWorkoutPlans().filter(p => p.id !== id);
    localStorage.setItem('hw_workout_plans', JSON.stringify(plans));
}
