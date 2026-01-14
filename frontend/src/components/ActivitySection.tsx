import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import StepCounter from './StepCounter';
import HealthMetrics from './HealthMetrics';
import {
    calculateDailyCalories,
    calculateCalorieBalance,
    loadHealthProfile,
    isProfileComplete,
    HealthProfile
} from '../services/calorieCalculator';
import { getTodaySteps } from '../services/stepTrackingService';

interface ActivitySectionProps {
    exerciseMinutes: number;
    exercisesCompleted: number;
    caloriesConsumed: number; // From nutrition tracking
}

export default function ActivitySection({
    exerciseMinutes,
    exercisesCompleted,
    caloriesConsumed
}: ActivitySectionProps) {
    const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
    const [showProfileSetup, setShowProfileSetup] = useState(false);

    useEffect(() => {
        const profile = loadHealthProfile();
        setHealthProfile(profile);
        setShowProfileSetup(!isProfileComplete(profile));
    }, []);

    const handleProfileSaved = (profile: HealthProfile) => {
        setHealthProfile(profile);
        setShowProfileSetup(false);
    };

    // If no profile, show setup
    if (showProfileSetup || !healthProfile) {
        return (
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">⚡ Activity Tracking</h2>
                    <p className="text-slate-600">
                        First, let's set up your health profile for accurate calorie calculations
                    </p>
                </div>
                <HealthMetrics onProfileSaved={handleProfileSaved} />
            </div>
        );
    }

    // Calculate calorie data
    const todaySteps = getTodaySteps();
    const calorieBreakdown = calculateDailyCalories(
        healthProfile,
        todaySteps.steps,
        exerciseMinutes,
        'default'
    );

    const calorieBalance = calculateCalorieBalance(caloriesConsumed, calorieBreakdown.totalBurned);

    return (
        <div className="space-y-6">
            {/* Header with Edit Profile Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">⚡ Activity Tracking</h2>
                    <p className="text-slate-600">Monitor your daily movement and calorie burn</p>
                </div>
                <button
                    onClick={() => setShowProfileSetup(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                    Edit Profile
                </button>
            </div>

            {/* Profile Setup Modal (if needed) */}
            {showProfileSetup && healthProfile && (
                <div className="mb-6">
                    <HealthMetrics onProfileSaved={handleProfileSaved} />
                    <button
                        onClick={() => setShowProfileSetup(false)}
                        className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Calorie Burn Overview Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-lg">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-600" />
                    Calories Burned Today
                </h3>

                {/* Large Total Display */}
                <div className="text-center mb-6">
                    <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
                        {calorieBreakdown.totalBurned.toLocaleString()}
                    </div>
                    <div className="text-slate-600 font-medium">total calories burned</div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 mb-6">
                    <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Minus className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">Resting (BMR)</div>
                                    <div className="text-sm text-slate-600">Calories burned at rest</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900">
                                    {calorieBreakdown.bmr}
                                </div>
                                <div className="text-sm text-slate-600">
                                    {Math.round((calorieBreakdown.bmr / calorieBreakdown.totalBurned) * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">Steps/Walking</div>
                                    <div className="text-sm text-slate-600">{todaySteps.steps.toLocaleString()} steps</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900">
                                    {calorieBreakdown.activityCalories}
                                </div>
                                <div className="text-sm text-slate-600">
                                    {Math.round((calorieBreakdown.activityCalories / calorieBreakdown.totalBurned) * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Flame className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">Exercise</div>
                                    <div className="text-sm text-slate-600">{exerciseMinutes} minutes</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900">
                                    {calorieBreakdown.exerciseCalories}
                                </div>
                                <div className="text-sm text-slate-600">
                                    {Math.round((calorieBreakdown.exerciseCalories / calorieBreakdown.totalBurned) * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calorie Balance */}
                <div className={`rounded-xl p-4 border-2 ${calorieBalance.status === 'deficit'
                        ? 'bg-green-50 border-green-200'
                        : calorieBalance.status === 'surplus'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-slate-900">Calorie Balance</div>
                        {calorieBalance.status === 'deficit' && <TrendingDown className="w-5 h-5 text-green-600" />}
                        {calorieBalance.status === 'surplus' && <TrendingUp className="w-5 h-5 text-red-600" />}
                        {calorieBalance.status === 'balanced' && <Minus className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex items-baseline justify-between">
                        <div>
                            <div className="text-sm text-slate-600">
                                Consumed: {caloriesConsumed} cal | Burned: {calorieBreakdown.totalBurned} cal
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-2xl font-bold ${calorieBalance.status === 'deficit' ? 'text-green-600' :
                                    calorieBalance.status === 'surplus' ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                {calorieBalance.balance > 0 ? '+' : ''}{calorieBalance.balance}
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                        {calorieBalance.message}
                    </div>
                </div>
            </div>

            {/* Step Counter Component */}
            <StepCounter />

            {/* Health Profile Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Your Health Profile</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-sm text-slate-600">Age</div>
                        <div className="text-lg font-semibold text-slate-900">{healthProfile.age} years</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-600">Weight</div>
                        <div className="text-lg font-semibold text-slate-900">{healthProfile.weightKg} kg</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-600">Height</div>
                        <div className="text-lg font-semibold text-slate-900">{healthProfile.heightCm} cm</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-600">Activity</div>
                        <div className="text-lg font-semibold text-slate-900 capitalize">
                            {healthProfile.activityLevel.replace('_', ' ')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
