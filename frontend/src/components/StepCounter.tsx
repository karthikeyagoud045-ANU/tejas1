import React, { useState, useEffect } from 'react';
import { Footprints, TrendingUp, Flame, Target, Plus, Award, Calendar } from 'lucide-react';
import {
    getTodaySteps,
    updateTodaySteps,
    addStepsToToday,
    getStepHistory,
    getWeeklySummary,
    getStepGoal,
    setStepGoal,
    getGoalProgress,
    getMilestones,
    getStepStreak,
    StepData
} from '../services/stepTrackingService';
import { loadHealthProfile } from '../services/calorieCalculator';

export default function StepCounter() {
    const [todaySteps, setTodaySteps] = useState<StepData>({
        date: new Date().toISOString().split('T')[0],
        steps: 0,
        distanceKm: 0,
        caloriesBurned: 0,
        source: 'manual'
    });

    const [stepGoal, setStepGoalState] = useState(10000);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualSteps, setManualSteps] = useState('');
    const [weeklyHistory, setWeeklyHistory] = useState<StepData[]>([]);
    const [streak, setStreak] = useState(0);

    // Load data on mount and set up refresh interval
    useEffect(() => {
        loadData();

        // Refresh every minute to keep data current
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadData = () => {
        const steps = getTodaySteps();
        setTodaySteps(steps);
        setStepGoalState(getStepGoal());
        setWeeklyHistory(getStepHistory(7));
        setStreak(getStepStreak());
    };

    const handleManualEntry = () => {
        const steps = parseInt(manualSteps);
        if (steps > 0) {
            const profile = loadHealthProfile();
            const weightKg = profile?.weightKg || 70;

            // Calculate distance and calories
            const distanceKm = parseFloat((steps * 0.76 / 1000).toFixed(2));
            const caloriesBurned = Math.round(steps * 0.04 * (weightKg / 70));

            updateTodaySteps(steps, distanceKm, caloriesBurned, 'manual');
            setManualSteps('');
            setShowManualEntry(false);
            loadData();
        }
    };

    const handleGoalChange = (newGoal: number) => {
        setStepGoal(newGoal);
        setStepGoalState(newGoal);
        loadData();
    };

    const progress = getGoalProgress(todaySteps.steps);
    const milestones = getMilestones(todaySteps.steps);
    const weeklySummary = getWeeklySummary();

    return (
        <div className="space-y-6">
            {/* Main Step Counter Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Footprints className="w-6 h-6 text-blue-600" />
                        Today's Steps
                    </h2>
                    <button
                        onClick={() => setShowManualEntry(!showManualEntry)}
                        className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                        title="Add steps manually"
                    >
                        <Plus className="w-5 h-5 text-blue-600" />
                    </button>
                </div>

                {/* Manual Entry Form */}
                {showManualEntry && (
                    <div className="mb-4 p-4 bg-white rounded-xl border border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Enter Step Count
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={manualSteps}
                                onChange={(e) => setManualSteps(e.target.value)}
                                placeholder="e.g., 8547"
                                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={handleManualEntry}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Big Step Display */}
                <div className="text-center mb-6">
                    <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                        {todaySteps.steps.toLocaleString()}
                    </div>
                    <div className="text-slate-600 font-medium">
                        / {stepGoal.toLocaleString()} steps
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="text-center mt-2 text-sm font-semibold text-slate-700">
                        {progress}% Complete
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {todaySteps.distanceKm}
                        </div>
                        <div className="text-xs text-slate-600">km walked</div>
                    </div>

                    <div className="bg-white rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Flame className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {todaySteps.caloriesBurned}
                        </div>
                        <div className="text-xs text-slate-600">calories</div>
                    </div>

                    <div className="bg-white rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {streak}
                        </div>
                        <div className="text-xs text-slate-600">day streak</div>
                    </div>
                </div>
            </div>

            {/* Weekly History Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Weekly Progress
                </h3>

                <div className="space-y-2">
                    {weeklyHistory.map((day, index) => {
                        const dayProgress = (day.steps / stepGoal) * 100;
                        const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

                        return (
                            <div key={day.date} className="flex items-center gap-3">
                                <div className="w-12 text-sm font-medium text-slate-600">
                                    {dayName}
                                </div>
                                <div className="flex-1">
                                    <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 rounded-lg ${day.steps >= stepGoal
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                    : 'bg-gradient-to-r from-blue-500 to-blue-400'
                                                }`}
                                            style={{ width: `${Math.min(dayProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-24 text-right text-sm font-semibold text-slate-700">
                                    {day.steps.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Weekly Summary */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {weeklySummary.totalSteps.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-600">Total Steps</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {weeklySummary.totalDistance.toFixed(1)} km
                            </div>
                            <div className="text-xs text-slate-600">Distance</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600">
                                {weeklySummary.totalCalories}
                            </div>
                            <div className="text-xs text-slate-600">Calories</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600">
                                {weeklySummary.averageSteps.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-600">Avg/Day</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    Step Milestones
                </h3>

                <div className="space-y-3">
                    {milestones.map((milestone) => (
                        <div
                            key={milestone.milestone}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all ${milestone.achieved
                                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200'
                                    : 'bg-slate-50 border-2 border-slate-200'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {milestone.achieved ? (
                                    <Award className="w-6 h-6 text-amber-500" />
                                ) : (
                                    <Target className="w-6 h-6 text-slate-400" />
                                )}
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        {milestone.label}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {milestone.milestone.toLocaleString()} steps
                                    </div>
                                </div>
                            </div>
                            {milestone.achieved && (
                                <div className="text-green-600 font-bold">✓</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Goal Settings Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Daily Goal
                </h3>

                <div className="flex flex-wrap gap-2">
                    {[5000, 7500, 10000, 12500, 15000].map((goal) => (
                        <button
                            key={goal}
                            onClick={() => handleGoalChange(goal)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${stepGoal === goal
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {goal.toLocaleString()}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-slate-600 mt-3">
                    WHO recommends 10,000 steps per day for optimal health
                </p>
            </div>
        </div>
    );
}
