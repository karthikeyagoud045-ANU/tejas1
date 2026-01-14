import React, { useState, useEffect } from 'react';
import { User, Scale, Ruler, Activity, Save, CheckCircle2 } from 'lucide-react';
import {
    HealthProfile,
    saveHealthProfile,
    loadHealthProfile,
    isProfileComplete
} from '../services/calorieCalculator';

interface HealthMetricsProps {
    onProfileSaved?: (profile: HealthProfile) => void;
}

export default function HealthMetrics({ onProfileSaved }: HealthMetricsProps) {
    const [profile, setProfile] = useState<HealthProfile>({
        age: 0,
        gender: 'male',
        weightKg: 0,
        heightCm: 0,
        activityLevel: 'moderately_active'
    });

    const [saved, setSaved] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Load existing profile on mount
    useEffect(() => {
        const existingProfile = loadHealthProfile();
        if (existingProfile) {
            setProfile(existingProfile);
            setIsComplete(isProfileComplete(existingProfile));
        }
    }, []);

    const handleChange = (field: keyof HealthProfile, value: any) => {
        const updatedProfile = { ...profile, [field]: value };
        setProfile(updatedProfile);
        setIsComplete(isProfileComplete(updatedProfile));
        setSaved(false);
    };

    const handleSave = () => {
        if (isComplete) {
            saveHealthProfile(profile);
            setSaved(true);
            onProfileSaved?.(profile);

            // Clear saved message after 3 seconds
            setTimeout(() => setSaved(false), 3000);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Health Metrics
                </h3>
                <p className="text-slate-600">
                    Required for accurate calorie burn calculations
                </p>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Age
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={profile.age || ''}
                            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Enter your age"
                        />
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Gender
                    </label>
                    <select
                        value={profile.gender}
                        onChange={(e) => handleChange('gender', e.target.value as HealthProfile['gender'])}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Weight */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Weight (kg)
                    </label>
                    <div className="relative">
                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="number"
                            min="1"
                            max="300"
                            step="0.1"
                            value={profile.weightKg || ''}
                            onChange={(e) => handleChange('weightKg', parseFloat(e.target.value) || 0)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Enter weight in kg"
                        />
                    </div>
                </div>

                {/* Height */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Height (cm)
                    </label>
                    <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="number"
                            min="1"
                            max="300"
                            value={profile.heightCm || ''}
                            onChange={(e) => handleChange('heightCm', parseInt(e.target.value) || 0)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Enter height in cm"
                        />
                    </div>
                </div>

                {/* Activity Level - Full Width */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Activity Level
                    </label>
                    <select
                        value={profile.activityLevel}
                        onChange={(e) => handleChange('activityLevel', e.target.value as HealthProfile['activityLevel'])}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
                    >
                        <option value="sedentary">Sedentary (little or no exercise)</option>
                        <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                        <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                        <option value="very_active">Very Active (6-7 days/week)</option>
                        <option value="extremely_active">Extremely Active (athlete level)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                        This helps calculate your daily calorie needs more accurately
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={!isComplete || saved}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isComplete && !saved
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    {saved ? (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            Profile Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Profile
                        </>
                    )}
                </button>

                {!isComplete && (
                    <p className="text-sm text-amber-600">
                        Please fill all fields to continue
                    </p>
                )}
            </div>
        </div>
    );
}
