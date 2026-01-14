import React, { useState } from 'react';
import { Dumbbell, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
    generateWorkoutPlan,
    WorkoutPlan,
    WorkoutPlanInput,
    saveWorkoutPlan
} from '../services/workoutPlanService';
import { getExerciseById } from '../data/exerciseLibrary';
import LoadingSpinner from './LoadingSpinner';

interface WizardAnswers {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    height?: number;
    weight?: number;
    goal?: 'lose_weight' | 'build_muscle' | 'improve_endurance' | 'increase_flexibility' | 'general_fitness';
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
    limitations?: string;
    sessionDuration?: 15 | 30 | 45 | 60;
    daysPerWeek?: number;
    equipment?: 'none' | 'minimal' | 'full_gym';
}

export default function CustomWorkoutPlanner() {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<WizardAnswers>({});
    const [currentAnswer, setCurrentAnswer] = useState<any>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);

    const totalSteps = 11;

    // Update answer for current step
    const handleAnswer = (value: any) => {
        setCurrentAnswer(value);
    };

    // Go to next step
    const handleNext = () => {
        // Save answer
        const stepKey = getStepKey(step);
        setAnswers(prev => ({ ...prev, [stepKey]: currentAnswer }));

        // Move to next step
        if (step < totalSteps) {
            setStep(step + 1);
            setCurrentAnswer('');
        } else {
            // Generate workout plan
            handleGeneratePlan();
        }
    };

    // Go to previous step
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            const prevKey = getStepKey(step - 1);
            setCurrentAnswer(answers[prevKey as keyof WizardAnswers] || '');
        }
    };

    // Get the state key for current step
    const getStepKey = (stepNum: number): keyof WizardAnswers => {
        const keyMap: Record<number, keyof WizardAnswers> = {
            1: 'age',
            2: 'gender',
            3: 'height',
            4: 'weight',
            5: 'goal',
            6: 'fitnessLevel',
            7: 'limitations',
            8: 'sessionDuration',
            9: 'daysPerWeek',
            10: 'equipment',
            11: 'goal' // confirmation step doesn't need a key
        };
        return keyMap[stepNum];
    };

    // Generate workout plan
    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        try {
            const input: WorkoutPlanInput = {
                goal: answers.goal || 'general_fitness',
                fitnessLevel: answers.fitnessLevel || 'beginner',
                sessionDuration: answers.sessionDuration || 30,
                daysPerWeek: answers.daysPerWeek || 3,
                equipment: answers.equipment || 'none',
                limitations: answers.limitations || ''
            };

            const plan = await generateWorkoutPlan(input);
            setGeneratedPlan(plan);
            saveWorkoutPlan(plan);
        } catch (error) {
            console.error('Failed to generate plan:', error);
            alert('Failed to generate workout plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Check if current step can proceed
    const canProceed = (): boolean => {
        if (step === 7) return true; // Limitations is optional
        if (step === 11) return true; // Confirmation step, no answer needed
        return currentAnswer !== '' && currentAnswer !== undefined;
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && canProceed()) {
            handleNext();
        }
    };

    // Render question based on step
    const renderQuestion = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">What is your age?</h2>
                        <p className="text-slate-600">This helps us tailor the workout intensity</p>
                        <input
                            type="number"
                            min="10"
                            max="100"
                            value={currentAnswer}
                            onChange={(e) => handleAnswer(parseInt(e.target.value))}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your age"
                            className="w-full px-6 py-4 text-2xl border-2 border-slate-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">What is your gender?</h2>
                        <p className="text-slate-600">For better calorie calculations</p>
                        <div className="grid grid-cols-3 gap-4">
                            {['male', 'female', 'other'].map((gender) => (
                                <button
                                    key={gender}
                                    onClick={() => handleAnswer(gender)}
                                    className={`px-6 py-8 rounded-2xl font-semibold capitalize transition-all text-lg ${currentAnswer === gender
                                        ? 'bg-blue-600 text-white shadow-xl scale-105'
                                        : 'bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-700'
                                        }`}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">What is your height?</h2>
                        <p className="text-slate-600">In centimeters</p>
                        <input
                            type="number"
                            min="100"
                            max="250"
                            value={currentAnswer}
                            onChange={(e) => handleAnswer(parseInt(e.target.value))}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., 175"
                            className="w-full px-6 py-4 text-2xl border-2 border-slate-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">What is your weight?</h2>
                        <p className="text-slate-600">In kilograms</p>
                        <input
                            type="number"
                            min="30"
                            max="200"
                            value={currentAnswer}
                            onChange={(e) => handleAnswer(parseInt(e.target.value))}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., 70"
                            className="w-full px-6 py-4 text-2xl border-2 border-slate-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">What's your primary goal?</h2>
                        <p className="text-slate-600">Choose the one that matters most to you</p>
                        <div className="space-y-3">
                            {[
                                { value: 'lose_weight', label: '🔥 Lose Fat', desc: 'High intensity, calorie burning workouts' },
                                { value: 'build_muscle', label: '💪 Build Muscle', desc: 'Strength and muscle growth' },
                                { value: 'improve_endurance', label: '🏃 Improve Endurance', desc: 'Cardio and stamina building' },
                                { value: 'increase_flexibility', label: '🧘 Increase Flexibility', desc: 'Stretching and mobility' },
                                { value: 'general_fitness', label: '⚡ General Fitness', desc: 'Balanced, all-around health' }
                            ].map((goal) => (
                                <button
                                    key={goal.value}
                                    onClick={() => handleAnswer(goal.value)}
                                    className={`w-full p-6 rounded-2xl text-left transition-all ${currentAnswer === goal.value
                                        ? 'bg-blue-600 text-white shadow-xl scale-105'
                                        : 'bg-white border-2 border-slate-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="font-bold text-lg mb-1">{goal.label}</div>
                                    <div className={`text-sm ${currentAnswer === goal.value ? 'text-blue-100' : 'text-slate-600'}`}>
                                        {goal.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">What's your fitness level?</h2>
                        <p className="text-slate-600">Be honest for the best results</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { value: 'beginner', label: 'Beginner', desc: 'New to working out' },
                                { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
                                { value: 'advanced', label: 'Advanced', desc: 'Regular exerciser' }
                            ].map((level) => (
                                <button
                                    key={level.value}
                                    onClick={() => handleAnswer(level.value)}
                                    className={`p-8 rounded-2xl text-center transition-all ${currentAnswer === level.value
                                        ? 'bg-green-600 text-white shadow-xl scale-105'
                                        : 'bg-white border-2 border-slate-200 hover:border-green-300'
                                        }`}
                                >
                                    <div className="font-bold text-xl mb-2">{level.label}</div>
                                    <div className={`text-sm ${currentAnswer === level.value ? 'text-green-100' : 'text-slate-600'}`}>
                                        {level.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">Any injuries or limitations?</h2>
                        <p className="text-slate-600">Optional - Skip if none</p>
                        <textarea
                            value={currentAnswer}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="e.g., back pain, avoid jumping, knee issues"
                            className="w-full px-6 py-4 text-lg border-2 border-slate-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                            rows={4}
                            autoFocus
                        />
                    </div>
                );

            case 8:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">How long per workout?</h2>
                        <p className="text-slate-600">Choose your ideal session duration</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[15, 30, 45, 60].map((duration) => (
                                <button
                                    key={duration}
                                    onClick={() => handleAnswer(duration)}
                                    className={`p-8 rounded-2xl transition-all ${currentAnswer === duration
                                        ? 'bg-purple-600 text-white shadow-xl scale-105'
                                        : 'bg-white border-2 border-slate-200 hover:border-purple-300'
                                        }`}
                                >
                                    <div className="text-4xl font-bold mb-2">{duration}</div>
                                    <div className={`text-sm ${currentAnswer === duration ? 'text-purple-100' : 'text-slate-600'}`}>
                                        minutes
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 9:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">How many days per week?</h2>
                        <p className="text-slate-600">Recommended: 3-5 days for best results</p>
                        <div className="space-y-8">
                            <div className="flex items-center justify-center gap-8">
                                {[2, 3, 4, 5, 6, 7].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => handleAnswer(days)}
                                        className={`w-16 h-16 rounded-full font-bold text-2xl transition-all ${currentAnswer === days
                                            ? 'bg-orange-600 text-white shadow-xl scale-125'
                                            : 'bg-white border-2 border-slate-200 hover:border-orange-300 text-slate-700'
                                            }`}
                                    >
                                        {days}
                                    </button>
                                ))}
                            </div>
                            {currentAnswer && (
                                <p className="text-center text-4xl font-bold text-orange-600 animate-fade-in">
                                    {currentAnswer} days per week
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 10:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">What equipment do you have?</h2>
                        <p className="text-slate-600">We'll design exercises around your available equipment</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { value: 'none', label: 'No Equipment', desc: 'Bodyweight only' },
                                { value: 'minimal', label: 'Minimal', desc: 'Dumbbells/Bands' },
                                { value: 'full_gym', label: 'Full Gym', desc: 'Complete access' }
                            ].map((eq) => (
                                <button
                                    key={eq.value}
                                    onClick={() => handleAnswer(eq.value)}
                                    className={`p-8 rounded-2xl text-center transition-all ${currentAnswer === eq.value
                                        ? 'bg-blue-600 text-white shadow-xl scale-105'
                                        : 'bg-white border-2 border-slate-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="font-bold text-xl mb-2">{eq.label}</div>
                                    <div className={`text-sm ${currentAnswer === eq.value ? 'text-blue-100' : 'text-slate-600'}`}>
                                        {eq.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 11:
                return (
                    <div className="space-y-8 animate-fade-in text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900">All Set!</h2>
                        <p className="text-lg text-slate-600">
                            Ready to generate your personalized AI workout plan?
                        </p>
                        <div className="bg-blue-50 rounded-2xl p-6 text-left max-w-md mx-auto">
                            <h3 className="font-bold text-slate-900 mb-3">Your Profile:</h3>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div>• {answers.age} years old, {answers.gender}</div>
                                <div>• {answers.height}cm, {answers.weight}kg</div>
                                <div>• Goal: {answers.goal?.replace('_', ' ')}</div>
                                <div>• Level: {answers.fitnessLevel}</div>
                                <div>• {answers.sessionDuration} min, {answers.daysPerWeek} days/week</div>
                                <div>• Equipment: {answers.equipment}</div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Generating state
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="lg" message="AI is creating your personalized workout plan..." />
                <p className="text-slate-600 mt-4">Analyzing your profile and generating optimal exercises</p>
            </div>
        );
    }

    // Plan display
    if (generatedPlan) {
        const [expandedDays, setExpandedDays] = useState<number[]>([]);

        const toggleDay = (index: number) => {
            setExpandedDays(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            );
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{generatedPlan.planName}</h2>
                        <p className="text-slate-600">
                            {generatedPlan.durationWeeks} weeks • {generatedPlan.daysPerWeek} days/week
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setGeneratedPlan(null);
                            setStep(1);
                            setAnswers({});
                            setCurrentAnswer('');
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Start Over
                    </button>
                </div>

                <div className="space-y-4">
                    {generatedPlan.workoutDays.map((day, index) => {
                        const isExpanded = expandedDays.includes(index);

                        return (
                            <div key={index} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{day.dayName}</h3>
                                            <p className="text-sm text-slate-600">
                                                {day.totalDuration} min • {day.exercises.length} exercises • ~{day.estimatedCalories} cal
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleDay(index)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                                        >
                                            {isExpanded ? 'Collapse' : 'Start'}
                                        </button>
                                    </div>

                                    {/* Expanded Exercise List */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                                            {day.exercises.map((ex, exIndex) => {
                                                const exercise = getExerciseById(ex.exerciseId);
                                                if (!exercise) return null;

                                                return (
                                                    <div
                                                        key={exIndex}
                                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-600 font-semibold">
                                                                {exIndex + 1}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900">{exercise.name}</div>
                                                                <div className="text-sm text-slate-600 capitalize">
                                                                    {exercise.category} • {exercise.difficulty}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm">
                                                            {ex.sets && (
                                                                <div className="font-semibold text-slate-900">
                                                                    {ex.sets} sets × {ex.reps} reps
                                                                </div>
                                                            )}
                                                            {ex.duration && (
                                                                <div className="font-semibold text-slate-900">
                                                                    {ex.duration}s hold
                                                                </div>
                                                            )}
                                                            <div className="text-slate-600">{ex.rest}s rest</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Wizard flow
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <Dumbbell className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Custom Workout Plan</h1>
                <p className="text-slate-600">Answer a few questions to get your AI-powered plan</p>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
                <div className="text-center mt-2 text-sm font-semibold text-slate-600">
                    Step {step} of {totalSteps}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200 min-h-[400px] flex flex-col justify-between">
                <div className="flex-1">
                    {renderQuestion()}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${step === 1
                            ? 'opacity-0 pointer-events-none'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${canProceed()
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl scale-100 hover:scale-105'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {step === totalSteps ? 'Generate Plan' : 'Next'}
                        {step < totalSteps && <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
